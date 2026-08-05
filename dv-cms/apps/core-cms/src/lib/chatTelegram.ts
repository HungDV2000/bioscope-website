/**
 * Cấu hình + gọi Telegram Bot API cho Live Chat.
 *
 * Đọc cấu hình từ global `chat-settings` TRƯỚC (sửa được trong admin), lùi về
 * biến môi trường khi ô trong admin bỏ trống.
 */
import type { Payload } from 'payload'

export type ChatConfig = {
  enabled: boolean
  botToken: string
  salesChatId: string
  webhookSecret: string
  widgetTitle: string
  welcomeMessage: string
  offlineMessage: string
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
    welcomeMessage: pick(g.welcomeMessage) || 'Chào bạn 👋 Bioscope có thể giúp gì cho bạn?',
    offlineMessage: pick(g.offlineMessage) || 'Hiện chưa có nhân viên trực. Để lại email, chúng tôi sẽ liên hệ lại.',
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

/** Gửi tin vào đúng topic của hội thoại. */
export async function sendToTopic(c: ChatConfig, threadId: number, text: string): Promise<void> {
  await tg(c.botToken, 'sendMessage', {
    chat_id: c.salesChatId,
    message_thread_id: threadId,
    text,
    disable_web_page_preview: true,
  })
}

/** Đăng ký webhook Telegram → CMS. Gọi khi đổi token / lần đầu. */
export async function setWebhook(c: ChatConfig, url: string): Promise<void> {
  await tg(c.botToken, 'setWebhook', {
    url,
    secret_token: c.webhookSecret || undefined,
    allowed_updates: ['message'],
  })
}
