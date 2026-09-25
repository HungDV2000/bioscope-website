import type { Payload, PayloadRequest } from 'payload'
import { SLUGS, type CampaignStatus } from '../constants.js'
import { maskName } from './phone.js'

export type Id = string | number

/**
 * ID dùng để GHI vào trường quan hệ. Adapter Postgres dùng ID số; kiểu sinh ra
 * trong core-cms (payload-types) đòi `number`, còn ID đọc từ header là chuỗi.
 */
export const relId = (id: Id): number => (typeof id === 'number' ? id : Number(id))

export type CampaignPoints = {
  video: number
  videoMain: number
  record: number
  order: number
  result: number
  goal: number
  bonusPerJoin: number
  bonusMax: number
  maxReferralOrders: number
}

export type CampaignDoc = {
  id: Id
  title: string
  slug: string
  status: CampaignStatus
  autoEndAtDeadline?: boolean
  deadline: string
  slots: number
  given: number
  discountPercent: number
  requireOtp?: boolean
  requireRecordingApproval?: boolean
  cycle?: 'monthly' | 'once'
  closeTime?: string
  announceDay?: number
  announceTime?: string
  showResultDays?: number
  programName?: string
  heroTitle?: string
  heroSubtitle?: string
  ctaLabel?: string
  giftNote?: string
  eligibilityNote?: string
  numberExplain?: string
  rulesText?: string
  domains?: { host: string }[]
  offRedirectUrl?: string
  points?: Partial<CampaignPoints>
  videos?: { id?: string; title: string; url?: string; durationLabel?: string; isMain?: boolean; minWatchSeconds?: number }[]
  hotline?: string
  contactEmail?: string
  zaloUrl?: string
  company?: Record<string, string | undefined>
  certifications?: { name: string; number?: string; file?: { url?: string } | Id | null }[]
  testimonials?: { name: string; area?: string; symptom?: string; quote: string; isIllustration?: boolean }[]
  studies?: { title: string; summary?: string; source?: string; link?: string }[]
  metaTitle?: string
  metaDescription?: string
  ogImage?: { url?: string } | Id | null
  favicon?: { url?: string; mimeType?: string } | Id | null
  gtmId?: string
  consentText?: string
  retentionDays?: number
  winnersFrozenAt?: string | null
  piiPurgedAt?: string | null
}

export const DEFAULT_POINTS: CampaignPoints = {
  video: 2,
  videoMain: 5,
  record: 10,
  order: 10,
  result: 10,
  goal: 29,
  bonusPerJoin: 2,
  bonusMax: 10,
  maxReferralOrders: 5,
}

export function pointsOf(c: Pick<CampaignDoc, 'points'>): CampaignPoints {
  const p = { ...DEFAULT_POINTS }
  for (const k of Object.keys(p) as (keyof CampaignPoints)[]) {
    const v = Number(c.points?.[k])
    if (Number.isFinite(v)) p[k] = v
  }
  if (p.goal <= 0) p.goal = DEFAULT_POINTS.goal
  return p
}

/**
 * Trạng thái THỰC TẾ của chiến dịch.
 *
 * Đã quá hạn chốt mà bật "tự kết thúc" thì coi như đã kết thúc ngay, không
 * chờ tác vụ nền (chạy mỗi phút) kịp đổi trạng thái — một phút đó đủ để vài
 * người đăng ký sau giờ chốt.
 */
export function effectiveStatus(c: Pick<CampaignDoc, 'status' | 'autoEndAtDeadline' | 'deadline'>): CampaignStatus {
  if (c.status === 'active' && c.autoEndAtDeadline !== false && c.deadline && new Date(c.deadline).getTime() <= Date.now()) {
    return 'ended'
  }
  return c.status
}

export async function getCampaignById(payload: Payload, id: Id, req?: PayloadRequest): Promise<CampaignDoc | null> {
  try {
    return (await payload.findByID({
      collection: SLUGS.campaigns,
      id,
      depth: 1,
      overrideAccess: true,
      ...(req ? { req } : {}),
    })) as unknown as CampaignDoc
  } catch {
    return null
  }
}

export async function getCampaignBySlug(payload: Payload, slug: string, req?: PayloadRequest): Promise<CampaignDoc | null> {
  const res = await payload.find({
    collection: SLUGS.campaigns,
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
    overrideAccess: true,
    ...(req ? { req } : {}),
  })
  return (res.docs[0] as unknown as CampaignDoc) ?? null
}

/**
 * Biến link YouTube/Vimeo khách dán vào thành địa chỉ nhúng.
 *
 * Chỉ nhận hai nhà cung cấp này và tự dựng lại URL từ mã video — không nhúng
 * nguyên chuỗi người dùng nhập, để không ai nhúng được một trang tuỳ ý (trang
 * giả mạo…) vào landing của Bioscope.
 */
export function toEmbedUrl(raw: string | undefined): string | null {
  if (!raw) return null
  let u: URL
  try {
    u = new URL(raw.trim())
  } catch {
    return null
  }
  const host = u.hostname.replace(/^www\.|^m\./, '')
  let id: string | null = null
  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    id = u.searchParams.get('v') ?? u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{11})/)?.[1] ?? null
  } else if (host === 'youtu.be') {
    id = u.pathname.slice(1, 12)
  }
  if (id && /^[\w-]{11}$/.test(id)) return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const vid = u.pathname.match(/(\d{6,})/)?.[1]
    if (vid) return `https://player.vimeo.com/video/${vid}`
  }
  return null
}

const serverUrl = () => (process.env.PAYLOAD_PUBLIC_SERVER_URL || '').replace(/\/$/, '')

