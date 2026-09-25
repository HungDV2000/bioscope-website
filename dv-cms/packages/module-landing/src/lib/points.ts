import type { Payload, PayloadRequest } from 'payload'
import { SLUGS, type PointType } from '../constants.js'
import { invalidateRanking } from './scoring.js'
import { relId } from './campaign.js'

type Id = string | number

/**
 * Cộng điểm — idempotent theo `refKey`.
 *
 * Trả `false` nếu khoá đó đã được cộng rồi (vi phạm ràng buộc duy nhất) —
 * trường hợp bình thường khi người dùng bấm hai lần hoặc hai request trùng
 * nhau, không phải lỗi.
 */
export async function grantPoints(
  payload: Payload,
  input: { participant: Id; campaign: Id; type: PointType; refKey: string; points: number; note?: string; round: string },
  req?: PayloadRequest,
): Promise<boolean> {
  // Khoá chống trùng mang theo mã đợt: cùng một video, tháng nào xem cũng được
  // cộng, nhưng trong một tháng thì không cộng hai lần.
  const refKey = `${input.round}:${input.refKey}`
  const existing = await payload.find({
    collection: SLUGS.pointEvents,
    where: { and: [{ participant: { equals: input.participant } }, { refKey: { equals: refKey } }] },
    depth: 0,
    limit: 1,
    overrideAccess: true,
    ...(req ? { req } : {}),
  })
  if (existing.docs.length) return false

  try {
    await payload.create({
      collection: SLUGS.pointEvents,
      data: {
        participant: relId(input.participant),
        campaign: relId(input.campaign),
        type: input.type,
        refKey,
        round: input.round,
        points: input.points,
        note: input.note,
      },
      overrideAccess: true,
      ...(req ? { req } : {}),
    })
    return true
  } catch (err) {
    // Hai request cùng lúc: bên thua va vào index duy nhất — coi như đã cộng.
    if (/unique|duplicate/i.test(String(err))) return false
    throw err
  }
}

/** Thu hồi điểm đã cộng theo khoá (ghi âm bị loại). */
export async function revokePoints(payload: Payload, participant: Id, refKey: string, round: string, req?: PayloadRequest): Promise<void> {
  await payload.delete({
    collection: SLUGS.pointEvents,
    where: { and: [{ participant: { equals: participant } }, { refKey: { equals: `${round}:${refKey}` } }] },
    overrideAccess: true,
    ...(req ? { req } : {}),
  })
}

/**
 * Tính lại điểm cache của một người: tổng mọi đợt (`points`) và điểm của đợt
 * người đó đang dự (`roundPoints` — con số dùng để xếp hạng).
 */
export async function recomputePoints(payload: Payload, participant: Id | null, req?: PayloadRequest): Promise<number> {
  if (participant == null) return 0
  const base = { depth: 0, overrideAccess: true as const, ...(req ? { req } : {}) }
  const events = await payload.find({
    collection: SLUGS.pointEvents,
    where: { participant: { equals: participant } },
    select: { points: true, round: true },
    pagination: false,
    ...base,
  })
  let roundKey: string | null = null
  try {
    const p = (await payload.findByID({ collection: SLUGS.participants, id: participant as string, ...base })) as {
      roundKey?: string | null
    }
    roundKey = p?.roundKey ?? null
  } catch {
    /* người tham gia vừa bị xoá */
  }
  const rows = events.docs as unknown as { points?: number; round?: string | null }[]
  const total = rows.reduce((sum, e) => sum + (Number(e.points) || 0), 0)
  const roundTotal = roundKey ? rows.filter((e) => e.round === roundKey).reduce((s, e) => s + (Number(e.points) || 0), 0) : 0
  // Điểm vừa đổi thì bảng xếp hạng cache không còn đúng — người vừa xem xong
  // video phải thấy hộp quà đầy lên ngay, không phải 15 giây sau.
  invalidateRanking()
  try {
    await payload.update({
      collection: SLUGS.participants,
      id: participant,
      data: { points: total, roundPoints: roundTotal },
      overrideAccess: true,
      ...(req ? { req } : {}),
    })
  } catch {
    // Người tham gia đã bị xoá — không còn gì để cập nhật.
  }
  return total
}
