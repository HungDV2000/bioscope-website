import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { LP_SESSION_MAX_AGE, LP_SESSION_SECRET } from './config'

/**
 * Phiên người tham gia landing = payload base64url + chữ ký HMAC-SHA256.
 *
 * Cookie chỉ mang id người tham gia và chiến dịch. Có ký thì không ai tự đổi
 * id để xem/làm thay người khác được; thiếu khoá ký thì không cấp phiên nào.
 */
type LpSession = { pid: string; slug: string; iat: number }

const sign = (payload: string) => createHmac('sha256', `lp:${LP_SESSION_SECRET}`).update(payload).digest('base64url')

export function serializeLpSession(pid: string | number, slug: string): string | null {
  if (!LP_SESSION_SECRET) return null
  const payload = Buffer.from(JSON.stringify({ pid: String(pid), slug, iat: Date.now() })).toString('base64url')
  return `${payload}.${sign(payload)}`
}

export function parseLpSession(raw: string | undefined, slug: string): LpSession | null {
  if (!raw || !LP_SESSION_SECRET) return null
  const dot = raw.lastIndexOf('.')
  if (dot < 1) return null
  const payload = raw.slice(0, dot)
  const a = Buffer.from(raw.slice(dot + 1))
  const b = Buffer.from(sign(payload))
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const s = JSON.parse(Buffer.from(payload, 'base64url').toString()) as LpSession
    if (s.slug !== slug || !s.pid) return null
    if (Date.now() - s.iat > LP_SESSION_MAX_AGE * 1000) return null
    return s
  } catch {
    return null
  }
}
