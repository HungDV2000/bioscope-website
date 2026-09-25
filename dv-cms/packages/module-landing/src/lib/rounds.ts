import type { Payload, PayloadRequest } from 'payload'
import { SLUGS } from '../constants.js'
import { relId, type CampaignDoc, type Id } from './campaign.js'
import { roundWindow } from './round-window.js'
import { invalidateRanking, loadRanking } from './scoring.js'
import { revalidateCampaign } from './revalidate.js'

/**
 * ĐỢT (round) — một vòng chơi, mặc định là một tháng.
 *
 * Chốt theo tháng nghĩa là điểm phải tính lại mỗi tháng, nếu không người tham
 * gia từ tháng 9 sẽ mang nguyên điểm sang tháng 10 và người mới không bao giờ
 * đuổi kịp. Người tham gia vẫn là MỘT hồ sơ (số điện thoại, mã giới thiệu giữ
 * nguyên), chỉ có điểm và thứ tự tham gia là tính theo từng đợt.
 *
 * Mọi mốc giờ tính theo giờ Việt Nam, không theo giờ máy chủ: VPS chạy UTC thì
 * "cuối tháng" của máy lệch 7 tiếng so với "cuối tháng" của khách.
 */
export type RoundStatus = 'open' | 'closed' | 'announced'

export type RoundDoc = {
  id: Id
  campaign: Id | { id: Id }
  key: string
  startAt: string
  endAt: string
  announceAt: string
  status: RoundStatus
  frozenAt?: string | null
  slots?: number
  winners?: { participant: Id | { id: Id; name?: string }; rank: number; points: number }[]
}

/** Đợt hiện hành trong CSDL; chưa có thì tạo. */
export async function ensureRound(payload: Payload, campaign: CampaignDoc, req?: PayloadRequest): Promise<RoundDoc> {
  const w = roundWindow(campaign)
  const base = { overrideAccess: true as const, ...(req ? { req } : {}) }
  const found = await payload.find({
    collection: SLUGS.rounds,
    where: { and: [{ campaign: { equals: campaign.id } }, { key: { equals: w.key } }] },
    depth: 0,
    limit: 1,
    ...base,
  })
  const existing = found.docs[0] as unknown as RoundDoc | undefined
  if (existing) return existing

  try {
    return (await payload.create({
      collection: SLUGS.rounds,
      data: {
        campaign: relId(campaign.id),
        key: w.key,
        startAt: w.startAt,
        endAt: w.endAt,
        announceAt: w.announceAt,
        status: 'open',
        slots: Number(campaign.slots) || 0,
      },
      ...base,
    })) as unknown as RoundDoc
  } catch (err) {
    // Hai request cùng lúc cùng tạo đợt: bên thua đọc lại bản của bên thắng.
    const again = await payload.find({
      collection: SLUGS.rounds,
      where: { and: [{ campaign: { equals: campaign.id } }, { key: { equals: w.key } }] },
      depth: 0,
      limit: 1,
      ...base,
    })
    const doc = again.docs[0] as unknown as RoundDoc | undefined
    if (doc) return doc
    throw err
  }
}

/**
 * Ghi tên người tham gia vào đợt đang mở.
 *
 * Gọi ở mọi thao tác của khách (mở trang, xem video, ghi âm…). Lần đầu chạm
 * vào đợt mới thì điểm về 0 và nhận số thứ tự mới — số này quyết định điểm
 * thưởng "có người tham gia sau bạn" và thứ tự khi hoà điểm.
 */
export async function ensureEnrolled(
  payload: Payload,
  campaign: CampaignDoc,
  participant: { id: Id; roundKey?: string | null; roundJoinSeq?: number | null },
  roundKey: string,
  req?: PayloadRequest,
): Promise<number> {
  if (participant.roundKey === roundKey && participant.roundJoinSeq) return participant.roundJoinSeq
  const base = { overrideAccess: true as const, ...(req ? { req } : {}) }

  for (let attempt = 0; attempt < 5; attempt++) {
    const last = await payload.find({
      collection: SLUGS.participants,
      where: { and: [{ campaign: { equals: campaign.id } }, { roundKey: { equals: roundKey } }] },
      select: { roundJoinSeq: true },
      sort: '-roundJoinSeq',
      depth: 0,
      limit: 1,
      ...base,
    })
    const seq = (Number((last.docs[0] as { roundJoinSeq?: number } | undefined)?.roundJoinSeq) || 0) + 1
    try {
      await payload.update({
        collection: SLUGS.participants,
        id: participant.id,
        data: { roundKey, roundJoinSeq: seq, roundPoints: 0 },
        ...base,
      })
      invalidateRanking(campaign.id)
      return seq
    } catch (err) {
      // Đụng ràng buộc duy nhất (campaign, roundKey, roundJoinSeq) → thử số kế.
      if (!/unique|duplicate/i.test(String(err))) throw err
    }
  }
  return 0
}

/**
 * Chốt một đợt: đóng băng thứ hạng, chọn `slots` người điểm cao nhất.
 *
 * Danh sách được lưu vào chính đợt đó nên tra lại tháng nào cũng được. Người
 * nhận quà KHÔNG lộ ra trang công khai cho tới mốc công bố (mặc định 10:00
 * ngày 05 tháng sau) — 5 ngày đó để Bioscope đối chiếu, loại trường hợp gian
 * lận rồi mới công bố.
 */
