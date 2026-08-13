import { cookies } from 'next/headers'
import { createHmac, timingSafeEqual } from 'node:crypto'
import {
  MEMBER_SESSION_COOKIE,
  MEMBER_SESSION_MAX_AGE,
  MEMBER_TOKEN_COOKIE,
  SESSION_SECRET,
} from './config'
import type { MemberSession } from './types'

/**
 * Phiên thành viên = payload base64url + chữ ký HMAC-SHA256.
 *
 * Bắt buộc ký: trước đây cookie chỉ là base64 JSON nên ai cũng tự chế được
 * cookie để giả danh thành viên đã duyệt. Thiếu khoá ký thì fail-closed —
 * không cấp và không chấp nhận phiên nào.
 */

const b64 = (s: string) => Buffer.from(s, 'utf-8').toString('base64url')
const unb64 = (s: string) => Buffer.from(s, 'base64url').toString('utf-8')

const sign = (payload: string) => createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url')

/** So sánh chữ ký theo thời gian hằng số (chống timing attack). */
function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  return ba.length === bb.length && timingSafeEqual(ba, bb)
}

export function serializeSession(session: MemberSession): string {
  if (!SESSION_SECRET) throw new Error('MEMBER_SESSION_SECRET/PAYLOAD_SECRET chưa được cấu hình.')
  const payload = b64(JSON.stringify({ ...session, iat: Date.now() }))
  return `${payload}.${sign(payload)}`
}

export function parseSession(raw: string | undefined): MemberSession | null {
  if (!raw || !SESSION_SECRET) return null
  const dot = raw.lastIndexOf('.')
  if (dot < 1) return null // cookie cũ (chưa ký) → coi như không hợp lệ
  const payload = raw.slice(0, dot)
  const sig = raw.slice(dot + 1)
  if (!safeEqual(sig, sign(payload))) return null
  try {
    const data = JSON.parse(unb64(payload)) as MemberSession
    if (!data.email || !data.status) return null
    // Hết hạn phía server, không tin mỗi maxAge của trình duyệt.
    if (data.iat && Date.now() - data.iat > MEMBER_SESSION_MAX_AGE * 1000) return null
    return data
  } catch {
    return null
  }
}

export async function getMemberSession(): Promise<MemberSession | null> {
  const jar = await cookies()
  return parseSession(jar.get(MEMBER_SESSION_COOKIE)?.value)
}

/** JWT Payload của thành viên — để gọi API B2B thay mặt họ. */
export async function getMemberToken(): Promise<string | null> {
  const jar = await cookies()
  return jar.get(MEMBER_TOKEN_COOKIE)?.value ?? null
}

export async function requireApprovedMember(): Promise<MemberSession> {
  const session = await getMemberSession()
  if (!session) throw new Error('UNAUTHENTICATED')
  if (session.status !== 'approved') throw new Error('NOT_APPROVED')
  return session
}
