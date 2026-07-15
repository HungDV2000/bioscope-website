/**
 * OpenAI Service — gọi GPT-4o cho nội dung + DALL·E 3 cho hình ảnh.
 *
 * Hai tác vụ tách biệt:
 *   1. GPT-4o → sinh nội dung (description, benefits, applications, badges, subtitle, INCI...)
 *   2. DALL·E 3 → sinh featured image prompt → vẽ hình → upload lên Payload Media
 *
 * KHÔNG dùng n8n — gọi trực tiếp từ CMS backend để đảm bảo:
 *   - Không phụ thuộc external webhook
 *   - Không tốn thêm 1-3s cho round-trip n8n
 *   - Payload Media upload ngay trong process (không cần external relay)
 */

import OpenAI from 'openai'

// ---------------------------------------------------------------------------
// Client singleton
// ---------------------------------------------------------------------------

let _client: OpenAI | null = null

export function getOpenAIClient(): OpenAI {
  if (_client) return _client

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY env var is not set')

  _client = new OpenAI({ apiKey })
  return _client
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Locale = 'vi' | 'en'

export type GeneratedContent = {
  name?: { vi: string; en: string }
  subtitle: { vi: string; en: string }
  description: { vi: string; en: string }
  benefits: string[]
  applications: string[]
  badges: string[]
  suggestedDosage: string
  inci?: { vi: string; en: string }
  originCountry?: string
  tag?: 'NEW' | 'TRENDING' | 'EXCLUSIVE' | null
  specs?: Array<{ label: { vi: string; en: string }; value: string; unit?: string }>
  seoTitle?: { vi: string; en: string }
  seoDescription?: { vi: string; en: string }
  imagePrompt: { vi: string; en: string }
}

export type GenerationResult =
  | { ok: true; content: GeneratedContent }
  | { ok: false; error: string }

// ---------------------------------------------------------------------------
// Model selection (per OpenAI docs, 2026). All overridable via env so the model
// can be tuned without a rebuild.
//   - Text/content + vision: GPT-5.6 family (terra = balanced intelligence/cost).
//   - Image: gpt-image-1 (DALL·E 3 is deprecated). Note: GPT Image models require
//     Organization Verification in the OpenAI developer console.
// ---------------------------------------------------------------------------

const CONTENT_MODEL = process.env.OPENAI_CONTENT_MODEL || 'gpt-5.6-terra'
const VISION_MODEL = process.env.OPENAI_VISION_MODEL || 'gpt-5.6-terra'

/**
 * Chat-completion token/temperature params that differ across model families.
 * GPT-5 family uses `max_completion_tokens` and only supports the default
 * temperature, whereas GPT-4 family uses `max_tokens` and custom temperature.
 */
function completionParams(model: string, maxTokens: number, temperature: number): Record<string, unknown> {
  if (/^(gpt-5|o[0-9])/.test(model)) {
    return { max_completion_tokens: maxTokens }
  }
  return { max_tokens: maxTokens, temperature }
}

/**
 * Sinh nội dung cho nguyên liệu bằng GPT-4o.
 *
 * @param ingredientData — tất cả fields hiện có của nguyên liệu (từ Payload)
 * @param driveFileContents — nội dung trích xuất từ PDF/TDS trên Drive
 */
export async function generateIngredientContent(
  ingredientData: {
    name: string
    type?: string
    inci?: string
    originCountry?: string
    brandName?: string
    category?: string
    driveId?: string
    driveFiles?: Array<{ fileName: string; mimeType: string }>
  },
  driveFileContents: string,
): Promise<GenerationResult> {
  const client = getOpenAIClient()

  const systemPrompt = buildContentSystemPrompt()
  const userPrompt = buildContentUserPrompt(ingredientData, driveFileContents)

  try {
    const completion = await client.chat.completions.create({
      model: CONTENT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      ...completionParams(CONTENT_MODEL, 8192, 0.3),
    })

    const raw = completion.choices[0]?.message?.content
    if (!raw) return { ok: false, error: 'No response from OpenAI' }

    const parsed = JSON.parse(raw) as GeneratedContent

    // Basic validation
    if (!parsed.subtitle?.vi || !parsed.description?.vi || !Array.isArray(parsed.benefits)) {
      return { ok: false, error: `GPT-4o returned unexpected JSON shape: ${raw.slice(0, 200)}` }
    }

    return { ok: true, content: parsed }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('context_length_exceeded')) {
      return { ok: false, error: 'Nội dung Drive quá dài. Hãy cắt bớt file PDF trước khi thử lại.' }
    }
    return { ok: false, error: `OpenAI error: ${msg}` }
  }
}

