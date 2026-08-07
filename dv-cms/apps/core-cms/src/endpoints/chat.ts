/**
 * Live Chat endpoints (Web ↔ Telegram).
 *   POST /api/chat/start      → tạo hội thoại (+ topic Telegram), trả token
 *   POST /api/chat/message    → khách gửi tin → lưu + đẩy vào topic
 *   GET  /api/chat/poll       → widget lấy tin trả lời của sales
 *   POST /api/telegram/webhook→ nhận tin sales trả lời từ Telegram
 */
import type { Endpoint, PayloadRequest } from 'payload'
import { randomUUID } from 'crypto'
import { getChatConfig, isTelegramReady, createTopic, sendToTopic, getMe, getChat, setWebhook } from '../lib/chatTelegram.js'
import { rateLimit, clientIp } from '../lib/rateLimit.js'

const json = (data: unknown, status = 200) => Response.json(data as never, { status })
const readBody = async (req: PayloadRequest): Promise<Record<string, unknown>> => {
  try {
    return (await (req as unknown as Request).json()) as Record<string, unknown>
  } catch {
    return {}
  }
}

// ── GET /api/chat/config ─────────────────────────────────────────────────────
// Widget hỏi trước khi hiện nút: bật không + tiêu đề. Công khai, không lộ token.
const configEndpoint: Endpoint = {
  path: '/chat/config',
  method: 'get',
  handler: async (req: PayloadRequest): Promise<Response> => {
    const cfg = await getChatConfig(req.payload, String(req.query?.locale ?? 'vi'))
    return json({ ok: true, enabled: cfg.enabled, widgetTitle: cfg.widgetTitle })
  },
}

// ── POST /api/chat/start ─────────────────────────────────────────────────────
const startEndpoint: Endpoint = {
  path: '/chat/start',
  method: 'post',
  handler: async (req: PayloadRequest): Promise<Response> => {
    const cfg = await getChatConfig(req.payload, String(req.query?.locale ?? 'vi'))
    if (!cfg.enabled) return json({ ok: false, error: 'Chat đang tắt.' }, 403)
    // Chống spam tạo hội thoại/topic: tối đa 5 hội thoại/10 phút mỗi IP.
    if (!rateLimit(`start:${clientIp(req)}`, 5, 10 * 60 * 1000)) {
      return json({ ok: false, error: 'Bạn mở chat quá nhiều lần, thử lại sau ít phút.' }, 429)
    }

    const body = await readBody(req)
    const startPage = String(body.startPage ?? '').slice(0, 300)
    const token = randomUUID()

    let topicId: number | undefined
    if (isTelegramReady(cfg)) {
      try {
        topicId = await createTopic(cfg, `Khách web · ${startPage || 'trang chủ'}`)
      } catch (e) {
        req.payload.logger.error(`[chat] tạo topic lỗi: ${String(e)}`)
      }
    }

    const conv = await req.payload.create({
      collection: 'chat-conversations',
      data: {
        title: `Khách · ${startPage || '/'} · ${new Date().toLocaleString('vi-VN')}`,
        sessionToken: token,
        status: 'open',
        telegramTopicId: topicId,
        startPage,
        userAgent: String(body.userAgent ?? '').slice(0, 300),
        lastMessageAt: new Date().toISOString(),
      } as never,
      overrideAccess: true,
    })

    return json({
      ok: true,
      conversationId: conv.id,
      token,
      online: isTelegramReady(cfg),
      widgetTitle: cfg.widgetTitle,
      welcomeMessage: cfg.welcomeMessage,
      offlineMessage: cfg.offlineMessage,
    })
  },
}

// ── POST /api/chat/message ───────────────────────────────────────────────────
const messageEndpoint: Endpoint = {
  path: '/chat/message',
  method: 'post',
  handler: async (req: PayloadRequest): Promise<Response> => {
    const body = await readBody(req)
    const token = String(body.token ?? '')
    const text = String(body.text ?? '').trim().slice(0, 4000)
    if (!token || !text) return json({ ok: false, error: 'Thiếu token hoặc nội dung.' }, 400)
    // Chống flood: tối đa 20 tin/phút mỗi IP.
    if (!rateLimit(`msg:${clientIp(req)}`, 20, 60 * 1000)) {
      return json({ ok: false, error: 'Gửi quá nhanh, chậm lại một chút nhé.' }, 429)
    }

    const conv = await findByToken(req, token)
    if (!conv) return json({ ok: false, error: 'Phiên không hợp lệ.' }, 404)

    const msg = await req.payload.create({
      collection: 'chat-messages',
      data: { conversation: conv.id, sender: 'visitor', text } as never,
      overrideAccess: true,
    })
    await req.payload.update({
      collection: 'chat-conversations',
      id: conv.id,
      data: { lastMessageAt: new Date().toISOString() } as never,
      overrideAccess: true,
    })

    const cfg = await getChatConfig(req.payload)
    if (isTelegramReady(cfg) && typeof conv.telegramTopicId === 'number') {
      try {
        await sendToTopic(cfg, conv.telegramTopicId, text)
      } catch (e) {
        req.payload.logger.error(`[chat] gửi topic lỗi: ${String(e)}`)
      }
    }
    return json({ ok: true, id: msg.id })
  },
}

