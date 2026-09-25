import { timingSafeEqual } from 'node:crypto'
import type { PayloadRequest } from 'payload'

export const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  })

export const fail = (status: number, error: string, extra: Record<string, unknown> = {}) =>
  json({ ok: false, error, ...extra }, status)

/** Khoá tin cậy server-to-server với frontend — cùng khoá module B2B đang dùng. */
export const internalSecret = () => (process.env.INTERNAL_API_SECRET || process.env.PAYLOAD_SECRET || '').trim()

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  return ba.length === bb.length && timingSafeEqual(ba, bb)
}

/**
 * Mọi endpoint công khai của landing chỉ nhận lời gọi từ frontend (cùng
 * stack), không nhận thẳng từ trình duyệt.
 *
 * Lý do: landing chạy trên tên miền riêng của từng chiến dịch. Cho trình duyệt
 * gọi thẳng CMS nghĩa là phải mở CORS cho mọi tên miền đó, và cookie phiên của
 * người tham gia phải sống ở tên miền admin. Đi vòng qua frontend thì cookie
 * nằm đúng tên miền landing, còn CMS chỉ cần tin một khoá bí mật.
 *
 * Thiếu khoá thì đóng hẳn (fail-closed), không mở cửa cho ai.
 */
export function isInternal(req: PayloadRequest): boolean {
  const secret = internalSecret()
  if (!secret) return false
  const given = req.headers.get('x-internal-secret') ?? ''
  return given.length > 0 && safeEqual(given, secret)
}

/** Nhân viên đăng nhập admin (collection `users`), không phải thành viên B2B. */
export function isStaff(req: PayloadRequest): boolean {
  const u = req.user as { collection?: string } | null | undefined
  return Boolean(u && u.collection === 'users')
}

export async function readJson<T = Record<string, unknown>>(req: PayloadRequest): Promise<T> {
  try {
    if (typeof req.json === 'function') return ((await req.json()) ?? {}) as T
  } catch {
    /* body rỗng hoặc không phải JSON */
  }
  return {} as T
}

/** IP người dùng thật — frontend chuyển tiếp qua header riêng. */
export function clientIp(req: PayloadRequest): string {
  return (
    req.headers.get('x-lp-client-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

export const str = (v: unknown, max = 500): string => (typeof v === 'string' ? v.trim().slice(0, max) : '')