// ---------------------------------------------------------------------------
// 2. Image generation — DALL·E 3 (two-stage)
// ---------------------------------------------------------------------------

const IMAGE_PROMPT_MODEL = process.env.OPENAI_IMAGE_PROMPT_MODEL || CONTENT_MODEL
const IMAGE_GENERATION_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2'
const IMAGE_SIZE = (process.env.OPENAI_IMAGE_SIZE || '1024x1024') as '1024x1024'
// gpt-image-1 quality: low | medium | high | auto (dall-e-3 used standard | hd).
const IMAGE_QUALITY = (process.env.OPENAI_IMAGE_QUALITY || 'medium') as 'medium'

/**
 * Sinh featured image cho nguyên liệu bằng DALL·E 3 (2-stage).
 *
 * Stage 1: GPT-4o → viết image prompt chuyên dụng cho dược liệu/mỹ phẩm
 * Stage 2: DALL·E 3 → vẽ hình từ prompt
 * Stage 3: Upload lên Payload Media → return media ID
 *
 * @param ingredientName Tên nguyên liệu
 * @param locale Ngôn ngữ ưu tiên cho prompt
 * @param uploadToPayload Hàm upload file buffer lên Payload Media
 * @returns URL của ảnh đã upload, hoặc null nếu thất bại
 */
