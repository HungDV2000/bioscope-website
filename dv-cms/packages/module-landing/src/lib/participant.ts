import type { Payload, PayloadRequest } from 'payload'
import { SLUGS, SYMPTOMS } from '../constants.js'
import { pointsOf, publicVideos, relId, type CampaignDoc, type Id } from './campaign.js'
import { REFERRAL_RE, uniqueReferralCode } from './referral.js'
import { loadRanking, invalidateRanking } from './scoring.js'
import { roundWindow } from './round-window.js'
import { ensureEnrolled } from './rounds.js'

/** Mã triệu chứng — khớp các lựa chọn s1–s5 của trường `symptoms`. */
type SymptomId = 's1' | 's2' | 's3' | 's4' | 's5'

export type ParticipantDoc = {
  id: Id
  campaign: Id | { id: Id }
  name: string
  phone: string
  symptoms?: string[]
  symptomOther?: string
  referralCode?: string
  joinSeq?: number
  points?: number
  status?: 'active' | 'blocked'
  winner?: boolean
  winnerRank?: number
  winAt?: string | null
  roundKey?: string | null
  roundJoinSeq?: number | null
  roundPoints?: number | null
  referredBy?: Id | { id: Id } | null
  inviteCredited?: boolean | null
  sharedAt?: string | null
  createdAt?: string
}

const idOf = (v: Id | { id: Id }) => (typeof v === 'object' ? v.id : v)

export async function findParticipant(payload: Payload, campaignId: Id, phone: string, req?: PayloadRequest) {
  const res = await payload.find({
    collection: SLUGS.participants,
    where: { and: [{ campaign: { equals: campaignId } }, { phone: { equals: phone } }] },
    depth: 0,
    limit: 1,
    overrideAccess: true,
    ...(req ? { req } : {}),
  })
  return (res.docs[0] as unknown as ParticipantDoc) ?? null
}

export async function getParticipant(payload: Payload, id: Id, req?: PayloadRequest): Promise<ParticipantDoc | null> {
  try {
    return (await payload.findByID({
      collection: SLUGS.participants,
      id,
      depth: 0,
      overrideAccess: true,
      ...(req ? { req } : {}),
    })) as unknown as ParticipantDoc
  } catch {
    return null
  }
}

/**
 * Tạo người tham gia, hoặc trả về người đã có (đăng ký lại bằng số cũ).
 *
 * Đăng ký lại KHÔNG tạo bản ghi mới và KHÔNG đổi thứ tự: nếu cho tạo mới thì
 * ai cũng xoá cookie rồi đăng ký lại để "vào sớm" hơn chính mình.
 *
 * `joinSeq` lấy max+1; hai người đăng ký cùng một tích tắc thì bên thua va
 * vào chỉ mục duy nhất (campaign, joinSeq) và thử lại.
 */
export async function registerParticipant(
  payload: Payload,
  campaign: CampaignDoc,
  input: {
    name: string
    phone: string
    symptoms: string[]
    symptomOther: string
    ref?: string
    consentText: string
    verified: boolean
    tracking: { ip: string; userAgent: string; host: string; utm: Record<string, string> }
  },
  req?: PayloadRequest,
): Promise<{ participant: ParticipantDoc; created: boolean }> {
  const existing = await findParticipant(payload, campaign.id, input.phone, req)
  if (existing) return { participant: existing, created: false }

  const symptoms = input.symptoms.filter((s): s is SymptomId => s in SYMPTOMS)

  let referredBy: Id | undefined
  const ref = (input.ref ?? '').toUpperCase()
  if (REFERRAL_RE.test(ref)) {
    const r = await payload.find({
      collection: SLUGS.participants,
      where: { and: [{ campaign: { equals: campaign.id } }, { referralCode: { equals: ref } }] },
      depth: 0,
      limit: 1,
      overrideAccess: true,
      ...(req ? { req } : {}),
    })
    referredBy = (r.docs[0] as { id?: Id } | undefined)?.id
  }

  const referralCode = await uniqueReferralCode(payload, input.name, input.phone, req)
  const now = new Date().toISOString()

  for (let attempt = 0; attempt < 6; attempt++) {
    const last = await payload.find({
      collection: SLUGS.participants,
      where: { campaign: { equals: campaign.id } },
      sort: '-joinSeq',
      select: { joinSeq: true },
      depth: 0,
      limit: 1,
      overrideAccess: true,
      ...(req ? { req } : {}),
    })
    const joinSeq = (Number((last.docs[0] as { joinSeq?: number } | undefined)?.joinSeq) || 0) + 1
    try {
      const doc = await payload.create({
        collection: SLUGS.participants,
        data: {
          campaign: relId(campaign.id),
          name: input.name,
          phone: input.phone,
          symptoms,
          symptomOther: input.symptomOther || undefined,
          referralCode,
          ...(referredBy ? { referredBy: relId(referredBy) } : {}),
          joinSeq,
          points: 0,
          status: 'active',
          consentAt: now,
          consentText: input.consentText,
          ...(input.verified ? { verifiedAt: now } : {}),
          tracking: input.tracking,
        },
        overrideAccess: true,
        ...(req ? { req } : {}),
      })
      invalidateRanking(campaign.id)
      const fresh = doc as unknown as ParticipantDoc
      await ensureEnrolled(payload, campaign, fresh, roundWindow(campaign).key, req)
      return { participant: (await getParticipant(payload, fresh.id, req)) ?? fresh, created: true }
    } catch (err) {
      const msg = String(err)
      if (!/unique|duplicate/i.test(msg)) throw err
      // Có thể là trùng SĐT (người kia vừa đăng ký song song) chứ không phải trùng thứ tự.
      const again = await findParticipant(payload, campaign.id, input.phone, req)
      if (again) return { participant: again, created: false }
    }
  }
  throw new Error('Không cấp được thứ tự đăng ký, vui lòng thử lại.')
}

