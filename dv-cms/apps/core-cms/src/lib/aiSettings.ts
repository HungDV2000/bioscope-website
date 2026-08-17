import type { Payload } from 'payload'
import { setAiConfig, type AiProvider } from './openaiService.js'

/**
 * Nạp "Cài đặt AI" từ admin vào service.
 *
 * Gọi lúc khởi động VÀ mỗi lần lưu global (hook afterChange) để đổi nhà cung
 * cấp / model có hiệu lực ngay, không phải khởi động lại tiến trình.
 *
 * Ô trống trong admin = dùng biến môi trường tương ứng (xem setAiConfig).
 */
export async function applyAiSettings(payload: Payload): Promise<void> {
  try {
    const g = (await payload.findGlobal({ slug: 'ai-settings', depth: 0 })) as unknown as Record<string, unknown>
    const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined)
    const provider = (str(g.provider) as AiProvider | undefined) ?? undefined

    setAiConfig({
      provider,
      // Khoá theo đúng nhà cung cấp đang chọn.
      apiKey: provider === 'openai' ? str(g.openAiApiKey) : str(g.openRouterApiKey),
      imageApiKey: str(g.imageApiKey),
      appName: str(g.appName),
      contentModel: str(g.contentModel),
      visionModel: str(g.visionModel),
      imagePromptModel: str(g.imagePromptModel),
      imageModel: str(g.imageModel),
    })

    payload.logger.info(
      `[ai] nhà cung cấp = ${provider ?? '(theo biến môi trường)'}; model nội dung = ${str(g.contentModel) ?? '(mặc định)'}`,
    )
  } catch {
    // Global chưa tạo (lần chạy đầu) → giữ nguyên cấu hình từ biến môi trường.
  }
}
