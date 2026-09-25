import type { Payload, PayloadRequest } from 'payload'
import { SLUGS } from '../constants.js'
import { pointsOf, type CampaignDoc, type Id } from './campaign.js'
import { grantPoints } from './points.js'
import { ensureEnrolled } from './rounds.js'
import type { ParticipantDoc } from './participant.js'

const idOf = (v: unknown): Id | null =>
  v == null ? null : typeof v === 'object' ? (((v as { id?: Id }).id ?? null) as Id | null) : (v as Id)

/**
 * Cộng điểm "mời được 1 người tham gia" cho người giới thiệu.
 *
 * Ba lớp chặn cày điểm bằng sim rác, vì đây là mức điểm cao nhất của bảng:
 *  1. người được mời phải qua OTP (đã kiểm ở bước đăng ký),
 *  2. chỉ cộng khi người đó LÀM XONG một việc thật (xem hết một video) — gọi
 *     hàm này sau khi cộng điểm video,
 *  3. mỗi đợt chỉ tính tối đa `maxReferralOrders` lượt mời cho một người.
 *
 * Mỗi người được mời chỉ tính MỘT LẦN trọn đời (cờ `inviteCredited`), tháng
 * sau mời lại chính người đó không được cộng nữa.
 */
export async function creditInviter(
  payload: Payload,
  campaign: CampaignDoc,
  invitee: ParticipantDoc & { referredBy?: unknown; inviteCredited?: boolean | null },
  roundKey: string,
  req?: PayloadRequest,
): Promise<void> {
  if (invitee.inviteCredited) return
  const referrer = idOf(invitee.referredBy)
  if (referrer == null || String(referrer) === String(invitee.id)) return
  const base = { overrideAccess: true as const, ...(req ? { req } : {}) }

  const ref = (await payload
    .findByID({ collection: SLUGS.participants, id: referrer as string, depth: 0, ...base })
    .catch(() => null)) as (ParticipantDoc & { status?: string }) | null
  if (!ref || ref.status === 'blocked') return

  const pts = pointsOf(campaign)
  // Người giới thiệu phải đang dự đợt này thì điểm mới có chỗ để cộng.
  await ensureEnrolled(payload, campaign, ref, roundKey, req)

  const already = await payload.count({
    collection: SLUGS.pointEvents,
    where: {
      and: [{ participant: { equals: referrer } }, { type: { equals: 'order' } }, { round: { equals: roundKey } }],
    },
    ...base,
  })
  if (already.totalDocs >= Math.max(0, Number(pts.maxReferralOrders) || 0)) return

  const granted = await grantPoints(
    payload,
    {
      participant: referrer,
      campaign: campaign.id,
      type: 'order',
      refKey: `invite:${invitee.id}`,
      round: roundKey,
      points: Number(pts.order) || 0,
      note: `Mời được ${invitee.name}`,
    },
    req,
  )
  if (granted) {
    await payload.update({
      collection: SLUGS.participants,
      id: invitee.id,
      data: { inviteCredited: true },
      ...base,
    })
  }
}
