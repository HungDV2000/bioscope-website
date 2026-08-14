/**
 * Đăng nhập bằng Google cho thành viên B2B.
 *
 *   GET  /api/b2b/google/config   → frontend hỏi có bật không + clientId (công khai)
 *   POST /api/b2b/google/exchange → frontend gửi `code`, CMS đổi lấy hồ sơ Google
 *                                   (dùng client secret), tìm/tạo member, trả JWT
 *
 * Client Secret KHÔNG bao giờ rời khỏi CMS. `code` của Google dùng một lần và
 * gắn chặt với client_id + redirect_uri của mình nên kẻ khác không giả được.
 */
import type { Endpoint, PayloadRequest } from 'payload'
import { randomBytes } from 'crypto'
import { rateLimit, clientIp } from '../lib/rateLimit.js'

const json = (data: unknown, status = 200) => Response.json(data as never, { status })

/**
 * Lấy nguyên nhân GỐC của lỗi. Lỗi truy vấn của Payload/Drizzle chỉ nói "Failed
 * query: insert into ..." còn lý do thật (vd: vi phạm ràng buộc NOT NULL) nằm ở
 * `cause` — không bóc ra thì đọc log vẫn không biết hỏng vì đâu.
 */
function rootCause(e: unknown): string {
  const parts: string[] = []
  let cur: unknown = e
  for (let i = 0; i < 4 && cur; i++) {
    const err = cur as { message?: string; detail?: string; constraint?: string; cause?: unknown }
    if (err.message) parts.push(err.message)
    if (err.detail) parts.push(`detail=${err.detail}`)
    if (err.constraint) parts.push(`constraint=${err.constraint}`)
    cur = err.cause
  }
  return parts.join(' | ') || String(e)
}

type AuthConfig = { enabled: boolean; clientId: string; clientSecret: string; allowRegistration: boolean }

export async function getAuthConfig(payload: PayloadRequest['payload']): Promise<AuthConfig> {
  let g: Record<string, unknown> = {}
  try {
    g = (await payload.findGlobal({ slug: 'auth-settings', depth: 0 })) as never
  } catch {
    /* global chưa tạo — dùng env */
  }
  const pick = (v: unknown, env?: string) => (typeof v === 'string' && v.trim() ? v.trim() : (env ?? '').trim())
  return {
    enabled: g.googleEnabled === true,
    clientId: pick(g.googleClientId, process.env.GOOGLE_OAUTH_CLIENT_ID),
    clientSecret: pick(g.googleClientSecret, process.env.GOOGLE_OAUTH_CLIENT_SECRET),
    allowRegistration: g.allowRegistration !== false,
  }
}

const isReady = (c: AuthConfig) => Boolean(c.enabled && c.clientId && c.clientSecret)

// ── GET /api/b2b/google/config ───────────────────────────────────────────────
const configEndpoint: Endpoint = {
  path: '/b2b/google/config',
  method: 'get',
  handler: async (req: PayloadRequest): Promise<Response> => {
    const c = await getAuthConfig(req.payload)
    // Chỉ lộ clientId (vốn công khai trong URL đăng nhập Google) — KHÔNG lộ secret.
    return json({
      ok: true,
      googleEnabled: isReady(c),
      clientId: isReady(c) ? c.clientId : '',
      allowRegistration: c.allowRegistration,
    })
  },
}

type GoogleProfile = { sub: string; email?: string; email_verified?: boolean; name?: string }

