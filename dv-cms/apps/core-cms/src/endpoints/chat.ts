/**
 * Live Chat endpoints (Web ↔ Telegram).
 *   POST /api/chat/start      → tạo hội thoại (+ topic Telegram), trả token
 *   POST /api/chat/message    → khách gửi tin → lưu + đẩy vào topic
 *   GET  /api/chat/poll       → widget lấy tin trả lời của sales
 *   POST /api/telegram/webhook→ nhận tin sales trả lời từ Telegram
 */
import type { Endpoint, PayloadRequest } from 'payload'
import { randomUUID } from 'crypto'
import { getChatConfig, isTelegramReady, createTopic, sendMessage, getFileUrl, getMe, getChat, setWebhook } from '../lib/chatTelegram.js'
import type { ChatConfig } from '../lib/chatTelegram.js'
import { rateLimit, clientIp } from '../lib/rateLimit.js'
import { lookupGeo } from '../lib/geo.js'
import { parseUserAgent } from '../lib/userAgent.js'

const json = (data: unknown, status = 200) => Response.json(data as never, { status })

/**
 * Gửi tin của khách sang Telegram, TỰ PHỤC HỒI khi topic đã bị xoá.
 *
 * Sales lỡ xoá một topic là mọi tin sau đó của khách đó gửi vào thread không
 * còn tồn tại → Telegram báo lỗi. Trước đây chỉ ghi log, tin nhắn khách nằm im
 * trong CMS và KHÔNG AI BIẾT để trả lời. Nay gửi lại vào nhóm chung kèm tag
 * #hs<id> (sales reply vào là map về đúng hội thoại) rồi xoá luôn topic hỏng
 * để những tin sau đi thẳng đường dự phòng.
 *
 * Trả message_id nếu tin đã đi theo đường KHÔNG topic (cần lưu để map reply).
 */