export async function generateAndUploadFeaturedImage(
  ingredientName: string,
  locale: Locale,
  imagePromptText: { vi: string; en: string },
  uploadToPayload: (buffer: Buffer, filename: string, mimeType: string, alt: string) => Promise<{ id: string; url: string } | null>,
): Promise<{ id: string; url: string } | null> {
  const client = getOpenAIClient()
  const preferredPrompt = imagePromptText[locale] || imagePromptText.vi

  // Stage 1: Refine prompt với GPT-4o
  const refinementPrompt = `Bạn là chuyên gia viết prompt cho DALL·E 3 trong ngành dược phẩm, mỹ phẩm và thực phẩm chức năng.

Viết một image prompt CHUYÊN NGHIỆP, THỰC TẾ để DALL·E 3 vẽ hình đại diện (featured image) cho nguyên liệu sau:

TÊN NGUYÊN LIỆU: ${ingredientName}
PROMPT GỐC: ${preferredPrompt}

YÊU CẦU:
- Phong cách: khoa học, chuyên nghiệp, thực tế (không cartoon, không fantasy)
- Background: trắng hoặc gradient nhẹ, studio chụp sản phẩm dược phẩm
- Nội dung: ${ingredientName} dạng nguyên liệu thực (bột, dịch, viên nén, cây thực vật...) phù hợp với ngành dược/mỹ phẩm
- GÓC NHÌN: close-up hoặc macro, rõ ràng, chuyên nghiệp
- KHÔNG có text, logo, watermark
- ÁNH SÁNG: studio, đều, chuyên nghiệp
- Format: mô tả bằng tiếng Anh

Trả về JSON: {"prompt": "<image prompt bằng tiếng Anh, tối đa 400 ký tự>". Chỉ trả về JSON, không giải thích gì thêm.`

  let refinedPrompt: string
  try {
    const refinement = await client.chat.completions.create({
      model: IMAGE_PROMPT_MODEL,
      messages: [{ role: 'user', content: refinementPrompt }],
      response_format: { type: 'json_object' },
      ...completionParams(IMAGE_PROMPT_MODEL, 500, 0.3),
    })
    const refined = JSON.parse(refinement.choices[0]?.message?.content ?? '{}') as { prompt?: string }
    refinedPrompt = refined.prompt ?? preferredPrompt
  } catch {
    refinedPrompt = preferredPrompt
  }

  // Stage 2: Generate image với DALL·E 3
  let imageBuffer: Buffer
  try {
    // gpt-image-1 returns b64_json (no `style`/`response_format` params); dall-e-3
    // used `style`/`quality: standard`. Keep the call minimal + model-agnostic.
    const imageResponse = await client.images.generate({
      model: IMAGE_GENERATION_MODEL,
      prompt: refinedPrompt,
      size: IMAGE_SIZE,
      quality: IMAGE_QUALITY,
      n: 1,
    })

    const first = imageResponse.data?.[0]
    // dall-e-3 returns `url`; some image models return base64 in `b64_json`.
    if (first?.b64_json) {
      imageBuffer = Buffer.from(first.b64_json, 'base64')
    } else if (first?.url) {
      const fetchRes = await fetch(first.url)
      if (!fetchRes.ok) throw new Error(`Tải ảnh về thất bại: HTTP ${fetchRes.status}`)
      imageBuffer = Buffer.from(await fetchRes.arrayBuffer())
    } else {
      throw new Error('OpenAI không trả về dữ liệu ảnh (thiếu url và b64_json)')
    }
  } catch (err) {
    // Re-throw so the worker can surface the real reason in the job log.
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[AI Image] Generation failed:', err)
    throw new Error(msg)
  }

  // Stage 3: Upload lên Payload Media
  const filename = `featured-${ingredientName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${Date.now()}.png`
  const alt = `${ingredientName} — featured image generated by AI`

  const result = await uploadToPayload(imageBuffer, filename, 'image/png', alt)
  return result
}

// ---------------------------------------------------------------------------
// Prompt builders
// ---------------------------------------------------------------------------

function buildContentSystemPrompt(): string {
  return `Bạn là chuyên gia khoa học trong ngành dược phẩm, mỹ phẩm và thực phẩm chức năng với 15 năm kinh nghiệm R&D tại Việt Nam và quốc tế.

Bạn làm việc cho CÔNG TY BIOSCOPE — chuyên gia nghiên cứu, phát triển và phân phối công nghệ, nguyên liệu và thành phẩm công nghệ cao cho y tế, dược phẩm, thực phẩm và mỹ phẩm.

ĐỊNH VỊ CÔNG TY:
- Thành lập 2011, TP. Hồ Chí Minh
- Hơn 23 dự án nghiên cứu, 14 đơn sáng chế
- Đối tác tin cậy của các nhà sản xuất uy tín toàn cầu
- Các công nghệ nổi bật: Nano hoạt chất, làm giàu khoáng thực vật, dẫn thuốc qua da Novaskin, Phytosome ướt

NGUYÊN TẮC VIẾT:
1. Viết bằng tiếng VIỆT CHUẨN cho field "vi", tiếng ANH CHUYÊN NGÀNH cho field "en"
2. Không bịa đặt thông tin — chỉ dựa trên dữ liệu được cung cấp từ TDS/PDF. TUYỆT ĐỐI không tự chế số liệu specs/hàm lượng/độ tinh khiết: chỉ điền specs khi con số đó XUẤT HIỆN trong tài liệu; nếu tài liệu không có số → để specs rỗng, KHÔNG đoán bừa
3. Nếu thiếu thông tin định tính (mô tả, ứng dụng), có thể suy luận khoa học hợp lý dựa trên tên hoạt chất và nguồn gốc — nhưng KHÔNG áp dụng cho số liệu định lượng
4. Description: 250-400 từ, chia 2-3 đoạn, chuyên nghiệp, có điểm nhấn khoa học (cơ chế tác dụng, nguồn gốc/công nghệ chiết xuất, ứng dụng thực tế trong công thức)
5. Benefits: 4-8 items, ngắn gọn, dễ hiểu, có số liệu nếu có
6. Applications: 3-6 items, liệt kê dạng bào chế cụ thể
7. Badges: chứng nhận phổ biến trong ngành (Halal, Kosher, Non-GMO, FDA, GMP...)
8. SuggestedDosage: liều tham khảo an toàn, ghi rõ nguồn tham khảo
9. INCI: tên khoa học/Latin nếu suy ra được; specs: 3-6 thông số kỹ thuật rút từ TDS (hàm lượng, độ tinh khiết, dạng...)
10. SEO: seoTitle ≤ 60 ký tự (tên + lợi ích chính), seoDescription 120-155 ký tự hấp dẫn có từ khóa — CẢ vi + en
11. NAME: chuẩn hóa lại tên sản phẩm — BỎ số thứ tự đầu dòng ("1.", "2."), BỎ mã nội bộ và hậu tố như "(TM)", "- TQ", "- Đức", "- VN"; viết hoa đúng chuẩn; giữ tên thương mại + hoạt chất chính. KHÔNG tự bịa thêm chữ không có trong tên gốc

TRẢ VỀ ĐỊNH DẠNG JSON — KHÔNG giải thích, KHÔNG markdown code block.`
}