/** Đổi authorization code lấy hồ sơ người dùng. */
async function exchangeCode(c: AuthConfig, code: string, redirectUri: string): Promise<GoogleProfile> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: c.clientId,
      client_secret: c.clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
    signal: AbortSignal.timeout(10000),
  })
  const tok = (await res.json()) as { access_token?: string; error_description?: string; error?: string }
  if (!res.ok || !tok.access_token) {
    throw new Error(tok.error_description || tok.error || 'Đổi code thất bại')
  }
  const me = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tok.access_token}` },
    signal: AbortSignal.timeout(10000),
  })
  if (!me.ok) throw new Error('Không đọc được hồ sơ Google')
  return (await me.json()) as GoogleProfile
}

// ── POST /api/b2b/google/exchange ────────────────────────────────────────────
const exchangeEndpoint: Endpoint = {
  path: '/b2b/google/exchange',
  method: 'post',
  handler: async (req: PayloadRequest): Promise<Response> => {
    if (!rateLimit(`goauth:${clientIp(req)}`, 10, 10 * 60 * 1000)) {
      return json({ error: 'Thử lại sau ít phút.' }, 429)
    }
    const cfg = await getAuthConfig(req.payload)
    if (!isReady(cfg)) return json({ error: 'Đăng nhập Google chưa được bật.' }, 400)

    const body = (await (req as unknown as Request).json().catch(() => ({}))) as Record<string, unknown>
    const code = String(body.code ?? '')
    const redirectUri = String(body.redirectUri ?? '')
    if (!code || !redirectUri) return json({ error: 'Thiếu code hoặc redirectUri.' }, 400)

    let profile: GoogleProfile
    try {
      profile = await exchangeCode(cfg, code, redirectUri)
    } catch (e) {
      req.payload.logger.warn(`[google-auth] đổi code lỗi: ${String(e)}`)
      return json({ error: 'Xác thực Google thất bại.' }, 401)
    }

    const email = (profile.email ?? '').toLowerCase().trim()
    if (!email || profile.email_verified === false) {
      return json({ error: 'Tài khoản Google chưa xác thực email.' }, 400)
    }

    // Tìm theo email (gộp với tài khoản đăng ký bằng mật khẩu cùng email).
    const found = await req.payload.find({
      collection: 'members',
      where: { email: { equals: email } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    })
    let member = found.docs[0] as { id: string | number; status?: string } | undefined

    if (!member) {
      if (!cfg.allowRegistration) return json({ error: 'Hệ thống đang tắt đăng ký mới.' }, 403)
      try {
        member = (await req.payload.create({
          collection: 'members',
          data: {
            email,
            // Payload bắt buộc có mật khẩu — đặt ngẫu nhiên, chủ tài khoản không
            // biết. hasPassword=false để trang tài khoản cho đặt mật khẩu lần đầu
            // mà không hỏi mật khẩu cũ.
            password: randomBytes(24).toString('base64url'),
            hasPassword: false,
            // Google không cung cấp tên công ty — để trống, khách điền ở trang Tài khoản.
            contactName: profile.name || email.split('@')[0],
            // Duyệt ở mức cơ bản: chat + sửa hồ sơ dùng ngay. Khu tài liệu B2B
            // vẫn chờ admin đổi status sang 'approved'.
            status: 'pending',
            authProvider: 'google',
            googleId: profile.sub,
            emailVerified: true,
          } as never,
          overrideAccess: true,
          req,
        })) as never
      } catch (e) {
        // Ghi rõ nguyên nhân: trước đây lỗi tạo tài khoản chỉ hiện "đăng nhập
        // Google thất bại", phải mở log CMS mới biết trường nào không hợp lệ.
        req.payload.logger.error(`[google-auth] tạo tài khoản thất bại cho ${email}: ${rootCause(e)}`)
        return json({ error: 'Không tạo được tài khoản từ hồ sơ Google.', detail: rootCause(e) }, 400)
      }
    } else {
      await req.payload.update({
        collection: 'members',
        id: member.id,
        data: { googleId: profile.sub, emailVerified: true } as never,
        overrideAccess: true,
        req,
      })
    }

    // Không cấp JWT ở đây: `payload.login` luôn đòi mật khẩu, mà tài khoản
    // Google thì không có. Frontend tự ký cookie phiên của nó, và mọi lời gọi
    // API sau đó đi bằng khoá nội bộ server-to-server (xem resolveMember ở
    // module-b2b) — dùng chung cho cả đăng nhập mật khẩu lẫn Google.
    const doc = await req.payload.findByID({
      collection: 'members',
      id: member.id,
      depth: 0,
      overrideAccess: true,
      req,
    })
    return json({ ok: true, user: doc })
  },
}

export const googleAuthEndpoints: Endpoint[] = [configEndpoint, exchangeEndpoint]