// ── GET /api/chat/poll ───────────────────────────────────────────────────────
const pollEndpoint: Endpoint = {
  path: '/chat/poll',
  method: 'get',
  handler: async (req: PayloadRequest): Promise<Response> => {
    const token = String(req.query?.token ?? '')
    const since = Number(req.query?.since ?? 0) || 0
    if (!token) return json({ ok: false, error: 'Thiếu token.' }, 400)
    const conv = await findByToken(req, token)
    if (!conv) return json({ ok: false, error: 'Phiên không hợp lệ.' }, 404)

    const res = await req.payload.find({
      collection: 'chat-messages',
      where: {
        and: [
          { conversation: { equals: conv.id } },
          { sender: { in: ['agent', 'system'] } },
          { id: { greater_than: since } },
        ],
      },
      sort: 'id',
      limit: 50,
      depth: 0,
      overrideAccess: true,
    })
    return json({
      ok: true,
      messages: res.docs.map((m) => ({
        id: m.id,
        sender: (m as { sender: string }).sender,
        text: (m as { text: string }).text,
        agentName: (m as { agentName?: string }).agentName ?? null,
      })),
    })
  },
}

// ── POST /api/telegram/webhook ───────────────────────────────────────────────
const webhookEndpoint: Endpoint = {
  path: '/telegram/webhook',
  method: 'post',
  handler: async (req: PayloadRequest): Promise<Response> => {
    const cfg = await getChatConfig(req.payload)
    // Xác thực secret (chống giả mạo).
    if (cfg.webhookSecret) {
      const got = (req.headers as unknown as Headers)?.get?.('x-telegram-bot-api-secret-token')
      if (got !== cfg.webhookSecret) return json({ ok: false }, 401)
    }
    const update = await readBody(req)
    const msg = update.message as
      | {
          message_thread_id?: number
          text?: string
          caption?: string
          photo?: unknown[]
          document?: unknown
          voice?: unknown
          sticker?: unknown
          from?: { is_bot?: boolean; first_name?: string; username?: string }
        }
      | undefined
    if (!msg || !msg.message_thread_id || msg.from?.is_bot) return json({ ok: true })
    // Text, hoặc nhãn cho ảnh/tệp/thoại (nhóm 8).
    const text =
      msg.text ||
      msg.caption ||
      (msg.photo ? '📷 [Sales đã gửi ảnh]' : msg.document ? '📎 [Sales đã gửi tệp]' : msg.voice ? '🎤 [tin thoại]' : msg.sticker ? '[sticker]' : '')
    if (!text) return json({ ok: true })

    const conv = await req.payload.find({
      collection: 'chat-conversations',
      where: { telegramTopicId: { equals: msg.message_thread_id } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const c = conv.docs[0]
    if (!c) return json({ ok: true }) // topic không map được → bỏ qua

    await req.payload.create({
      collection: 'chat-messages',
      data: {
        conversation: c.id,
        sender: 'agent',
        text: text.slice(0, 4000),
        agentName: msg.from?.first_name ?? msg.from?.username ?? 'Sales',
      } as never,
      overrideAccess: true,
    })
    await req.payload.update({
      collection: 'chat-conversations',
      id: c.id,
      data: { lastMessageAt: new Date().toISOString() } as never,
      overrideAccess: true,
    })
    return json({ ok: true })
  },
}

// ── POST /api/chat/contact ───────────────────────────────────────────────────
// Khách để lại tên/email (thường khi ngoài giờ) → lưu + báo vào topic.
const contactEndpoint: Endpoint = {
  path: '/chat/contact',
  method: 'post',
  handler: async (req: PayloadRequest): Promise<Response> => {
    const body = await readBody(req)
    const token = String(body.token ?? '')
    const email = String(body.email ?? '').trim().slice(0, 200)
    const name = String(body.name ?? '').trim().slice(0, 120)
    if (!token || !email) return json({ ok: false, error: 'Thiếu token hoặc email.' }, 400)
    if (!/.+@.+\..+/.test(email)) return json({ ok: false, error: 'Email không hợp lệ.' }, 400)
    if (!rateLimit(`contact:${clientIp(req)}`, 5, 10 * 60 * 1000)) return json({ ok: false, error: 'Thử lại sau.' }, 429)

    const conv = await findByToken(req, token)
    if (!conv) return json({ ok: false, error: 'Phiên không hợp lệ.' }, 404)

    await req.payload.update({
      collection: 'chat-conversations',
      id: conv.id,
      data: { visitorName: name || undefined, visitorEmail: email, lastMessageAt: new Date().toISOString() } as never,
      overrideAccess: true,
    })
    const note = `📧 Khách để lại liên hệ — ${name ? name + ' · ' : ''}${email}`
    await req.payload.create({
      collection: 'chat-messages',
      data: { conversation: conv.id, sender: 'system', text: 'Đã gửi thông tin liên hệ. Chúng tôi sẽ phản hồi sớm.' } as never,
      overrideAccess: true,
    })
    const cfg = await getChatConfig(req.payload)
    if (isTelegramReady(cfg) && typeof conv.telegramTopicId === 'number') {
      try {
        await sendToTopic(cfg, conv.telegramTopicId, note)
      } catch {
        /* im lặng */
      }
    }
    return json({ ok: true })
  },
}

// ── POST /api/chat/telegram-setup ────────────────────────────────────────────
// Admin: kiểm tra token/chat/Topics + đăng ký webhook. Trả trạng thái từng bước.
const setupEndpoint: Endpoint = {
  path: '/chat/telegram-setup',
  method: 'post',
  handler: async (req: PayloadRequest): Promise<Response> => {
    if ((req.user as { role?: string } | undefined)?.role !== 'admin') {
      return json({ ok: false, error: 'Chỉ admin.' }, 403)
    }
    const cfg = await getChatConfig(req.payload)
    if (!cfg.botToken) return json({ ok: false, error: 'Chưa có Bot Token (Cài đặt Chat hoặc TELEGRAM_BOT_TOKEN).' }, 400)
    if (!cfg.salesChatId) return json({ ok: false, error: 'Chưa có Chat ID nhóm sales.' }, 400)

    const steps: Record<string, string> = {}
    try {
      const me = await getMe(cfg)
      steps.bot = `✓ Bot @${me.username ?? '?'}`
    } catch (e) {
      return json({ ok: false, error: `Token sai: ${e instanceof Error ? e.message : String(e)}`, steps }, 400)
    }
    try {
      const chat = await getChat(cfg)
      if (!chat.is_forum) {
        return json({ ok: false, error: 'Nhóm CHƯA bật Topics. Vào cài đặt nhóm → bật "Topics" rồi thử lại.', steps }, 400)
      }
      steps.chat = `✓ Nhóm "${chat.title ?? ''}" đã bật Topics`
    } catch (e) {
      return json({ ok: false, error: `Không đọc được nhóm (bot đã vào nhóm + là admin?): ${e instanceof Error ? e.message : String(e)}`, steps }, 400)
    }
    try {
      const base = (process.env.PAYLOAD_PUBLIC_SERVER_URL || '').replace(/\/$/, '')
      if (!base) return json({ ok: false, error: 'Thiếu PAYLOAD_PUBLIC_SERVER_URL để đăng ký webhook.', steps }, 500)
      await setWebhook(cfg, `${base}/api/telegram/webhook`)
      steps.webhook = `✓ Đã đăng ký webhook → ${base}/api/telegram/webhook`
    } catch (e) {
      return json({ ok: false, error: `Đăng ký webhook lỗi: ${e instanceof Error ? e.message : String(e)}`, steps }, 400)
    }
    return json({ ok: true, message: 'Kết nối Telegram OK — sẵn sàng nhận/gửi tin.', steps })
  },
}

async function findByToken(req: PayloadRequest, token: string) {
  const r = await req.payload.find({
    collection: 'chat-conversations',
    where: { sessionToken: { equals: token } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return r.docs[0] as { id: number | string; telegramTopicId?: number } | undefined
}

export const chatEndpoints: Endpoint[] = [
  configEndpoint,
  startEndpoint,
  messageEndpoint,
  pollEndpoint,
  contactEndpoint,
  webhookEndpoint,
  setupEndpoint,
]