function buildContentUserPrompt(
  ingredient: {
    name: string
    type?: string
    inci?: string
    originCountry?: string
    brandName?: string
    category?: string
    driveFiles?: Array<{ fileName: string; mimeType: string }>
  },
  driveFileContents: string,
): string {
  const fileList = ingredient.driveFiles
    ?.map((f) => `- ${f.fileName} (${f.mimeType})`)
    .join('\n') ?? 'Không có file đính kèm'

  return `## NGUYÊN LIỆU CẦN VIẾT NỘI DUNG

**Tên nguyên liệu:** ${ingredient.name}
**Loại:** ${ingredient.type ?? 'Không xác định'}
**Tên INCI:** ${ingredient.inci ?? 'Không có'}
**Quốc gia gốc:** ${ingredient.originCountry ?? 'Không xác định'}
**Thương hiệu OEM:** ${ingredient.brandName ?? 'Không có'}
**Danh mục:** ${ingredient.category ?? 'Không xác định'}

## FILE ĐÍNH KÈM TỪ GOOGLE DRIVE
${fileList}

## NỘI DUNG TRÍCH XUẤT TỪ TDS/PDF
---
${driveFileContents || 'Không có nội dung từ file Drive'}
---

## YÊU CẦU ĐẦU RA

Trả về JSON với format sau (VIẾT ĐẦY ĐỦ cả 2 ngôn ngữ):

{
  "name": {
    "vi": "<TÊN SẢN PHẨM ĐÃ CHUẨN HÓA tiếng Việt: bỏ số thứ tự đầu dòng (VD '1.'), bỏ mã nội bộ/hậu tố như '(TM)', '- TQ', '- Đức', viết hoa đúng chuẩn, giữ tên thương mại + hoạt chất chính. VD: '1. Đường Erythritol - TQ(TM)' → 'Đường Erythritol'>",
    "en": "<standardized English/international product name, VD: 'Erythritol'>"
  },
  "subtitle": {
    "vi": "<tên ngắn gọn 1 câu, thu hút, có yếu tố khoa học hoặc lợi ích nổi bật, 20-60 ký tự>",
    "en": "<tiếng Anh chuyên ngành, 1 dòng, thu hút, 20-80 ký tự>"
  },
  "description": {
    "vi": "<mô tả 150-300 từ tiếng Việt, có cấu trúc: giới thiệu → đặc điểm → ứng dụng → tại sao Bioscope chọn>",
    "en": "<150-300 words English, professional pharma/cosmetic tone>"
  },
  "benefits": [
    "<lợi ích 1 — có số liệu nếu có, VD: Tăng sinh collagen lên 47% sau 4 tuần (in vitro)>",
    "<lợi ích 2>",
    "... 4-8 items>"
  ],
  "applications": [
    "<ứng dụng 1 — dạng bào chế cụ thể, VD: Kem dưỡng da chống lão hóa>",
    "<ứng dụng 2>",
    "... 3-6 items>"
  ],
  "badges": [
    "<chứng nhận 1 — VD: GMP Certified>",
    "<chứng nhận 2 — VD: Halal Certified>",
    "<chứng nhận 3 — VD: Non-GMO Verified>",
    "... các chứng nhận phù hợp với ngành và nguồn gốc>"
  ],
  "suggestedDosage": "<liều dùng gợi ý, VD: 100-500mg/ngày (tham khảo từ TDS và tài liệu khoa học)>",
  "inci": {
    "vi": "<tên khoa học / INCI (tên Latin), VD: Oryza Sativa Bran Oil — nếu không xác định được để chuỗi rỗng>",
    "en": "<INCI name, thường giống tiếng Việt>"
  },
  "originCountry": "<mã quốc gia xuất xứ 2 ký tự nếu suy ra được từ tài liệu, VD: NO cho Na Uy, JP, VN — nếu không rõ để chuỗi rỗng>",
  "tag": "<một trong: NEW | TRENDING | EXCLUSIVE — hoặc null nếu không phù hợp>",
  "specs": [
    {
      "label": { "vi": "<tên thông số, VD: Hàm lượng>", "en": "<English label, e.g. Content>" },
      "value": "<giá trị, VD: 95>",
      "unit": "<đơn vị nếu có, VD: % — bỏ trống nếu không có>"
    },
    "... 3-6 thông số kỹ thuật rút ra từ TDS (hàm lượng hoạt chất, độ tinh khiết, dạng, xuất xứ...)>"
  ],
  "seoTitle": {
    "vi": "<tiêu đề SEO tiếng Việt, ≤ 60 ký tự, chứa tên nguyên liệu + lợi ích chính>",
    "en": "<SEO title English, ≤ 60 chars>"
  },
  "seoDescription": {
    "vi": "<meta description tiếng Việt, 120-155 ký tự, hấp dẫn, chứa từ khóa>",
    "en": "<meta description English, 120-155 chars>"
  },
  "imagePrompt": {
    "vi": "<mô tả ngắn hình ảnh đại diện bằng tiếng Việt — phong cách studio dược phẩm, góc nhìn close-up, có mô tả nguyên liệu rõ ràng, 50-200 ký tự>",
    "en": "<English image description for DALL·E 3 — professional pharmaceutical/cosmetic studio style, close-up view, realistic, no text, max 200 chars>"
  }
}`
}

