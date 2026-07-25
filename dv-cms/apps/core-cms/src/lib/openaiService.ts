/**
 * OpenAI Service — sinh nội dung + hình ảnh cho nguyên liệu.
 * Model mặc định: GPT-5.6 (nội dung/vision) + gpt-image-2 (ảnh), đổi qua env.
 *
 * Hai tác vụ tách biệt:
 *   1. Nội dung → hồ sơ nguyên liệu đầy đủ. Prompt chia 2 tầng:
 *      · LOẠI A (specs, technical.*, regulatory.*) = TRÍCH XUẤT từ TDS,
 *        cấm suy diễn — bỏ trống khi tài liệu không ghi.
 *      · LOẠI B (description, benefits, research.mechanism, SEO) = BIÊN TẬP,
 *        được suy luận khoa học nhưng mọi con số vẫn phải có trong tài liệu.
 *   2. Ảnh → refine prompt → vẽ hình → upload lên Payload Media.
 *      Prompt ảnh do worker dựng từ bản ghi ĐÃ LƯU (xem
 *      buildImagePromptFromIngredient) nên chạy full và chạy lẻ cho chất lượng
 *      như nhau.
 *
 * KHÔNG dùng n8n — gọi trực tiếp từ CMS backend để đảm bảo:
 *   - Không phụ thuộc external webhook
 *   - Không tốn thêm 1-3s cho round-trip n8n
 *   - Payload Media upload ngay trong process (không cần external relay)
 */

import OpenAI from 'openai'
import type { ChatCompletionContentPart } from 'openai/resources/chat/completions'

// ---------------------------------------------------------------------------
// Client singleton
// ---------------------------------------------------------------------------

let _client: OpenAI | null = null

/**
 * Per-request timeout (ms). The SDK default is 10 minutes, and with the default
 * 2 retries a single hung call could hold the sequential AI queue for ~30 min
 * while every other ingredient waits. Image generation is the slowest legitimate
 * call (~30-90s), so 3 minutes leaves generous headroom while still failing fast.
 */
const OPENAI_TIMEOUT_MS = Number(process.env.OPENAI_TIMEOUT_MS ?? 180_000)
/** Retries per call. Worst case queue occupancy = TIMEOUT × (1 + retries). */
const OPENAI_MAX_RETRIES = Number(process.env.OPENAI_MAX_RETRIES ?? 2)