/**
 * Toàn bộ trạng thái "sổ nhiệm vụ" của một người — thứ giao diện cần để vẽ
 * hộp quà, danh sách việc và nút chính dưới đáy.
 */
export async function participantState(payload: Payload, campaign: CampaignDoc, p: ParticipantDoc, req?: PayloadRequest) {
  const base = { overrideAccess: true, depth: 0, ...(req ? { req } : {}) }
  const round = roundWindow(campaign)
  // Chưa ghi tên vào đợt này thì mọi việc của đợt coi như chưa làm.
  const inRound = p.roundKey === round.key
  const [events, recs, paidOrders] = await Promise.all([
    payload.find({
      collection: SLUGS.pointEvents,
      where: { and: [{ participant: { equals: p.id } }, { round: { equals: round.key } }] },
      select: { type: true, refKey: true, points: true },
      pagination: false,
      ...base,
    }),
    payload.find({
      collection: SLUGS.recordings,
      where: { participant: { equals: p.id } },
      select: { kind: true, status: true, createdAt: true },
      sort: '-createdAt',
      pagination: false,
      ...base,
    }),
    // Đơn đã xác nhận của chính người này — điều kiện mở nhiệm vụ "kể lại kết quả".
    payload.find({
      collection: SLUGS.orders,
      where: {
        and: [
          { buyer: { equals: p.id } },
          { status: { in: ['confirmed', 'shipped'] } },
          { updatedAt: { less_than_equal: new Date(Date.now() - 14 * 86400_000).toISOString() } },
        ],
      },
      select: { status: true },
      limit: 1,
      ...base,
    }),
  ])

  const ev = events.docs as unknown as { type: string; refKey: string; points: number }[]
  const strip = (k: string) => k.replace(new RegExp(`^${round.key}:`), '')
  const videos = ev.filter((e) => e.type === 'video').map((e) => strip(e.refKey).replace(/^video:/, ''))
  // `order` nay mang nghĩa "mời được một người tham gia" (bảng điểm 09/2026).
  const invited = ev.filter((e) => e.type === 'order').length
  const recordings = recs.docs as unknown as { kind: string; status: string; createdAt?: string }[]
  const statusOf = (kind: string, sinceISO?: string) => {
    const since = sinceISO ? new Date(sinceISO).getTime() : 0
    const list = recordings.filter((r) => r.kind === kind && (!since || new Date(r.createdAt ?? 0).getTime() >= since))
    if (!list.length) return 'none'
    if (list.some((r) => r.status === 'approved')) return 'approved'
    if (list.some((r) => r.status === 'pending')) return 'pending'
    return 'rejected'
  }

  const ranking = inRound ? await loadRanking(payload, campaign, { roundKey: round.key }) : []
  const me = ranking.find((r) => String(r.id) === String(p.id))
  const pts = pointsOf(campaign)
  const total = me?.total ?? 0

  /**
   * Nhiệm vụ "chia sẻ kết quả sau 2 tuần" mở cho người ĐÃ NHẬN QUÀ hoặc ĐÃ MUA
   * HÀNG, tính từ 14 ngày sau mốc đó — họ mới có kết quả thật để kể.
   */
  const winAt = p.winAt ? new Date(p.winAt).getTime() : 0
  const resultUnlocked =
    Boolean(p.winner && winAt && Date.now() - winAt >= 14 * 86400_000) || paidOrders.docs.length > 0

  return {
    id: p.id,
    name: p.name,
    phoneMasked: `${p.phone.slice(0, 2)}•• ••• ${p.phone.slice(-3)}`,
    referralCode: p.referralCode ?? '',
    joinSeq: p.joinSeq ?? 0,
    status: p.status ?? 'active',
    points: Number(p.roundPoints) || 0,
    bonusCount: me?.bonusCount ?? 0,
    total,
    pct: me?.pct ?? Math.min(100, Math.round((total / pts.goal) * 100)),
    rank: me?.rank ?? null,
    rankOf: ranking.length,
    roundKey: round.key,
    videosWatched: videos.filter((k) => publicVideos(campaign).some((v) => v.key === k)),
    // Kể chuyện dạ dày làm lại mỗi đợt; kể lại kết quả thì một lần cho mỗi người.
    recording: inRound ? statusOf('intro', round.startAt) : 'none',
    result: statusOf('result'),
    resultUnlocked,
    sharedAt: p.sharedAt ?? null,
    invited,
    invitedMax: pts.maxReferralOrders,
    winner: Boolean(p.winner),
    winnerRank: p.winnerRank ?? null,
    campaignId: idOf(p.campaign),
  }
}
