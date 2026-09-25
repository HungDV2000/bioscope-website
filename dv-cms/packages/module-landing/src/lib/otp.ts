import { createHmac, randomInt, timingSafeEqual } from 'node:crypto'
import type { Payload, PayloadRequest } from 'payload'
import { SLUGS } from '../constants.js'
import { internalSecret } from './http.js'
import { getLandingSettings, sendSms } from './sms.js'
import { relId, type Id } from './campaign.js'

const OTP_TTL_MS = 5 * 60_000
const MAX_ATTEMPTS = 5
/** Khoảng tối thiểu giữa hai lần gửi cho cùng một số — khớp nút "Gửi lại (60s)". */
const RESEND_GAP_MS = 55_000

const hashCode = (phone: string, code: string) =>
  createHmac('sha256', `lp-otp:${internalSecret()}`).update(`${phone}:${code}`).digest('hex')

export type RequestOtpResult =
  | { ok: true; devCode?: string; expiresInSec: number }
  | { ok: false; error: 'too_soon' | 'phone_limit' | 'ip_limit' | 'send_failed'; retryAfterSec?: number }

/**
 * Tạo và gửi OTP.
 *
 * Ba lớp giới hạn, vì mỗi tin SMS là tiền thật:
 *  - cùng một số: cách nhau ≥ 55 giây, tối đa N tin/giờ;
 *  - cùng một IP: tối đa M tin/giờ — chặn kiểu dùng landing để spam tin tới
 *    hàng loạt số người khác.
 */
export async function requestOtp(
  payload: Payload,
  input: { campaign: Id; phone: string; ip: string },
  req?: PayloadRequest,
): Promise<RequestOtpResult> {
  const settings = await getLandingSettings(payload)
  const hourAgo = new Date(Date.now() - 3600_000).toISOString()
  const base = { overrideAccess: true, ...(req ? { req } : {}) }

  const recentForPhone = await payload.find({
    collection: SLUGS.otps,
    where: { and: [{ phone: { equals: input.phone } }, { createdAt: { greater_than: hourAgo } }] },
    sort: '-createdAt',
    depth: 0,
    limit: 50,
    ...base,
  })
  const last = recentForPhone.docs[0] as { createdAt?: string } | undefined
  if (last?.createdAt) {
    const since = Date.now() - new Date(last.createdAt).getTime()
    if (since < RESEND_GAP_MS) return { ok: false, error: 'too_soon', retryAfterSec: Math.ceil((RESEND_GAP_MS - since) / 1000) }
  }
  if (recentForPhone.totalDocs >= (settings.otpPerPhonePerHour ?? 5)) {
    return { ok: false, error: 'phone_limit', retryAfterSec: 3600 }
  }

  if (input.ip && input.ip !== 'unknown') {
    const recentForIp = await payload.count({
      collection: SLUGS.otps,
      where: { and: [{ ip: { equals: input.ip } }, { createdAt: { greater_than: hourAgo } }] },
      ...base,
    })
    if (recentForIp.totalDocs >= (settings.otpPerIpPerHour ?? 20)) {
      return { ok: false, error: 'ip_limit', retryAfterSec: 3600 }
    }
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, '0')
  const sent = await sendSms(payload, input.phone, code)

  await payload.create({
    collection: SLUGS.otps,
    data: {
      campaign: relId(input.campaign),
      phone: input.phone,
      codeHash: hashCode(input.phone, code),
      expiresAt: new Date(Date.now() + OTP_TTL_MS).toISOString(),
      attempts: 0,
      ip: input.ip,
      delivered: sent.delivered,
    },
    ...base,
  })

  if (!sent.delivered) return { ok: false, error: 'send_failed' }

  // Chỉ trả mã về cho giao diện khi đang chạy thử (không gửi SMS thật) VÀ
  // không phải production — để dev bấm thử được luồng mà không cần đọc log.
  const devCode = sent.provider === 'log' && process.env.NODE_ENV !== 'production' ? code : undefined
  return { ok: true, expiresInSec: OTP_TTL_MS / 1000, ...(devCode ? { devCode } : {}) }
}

export type VerifyOtpResult = { ok: true } | { ok: false; error: 'expired' | 'wrong' | 'too_many' }

/**
 * Kiểm mã. Mỗi mã chỉ dùng một lần và chỉ được thử sai 5 lần — hết lượt thì
 * phải xin mã mới (lại bị giới hạn tần suất gửi), nên không dò nổi 10⁶ khả
 * năng.
 */
export async function verifyOtp(
  payload: Payload,
  input: { campaign: Id; phone: string; code: string },
  req?: PayloadRequest,
): Promise<VerifyOtpResult> {
  const base = { overrideAccess: true, ...(req ? { req } : {}) }
  const res = await payload.find({
    collection: SLUGS.otps,
    where: {
      and: [
        { campaign: { equals: input.campaign } },
        { phone: { equals: input.phone } },
        { consumedAt: { exists: false } },
        { expiresAt: { greater_than: new Date().toISOString() } },
      ],
    },
    sort: '-createdAt',
    depth: 0,
    limit: 1,
    ...base,
  })
  const otp = res.docs[0] as { id: Id; codeHash: string; attempts?: number } | undefined
  if (!otp) return { ok: false, error: 'expired' }
  if ((otp.attempts ?? 0) >= MAX_ATTEMPTS) return { ok: false, error: 'too_many' }

  const given = Buffer.from(hashCode(input.phone, String(input.code).replace(/\D/g, '')))
  const stored = Buffer.from(otp.codeHash)
  const match = given.length === stored.length && timingSafeEqual(given, stored)

  await payload.update({
    collection: SLUGS.otps,
    id: otp.id,
    data: match ? { consumedAt: new Date().toISOString() } : { attempts: (otp.attempts ?? 0) + 1 },
    ...base,
  })
  return match ? { ok: true } : { ok: false, error: 'wrong' }
}