export function absoluteMediaUrl(m: unknown): string | null {
  const url = typeof m === 'object' && m ? (m as { url?: string }).url : undefined
  if (!url) return null
  return url.startsWith('http') ? url : `${serverUrl()}${url}`
}

export type PublicVideo = {
  key: string
  title: string
  durationLabel: string
  embedUrl: string | null
  isMain: boolean
  points: number
  minWatchSeconds: number
}

export function publicVideos(c: CampaignDoc): PublicVideo[] {
  const p = pointsOf(c)
  return (c.videos ?? []).map((v, i) => ({
    // `id` của phần tử mảng do Payload sinh và giữ nguyên khi đổi thứ tự —
    // dùng làm khoá sổ điểm, để kéo video lên xuống không làm ai được cộng lại.
    key: String(v.id ?? `v${i + 1}`),
    title: v.title,
    durationLabel: v.durationLabel ?? '',
    embedUrl: toEmbedUrl(v.url),
    isMain: Boolean(v.isMain),
    points: v.isMain ? p.videoMain : p.video,
    minWatchSeconds: Math.max(3, Number(v.minWatchSeconds ?? 20)),
  }))
}

/**
 * Điền chỗ trống trong câu chữ admin nhập: {soSuat}, {thang}, {nam}.
 *
 * Nhờ vậy sang tháng 10 tiêu đề tự thành "Chương trình quà tháng 10" mà không
 * ai phải vào sửa, và đổi số suất là mọi chỗ đổi theo.
 */
export function fillTemplate(tpl: string | undefined, vars: { soSuat: number; thang: number; nam: number }): string {
  return String(tpl ?? '')
    .replace(/\{soSuat\}/g, String(vars.soSuat))
    .replace(/\{thang\}/g, String(vars.thang))
    .replace(/\{nam\}/g, String(vars.nam))
    .trim()
}

export type PublicRound = {
  key: string
  label: string
  endAt: string
  announceAt: string
  status: 'open' | 'closed' | 'announced'
}

/** Dữ liệu chiến dịch gửi cho trang công khai — KHÔNG có gì nội bộ. */
export function publicCampaign(
  c: CampaignDoc,
  extra: {
    participants: number
    winners?: { name: string; rank: number }[]
    round?: PublicRound
    lastResult?: { key: string; label: string; announceAt: string; announced: boolean; winners: { name: string; rank: number }[] } | null
  },
) {
  const status = effectiveStatus(c)
  const month = extra.round?.key?.split('-') ?? []
  const vars = {
    soSuat: Number(c.slots) || 0,
    thang: Number(month[1]) || new Date().getMonth() + 1,
    nam: Number(month[0]) || new Date().getFullYear(),
  }
  return {
    // Giờ máy chủ: trang dùng cho lần dựng đầu tiên nên HTML của server và của
    // trình duyệt giống nhau; sau khi hydrate mới đếm theo đồng hồ máy khách.
    serverNow: new Date().toISOString(),
    cycle: c.cycle === 'once' ? ('once' as const) : ('monthly' as const),
    round: extra.round ?? null,
    lastResult: extra.lastResult ?? null,
    showResultDays: Number(c.showResultDays) || 7,
    programName: fillTemplate(c.programName || 'Chương trình quà tháng {thang}', vars),
    heroTitle: fillTemplate(c.heroTitle || '{soSuat} phần quà dành cho khách hàng quan tâm đến *sức khoẻ dạ dày*', vars),
    heroSubtitle:
      c.heroSubtitle?.trim() || 'Tham gia chương trình, hoàn thành các hoạt động để tích điểm và có cơ hội nhận quà tận nhà.',
    ctaLabel: c.ctaLabel?.trim() || 'THAM GIA NGAY',
    giftNote: c.giftNote?.trim() ?? '',
    eligibilityNote: c.eligibilityNote?.trim() ?? '',
    numberExplain: c.numberExplain?.trim() ?? '',
    rulesText: c.rulesText?.trim() ?? '',
    id: c.id,
    slug: c.slug,
    title: c.title,
    status,
    deadline: c.deadline,
    slots: c.slots,
    given: c.given,
    discountPercent: c.discountPercent,
    requireOtp: c.requireOtp !== false,
    points: pointsOf(c),
    videos: publicVideos(c),
    hotline: c.hotline ?? '',
    contactEmail: c.contactEmail ?? '',
    zaloUrl: c.zaloUrl ?? '',
    company: c.company ?? {},
    certifications: (c.certifications ?? []).map((x) => ({ name: x.name, number: x.number ?? '', fileUrl: absoluteMediaUrl(x.file) })),
    testimonials: (c.testimonials ?? []).map((t) => ({
      name: t.name,
      area: t.area ?? '',
      symptom: t.symptom ?? '',
      quote: t.quote,
      isIllustration: t.isIllustration !== false,
    })),
    studies: (c.studies ?? []).map((s) => ({ title: s.title, summary: s.summary ?? '', source: s.source ?? '', link: s.link ?? '' })),
    seo: {
      title: c.metaTitle ?? '',
      description: c.metaDescription ?? '',
      image: absoluteMediaUrl(c.ogImage),
      favicon: absoluteMediaUrl(c.favicon),
      faviconType: typeof c.favicon === 'object' && c.favicon ? (c.favicon.mimeType ?? '') : '',
    },
    gtmId: c.gtmId ?? '',
    consentText: c.consentText ?? 'Tôi đồng ý để Bioscope liên hệ báo tin về chương trình.',
    offRedirectUrl: c.offRedirectUrl || 'https://web.bioscope.vn',
    stats: { participants: extra.participants },
    winners: extra.winners ?? [],
    winnersFrozenAt: c.winnersFrozenAt ?? null,
  }
}

export { maskName }