async function sendToConversation(
  req: PayloadRequest,
  cfg: ChatConfig,
  conv: { id: number | string; telegramTopicId?: number },
  body: string,
): Promise<{ fallbackMessageId?: number }> {
  const topicId = typeof conv.telegramTopicId === 'number' ? conv.telegramTopicId : undefined
  const tagged = `💬 #hs${conv.id}: ${body}`

  if (!topicId) return { fallbackMessageId: await sendMessage(cfg, tagged, undefined) }

  try {
    await sendMessage(cfg, body, topicId)
    return {}
  } catch (e) {
    req.payload.logger.warn(
      `[chat] topic ${topicId} không gửi được (bị xoá?), chuyển sang nhóm chung: ${String(e)}`,
    )
    const mid = await sendMessage(cfg, `⚠️ (topic cũ đã mất)\n${tagged}`, undefined)
    await req.payload
      .update({
        collection: 'chat-conversations',
        id: conv.id,
        data: { telegramTopicId: null } as never,
        overrideAccess: true,
      })
      .catch(() => {})
    return { fallbackMessageId: mid }
  }
}
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
    return json({
      ok: true,
      enabled: cfg.enabled,
      widgetTitle: cfg.widgetTitle,
      loginGreeting: cfg.loginGreeting,
      bubbleEnabled: cfg.bubbleEnabled,
      bubbleMessage: cfg.bubbleMessage,
      bubbleDelay: cfg.bubbleDelay,
      bubbleOncePerSession: cfg.bubbleOncePerSession,
    })
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
    const str = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max) || undefined
    const startPage = str(body.startPage, 300) ?? ''
    const userAgent = String(body.userAgent ?? '').slice(0, 500)
    const token = randomUUID()

    // Định danh: proxy frontend đính kèm thông tin thành viên nếu đã đăng nhập.
    // Bắt buộc đăng nhập mới được chat — proxy đã xác thực bằng cookie phiên
    // CÓ KÝ nên client không tự khai loggedIn được.
    const loggedIn = body.loggedIn === true
    if (!loggedIn) return json({ ok: false, error: 'login_required' }, 401)

    const memberName = str(body.memberName, 120)
    const memberEmail = str(body.memberEmail, 200)
    const memberId = body.memberId != null ? String(body.memberId) : undefined
    const memberCompany = str(body.memberCompany, 200)
    const isBusiness = body.memberType !== 'individual'

    // ── Tracking tự động ──
    const ip = clientIp(req)
    const geo = await lookupGeo(ip)
    const ua = parseUserAgent(userAgent)

    // Sales cần biết ngay đang nói chuyện với doanh nghiệp hay khách cá nhân.
    const who = `${isBusiness ? '🏢 Doanh nghiệp' : '🙋 Cá nhân'}: ${memberName || memberEmail}${
      memberCompany ? ` (${memberCompany})` : ''
    }`

    let topicId: number | undefined
    if (isTelegramReady(cfg)) {
      try {
        // Tên topic gắn danh tính để sales nhận ra ngay.
        topicId = await createTopic(
          cfg,
          `${isBusiness ? '🏢' : '🙋'} ${memberName || memberEmail} · ${memberCompany || startPage || '/'}`,
        )
      } catch (e) {
        // Nhóm chưa bật Topics → dùng chung nhóm (map reply-to). Không chặn chat.
        req.payload.logger.warn(`[chat] không tạo được topic (nhóm chưa bật Topics?), dùng chung nhóm: ${String(e)}`)
      }
    }

    const conv = await req.payload.create({
      collection: 'chat-conversations',
      data: {
        title: `${memberName || memberEmail} · ${startPage || '/'} · ${new Date().toLocaleString('vi-VN')}`,
        sessionToken: token,
        status: 'open',
        telegramTopicId: topicId,
        // Khách
        loggedIn,
        member: memberId,
        company: memberCompany,
        visitorName: memberName,
        visitorEmail: memberEmail,
        // Vị trí (ước lượng từ IP)
        visitorIp: ip,
        location: geo.label || undefined,
        country: geo.country,
        region: geo.region,
        city: geo.city,
        postal: geo.postal,
        timezone: geo.timezone,
        latitude: geo.latitude,
        longitude: geo.longitude,
        isp: geo.isp,
        // Thiết bị
        userAgent,
        browser: ua.browser,
        browserVersion: ua.browserVersion,
        os: ua.os,
        deviceType: ua.device,
        screen: str(body.screen, 40),
        language: str(body.language, 40),
        // Nguồn truy cập
        startPage,
        referrer: str(body.referrer, 300),
        landingPage: str(body.landingPage, 300),
        pageViews: typeof body.pageViews === 'number' ? body.pageViews : undefined,
        utmSource: str(body.utmSource, 120),
        utmMedium: str(body.utmMedium, 120),
        utmCampaign: str(body.utmCampaign, 120),
        lastMessageAt: new Date().toISOString(),
      } as never,
      overrideAccess: true,
    })

    // Gửi thẻ giới thiệu vào Telegram để sales biết AI ĐANG CHAT.
    if (isTelegramReady(cfg)) {
      const device = [ua.browser, ua.browserVersion, '·', ua.os].filter(Boolean).join(' ')
      const source = [
        str(body.utmSource, 120) && `utm: ${body.utmSource}/${body.utmMedium ?? ''}`,
        str(body.referrer, 300) && `từ ${String(body.referrer).slice(0, 80)}`,
      ]
        .filter(Boolean)
        .join(' · ')
      const intro = [
        `🆕 Khách mới bắt đầu chat`,
        who,
        memberEmail && `✉️ ${memberEmail}`,
        geo.label && `📍 ${geo.label}`,
        geo.isp && `📡 ${geo.isp}`,
        ip && `🌐 IP: ${ip}`,
        device && `🖥 ${device}${ua.device ? ` (${ua.device})` : ''}`,
        `🔗 Trang: ${startPage || '/'}`,
        typeof body.pageViews === 'number' && body.pageViews > 0 && `👣 Đã xem ${body.pageViews} trang`,
        source && `🧭 ${source}`,
        !topicId ? `\n#hs${conv.id} — Sales trả lời bằng cách REPLY vào tin này.` : '',
      ]
        .filter(Boolean)
        .join('\n')
      try {
        const mid = await sendMessage(cfg, intro, topicId)
        // Không topic: lưu message_id của thẻ intro để map reply về hội thoại.
        if (!topicId) {
          await req.payload.create({
            collection: 'chat-messages',
            data: { conversation: conv.id, sender: 'system', text: intro, telegramMessageId: mid } as never,
            overrideAccess: true,
          })
        }
      } catch (e) {
        req.payload.logger.error(`[chat] gửi thẻ giới thiệu lỗi: ${String(e)}`)
      }
    }

    return json({
      ok: true,
      conversationId: conv.id,
      token,
      // Widget lưu lại để biết token này của tài khoản nào (máy dùng chung).
      memberId,
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
    if (isTelegramReady(cfg)) {
      try {
        const { fallbackMessageId } = await sendToConversation(req, cfg, conv, text)
        // Tin đi đường không-topic → lưu message_id để map reply của sales về.
        if (fallbackMessageId) {
          await req.payload.update({
            collection: 'chat-messages',
            id: msg.id,
            data: { telegramMessageId: fallbackMessageId } as never,
            overrideAccess: true,
          })
        }
      } catch (e) {
        req.payload.logger.error(`[chat] gửi Telegram lỗi: ${String(e)}`)
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
        createdAt: (m as { createdAt?: string }).createdAt ?? null,
        // Có đính kèm thì widget tự gọi /chat/file để lấy nội dung thật.
        attachmentKind: (m as { attachmentKind?: string }).attachmentKind ?? null,
        attachmentName: (m as { attachmentName?: string }).attachmentName ?? null,
      })),
    })
  },
}