export function getOpenAIClient(): OpenAI {
  if (_client) return _client

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY env var is not set')

  _client = new OpenAI({
    apiKey,
    timeout: OPENAI_TIMEOUT_MS,
    maxRetries: OPENAI_MAX_RETRIES,
  })
  return _client
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Locale = 'vi' | 'en'

export type LocalizedText = { vi: string; en: string }

/**
 * Technical dossier — mirrors the `technical` group on the Ingredients
 * collection. These are TRANSCRIPTION fields: the model must copy them from the
 * TDS/COA or leave them empty. It must never infer a CAS number or a shelf life.
 */
export type GeneratedTechnical = {
  casNumber?: string
  hsCode?: string
  eNumber?: string
  particleSize?: string
  assay?: LocalizedText
  standardization?: LocalizedText
  appearance?: LocalizedText
  solubility?: LocalizedText
  shelfLife?: LocalizedText
  storage?: LocalizedText
  packaging?: LocalizedText
  leadTime?: LocalizedText
  incompatibility?: LocalizedText
}

/** Regulatory group. `status` values must match the select options on the collection. */
export type RegulatoryStatus = 'fda_gras' | 'efsa' | 'vn_moh' | 'novel_food'

export type GeneratedRegulatory = {
  status?: RegulatoryStatus[]
  registrationNo?: string
  usageLimit?: LocalizedText
}

export type GeneratedResearch = {
  mechanism?: LocalizedText
}

/** Bảng giá NỘI BỘ lấy từ file "Mô tả". Chỉ điền khi tài liệu có ghi. */
export type GeneratedPricing = {
  quoteDate?: string
  currency?: 'VND' | 'USD'
  terms?: LocalizedText
  tiers?: Array<{ moq: string; price?: number; unit?: string; note?: string }>
}

export type GeneratedSpec = {
  label: LocalizedText | string
  value: string
  unit?: string
  /** Render style on the frontend. `bar`/`donut` also need `percent`. */
  display?: 'text' | 'number' | 'bar' | 'donut'
  /** 0–100, only meaningful for bar/donut. */
  percent?: number
}

export type GeneratedContent = {
  name?: LocalizedText
  subtitle: LocalizedText
  description: LocalizedText
  benefits: { vi: string[]; en: string[] }
  applications: { vi: string[]; en: string[] }
  badges: string[]
  suggestedDosage?: LocalizedText
  inci?: LocalizedText
  originCountry?: string
  brandName?: string
  moq?: string
  tag?: 'NEW' | 'TRENDING' | 'EXCLUSIVE' | null
  specs?: GeneratedSpec[]
  technical?: GeneratedTechnical
  regulatory?: GeneratedRegulatory
  research?: GeneratedResearch
  pricing?: GeneratedPricing
  /** Thẻ lọc — AI chọn theo TÊN, worker đối chiếu sang id. Không được bịa tên mới. */
  facets?: { primaries?: string[]; functions?: string[]; natures?: string[]; forms?: string[]; properties?: string[] }
  seoTitle?: LocalizedText
  seoDescription?: LocalizedText
  imagePrompt: LocalizedText
}

/**
 * File gửi kèm thẳng vào lời gọi sinh nội dung (PDF hoặc ảnh).
 * Tên giữ là PdfAttachment cho tương thích; `buffer` tự quyết định loại content
 * part khi dựng request (xem toContentPart).
 */
export type PdfAttachment = { filename: string; buffer: Buffer }

/** Nhận diện ảnh qua magic bytes để chọn đúng loại content part. */
function attachmentMime(buf: Buffer): { mime: string; isImage: boolean } {
  const img = detectImageMimeType(buf)
  if (img) return { mime: img, isImage: true }
  return { mime: 'application/pdf', isImage: false }
}

/**
 * PDF đi qua content part `file`; ảnh đi qua `image_url`. OpenAI không nhận ảnh
 * ở ô file và không nhận PDF ở ô image_url — gửi sai ô là bị từ chối ngay.
 */
function toContentPart(a: PdfAttachment): ChatCompletionContentPart {
  const { mime, isImage } = attachmentMime(a.buffer)
  const dataUri = `data:${mime};base64,${a.buffer.toString('base64')}`
  return isImage
    ? { type: 'image_url', image_url: { url: dataUri, detail: 'high' } }
    : { type: 'file', file: { filename: a.filename, file_data: dataUri } }
}

/**
 * Trần tổng dung lượng file đính kèm. OpenAI giới hạn 50MB cho CẢ request, nên
 * chừa biên an toàn cho phần prompt text.
 */
export const ATTACHMENT_MAX_TOTAL_BYTES = Number(
  process.env.OPENAI_ATTACHMENT_MAX_BYTES ?? 40 * 1024 * 1024,
)

export type GenerationResult =
  | { ok: true; content: GeneratedContent }
  | { ok: false; error: string }

// ---------------------------------------------------------------------------
// Token / cost accounting
// ---------------------------------------------------------------------------

type CallUsage = { prompt: number; completion: number; calls: number }

/**
 * Per-job token accounting, split by purpose so a job's cost can be attributed
 * (a scanned TDS drives the `vision` bucket; a long TDS drives `content`).
 * Passed in by the worker and mutated in place by each call.
 */
export type AiUsage = {
  content: CallUsage
  vision: CallUsage
  imagePrompt: CallUsage
  /** Images actually generated (billed per image, not per token). */
  images: number
  /** Số trang PDF do Mistral OCR xử lý (tính tiền theo trang, không theo token). */
  ocrPages: number
}

export function createUsage(): AiUsage {
  return {
    content: { prompt: 0, completion: 0, calls: 0 },
    vision: { prompt: 0, completion: 0, calls: 0 },
    imagePrompt: { prompt: 0, completion: 0, calls: 0 },
    images: 0,
    ocrPages: 0,
  }
}

/** Fold one chat-completion's `usage` block into the accumulator. */
function recordUsage(
  usage: AiUsage | undefined,
  bucket: keyof Omit<AiUsage, 'images' | 'ocrPages'>,
  raw: { prompt_tokens?: number; completion_tokens?: number } | undefined,
): void {
  if (!usage) return
  usage[bucket].prompt += raw?.prompt_tokens ?? 0
  usage[bucket].completion += raw?.completion_tokens ?? 0
  usage[bucket].calls += 1
}

/**
 * Bảng đơn giá theo model (USD / 1M token), tra tại openai.com/api/pricing
 * tháng 07/2026. Giá model CÓ đổi theo thời gian — OPENAI_PRICE_* luôn ghi đè,
 * và log ghi rõ đang dùng bảng này hay giá do bạn đặt.
 *
 * Chênh lệch rất đáng kể: luna rẻ hơn terra 2,5 lần ở CẢ hai chiều.
 */
const MODEL_PRICES: Record<string, { input: number; cachedInput: number; output: number }> = {
  'gpt-5.6-sol': { input: 5, cachedInput: 0.5, output: 30 },
  'gpt-5.6-terra': { input: 2.5, cachedInput: 0.25, output: 15 },
  'gpt-5.6-luna': { input: 1, cachedInput: 0.1, output: 6 },
}
/** Dùng khi model không có trong bảng — lấy mức terra cho khỏi ước quá thấp. */
const FALLBACK_PRICE = MODEL_PRICES['gpt-5.6-terra']
const DEFAULT_PRICE_PER_IMAGE = 0.04
/** Mistral OCR: $4 / 1.000 trang (tra 07/2026). Đổi qua MISTRAL_OCR_PRICE_PER_PAGE. */
const DEFAULT_PRICE_PER_OCR_PAGE = 0.004
/** Tỉ giá USD→VND để log kèm tiền Việt. Đổi qua OPENAI_USD_TO_VND. */
const DEFAULT_USD_TO_VND = 25_400

const numOr = (v: string | undefined, fallback: number): number => {
  const n = Number(v)
  return Number.isFinite(n) && n >= 0 ? n : fallback
}

export type CostEstimate = {
  usd: number
  vnd: number
  /** true nếu đang dùng bảng giá dựng sẵn (chưa đặt OPENAI_PRICE_*). */
  usingDefaults: boolean
  /** Model được dùng để tra bảng giá. */
  model: string
  rates: { inputPer1M: number; outputPer1M: number; perImage: number; perOcrPage: number; usdToVnd: number }
}

/**
 * Ước tính chi phí một job. Luôn trả về con số — tra bảng giá theo CONTENT_MODEL
 * đang cấu hình, nên đổi model là log tự tính theo giá đúng của model đó.
 */
export function estimateCost(usage: AiUsage): CostEstimate {
  const usingDefaults =
    process.env.OPENAI_PRICE_INPUT_PER_1M == null && process.env.OPENAI_PRICE_OUTPUT_PER_1M == null

  const model = CONTENT_MODEL
  const table = MODEL_PRICES[model] ?? FALLBACK_PRICE

  const inputPer1M = numOr(process.env.OPENAI_PRICE_INPUT_PER_1M, table.input)
  const outputPer1M = numOr(process.env.OPENAI_PRICE_OUTPUT_PER_1M, table.output)
  const perImage = numOr(process.env.OPENAI_PRICE_PER_IMAGE, DEFAULT_PRICE_PER_IMAGE)
  const perOcrPage = numOr(process.env.MISTRAL_OCR_PRICE_PER_PAGE, DEFAULT_PRICE_PER_OCR_PAGE)
  const usdToVnd = numOr(process.env.OPENAI_USD_TO_VND, DEFAULT_USD_TO_VND)

  const promptTokens = usage.content.prompt + usage.vision.prompt + usage.imagePrompt.prompt
  const completionTokens = usage.content.completion + usage.vision.completion + usage.imagePrompt.completion

  const usd =
    (promptTokens / 1_000_000) * inputPer1M +
    (completionTokens / 1_000_000) * outputPer1M +
    usage.images * perImage +
    usage.ocrPages * perOcrPage

  return {
    usd: Math.round(usd * 1_000_000) / 1_000_000,
    vnd: Math.round(usd * usdToVnd),
    usingDefaults,
    model,
    rates: { inputPer1M, outputPer1M, perImage, perOcrPage, usdToVnd },
  }
}

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
 * Bòn CHI TIẾT lỗi từ OpenAI SDK. `.message` thường chỉ là câu chung chung; các
 * trường status/type/code/param mới nói được nguyên nhân thật (vd param sai,
 * model không hỗ trợ input). Không có chúng thì lỗi 500 không thể chẩn đoán.
 */
function openaiErrorDetail(err: unknown): string {
  const e = err as {
    status?: number
    code?: string | null
    type?: string
    param?: string | null
    message?: string
    error?: { message?: string; type?: string; code?: string; param?: string }
  }
  const parts = [
    e?.status != null && `status=${e.status}`,
    (e?.type || e?.error?.type) && `type=${e.type ?? e.error?.type}`,
    (e?.code || e?.error?.code) && `code=${e.code ?? e.error?.code}`,
    (e?.param || e?.error?.param) && `param=${e.param ?? e.error?.param}`,
  ].filter(Boolean)
  const msg = e?.error?.message || e?.message || String(err)
  return parts.length ? `${msg} [${parts.join(' ')}]` : msg
}

/**
 * Coerce the model's JSON into the GeneratedContent shape. Different models
 * (gpt-4o vs gpt-5.6) vary: a bilingual field may come back as a plain string,
 * and list fields may be missing or contain objects. Normalize so downstream
 * writeback never trips over shape differences.
 */
function normalizeGenerated(raw: unknown): GeneratedContent {
  const o = (raw ?? {}) as Record<string, unknown>

  // {vi,en} — accept a plain string or a partial object.
  const pair = (v: unknown): { vi: string; en: string } | undefined => {
    if (v == null) return undefined
    if (typeof v === 'string') return { vi: v, en: v }
    if (typeof v === 'object') {
      const p = v as { vi?: unknown; en?: unknown }
      const vi = typeof p.vi === 'string' ? p.vi : typeof p.en === 'string' ? p.en : ''
      const en = typeof p.en === 'string' ? p.en : vi
      return vi || en ? { vi, en } : undefined
    }
    return undefined
  }

  // string[] — accept a string, or an array of strings/objects (pick label/text/value).
  const list = (v: unknown): string[] => {
    if (typeof v === 'string') return v.trim() ? [v.trim()] : []
    if (!Array.isArray(v)) return []
    return v
      .map((it) => {
        if (typeof it === 'string') return it.trim()
        if (it && typeof it === 'object') {
          const x = it as Record<string, unknown>
          const cand = x.text ?? x.label ?? x.value ?? x.vi
          return typeof cand === 'string' ? cand.trim() : ''
        }
        return ''
      })
      .filter(Boolean)
  }

  const str = (v: unknown): string | undefined =>
    typeof v === 'string' ? v : v == null ? undefined : String(v)

  // Split a legacy bilingual blob "VI: … | EN: …" into its two sides.
  const splitBilingual = (s: string): { vi: string; en: string } => {
    const m = s.match(/VI:\s*([\s\S]*?)\s*\|\s*EN:\s*([\s\S]*)$/i)
    if (m) return { vi: m[1].trim(), en: m[2].trim() }
    return { vi: s, en: s }
  }

  // {vi:[],en:[]} — accept the per-locale object, or a flat array (possibly of
  // "VI: … | EN: …" blobs) and split it into the two locales.
  const listPair = (v: unknown): { vi: string[]; en: string[] } => {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const p = v as { vi?: unknown; en?: unknown }
      const vi = list(p.vi)
      const en = list(p.en)
      if (vi.length || en.length) return { vi: vi.length ? vi : en, en: en.length ? en : vi }
    }
    const flat = list(v)
    return { vi: flat.map((s) => splitBilingual(s).vi), en: flat.map((s) => splitBilingual(s).en) }
  }

  /** Drop a {vi,en} pair whose both sides are blank, so we never write "" over real data. */
  const pairOrUndef = (v: unknown): LocalizedText | undefined => {
    const p = pair(v)
    return p && (p.vi.trim() || p.en.trim()) ? p : undefined
  }

  /** Trimmed non-empty string, else undefined — same "never overwrite with blank" rule. */
  const strOrUndef = (v: unknown): string | undefined => {
    const s = str(v)?.trim()
    return s ? s : undefined
  }

  // The technical dossier arrives as a nested object; tolerate a flat shape too
  // (some models emit `technical_casNumber` instead of `technical.casNumber`).
  const groupOf = (key: string): Record<string, unknown> => {
    const nested = o[key]
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      return nested as Record<string, unknown>
    }
    const prefix = `${key}_`
    const flatKeys = Object.keys(o).filter((k) => k.startsWith(prefix))
    if (!flatKeys.length) return {}
    return Object.fromEntries(flatKeys.map((k) => [k.slice(prefix.length), o[k]]))
  }

  const t = groupOf('technical')
  const technical: GeneratedTechnical = {
    casNumber: strOrUndef(t.casNumber),
    hsCode: strOrUndef(t.hsCode),
    eNumber: strOrUndef(t.eNumber),
    particleSize: strOrUndef(t.particleSize),
    assay: pairOrUndef(t.assay),
    standardization: pairOrUndef(t.standardization),
    appearance: pairOrUndef(t.appearance),
    solubility: pairOrUndef(t.solubility),
    shelfLife: pairOrUndef(t.shelfLife),
    storage: pairOrUndef(t.storage),
    packaging: pairOrUndef(t.packaging),
    leadTime: pairOrUndef(t.leadTime),
    incompatibility: pairOrUndef(t.incompatibility),
  }

  const VALID_REG_STATUS: RegulatoryStatus[] = ['fda_gras', 'efsa', 'vn_moh', 'novel_food']
  const r = groupOf('regulatory')
  // `status` may come back as an array, or as a "efsa | vn_moh" / "efsa, vn_moh"
  // string. Keep only values the collection's select actually accepts —
  // an unknown value would fail validation and sink the whole write.
  const regStatus = (Array.isArray(r.status) ? r.status : String(r.status ?? '').split(/[|,]/))
    .map((s) => String(s).trim().toLowerCase())
    .filter((s): s is RegulatoryStatus => (VALID_REG_STATUS as string[]).includes(s))
  const regulatory: GeneratedRegulatory = {
    status: regStatus.length ? Array.from(new Set(regStatus)) : undefined,
    registrationNo: strOrUndef(r.registrationNo),
    usageLimit: pairOrUndef(r.usageLimit),
  }

  const research: GeneratedResearch = { mechanism: pairOrUndef(groupOf('research').mechanism) }

  const fc = groupOf('facets')
  const facets = {
    primaries: list(fc.primaries),
    functions: list(fc.functions),
    natures: list(fc.natures),
    forms: list(fc.forms),
    properties: list(fc.properties),
  }

  const pr = groupOf('pricing')
  const rawTiers = Array.isArray(pr.tiers) ? (pr.tiers as Array<Record<string, unknown>>) : []
  const tiers = rawTiers
    .map((t) => {
      const moq = strOrUndef(t.moq)
      if (!moq) return undefined // bậc phải có MOQ, nếu không thì vô nghĩa
      const priceNum = Number(String(t.price ?? '').replace(/[^\d.]/g, ''))
      return {
        moq,
        price: Number.isFinite(priceNum) && priceNum > 0 ? priceNum : undefined,
        unit: strOrUndef(t.unit) ?? 'kg',
        note: strOrUndef(t.note),
      }
    })
    .filter((t): t is NonNullable<typeof t> => Boolean(t))
  const pricing: GeneratedPricing = {
    quoteDate: strOrUndef(pr.quoteDate),
    currency: pr.currency === 'USD' ? 'USD' : strOrUndef(pr.currency) ? 'VND' : undefined,
    terms: pairOrUndef(pr.terms),
    tiers: tiers.length ? tiers : undefined,
  }

  /** Keep a group only if at least one member survived — avoids empty writes. */
  const nonEmpty = <T extends object>(g: T): T | undefined =>
    Object.values(g).some((v) => v !== undefined) ? g : undefined

  const VALID_DISPLAY = ['text', 'number', 'bar', 'donut'] as const
  const specs: GeneratedSpec[] | undefined = Array.isArray(o.specs)
    ? (o.specs as Array<Record<string, unknown>>).map((s) => {
        const display = VALID_DISPLAY.includes(s?.display as (typeof VALID_DISPLAY)[number])
          ? (s.display as GeneratedSpec['display'])
          : 'text'
        // `percent` is only meaningful for bar/donut, and the field is clamped
        // 0–100 on the collection — send nothing rather than an out-of-range
        // number that would fail validation.
        const rawPct = Number(s?.percent)
        const percent =
          (display === 'bar' || display === 'donut') && Number.isFinite(rawPct)
            ? Math.min(100, Math.max(0, Math.round(rawPct)))
            : undefined
        return {
          label: (s?.label ?? '') as GeneratedSpec['label'],
          value: String(s?.value ?? ''),
          unit: strOrUndef(s?.unit),
          display,
          percent,
        }
      })
    : undefined

  return {
    technical: nonEmpty(technical),
    regulatory: nonEmpty(regulatory),
    research: nonEmpty(research),
    pricing: nonEmpty(pricing),
    facets: Object.values(facets).some((v) => v.length) ? facets : undefined,
    brandName: strOrUndef(o.brandName),
    moq: strOrUndef(o.moq),
    name: pair(o.name),
    subtitle: pair(o.subtitle) ?? { vi: '', en: '' },
    description: pair(o.description) ?? { vi: '', en: '' },
    benefits: listPair(o.benefits),
    applications: listPair(o.applications),
    badges: list(o.badges),
    // Localized on the collection — accept a plain string (older prompt shape)
    // and mirror it into both locales via `pair`.
    suggestedDosage: pairOrUndef(o.suggestedDosage),
    inci: pair(o.inci),
    originCountry: strOrUndef(o.originCountry),
    tag: (['NEW', 'TRENDING', 'EXCLUSIVE'].includes(o.tag as string) ? o.tag : null) as GeneratedContent['tag'],
    specs,
    seoTitle: pair(o.seoTitle),
    seoDescription: pair(o.seoDescription),
    imagePrompt: pair(o.imagePrompt) ?? { vi: '', en: '' },
  }
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
    /** Danh sách thẻ lọc khả dụng, nhóm theo loại — AI chỉ được chọn trong đây. */
    availableFacets?: Record<string, string[]>
  },
  driveFileContents: string,
  usage?: AiUsage,
  attachments: PdfAttachment[] = [],
): Promise<GenerationResult> {
  const client = getOpenAIClient()

  const systemPrompt = buildContentSystemPrompt()

  /**
   * Một lượt gọi model. Tách hàm để có thể gọi lại KHÔNG kèm file khi lần đầu
   * lỗi — một PDF hỏng/khó xử có thể khiến OpenAI trả 500, và trước đây bỏ trích
   * text nên không còn gì để lùi về ⇒ job mất trắng. Lùi về "chỉ tên" vẫn hơn
   * là không có gì.
   */
  const callOnce = async (withAttachments: boolean) => {
    const userPrompt = buildContentUserPrompt(
      ingredientData,
      driveFileContents,
      withAttachments ? attachments : [],
    )
    const userContent: ChatCompletionContentPart[] = [
      ...attachments.map(toContentPart),
      { type: 'text', text: userPrompt },
    ]
    const completion = await client.chat.completions.create({
      model: CONTENT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: withAttachments && attachments.length ? userContent : userPrompt },
      ],
      response_format: { type: 'json_object' },
      ...completionParams(CONTENT_MODEL, 8192, 0.3),
    })
    recordUsage(usage, 'content', completion.usage)
    const raw = completion.choices[0]?.message?.content
    if (!raw) throw new Error('No response from OpenAI')
    return normalizeGenerated(JSON.parse(raw))
  }

  const isServerErr = (err: unknown) => {
    const status = (err as { status?: number })?.status
    if (typeof status === 'number') return status >= 500
    const m = err instanceof Error ? err.message : String(err)
    return /\b5\d\d\b/.test(m) || m.includes('server had an error')
  }

  try {
    let parsed: GeneratedContent
    try {
      parsed = await callOnce(attachments.length > 0)
    } catch (firstErr) {
      // Lỗi máy chủ (5xx) khi CÓ file đính kèm → thử lại KHÔNG kèm file (một PDF
      // khó xử có thể làm server 500). Không có file thì ném tiếp ra ngoài.
      if (attachments.length && isServerErr(firstErr)) {
        parsed = await callOnce(false)
      } else {
        throw firstErr
      }
    }

    // Only hard-fail if there is essentially no usable text at all.
    if (!parsed.subtitle?.vi && !parsed.description?.vi) {
      return { ok: false, error: 'AI không trả về subtitle/description.' }
    }

    return { ok: true, content: parsed }
  } catch (err) {
    const detail = openaiErrorDetail(err)
    // Kèm model + số file để phân biệt lỗi do request (sai param/model không hỗ
    // trợ input) với lỗi máy chủ thực sự.
    const ctx = `model=${CONTENT_MODEL} attachments=${attachments.length}`
    if (detail.includes('context_length_exceeded')) {
      return { ok: false, error: 'Nội dung Drive quá dài. Hãy cắt bớt file PDF trước khi thử lại.' }
    }
    if (isServerErr(err)) {
      return {
        ok: false,
        error: `OpenAI lỗi máy chủ (5xx). Nếu lặp lại nhiều lần thì KHÔNG phải lỗi thoáng qua — kiểm tra model có hỗ trợ input này không. ${ctx} · ${detail}`,
      }
    }
    return { ok: false, error: `OpenAI error (${ctx}): ${detail}` }
  }
}

