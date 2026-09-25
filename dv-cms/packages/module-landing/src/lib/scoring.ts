import type { Payload } from 'payload'
import { SLUGS } from '../constants.js'
import { pointsOf, type CampaignDoc, type Id } from './campaign.js'
import { roundWindow } from './round-window.js'
import { maskName } from './phone.js'

export type Ranked = {
  id: Id
  name: string
  points: number
  joinSeq: number
  /** Số người vào sau được tính (đã chặn trần). */
  bonusCount: number
  total: number
  pct: number
  rank: number
}

type Row = { id: Id; name: string; roundPoints?: number; roundJoinSeq?: number }

const cache = new Map<string, { at: number; rows: Ranked[] }>()
/** Bảng xếp hạng tính lại tối đa 15 giây một lần cho mỗi chiến dịch. */
const TTL_MS = 15_000

export function invalidateRanking(campaignId?: Id): void {
  if (campaignId == null) return cache.clear()
  // Mỗi chiến dịch có nhiều đợt trong cache — xoá hết các đợt của nó.
  const prefix = `${String(campaignId)}:`
  for (const k of cache.keys()) if (k.startsWith(prefix)) cache.delete(k)
}

/**
 * Tính bảng xếp hạng.
 *
 * Tổng điểm = điểm nhiệm vụ (sổ điểm) + điểm "người vào sau".
 *
 * Điểm "người vào sau" KHÔNG lưu sẵn mà tính từ thứ tự đăng ký lúc đọc: nếu
 * lưu, mỗi lần có người mới vào phải cập nhật điểm của tất cả người vào trước
 * — hàng nghìn lệnh ghi cho một lượt đăng ký. Tính lúc đọc thì không ai bơm
 * được con số này, và người bị loại (gian lận) tự động không còn được tính.
 *
 * Bằng điểm thì ai đăng ký trước đứng trên — đúng luật chơi đã công bố.
 */
export async function loadRanking(
  payload: Payload,
  campaign: CampaignDoc,
  opts: { fresh?: boolean; roundKey?: string } = {},
): Promise<Ranked[]> {
  const roundKey = opts.roundKey ?? roundWindow(campaign).key
  const key = `${String(campaign.id)}:${roundKey}`
  const hit = cache.get(key)
  if (!opts.fresh && hit && Date.now() - hit.at < TTL_MS) return hit.rows

  // Chỉ những người đang dự ĐỢT này: sang tháng mới ai chưa quay lại thì chưa
  // có tên, điểm tháng trước không mang sang.
  const res = await payload.find({
    collection: SLUGS.participants,
    where: {
      and: [{ campaign: { equals: campaign.id } }, { status: { equals: 'active' } }, { roundKey: { equals: roundKey } }],
    },
    select: { name: true, roundPoints: true, roundJoinSeq: true },
    depth: 0,
    pagination: false,
    overrideAccess: true,
  })

  const p = pointsOf(campaign)
  const rows = (res.docs as unknown as Row[])
    .map((r) => ({
      id: r.id,
      name: r.name,
      points: Number(r.roundPoints) || 0,
      joinSeq: Number(r.roundJoinSeq) || Number.MAX_SAFE_INTEGER,
    }))
    .sort((a, b) => a.joinSeq - b.joinSeq)

  const n = rows.length
  const ranked: Ranked[] = rows.map((r, i) => {
    const after = n - 1 - i
    const bonusCount = Math.min(p.bonusMax, after)
    const total = r.points + bonusCount * p.bonusPerJoin
    return {
      ...r,
      bonusCount,
      total,
      pct: Math.min(100, Math.round((total / p.goal) * 100)),
      rank: 0,
    }
  })

  ranked.sort((a, b) => b.total - a.total || a.joinSeq - b.joinSeq)
  ranked.forEach((r, i) => (r.rank = i + 1))

  cache.set(key, { at: Date.now(), rows: ranked })
  return ranked
}

/** Top N cho bảng công khai — tên đã rút gọn, không có số điện thoại. */
export function publicTop(rows: Ranked[], n = 10) {
  return rows.slice(0, n).map((r) => ({ rank: r.rank, name: maskName(r.name), pct: r.pct, total: r.total }))
}