export async function closeRound(
  payload: Payload,
  campaign: CampaignDoc,
  round: RoundDoc,
  opts: { force?: boolean; req?: PayloadRequest } = {},
): Promise<{ closed: boolean; winners: number; reason?: string }> {
  if (round.status !== 'open' && !opts.force) return { closed: false, winners: 0, reason: 'already_closed' }
  const base = { overrideAccess: true as const, ...(opts.req ? { req: opts.req } : {}) }

  const ranking = await loadRanking(payload, campaign, { fresh: true, roundKey: round.key })
  const top = ranking.slice(0, Math.max(0, Number(round.slots ?? campaign.slots) || 0))
  const now = new Date().toISOString()

  // Cờ "đã nhận quà" trên hồ sơ để mở nhiệm vụ kể lại kết quả sau 2 tuần.
  for (const w of top) {
    await payload.update({
      collection: SLUGS.participants,
      id: w.id,
      data: { winner: true, winnerRank: w.rank, winAt: now },
      ...base,
    })
  }

  await payload.update({
    collection: SLUGS.rounds,
    id: round.id,
    data: {
      status: 'closed',
      frozenAt: now,
      participants: ranking.length,
      winners: top.map((w) => ({ participant: relId(w.id), rank: w.rank, points: w.total })),
    },
    ...base,
  })

  // Chu kỳ một lần: chốt xong là đóng chiến dịch như trước.
  if (campaign.cycle !== 'monthly' && campaign.status === 'active') {
    await payload.update({
      collection: SLUGS.campaigns,
      id: campaign.id,
      data: { status: 'ended', winnersFrozenAt: now },
      ...base,
    })
  } else {
    await payload.update({ collection: SLUGS.campaigns, id: campaign.id, data: { winnersFrozenAt: now }, ...base })
  }

  await revalidateCampaign(payload, campaign.slug)
  payload.logger.info(`[landing] Đã chốt đợt ${round.key} của "${campaign.slug}": ${top.length}/${ranking.length} người nhận quà.`)
  return { closed: true, winners: top.length }
}

/** Đợt gần nhất đã chốt (để hiện dải "kết quả tháng trước"). */
export async function lastClosedRound(payload: Payload, campaign: CampaignDoc, req?: PayloadRequest): Promise<RoundDoc | null> {
  const res = await payload.find({
    collection: SLUGS.rounds,
    where: { and: [{ campaign: { equals: campaign.id } }, { status: { not_equals: 'open' } }] },
    sort: '-endAt',
    depth: 1,
    limit: 1,
    overrideAccess: true,
    ...(req ? { req } : {}),
  })
  return (res.docs[0] as unknown as RoundDoc) ?? null
}

/**
 * Tác vụ nền mỗi phút: chốt đợt hết hạn, mở đợt kế, tới giờ thì công bố.
 *
 * Chạy trong tiến trình CMS như các tác vụ nền khác của repo — không cần cron
 * hệ thống, và không phụ thuộc ai đó mở trang admin đúng lúc giao thừa.
 */
export function startRoundScheduler(payload: Payload): void {
  const tick = async () => {
    try {
      const res = await payload.find({
        collection: SLUGS.campaigns,
        where: { status: { in: ['active', 'ended'] } },
        depth: 0,
        pagination: false,
        overrideAccess: true,
      })
      const now = Date.now()
      for (const c of res.docs as unknown as CampaignDoc[]) {
        if (c.autoEndAtDeadline === false) continue

        // 1) Đợt quá hạn → chốt.
        const open = await payload.find({
          collection: SLUGS.rounds,
          where: { and: [{ campaign: { equals: c.id } }, { status: { equals: 'open' } }] },
          depth: 0,
          pagination: false,
          overrideAccess: true,
        })
        for (const r of open.docs as unknown as RoundDoc[]) {
          if (new Date(r.endAt).getTime() <= now) await closeRound(payload, c, r)
        }

        // 2) Tới mốc công bố → mở danh sách người nhận quà.
        const closed = await payload.find({
          collection: SLUGS.rounds,
          where: { and: [{ campaign: { equals: c.id } }, { status: { equals: 'closed' } }] },
          depth: 0,
          pagination: false,
          overrideAccess: true,
        })
        for (const r of closed.docs as unknown as RoundDoc[]) {
          if (new Date(r.announceAt).getTime() <= now) {
            await payload.update({ collection: SLUGS.rounds, id: r.id, data: { status: 'announced' }, overrideAccess: true })
            await revalidateCampaign(payload, c.slug)
            payload.logger.info(`[landing] Đã công bố người nhận quà đợt ${r.key} của "${c.slug}".`)
          }
        }

        // 3) Chiến dịch tháng đang chạy → luôn có sẵn đợt của tháng hiện tại.
        if (c.status === 'active' && c.cycle === 'monthly') await ensureRound(payload, c)
      }
    } catch (err) {
      payload.logger.error(`[landing] Tác vụ nền đợt chạy lỗi: ${String(err)}`)
    }
  }
  const timer = setInterval(tick, 60_000)
  timer.unref?.()
  void tick()
}