// ── GET /api/chat/file ───────────────────────────────────────────────────────
// Tải ảnh/tệp sales gửi. Kiểm phiên: tin nhắn phải THUỘC ĐÚNG hội thoại của
// token đưa lên, nếu không khách này xem được đính kèm của khách khác.
const fileEndpoint: Endpoint = {
  path: '/chat/file',
  method: 'get',
  handler: async (req: PayloadRequest): Promise<Response> => {
    const token = String(req.query?.token ?? '')
    const id = String(req.query?.id ?? '')
    if (!token || !id) return json({ ok: false, error: 'Thiếu tham số.' }, 400)
    if (!rateLimit(`file:${clientIp(req)}`, 60, 60 * 1000)) return json({ ok: false }, 429)

    const conv = await findByToken(req, token)
    if (!conv) return json({ ok: false, error: 'Phiên không hợp lệ.' }, 404)

    const found = await req.payload.find({
      collection: 'chat-messages',
      where: { and: [{ id: { equals: id } }, { conversation: { equals: conv.id } }] },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const m = found.docs[0] as { telegramFileId?: string; attachmentName?: string } | undefined
    if (!m?.telegramFileId) return json({ ok: false, error: 'Không có tệp.' }, 404)

    const cfg = await getChatConfig(req.payload)
    if (!isTelegramReady(cfg)) return json({ ok: false }, 503)

    try {
      const url = await getFileUrl(cfg, m.telegramFileId)
      const up = await fetch(url, { signal: AbortSignal.timeout(20000) })
      if (!up.ok || !up.body) return json({ ok: false, error: 'Không tải được tệp.' }, 502)
      return new Response(up.body, {
        headers: {
          'Content-Type': up.headers.get('content-type') ?? 'application/octet-stream',
          'Content-Disposition': `inline; filename="${(m.attachmentName ?? 'file').replace(/[^\w.\-]/g, '_')}"`,
          // Riêng tư: không cho proxy/CDN nào đệm lại tệp của khách.
          'Cache-Control': 'private, max-age=300',
        },
      })
    } catch (e) {
      req.payload.logger.error(`[chat] tải tệp lỗi: ${String(e)}`)
      return json({ ok: false, error: 'Không tải được tệp.' }, 502)
    }
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
          reply_to_message?: { message_id?: number }
          text?: string
          caption?: string
          photo?: { file_id: string; file_size?: number }[]
          document?: { file_id: string; file_name?: string }
          voice?: { file_id: string }
          video?: { file_id: string; file_name?: string }
          sticker?: unknown
          from?: { is_bot?: boolean; first_name?: string; username?: string }
        }
      | undefined
    if (!msg || msg.from?.is_bot) return json({ ok: true })

    // Đính kèm: giữ file_id để khách tải được nội dung THẬT (ảnh/tệp/thoại),
    // không chỉ hiện một dòng chữ mô tả. Ảnh có nhiều cỡ → lấy cỡ lớn nhất.
    const att: { kind?: 'photo' | 'document' | 'voice' | 'video'; fileId?: string; name?: string } = {}
    if (msg.photo?.length) {
      att.kind = 'photo'
      att.fileId = msg.photo[msg.photo.length - 1]?.file_id
    } else if (msg.document) {
      att.kind = 'document'
      att.fileId = msg.document.file_id
      att.name = msg.document.file_name
    } else if (msg.video) {
      att.kind = 'video'
      att.fileId = msg.video.file_id
      att.name = msg.video.file_name
    } else if (msg.voice) {
      att.kind = 'voice'
      att.fileId = msg.voice.file_id
    }

    const text =
      msg.text ||
      msg.caption ||
      (att.kind === 'photo'
        ? '📷 Ảnh'
        : att.kind === 'document'
          ? `📎 ${att.name ?? 'Tệp đính kèm'}`
          : att.kind === 'video'
            ? '🎬 Video'
            : att.kind === 'voice'
              ? '🎤 Tin thoại'
              : msg.sticker
                ? '[sticker]'
                : '')
    if (!text) return json({ ok: true })

    // Map tin sales về hội thoại:
    //  1) Nhóm dùng Topics → theo message_thread_id.
    //  2) Nhóm thường (không Topics) → sales REPLY vào tin của bot → theo
    //     reply_to_message.message_id đã lưu ở telegramMessageId.
    let c: { id: number | string } | undefined
    if (msg.message_thread_id) {
      const conv = await req.payload.find({
        collection: 'chat-conversations',
        where: { telegramTopicId: { equals: msg.message_thread_id } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      c = conv.docs[0] as { id: number | string } | undefined
    } else if (msg.reply_to_message?.message_id) {
      const rel = await req.payload.find({
        collection: 'chat-messages',
        where: { telegramMessageId: { equals: msg.reply_to_message.message_id } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      const relMsg = rel.docs[0] as { conversation?: number | string } | undefined
      if (relMsg?.conversation != null) c = { id: relMsg.conversation }
    }
    if (!c) return json({ ok: true }) // không map được → bỏ qua (vd sales chat linh tinh)

    await req.payload.create({
      collection: 'chat-messages',
      data: {
        conversation: c.id,
        sender: 'agent',
        text: text.slice(0, 4000),
        agentName: msg.from?.first_name ?? msg.from?.username ?? 'Sales',
        telegramFileId: att.fileId,
        attachmentKind: att.kind,
        attachmentName: att.name,
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
    await req.payload.create({
      collection: 'chat-messages',
      data: { conversation: conv.id, sender: 'system', text: 'Đã gửi thông tin liên hệ. Chúng tôi sẽ phản hồi sớm.' } as never,
      overrideAccess: true,
    })
    const cfg = await getChatConfig(req.payload)
    if (isTelegramReady(cfg)) {
      try {
        await sendToConversation(req, cfg, conv, `📧 Khách để lại liên hệ — ${name ? name + ' · ' : ''}${email}`)
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
      steps.chat = chat.is_forum
        ? `✓ Nhóm "${chat.title ?? ''}" đã bật Topics — mỗi khách một topic riêng.`
        : `✓ Nhóm "${chat.title ?? ''}" (không bật Topics) — sales trả lời bằng cách REPLY vào tin của bot.`
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

/**
 * Tìm hội thoại theo token VÀ kiểm tra đúng chủ sở hữu.
 *
 * Chỉ dựa vào token là không đủ: token nằm trong localStorage của trình duyệt
 * và không mất khi đăng xuất. Trên máy dùng chung (văn phòng, quán net), người
 * đăng nhập sau sẽ đọc được nguyên hội thoại của người trước. Vì vậy mọi thao
 * tác đều phải khớp thêm id thành viên do proxy frontend đính kèm (proxy đã
 * xác thực bằng cookie phiên CÓ KÝ nên client không tự khai được).
 *
 * Hội thoại cũ chưa gắn thành viên coi như KHÔNG thuộc về ai → widget sẽ mở
 * hội thoại mới; bản ghi cũ vẫn còn nguyên trong admin.
 */
async function findByToken(req: PayloadRequest, token: string) {
  const r = await req.payload.find({
    collection: 'chat-conversations',
    where: { sessionToken: { equals: token } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const conv = r.docs[0] as
    | { id: number | string; telegramTopicId?: number; member?: number | string | null }
    | undefined
  if (!conv) return undefined

  const memberId = (req.headers as unknown as Headers)?.get?.('x-chat-member') ?? ''
  if (!memberId || conv.member == null || String(conv.member) !== String(memberId)) {
    req.payload.logger.warn(`[chat] từ chối truy cập hội thoại ${conv.id}: không đúng chủ sở hữu.`)
    return undefined
  }
  return conv
}

export const chatEndpoints: Endpoint[] = [
  configEndpoint,
  startEndpoint,
  messageEndpoint,
  pollEndpoint,
  fileEndpoint,
  contactEndpoint,
  webhookEndpoint,
  setupEndpoint,
]