// ---------------------------------------------------------------------------
// Drive file content extraction helpers
// ---------------------------------------------------------------------------

/**
 * Trích xuất nội dung text từ PDF buffer sử dụng pdfjs-dist.
 * Worker code động (không có import top-level vì pdfjs-dist dùng WASM).
 *
 * @param buffer PDF buffer
 * @returns Nội dung text thuần (không giữ format)
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  // pdfjs-dist v4 calls Promise.withResolvers(), which only exists on Node 22+.
  // Polyfill it so PDF extraction also works on Node 20 (current Docker image).
  const P = Promise as unknown as { withResolvers?: () => unknown }
  if (typeof P.withResolvers !== 'function') {
    P.withResolvers = function withResolvers<T>() {
      let resolve!: (v: T | PromiseLike<T>) => void
      let reject!: (r?: unknown) => void
      const promise = new Promise<T>((res, rej) => {
        resolve = res
        reject = rej
      })
      return { promise, resolve, reject }
    }
  }

  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const PDFJS = pdfjsLib

  // Pass a Uint8Array (pdfjs detaches the underlying buffer) to avoid corrupting
  // the shared Node Buffer, and disable the worker for a pure-Node environment.
  const data = new Uint8Array(buffer)
  const loadingTask = PDFJS.getDocument({ data, useWorkerFetch: false, isEvalSupported: false })
  const pdf = await loadingTask.promise

  const texts: string[] = []
  const maxPages = Math.min(pdf.numPages, 20) // Giới hạn 20 trang để tránh token explosion

  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item: any) => item.str ?? '')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()

    if (pageText) texts.push(pageText)
  }

  return texts.join('\n\n--- Page break ---\n\n')
}

/**
 * Truncate text để fit trong GPT-4o context window.
 * GPT-4o supports 128k tokens → giới hạn 100k chars cho an toàn.
 */