// ---------------------------------------------------------------------------
// 2. Image generation — DALL·E 3 (two-stage)
// ---------------------------------------------------------------------------

const IMAGE_PROMPT_MODEL = process.env.OPENAI_IMAGE_PROMPT_MODEL || CONTENT_MODEL
const IMAGE_GENERATION_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2'
const IMAGE_SIZE = (process.env.OPENAI_IMAGE_SIZE || '1024x1024') as '1024x1024'
/** dall-e-3 is the only image model that needs no Organization Verification. */
const IS_DALLE = IMAGE_GENERATION_MODEL.startsWith('dall-e')
/**
 * Quality vocabularies differ per family: dall-e-3 takes standard|hd, gpt-image
 * takes low|medium|high|auto. Normalize so switching OPENAI_IMAGE_MODEL alone
 * (e.g. to dall-e-3) works without also fixing OPENAI_IMAGE_QUALITY.
 */
const IMAGE_QUALITY = (() => {
  const q = process.env.OPENAI_IMAGE_QUALITY
  if (IS_DALLE) return (q === 'hd' ? 'hd' : 'standard') as 'standard'
  return (q && ['low', 'medium', 'high', 'auto'].includes(q) ? q : 'medium') as 'medium'
})()

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
  // Payload's `create` returns a numeric id on Postgres and a string id on
  // Mongo — accept both rather than forcing the caller into an `as never` cast.
  uploadToPayload: (buffer: Buffer, filename: string, mimeType: string, alt: string) => Promise<{ id: string | number; url: string } | null>,
  usage?: AiUsage,
): Promise<{ id: string | number; url: string } | null> {
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
    recordUsage(usage, 'imagePrompt', refinement.usage)
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

    if (usage) usage.images += 1
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

═══════════════════════════════════════════════════════════════
HAI LOẠI TRƯỜNG — HAI TIÊU CHUẨN KHÁC NHAU. ĐỌC KỸ PHẦN NÀY.
═══════════════════════════════════════════════════════════════

▶ LOẠI A — TRÍCH XUẤT (transcription). TUYỆT ĐỐI KHÔNG SUY DIỄN.
   Gồm: specs, technical.*, regulatory.*, moq, brandName, originCountry.

   Quy tắc DUY NHẤT: con số/mã/giá trị phải XUẤT HIỆN TRONG TÀI LIỆU
   được cung cấp. Chép lại đúng như tài liệu ghi (giữ nguyên dấu ≤ ≥ –,
   đơn vị, khoảng giá trị).

   Nếu tài liệu KHÔNG ghi → BỎ TRỐNG trường đó (bỏ hẳn key, hoặc để "").
   Bỏ trống là ĐÚNG. Đoán là SAI và gây hậu quả pháp lý.

   Đặc biệt nghiêm ngặt — KHÔNG BAO GIỜ được suy đoán:
     · casNumber, hsCode, eNumber  → chỉ chép khi tài liệu ghi rõ
     · regulatory.registrationNo   → chỉ chép số công bố có thật trong tài liệu
     · regulatory.status           → chỉ chọn khi tài liệu chứng minh
     · shelfLife, storage, packaging, assay → chỉ chép từ TDS
   Một mã CAS bịa ra sẽ được đăng công khai cho khách hàng công nghiệp —
   thà để trống còn hơn sai.

▶ LOẠI B — BIÊN TẬP (editorial). ĐƯỢC suy luận khoa học hợp lý.
   Gồm: subtitle, description, benefits, applications, badges,
        research.mechanism, seoTitle, seoDescription, imagePrompt.

   Được viết dựa trên tên hoạt chất, nhóm chất, nguồn gốc và kiến thức
   ngành. NHƯNG mọi CON SỐ nhắc trong phần này vẫn phải có trong tài liệu.
   Không viết "tăng 47%" nếu tài liệu không ghi con số đó.

═══════════════════════════════════════════════════════════════

NGUYÊN TẮC CHUNG:
1. Viết tiếng VIỆT CHUẨN cho field "vi", tiếng ANH CHUYÊN NGÀNH cho field "en". Mọi trường song ngữ phải điền ĐỦ CẢ HAI.
2. Description: 250-400 từ, chia 2-3 đoạn (giới thiệu → đặc điểm/công nghệ → ứng dụng thực tế trong công thức).
3. Benefits: 4-8 items. Applications: 3-6 items, ghi rõ dạng bào chế.
4. Badges: chỉ ghi chứng nhận tài liệu có nêu (Halal, Kosher, Non-GMO, GMP...). Không có → mảng rỗng.
5. SuggestedDosage: liều tham khảo, song ngữ. Không rõ → bỏ trống.
6. SEO: seoTitle ≤ 60 ký tự, seoDescription 120-155 ký tự — cả vi + en.
7. NAME: chuẩn hoá tên — BỎ số thứ tự đầu dòng ("1.", "2."), BỎ mã nội bộ và hậu tố như "(TM)", "- TQ", "- Đức", "- VN"; viết hoa đúng chuẩn; giữ tên thương mại + hoạt chất chính. KHÔNG thêm chữ không có trong tên gốc.

SPECS — chú ý định dạng hiển thị:
   · Mỗi spec có "display": "text" | "bar".
   · Dùng "bar" + "percent" (0-100) CHỈ KHI thông số là tỉ lệ phần trăm
     và bạn đọc được giá trị điển hình. VD: DHA ≥ 50 area% (điển hình 56)
     → {"display": "bar", "percent": 56}.
   · Mọi thông số còn lại (mg/g, mg/kg, °C, chỉ số không đơn vị, định tính)
     → "display": "text", KHÔNG kèm percent.
   · Số lượng: lấy HẾT thông số có trong TDS (10-25 dòng là bình thường),
     không giới hạn 3-6. Ưu tiên: hoạt chất chính → chỉ tiêu chất lượng →
     kim loại nặng/tạp chất → vi sinh.

FILE MÔ TẢ CÓ NHIỀU BIẾN THỂ:
   Một số file "Mô tả" liệt kê NHIỀU sản phẩm/biến thể trong cùng tài liệu (VD
   "Kiku Flower Extract-WSP" và "Kiku Flower Extract-P"; hay "Red Vine Pr1432"
   và "Pr1419"). CHỈ lấy dữ liệu của biến thể KHỚP với tên nguyên liệu đang xử
   lý (xem "Tên nguyên liệu" ở phần dữ liệu). TUYỆT ĐỐI không trộn giá/MOQ của
   biến thể khác vào. Nếu không chắc biến thể nào khớp → bỏ trống pricing.

BẢNG GIÁ (pricing):
   Lấy từ các dòng "MOQ ...: ...đ/kg" trong file Mô tả. Chép đúng từng con số.
   Một MOQ nhiều mức giá thì mỗi mức là một bậc (tiers). Bỏ dấu chấm phân cách
   nghìn khi ghi price. Ngày báo giá đổi sang YYYY-MM-DD.

TRẢ VỀ ĐỊNH DẠNG JSON — KHÔNG giải thích, KHÔNG markdown code block.

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
    "vi": "<mô tả 250-400 từ tiếng Việt, có cấu trúc: giới thiệu → đặc điểm → ứng dụng → tại sao Bioscope chọn>",
    "en": "<250-400 words English, professional pharma/cosmetic tone>"
  },
  "benefits": {
    "vi": ["<lợi ích 1 tiếng Việt — có số liệu nếu có, VD: Tăng sinh collagen lên 47% sau 4 tuần (in vitro)>", "<lợi ích 2>", "... 4-8 items>"],
    "en": ["<benefit 1 in English, same meaning as vi[0]>", "<benefit 2>", "... same count as vi>"]
  },
  "applications": {
    "vi": ["<ứng dụng 1 tiếng Việt — dạng bào chế cụ thể, VD: Kem dưỡng da chống lão hóa>", "<ứng dụng 2>", "... 3-6 items>"],
    "en": ["<application 1 in English, same meaning as vi[0]>", "<application 2>", "... same count as vi>"]
  },
  "badges": [
    "<chứng nhận 1 — VD: GMP Certified>",
    "<chứng nhận 2 — VD: Halal Certified>",
    "<chứng nhận 3 — VD: Non-GMO Verified>",
    "... các chứng nhận phù hợp với ngành và nguồn gốc>"
  ],
  "suggestedDosage": {
    "vi": "<liều dùng gợi ý tiếng Việt, VD: 100-500 mg/ngày (tham khảo từ TDS) — bỏ trống nếu tài liệu không nêu>",
    "en": "<suggested dosage in English — leave empty if the document does not state it>"
  },
  "brandName": "<[LOẠI A] thương hiệu/nhà sản xuất ghi trên tài liệu, VD: GC Rieber VivoMega — rỗng nếu không có>",
  "moq": "<[LOẠI A] số lượng đặt tối thiểu nếu tài liệu nêu, VD: 190 kg (1 phuy) — rỗng nếu không có>",
  "inci": {
    "vi": "<tên khoa học / INCI (tên Latin), VD: Oryza Sativa Bran Oil — nếu không xác định được để chuỗi rỗng>",
    "en": "<INCI name, thường giống tiếng Việt>"
  },
  "originCountry": "<mã quốc gia xuất xứ 2 ký tự nếu suy ra được từ tài liệu, VD: NO cho Na Uy, JP, VN — nếu không rõ để chuỗi rỗng>",
  "tag": "<một trong: NEW | TRENDING | EXCLUSIVE — hoặc null nếu không phù hợp>",
  "specs": [
    {
      "label": { "vi": "<tên thông số, VD: DHA (C22:6n3)>", "en": "<English label, e.g. DHA (C22:6n3)>" },
      "value": "<giá trị ĐÚNG NHƯ TÀI LIỆU GHI, VD: ≥ 50 (điển hình 56)>",
      "unit": "<đơn vị, VD: area% — bỏ trống nếu không có>",
      "display": "<'bar' nếu là tỉ lệ phần trăm và đọc được giá trị điển hình, ngược lại 'text'>",
      "percent": "<CHỈ khi display='bar': số 0-100, VD: 56 — bỏ hẳn key này khi display='text'>"
    },
    "... LẤY HẾT thông số có trong TDS/COA (10-25 dòng là bình thường): hoạt chất chính, chỉ tiêu chất lượng, kim loại nặng, tạp chất, vi sinh>"
  ],

  "technical": {
    "_comment": "[LOẠI A — TRÍCH XUẤT] Chỉ điền khi tài liệu ghi rõ. Không suy đoán. Bỏ trống trường nào tài liệu không nêu.",
    "casNumber": "<số CAS, VD: 8016-13-5 — RỖNG nếu tài liệu không ghi>",
    "hsCode": "<mã HS, VD: 1504.20 — RỖNG nếu không ghi>",
    "eNumber": "<mã E, VD: E306 — RỖNG nếu không ghi>",
    "particleSize": "<kích thước hạt, VD: 80 mesh — RỖNG nếu không ghi>",
    "assay": { "vi": "<hàm lượng/độ tinh khiết, VD: DHA ≥ 50 area%>", "en": "<assay / purity>" },
    "standardization": { "vi": "<chuẩn hoá theo, VD: tối thiểu 500 mg/g DHA>", "en": "<standardized to>" },
    "appearance": { "vi": "<dạng & ngoại quan, VD: Lỏng, vàng nhạt, mùi cá đặc trưng>", "en": "<appearance / form>" },
    "solubility": { "vi": "<độ tan, VD: Không tan trong nước>", "en": "<solubility>" },
    "shelfLife": { "vi": "<hạn dùng, VD: 3 năm kể từ NSX>", "en": "<shelf life>" },
    "storage": { "vi": "<điều kiện bảo quản, VD: 15-25°C, tránh ánh sáng>", "en": "<storage conditions>" },
    "packaging": { "vi": "<quy cách đóng gói, VD: 190 kg/phuy thép>", "en": "<packaging>" },
    "leadTime": { "vi": "<thời gian giao hàng nếu tài liệu nêu>", "en": "<lead time>" },
    "incompatibility": { "vi": "<lưu ý phối trộn/tương kỵ, xử lý trước khi dùng>", "en": "<handling / incompatibility notes>" }
  },

  "regulatory": {
    "_comment": "[LOẠI A — TRÍCH XUẤT] Pháp lý. Sai ở đây là rủi ro pháp lý thật. Không chắc thì bỏ trống.",
    "status": "<mảng, chỉ chọn khi tài liệu CHỨNG MINH, các giá trị hợp lệ: fda_gras | efsa | vn_moh | novel_food — mảng rỗng nếu không rõ>",
    "registrationNo": "<số công bố/đăng ký CHÍNH XÁC như tài liệu ghi — RỖNG nếu không có. TUYỆT ĐỐI không bịa>",
    "usageLimit": { "vi": "<ngưỡng sử dụng cho phép / quy chuẩn áp dụng>", "en": "<permitted usage level>" }
  },

  "research": {
    "_comment": "[LOẠI B — BIÊN TẬP] Được suy luận khoa học, nhưng số liệu phải có trong tài liệu.",
    "mechanism": {
      "vi": "<cơ chế tác dụng, 2-4 câu tiếng Việt: hoạt chất tác động thế nào ở mức sinh học>",
      "en": "<mechanism of action, 2-4 sentences>"
    }
  },
  "pricing": {
    "_comment": "[LOẠI A — TRÍCH XUẤT] Bảng giá từ file Mô tả. Chép ĐÚNG con số, KHÔNG suy đoán. Không có giá thì bỏ cả object.",
    "quoteDate": "<ngày báo giá YYYY-MM-DD nếu tài liệu ghi, VD từ 'Giá ngày 11/01/2024' → 2024-01-11 — rỗng nếu không có>",
    "currency": "<VND | USD — mặc định VND cho giá tiền Việt>",
    "terms": { "vi": "<điều kiện giá, VD: đã gồm CB, chưa VAT>", "en": "<price terms in English>" },
    "tiers": [
      {
        "moq": "<bậc MOQ ĐÚNG như tài liệu, VD: '25kg', 'dưới 20kg', '100-200kg'>",
        "price": "<CHỈ SỐ, bỏ dấu chấm phân cách, VD '5.271.500đ/kg' → 5271500>",
        "unit": "<đơn vị tính giá, VD: kg>",
        "note": "<ghi chú riêng của bậc này nếu có>"
      },
      "... LẤY HẾT các bậc giá (có nguyên liệu tới 6 bậc, VD Nanocumin: dưới 20kg, 21-50kg, 50-100kg, 100-200kg, 200-400kg, 400-500kg)"
    ]
  },
  "facets": {
    "_comment": "Thẻ để LỌC trên web. CHỈ chọn tên có trong 'THẺ LỌC KHẢ DỤNG' ở trên, chép chính xác. Không có thẻ phù hợp thì để mảng rỗng.",
    "primaries": ["<BẮT BUỘC ít nhất 1 danh mục chính. Nếu không thuộc Chiết xuất thực vật/Omega & dầu cá/Lợi khuẩn/Hoạt chất công nghệ cao thì chọn 'Nguyên liệu mới'>"],
    "functions": ["<công dụng, chọn 1-3 thẻ sát nhất>"],
    "natures": ["<bản chất nguyên liệu, thường 1-2 thẻ>"],
    "forms": ["<dạng bào chế theo tài liệu, thường 1 thẻ>"],
    "properties": ["<đặc tính kỹ thuật nếu tài liệu nêu rõ>"]
  },
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

