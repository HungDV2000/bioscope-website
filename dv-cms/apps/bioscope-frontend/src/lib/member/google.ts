import { createHmac, timingSafeEqual } from 'node:crypto'
import { SESSION_SECRET } from './config'

/** Cookie giữ nonce của luồng OAuth (chống CSRF). */
export const GOOGLE_STATE_COOKIE = 'bs_goauth_state'

/**
 * Origin công khai mà KHÁCH đang truy cập.
 *
 * Bên trong container, req.nextUrl.origin là http://localhost:26300 — dùng nó
 * để redirect thì khách bị đá về localhost (không vào được). Phải đọc header
 * do nginx/aaPanel chuyển tiếp. Cũng KHÔNG dùng NEXT_PUBLIC_SITE_URL làm ưu
 * tiên: nếu biến đó là web.bioscope.vn mà khách đang ở bioscope.vn thì cookie
 * state đặt ở tên miền này, Google lại trả về tên miền kia → mất cookie →
 * lỗi google_state.
 */
export function publicOrigin(req: { headers: Headers; nextUrl: URL }): string {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host')
  if (host) {
    const proto =
      req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() ||
      (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https')
    return `${proto}://${host}`
  }
  return (process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin).replace(/\/$/, '')
}

/** Redirect URI phải khớp TUYỆT ĐỐI với khai báo ở Google Cloud Console. */
export function googleRedirectUri(origin: string): string {
  return `${origin.replace(/\/$/, '')}/api/auth/google/callback`
}

/** Chỉ nhận đường dẫn nội bộ — chặn open redirect. */
export function safeReturnTo(raw: string | null | undefined, fallback = '/member'): string {
  if (!raw) return fallback
  return raw.startsWith('/') && !raw.startsWith('//') ? raw : fallback
}

export function signState(nonce: string, returnTo: string): string {
  const raw = `${nonce}|${returnTo}`
  const sig = createHmac('sha256', SESSION_SECRET).update(raw).digest('base64url')
  return `${Buffer.from(raw, 'utf-8').toString('base64url')}.${sig}`
}

/** Kiểm chữ ký state + đối chiếu nonce với cookie. Trả returnTo nếu hợp lệ. */
export function verifyState(state: string | null, nonceCookie: string | undefined): string | null {
  if (!state || !nonceCookie || !SESSION_SECRET) return null
  const dot = state.lastIndexOf('.')
  if (dot < 1) return null
  const payload = state.slice(0, dot)
  const sig = state.slice(dot + 1)
  const expected = createHmac('sha256', SESSION_SECRET)
    .update(Buffer.from(payload, 'base64url').toString('utf-8'))
    .digest('base64url')
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  const [nonce, returnTo] = Buffer.from(payload, 'base64url').toString('utf-8').split('|')
  const na = Buffer.from(nonce ?? '')
  const nb = Buffer.from(nonceCookie)
  if (na.length !== nb.length || !timingSafeEqual(na, nb)) return null
  return safeReturnTo(returnTo)
}