export function truncateForAI(text: string, maxChars = 80_000): string {
  if (text.length <= maxChars) return text
  return text.slice(0, maxChars) + '\n\n[...content truncated due to length...]'
}

// ---------------------------------------------------------------------------
// Vision — GPT-4o đọc hình ảnh (OCR, scanned PDF, ingredient photos)
// ---------------------------------------------------------------------------

/**
 * Trích xuất text từ hình ảnh bằng GPT-4o Vision.
 * Dùng cho:
 *   - Scanned PDF (pdfjs-dist trả về text rỗng → dùng vision)
 *   - Hình ảnh chụp TDS, tài liệu, ingredient photos
 *
 * @param imageBuffer Buffer của ảnh (JPEG, PNG, WebP...)
 * @param fileName Tên file để mô tả trong prompt
 * @returns Nội dung text trích xuất được
 */
export async function extractTextFromImageUsingVision(
  imageBuffer: Buffer,
  fileName: string,
): Promise<string> {
  const client = getOpenAIClient()

  // Detect MIME type từ magic bytes
  const mimeType = detectImageMimeType(imageBuffer)

  // Convert to base64
  const base64Image = imageBuffer.toString('base64')
  const dataUrl = `data:${mimeType};base64,${base64Image}`

  const systemPrompt = `Bạn là chuyên gia OCR trong ngành dược phẩm, mỹ phẩm và thực phẩm chức năng.

Từ hình ảnh được cung cấp, hãy:
1. Trích xuất TẤT CẢ text có trong ảnh
2. Giữ nguyên cấu trúc: tiêu đề, bảng, danh sách, bullet points
3. Nếu là tài liệu kỹ thuật (TDS, MSDS, COA, Certificate...), trích xuất đầy đủ:
   - Tên hoạt chất, CAS number, INCI name
   - Thông số kỹ thuật (purity, moisture, particle size...)
   - Liều dùng khuyến nghị
   - Điều kiện bảo quản
   - Thông tin nhà sản xuất
4. Nếu là ảnh chụp sản phẩm/nguyên liệu, mô tả những gì bạn thấy
5. Trả về text thuần, KHÔNG giải thích, KHÔNG markdown

Nếu ảnh không chứa text có ý nghĩa, trả về: "[No readable text found]"`

  try {
    const response = await client.chat.completions.create({
      model: VISION_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: dataUrl, detail: 'high' },
            },
            {
              type: 'text',
              text: `Trích xuất text từ hình ảnh: ${fileName}`,
            },
          ],
        },
      ],
      ...completionParams(VISION_MODEL, 4096, 0.1),
    })

    const text = response.choices[0]?.message?.content ?? ''
    return text.trim()
  } catch (err) {
    console.error('[Vision OCR] Failed:', err)
    return ''
  }
}

/**
 * Detect image MIME type từ magic bytes (buffer).
 */
function detectImageMimeType(buffer: Buffer): string {
  if (buffer.length < 4) return 'image/png'

  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return 'image/png'
  }
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg'
  }
  // WebP: RIFF....WEBP
  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) {
    return 'image/webp'
  }
  // GIF: 47 49 46 38
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
    return 'image/gif'
  }
  // Default
  return 'image/png'
}