function buildContentUserPrompt(
  ingredient: {
    name: string
    type?: string
    inci?: string
    originCountry?: string
    brandName?: string
    category?: string
    driveFiles?: Array<{ fileName: string; mimeType: string }>
    availableFacets?: Record<string, string[]>
  },
  driveFileContents: string,
  attachments: PdfAttachment[] = [],
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

${
    ingredient.availableFacets && Object.values(ingredient.availableFacets).some((v) => v.length)
      ? `## THẺ LỌC KHẢ DỤNG — CHỈ ĐƯỢC CHỌN TRONG DANH SÁCH NÀY
${Object.entries(ingredient.availableFacets)
  .filter(([, v]) => v.length)
  .map(([g, v]) => `${g}: ${v.join(' | ')}`)
  .join('\n')}

Chép CHÍNH XÁC tên thẻ (kể cả dấu tiếng Việt). Thẻ nào không có trong danh sách
thì BỎ QUA — tuyệt đối không tự nghĩ ra thẻ mới, vì thẻ lạ sẽ bị loại và làm
hỏng bộ lọc. Không chắc thì để mảng rỗng.

`
      : ''
  }${attachments.length ? `## TÀI LIỆU ĐÍNH KÈM (${attachments.length}) — NGUỒN DỮ LIỆU CHÍNH
${attachments.map((a) => `- ${a.filename}`).join('\n')}

Các file trên được đính kèm NGUYÊN BẢN ở đầu tin nhắn này. Hãy ĐỌC TRỰC TIẾP
từ trang tài liệu — đây là nguồn duy nhất và đáng tin nhất.

Đọc kỹ các BẢNG thông số: chép đúng từng chữ số, đơn vị và dấu (≤ ≥ ±), và
ghép đúng giá trị với đúng chỉ tiêu theo hàng/cột. Giá trị nào mờ hoặc không
chắc thì BỎ TRỐNG, không đoán.
` : ''}${driveFileContents ? `
## NỘI DUNG DẠNG TEXT
---
${driveFileContents}
---
` : ''}${!attachments.length && !driveFileContents ? `
## KHÔNG CÓ TÀI LIỆU
Không đọc được tài liệu nào. Chỉ viết phần BIÊN TẬP dựa trên tên nguyên liệu;
BỎ TRỐNG toàn bộ specs, technical, regulatory, pricing.
` : ''}
`
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

  // Point pdfjs at the real worker file on disk. Without this it falls back to a
  // "fake worker" that dynamically imports `pdf.worker.mjs`; inside the Next.js
  // server bundle that specifier can't be resolved and extraction dies with
  //   "Setting up fake worker failed: Cannot find module '…/pdf.worker.mjs'"
  // — which silently degraded every AI generation to name-only input.
  // Requires `pdfjs-dist` in next.config `serverExternalPackages` so the package
  // stays outside the bundle and resolves from node_modules.
  try {
    if (!PDFJS.GlobalWorkerOptions.workerSrc) {
      const { createRequire } = await import('node:module')
      const requireFromHere = createRequire(import.meta.url)
      PDFJS.GlobalWorkerOptions.workerSrc = requireFromHere.resolve(
        'pdfjs-dist/legacy/build/pdf.worker.mjs',
      )
    }
  } catch {
    // Fall through — pdfjs will retry its own resolution below.
  }

  // Pass a Uint8Array (pdfjs detaches the underlying buffer) to avoid corrupting
  // the shared Node Buffer, and disable the worker for a pure-Node environment.
  const data = new Uint8Array(buffer)
  const loadingTask = PDFJS.getDocument({ data, useWorkerFetch: false, isEvalSupported: false })
  const pdf = await loadingTask.promise

  const texts: string[] = []
  // Cửa sổ ngữ cảnh là 1,05M token nên trần 20 trang cũ quá chặt. 100 trang vẫn
  // chỉ chiếm một phần nhỏ, mà không còn cắt mất tài liệu dày (dossier đăng ký).
  const maxPages = Math.min(pdf.numPages, Number(process.env.PDF_MAX_PAGES ?? 100))

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
/**
 * Trần ký tự text gửi kèm. Cũ là 80.000 (~27k token) — đặt từ thời giả định cửa
 * sổ nhỏ. Cửa sổ thật là 1,05M token nên 300.000 ký tự (~100k token) vẫn chỉ
 * chiếm ~10%, mà không còn cắt mất tài liệu dày.
 */
export const TEXT_MAX_CHARS = Number(process.env.AI_TEXT_MAX_CHARS ?? 300_000)

export function truncateForAI(text: string, maxChars = TEXT_MAX_CHARS): string {
  if (text.length <= maxChars) return text
  return text.slice(0, maxChars) + '\n\n[...content truncated due to length...]'
}

// ---------------------------------------------------------------------------
// Vision / OCR — đọc hình ảnh và PDF scan
// ---------------------------------------------------------------------------

const OCR_SYSTEM_PROMPT = `Bạn là chuyên gia OCR trong ngành dược phẩm, mỹ phẩm và thực phẩm chức năng.

Từ tài liệu được cung cấp, hãy:
1. Trích xuất TẤT CẢ text có trong tài liệu
2. Giữ nguyên cấu trúc: tiêu đề, bảng, danh sách, bullet points
3. Nếu là tài liệu kỹ thuật (TDS, MSDS, COA, Certificate...), trích xuất đầy đủ:
   - Tên hoạt chất, CAS number, INCI name
   - Thông số kỹ thuật (purity, moisture, particle size...)
   - Liều dùng khuyến nghị
   - Điều kiện bảo quản
   - Thông tin nhà sản xuất
4. Nếu là ảnh chụp sản phẩm/nguyên liệu, mô tả những gì bạn thấy
5. Trả về text thuần, KHÔNG giải thích, KHÔNG markdown

Nếu không có text có ý nghĩa, trả về: "[No readable text found]"`

/** Giới hạn kích thước PDF gửi cho model (OpenAI trần ~32MB). */
const PDF_OCR_MAX_BYTES = Number(process.env.OPENAI_PDF_OCR_MAX_BYTES ?? 20 * 1024 * 1024)

/**
 * OCR một PDF SCAN (không có lớp text) bằng cách gửi thẳng file cho model.
 *
 * OpenAI nhận PDF qua content part kiểu `file` (file_data base64) và tự rasterize
 * từng trang để đọc cả chữ lẫn hình — nên không cần thư viện canvas/native trong
 * container. Đây là đường đúng cho COA/TDS bản scan; gửi bytes PDF vào ô ảnh
 * (image_url) thì OpenAI từ chối vì không phải ảnh.
 */
export async function extractTextFromPdfUsingVision(
  pdfBuffer: Buffer,
  fileName: string,
  usage?: AiUsage,
): Promise<string> {
  if (pdfBuffer.length > PDF_OCR_MAX_BYTES) {
    throw new Error(
      `PDF ${(pdfBuffer.length / 1024 / 1024).toFixed(1)}MB vượt trần OCR ${(PDF_OCR_MAX_BYTES / 1024 / 1024).toFixed(0)}MB.`,
    )
  }
  const client = getOpenAIClient()
  const dataUrl = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`

  const response = await client.chat.completions.create({
    model: VISION_MODEL,
    messages: [
      { role: 'system', content: OCR_SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'file', file: { filename: fileName, file_data: dataUrl } },
          { type: 'text', text: `Trích xuất toàn bộ text từ tài liệu PDF: ${fileName}` },
        ],
      },
    ],
    ...completionParams(VISION_MODEL, 8192, 0.1),
  })
  recordUsage(usage, 'vision', response.usage)
  const text = (response.choices[0]?.message?.content ?? '').trim()
  return text === '[No readable text found]' ? '' : text
}

