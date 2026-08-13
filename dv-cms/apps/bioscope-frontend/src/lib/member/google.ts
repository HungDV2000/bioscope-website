import { createHmac, timingSafeEqual } from 'node:crypto'
import { SESSION_SECRET } from './config'

/** Cookie giữ nonce của luồng OAuth (chống CSRF). */
export const GOOGLE_STATE_COOKIE = 'bs_goauth_state'

/** Redirect URI phải khớp TUYỆT ĐỐI với khai báo ở Google Cloud Console. */
export function googleRedirectUri(origin: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || origin).replace(/\/$/, '')
  return `${base}/api/auth/google/callback`
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
