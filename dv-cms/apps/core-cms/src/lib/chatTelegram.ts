/**
 * Cấu hình + gọi Telegram Bot API cho Live Chat.
 *
 * Đọc cấu hình từ global `chat-settings` TRƯỚC (sửa được trong admin), lùi về
 * biến môi trường khi ô trong admin bỏ trống.
 */
import type { Payload } from 'payload'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

/**
 * Rich text (Lexical) → HTML để gửi xuống widget. Admin là người soạn nên nội
 * dung tin cậy; widget render bằng dangerouslySetInnerHTML.
 * Rỗng/không phải rich text → trả '' để nơi gọi lùi về câu mặc định.
 */
function richToHtml(v: unknown): string {
  if (!v || typeof v !== 'object' || !('root' in (v as object))) return ''
  try {
    // disableContainer: bỏ <div class="payload-richtext"> bọc ngoài — widget tự lo
    // khung, thêm div nữa sẽ phá bố cục bong bóng chat.
    const html = convertLexicalToHTML({ data: v as SerializedEditorState, disableContainer: true })
    // Lexical sinh <p></p> rỗng khi ô chưa nhập gì.
    return html.replace(/<p[^>]*>(\s|&nbsp;|<br\s*\/?>)*<\/p>/g, '').trim()
  } catch {
    return ''
  }
}

/** Bỏ thẻ HTML để lấy văn bản thuần (dùng cho Telegram, tiêu đề…). */
export const htmlToText = (html: string) =>
  html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

export type ChatConfig = {
  enabled: boolean
  botToken: string
  salesChatId: string
  webhookSecret: string
  widgetTitle: string
  /** HTML — đã chuyển từ rich text. */
  welcomeMessage: string
  loginGreeting: string
  offlineMessage: string
  bubbleEnabled: boolean
  /** HTML — đã chuyển từ rich text. */
  bubbleMessage: string
  bubbleDelay: number
  bubbleOncePerSession: boolean
}

export async function getChatConfig(payload: Payload, locale = 'vi'): Promise<ChatConfig> {
  let g: Record<string, unknown> = {}
  try {
    g = (await payload.findGlobal({ slug: 'chat-settings', locale: locale as 'vi', depth: 0 })) as never
  } catch {
    /* global chưa tạo — dùng env */
  }
  const pick = (v: unknown, env?: string) => (typeof v === 'string' && v.trim() ? v.trim() : (env ?? '').trim())
  return {
    enabled: g.enabled === true,
    botToken: pick(g.botToken, process.env.TELEGRAM_BOT_TOKEN),
    salesChatId: pick(g.salesChatId, process.env.TELEGRAM_SALES_CHAT_ID),
    webhookSecret: pick(g.webhookSecret, process.env.TELEGRAM_WEBHOOK_SECRET),
    widgetTitle: pick(g.widgetTitle) || 'Bioscope hỗ trợ',
    welcomeMessage: richToHtml(g.welcomeMessage) || '<p>Chào bạn 👋 Bioscope có thể giúp gì cho bạn?</p>',
    loginGreeting: richToHtml(g.loginGreeting),
    offlineMessage: pick(g.offlineMessage) || 'Hiện chưa có nhân viên trực. Để lại email, chúng tôi sẽ liên hệ lại.',
    bubbleEnabled: g.bubbleEnabled !== false,
    bubbleMessage:
      richToHtml(g.bubbleMessage) ||
      '<p>Chào bạn 👋 Cần tư vấn nguyên liệu hay báo giá? Nhắn cho Bioscope nhé!</p>',
    bubbleDelay: typeof g.bubbleDelay === 'number' ? g.bubbleDelay : 5,
    bubbleOncePerSession: g.bubbleOncePerSession !== false,
  }
}

/** Bot API đã cấu hình đủ để gửi/nhận chưa. */
export const isTelegramReady = (c: ChatConfig) => Boolean(c.botToken && c.salesChatId)

async function tg<T = Record<string, unknown>>(token: string, method: string, body: unknown): Promise<T> {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  })
  const json = (await res.json()) as { ok: boolean; result?: T; description?: string }
  if (!json.ok) throw new Error(`Telegram ${method}: ${json.description ?? res.status}`)
  return json.result as T
}

/** Tạo topic trong nhóm (supergroup bật Topics) → trả message_thread_id. */
export async function createTopic(c: ChatConfig, name: string): Promise<number> {
  const r = await tg<{ message_thread_id: number }>(c.botToken, 'createForumTopic', {
    chat_id: c.salesChatId,
    name: name.slice(0, 120),
  })
  return r.message_thread_id
}

/**
 * Gửi tin vào nhóm — trả về message_id (để map reply khi nhóm KHÔNG dùng Topics).
 * threadId undefined = gửi vào nhóm chung (không topic).
 */
export async function sendMessage(c: ChatConfig, text: string, threadId?: number | null): Promise<number> {
  const r = await tg<{ message_id: number }>(c.botToken, 'sendMessage', {
    chat_id: c.salesChatId,
    ...(threadId ? { message_thread_id: threadId } : {}),
    text,
    disable_web_page_preview: true,
  })
  return r.message_id
}

/** Đăng ký webhook Telegram → CMS. Gọi khi đổi token / lần đầu. */
export async function setWebhook(c: ChatConfig, url: string): Promise<void> {
  await tg(c.botToken, 'setWebhook', {
    url,
    secret_token: c.webhookSecret || undefined,
    allowed_updates: ['message'],
  })
}

/**
 * Lấy đường dẫn tải file của Telegram từ file_id.
 *
 * KHÔNG lưu file vào thư viện Media: tệp sales gửi có thể là báo giá/hợp đồng
 * riêng của một khách, mà Media thì đọc công khai và ai vào admin cũng thấy.
 * Thay vào đó tải theo yêu cầu qua endpoint có kiểm phiên của chính khách đó.
 */
export async function getFileUrl(c: ChatConfig, fileId: string): Promise<string> {
  const r = await tg<{ file_path?: string }>(c.botToken, 'getFile', { file_id: fileId })
  if (!r.file_path) throw new Error('Telegram không trả file_path')
  return `https://api.telegram.org/file/bot${c.botToken}/${r.file_path}`
}

/** Kiểm tra token hợp lệ → trả tên bot. */
export async function getMe(c: ChatConfig): Promise<{ username?: string }> {
  return tg<{ username?: string }>(c.botToken, 'getMe', {})
}

/** Kiểm tra nhóm: tồn tại + đã bật Topics chưa (is_forum). */
export async function getChat(c: ChatConfig): Promise<{ title?: string; is_forum?: boolean; type?: string }> {
  return tg<{ title?: string; is_forum?: boolean; type?: string }>(c.botToken, 'getChat', { chat_id: c.salesChatId })
}
