import type { Payload, PayloadRequest } from 'payload'
import { randomInt } from 'node:crypto'
import { SLUGS } from '../constants.js'
import { stripAccents } from './phone.js'

/**
 * Mã giới thiệu dạng chữ cái đầu của tên + 5 số cuối SĐT (NVA13214) — đúng
 * định dạng yêu cầu gốc, dễ đọc qua điện thoại.
 *
 * Trùng (hai người cùng viết tắt và cùng 5 số cuối — hiếm nhưng có) thì thêm
 * một chữ số ngẫu nhiên. Ràng buộc duy nhất ở CSDL là chốt chặn cuối.
 */
export function baseCode(name: string, phone: string): string {
  const initials = stripAccents(name)
    .toUpperCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .replace(/[^A-Z]/g, '')
    .slice(0, 4)
  return `${initials || 'KH'}${phone.slice(-5)}`
}

export async function uniqueReferralCode(payload: Payload, name: string, phone: string, req?: PayloadRequest): Promise<string> {
  const base = baseCode(name, phone)
  for (let i = 0; i < 6; i++) {
    const code = i === 0 ? base : `${base}${randomInt(10)}${i > 2 ? randomInt(10) : ''}`
    const taken = await payload.count({
      collection: SLUGS.participants,
      where: { referralCode: { equals: code } },
      overrideAccess: true,
      ...(req ? { req } : {}),
    })
    if (taken.totalDocs === 0) return code
  }
  return `${base}${Date.now().toString().slice(-4)}`
}

/** Mã hợp lệ về hình thức: 1–5 chữ cái + 5 số, có thể thêm 1–2 số phụ. */
export const REFERRAL_RE = /^[A-Z]{1,5}\d{5,7}$/
