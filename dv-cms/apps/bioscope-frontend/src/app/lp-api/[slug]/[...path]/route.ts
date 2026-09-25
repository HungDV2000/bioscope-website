import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { lpFetch } from '@/lib/landing/cms'
import { lpCookieName, LP_SESSION_MAX_AGE } from '@/lib/landing/config'
import { parseLpSession, serializeLpSession } from '@/lib/landing/session'
import { clientIp, rateLimit } from '@/lib/rate-limit'

/**
 * Cổng API của landing — trình duyệt chỉ nói chuyện với đường này.
 *
 * Nó (1) đọc cookie phiên đã ký và chuyển id người tham gia sang CMS, (2) gắn
 * khoá nội bộ, (3) chặn tần suất theo IP trước khi tốn một lệnh gọi CMS hay
 * một tin SMS. Chỉ những đường dẫn liệt kê dưới đây được đi qua — không có
 * chuyện chuyển tiếp tuỳ ý tới CMS.
 */
type Route = {
  method: 'GET' | 'POST'
  session: 'required' | 'optional' | 'none'
  /** Giới hạn [số lần, cửa sổ ms] theo IP. */
  limit?: [number, number]
  multipart?: boolean
}

const ROUTES: Record<string, Route> = {
  me: { method: 'GET', session: 'required' },
  otp: { method: 'POST', session: 'none', limit: [8, 10 * 60_000] },
  join: { method: 'POST', session: 'none', limit: [20, 10 * 60_000] },
  'video/start': { method: 'POST', session: 'required', limit: [60, 60_000] },
  'video/complete': { method: 'POST', session: 'required', limit: [60, 60_000] },
  recordings: { method: 'POST', session: 'required', limit: [10, 10 * 60_000], multipart: true },
  share: { method: 'POST', session: 'required', limit: [20, 60_000] },
  orders: { method: 'POST', session: 'optional', limit: [6, 10 * 60_000] },
  logout: { method: 'POST', session: 'none' },
}

/** 16 MB — CMS còn chặn ở 15 MB; chặn sớm ở đây để khỏi đẩy file khổng lồ đi tiếp. */
const MAX_UPLOAD = 16 * 1024 * 1024

const bad = (status: number, error: string, extra: Record<string, unknown> = {}) =>
  NextResponse.json({ ok: false, error, ...extra }, { status, headers: { 'Cache-Control': 'no-store' } })

function cookieOpts(req: NextRequest) {
  const proto = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() ?? req.nextUrl.protocol.replace(':', '')
  return { httpOnly: true, sameSite: 'lax' as const, path: '/', maxAge: LP_SESSION_MAX_AGE, secure: proto === 'https' }
}

async function handle(req: NextRequest, ctx: { params: Promise<{ slug: string; path: string[] }> }) {
  const { slug, path } = await ctx.params
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return bad(404, 'not_found')

  let key = path.join('/')
  let route = ROUTES[key]
  // /code/<MÃ> — kiểm mã giảm giá ở form đặt hàng
  if (!route && path[0] === 'code' && path.length === 2) {
    key = 'code'
    route = { method: 'GET', session: 'none', limit: [40, 60_000] }
  }
  if (!route || route.method !== req.method) return bad(404, 'not_found')

  const ip = clientIp(req)
  if (route.limit) {
    const r = rateLimit(`lp:${slug}:${key}:${ip}`, route.limit[0], route.limit[1])
    if (!r.ok) return bad(429, 'rate_limited', { retryAfterSec: r.retryAfter })
  }

  const jar = await cookies()
  const cookieName = lpCookieName(slug)

  if (key === 'logout') {
    const res = NextResponse.json({ ok: true })
    res.cookies.set(cookieName, '', { ...cookieOpts(req), maxAge: 0 })
    return res
  }

  const session = parseLpSession(jar.get(cookieName)?.value, slug)
  if (route.session === 'required' && !session) return bad(401, 'no_session')

  let body: BodyInit | undefined
  const headers: Record<string, string> = {}
  if (req.method === 'POST') {
    if (route.multipart) {
      const len = Number(req.headers.get('content-length') ?? 0)
      if (len > MAX_UPLOAD) return bad(413, 'too_large')
      const ct = req.headers.get('content-type') ?? ''
      if (!ct.startsWith('multipart/form-data')) return bad(415, 'multipart_required')
      const buf = await req.arrayBuffer()
      if (buf.byteLength > MAX_UPLOAD) return bad(413, 'too_large')
      body = buf
      headers['content-type'] = ct
    } else {
      const text = await req.text()
      if (text.length > 20_000) return bad(413, 'too_large')
      let data: Record<string, unknown> = {}
      try {
        data = text ? (JSON.parse(text) as Record<string, unknown>) : {}
      } catch {
        return bad(400, 'bad_json')
      }
      // Tên miền khách đang đứng — để biết họ vào từ tên miền landing nào.
      if (key === 'join') data.host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? ''
      body = JSON.stringify(data)
      headers['content-type'] = 'application/json'
    }
  }
  headers['user-agent'] = req.headers.get('user-agent') ?? ''

  const cmsPath = key === 'code' ? `/c/${slug}/code/${encodeURIComponent(path[1])}` : `/c/${slug}/${key}`
  let upstream: Response
  try {
    upstream = await lpFetch(cmsPath, {
      method: req.method,
      body,
      headers,
      ip,
      ...(session ? { participantId: session.pid } : {}),
    })
  } catch {
    return bad(502, 'cms_unreachable')
  }

  const data = (await upstream.json().catch(() => ({ ok: false, error: 'bad_upstream' }))) as Record<string, unknown>

  // Tham gia thành công → cấp cookie phiên đã ký. Id nội bộ không trả về
  // trình duyệt — cookie là đủ.
  let token: string | null = null
  if (key === 'join' && upstream.ok && data.participantId != null) {
    token = serializeLpSession(String(data.participantId), slug)
    if (!token) return bad(500, 'server_misconfigured')
    delete data.participantId
  }

  const res = NextResponse.json(data, { status: upstream.status, headers: { 'Cache-Control': 'no-store' } })
  if (token) res.cookies.set(cookieName, token, cookieOpts(req))
  // Phiên trỏ tới người đã bị xoá / chiến dịch khác → dọn cookie hỏng.
  if (upstream.status === 401 && session) res.cookies.set(cookieName, '', { ...cookieOpts(req), maxAge: 0 })
  return res
}

export const GET = handle
export const POST = handle
