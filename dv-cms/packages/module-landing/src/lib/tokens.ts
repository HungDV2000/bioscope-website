import { createHmac, timingSafeEqual } from 'node:crypto'
import { internalSecret } from './http.js'

/**
 * Phiếu "bắt đầu xem video", ký HMAC.
 *
 * Mở video → nhận phiếu có giờ bắt đầu; đóng video → nộp phiếu. Chỉ cộng điểm
 * khi đã qua đủ số giây tối thiểu. Không lưu gì vào CSDL: phiếu tự mang giờ
 * bắt đầu, và chữ ký đảm bảo không ai sửa được giờ đó.
 *
 * Đây không chống được người kiên nhẫn mở video rồi để đó — nhưng chặn được
 * kiểu gọi thẳng API "đã xem" cả chục lần một giây.
 */
const sign = (payload: string) => createHmac('sha256', `lp-video:${internalSecret()}`).update(payload).digest('base64url')

export function issueWatchToken(participantId: string | number, videoKey: string): string {
  const payload = `${participantId}.${videoKey}.${Date.now()}`
  return `${Buffer.from(payload).toString('base64url')}.${sign(payload)}`
}

export function verifyWatchToken(
  token: string,
  participantId: string | number,
  videoKey: string,
): { ok: true; startedAt: number } | { ok: false } {
  const [b64, sig] = String(token).split('.')
  if (!b64 || !sig) return { ok: false }
  const payload = Buffer.from(b64, 'base64url').toString()
  const expected = sign(payload)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false }
  const [pid, key, ts] = payload.split('.')
  if (pid !== String(participantId) || key !== videoKey) return { ok: false }
  const startedAt = Number(ts)
  // Phiếu sống tối đa 3 giờ — mở tab rồi quay lại hôm sau thì xem lại.
  if (!Number.isFinite(startedAt) || Date.now() - startedAt > 3 * 3600_000) return { ok: false }
  return { ok: true, startedAt }
}