/**
 * Trích xuất text từ hình ảnh bằng GPT-4o Vision.
 * Dùng cho:
 *   - Hình ảnh chụp TDS, tài liệu, ingredient photos
 *
 * @param imageBuffer Buffer của ảnh (JPEG, PNG, WebP...)
 * @param fileName Tên file để mô tả trong prompt
 * @returns Nội dung text trích xuất được
 */
export async function extractTextFromImageUsingVision(
  imageBuffer: Buffer,
  fileName: string,
  usage?: AiUsage,
): Promise<string> {
  const client = getOpenAIClient()

  // Detect MIME type từ magic bytes
  const mimeType = detectImageMimeType(imageBuffer)
  if (!mimeType) {
    // Vision CHỈ nhận ảnh thật. Buffer PDF (bắt đầu bằng %PDF) trước đây bị
    // detectImageMimeType trả nhầm 'image/png' rồi gửi cho Vision → OpenAI từ
    // chối ngay (~1 giây). PDF scan cần được rasterize thành ảnh trước, việc mà
    // pipeline này chưa làm — nên báo rõ thay vì gửi dữ liệu rác.
    const head = imageBuffer.subarray(0, 5).toString('latin1')
    if (head.startsWith('%PDF')) {
      throw new Error(
        'PDF không có lớp text (scan). Vision không đọc trực tiếp được file PDF — ' +
          'hãy tải lên bản PDF có text, ảnh chụp (JPG/PNG), hoặc Google Docs.',
      )
    }
    throw new Error('Định dạng không phải ảnh nên Vision không đọc được.')
  }

  // Convert to base64
  const base64Image = imageBuffer.toString('base64')
  const dataUrl = `data:${mimeType};base64,${base64Image}`

  const systemPrompt = OCR_SYSTEM_PROMPT

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

    recordUsage(usage, 'vision', response.usage)
    const text = response.choices[0]?.message?.content ?? ''
    return text.trim()
  } catch (err) {
    console.error('[Vision OCR] Failed:', err)
    // Ném lại để worker ghi được lý do thật vào log job. Trước đây trả '' âm
    // thầm nên mọi lỗi Vision đều hiện thành "Không trích xuất được nội dung".
    throw err instanceof Error ? err : new Error(String(err))
  }
}

/**
 * Detect image MIME type từ magic bytes. Trả về null nếu KHÔNG phải ảnh —
 * để nơi gọi từ chối sớm thay vì gửi buffer rác cho Vision.
 */
function detectImageMimeType(buffer: Buffer): string | null {
  if (buffer.length < 4) return null

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
  // Không khớp magic bytes ảnh nào → không phải ảnh.
  return null
}
