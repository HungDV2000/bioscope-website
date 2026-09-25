import type { Payload } from 'payload'

/**
 * Báo frontend dựng lại landing ngay sau khi admin lưu chiến dịch.
 *
 * Dùng lại endpoint `/api/revalidate` sẵn có của frontend (cùng khoá
 * REVALIDATE_SECRET với plugin lõi). Lỗi mạng chỉ ghi log: trang vẫn tự làm
 * mới sau vài chục giây, không đáng để báo "lưu thất bại" cho người dùng.
 */
export async function revalidateCampaign(payload: Payload, slug: string | undefined): Promise<void> {
  const frontend = (process.env.FRONTEND_INTERNAL_URL || process.env.FRONTEND_URL || '').replace(/\/$/, '')
  const secret = process.env.REVALIDATE_SECRET
  if (!frontend || !secret || !slug) return
  try {
    const url = `${frontend}/api/revalidate?secret=${encodeURIComponent(secret)}&path=${encodeURIComponent(`/lp/${slug}`)}`
    await fetch(url, { method: 'POST', signal: AbortSignal.timeout(4000) })
  } catch (err) {
    payload.logger.warn(`[landing] revalidate /lp/${slug} lỗi: ${String(err)}`)
  }
}
