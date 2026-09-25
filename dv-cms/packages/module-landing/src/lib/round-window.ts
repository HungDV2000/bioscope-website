import type { CampaignDoc } from './campaign.js'

/**
 * Mốc thời gian của một ĐỢT (mặc định một tháng), tính theo giờ Việt Nam.
 *
 * Tách khỏi `rounds.ts` để `scoring.ts` dùng được mà không tạo vòng import
 * (rounds → scoring → rounds).
 */
export const VN_OFFSET = '+07:00'

const pad = (n: number) => String(n).padStart(2, '0')

/** Các thành phần ngày/giờ theo múi giờ Việt Nam. */
function vnParts(d: Date) {
  const t = new Date(d.getTime() + 7 * 3600_000)
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() }
}

const vnISO = (y: number, m: number, d: number, hh: number, mm: number, ss = 0) =>
  new Date(`${y}-${pad(m)}-${pad(d)}T${pad(hh)}:${pad(mm)}:${pad(ss)}${VN_OFFSET}`).toISOString()

const daysInMonth = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate()

const parseHHmm = (s: string | undefined, fallback: [number, number]): [number, number] => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(s ?? '').trim())
  if (!m) return fallback
  const hh = Math.min(23, Number(m[1]))
  const mm = Math.min(59, Number(m[2]))
  return [hh, mm]
}

export const monthLabel = (key: string) => {
  const [y, m] = key.split('-')
  return `tháng ${Number(m)}/${y}`
}

export type RoundWindow = { key: string; startAt: string; endAt: string; announceAt: string }

/**
 * Khung thời gian của đợt chứa thời điểm `at`.
 *
 * - Chu kỳ tháng: mở 00:00 ngày 1, chốt theo *Giờ chốt* ngày cuối tháng, công
 *   bố vào *Ngày công bố* của tháng sau (mặc định 10:00 ngày 05).
 * - Chu kỳ một lần: dùng đúng hạn chốt khai trong chiến dịch, công bố sau đó
 *   `announceDay` ngày.
 */
export function roundWindow(campaign: CampaignDoc, at: Date = new Date()): RoundWindow {
  const [closeH, closeM] = parseHHmm(campaign.closeTime, [23, 59])
  const announceDay = Math.max(1, Math.min(28, Number(campaign.announceDay) || 5))
  const [annH, annM] = parseHHmm(campaign.announceTime, [10, 0])

  if (campaign.cycle !== 'monthly') {
    const end = campaign.deadline ? new Date(campaign.deadline) : new Date(at.getTime() + 30 * 86400_000)
    const announce = new Date(end.getTime() + announceDay * 86400_000)
    return { key: 'once', startAt: new Date(0).toISOString(), endAt: end.toISOString(), announceAt: announce.toISOString() }
  }

  const { y, m } = vnParts(at)
  const key = `${y}-${pad(m)}`
  const ny = m === 12 ? y + 1 : y
  const nm = m === 12 ? 1 : m + 1
  return {
    key,
    startAt: vnISO(y, m, 1, 0, 0),
    endAt: vnISO(y, m, daysInMonth(y, m), closeH, closeM, 59),
    announceAt: vnISO(ny, nm, announceDay, annH, annM),
  }
}

