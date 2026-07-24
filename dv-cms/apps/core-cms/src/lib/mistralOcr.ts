/**
 * Mistral OCR — đọc PDF SCAN (không có lớp text).
 *
 * Vì sao dùng model riêng thay vì model đa năng của OpenAI:
 *   - `mistral-ocr-latest` là model CHUYÊN cho tài liệu: trả markdown có cấu
 *     trúc, giữ được bảng — mà COA/TDS thì gần như toàn bảng thông số.
 *   - Rẻ hơn ~4 lần: $4/1.000 trang, so với ~$0.016/trang khi để OpenAI
 *     rasterize từng trang rồi tính token ảnh + token text trả về.
 *
 * Chỉ dùng cho PDF scan. PDF có lớp text vẫn đọc bằng pdfjs (miễn phí, nhanh),
 * và ảnh rời vẫn đi qua Vision của OpenAI.
 *
 * API: POST https://api.mistral.ai/v1/ocr
 *      body { model, document: { type: 'document_url', document_url: <data URI> } }
 */

const MISTRAL_OCR_URL = 'https://api.mistral.ai/v1/ocr'
const MISTRAL_OCR_MODEL = process.env.MISTRAL_OCR_MODEL || 'mistral-ocr-latest'
/** Trần kích thước gửi lên, tránh nuốt file khổng lồ. */
const MAX_BYTES = Number(process.env.MISTRAL_OCR_MAX_BYTES ?? 20 * 1024 * 1024)
/** Timeout riêng — OCR nhiều trang có thể lâu, nhưng không được treo hàng đợi. */
const TIMEOUT_MS = Number(process.env.MISTRAL_OCR_TIMEOUT_MS ?? 120_000)

export function isMistralOcrConfigured(): boolean {
  return Boolean(process.env.MISTRAL_API_KEY)
}

type OcrPage = { index?: number; markdown?: string }
type OcrResponse = { pages?: OcrPage[]; usage_info?: { pages_processed?: number } }

export type MistralOcrResult = {
  text: string
  /** Số trang Mistral thực sự xử lý — dùng để tính tiền ($/1.000 trang). */
  pages: number
}

/**
 * OCR một PDF scan.
 *
 * @throws Lỗi có thông điệp rõ ràng (thiếu key, HTTP status + body, timeout).
 *         Worker bắt và ghi vào log job, nên không được nuốt.
 */
export async function extractTextFromPdfUsingMistral(
  pdfBuffer: Buffer,
  fileName: string,
): Promise<MistralOcrResult> {
  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) throw new Error('Chưa đặt MISTRAL_API_KEY.')

  if (pdfBuffer.length > MAX_BYTES) {
    throw new Error(
      `PDF ${(pdfBuffer.length / 1024 / 1024).toFixed(1)}MB vượt trần ${(MAX_BYTES / 1024 / 1024).toFixed(0)}MB.`,
    )
  }

  const dataUri = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`

  let res: Response
  try {
    res = await fetch(MISTRAL_OCR_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MISTRAL_OCR_MODEL,
        document: { type: 'document_url', document_url: dataUri },
        // Bảng ở dạng markdown để nhét thẳng vào prompt sinh nội dung — HTML sẽ
        // tốn token vô ích.
        table_format: 'markdown',
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(`Gọi Mistral OCR thất bại: ${msg}`)
  }

  if (!res.ok) {
    // Kèm body: Mistral trả lý do cụ thể (sai key, quota, file hỏng) trong đó.
    const body = await res.text().catch(() => '')
    throw new Error(`Mistral OCR HTTP ${res.status}: ${body.slice(0, 300)}`)
  }

  const data = (await res.json()) as OcrResponse
  const pages = data.pages ?? []
  const text = pages
    .map((p) => (p.markdown ?? '').trim())
    .filter(Boolean)
    .join('\n\n--- Page break ---\n\n')

  return {
    text,
    // Ưu tiên usage_info; API tính tiền theo số trang đã xử lý.
    pages: data.usage_info?.pages_processed ?? pages.length,
  }
}
