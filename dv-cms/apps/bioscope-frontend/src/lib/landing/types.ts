export type LpStatus = 'draft' | 'active' | 'ended' | 'off'

export type LpVideo = {
  key: string
  title: string
  durationLabel: string
  embedUrl: string | null
  isMain: boolean
  points: number
  minWatchSeconds: number
}

export type LpPoints = {
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

export type LpRound = {
  key: string
  label: string
  endAt: string
  announceAt: string
  status: 'open' | 'closed' | 'announced'
}

export type LpLastResult = {
  key: string
  label: string
  announceAt: string
  announced: boolean
  winners: { name: string; rank: number }[]
}

export type LpCampaign = {
  id: string | number
  slug: string
  title: string
  status: LpStatus
  cycle: 'monthly' | 'once'
  serverNow: string
  round: LpRound | null
  lastResult: LpLastResult | null
  showResultDays: number
  programName: string
  heroTitle: string
  heroSubtitle: string
  ctaLabel: string
  giftNote: string
  eligibilityNote: string
  numberExplain: string
  rulesText: string
  deadline: string
  slots: number
  given: number
  discountPercent: number
  requireOtp: boolean
  points: LpPoints
  videos: LpVideo[]
  hotline: string
  contactEmail: string
  zaloUrl: string
  company: Record<string, string | undefined>
  certifications: { name: string; number: string; fileUrl: string | null }[]
  testimonials: { name: string; area: string; symptom: string; quote: string; isIllustration: boolean }[]
  studies: { title: string; summary: string; source: string; link: string }[]
  seo: { title: string; description: string; image: string | null; favicon: string | null; faviconType: string }
  gtmId: string
  consentText: string
  offRedirectUrl: string
  stats: { participants: number }
  winners: { name: string; rank: number }[]
  winnersFrozenAt: string | null
}

export type LpLeader = { rank: number; name: string; pct: number; total: number }

export type LpRecStatus = 'none' | 'pending' | 'approved' | 'rejected'

export type LpMe = {
  id: string | number
  name: string
  phoneMasked: string
  referralCode: string
  joinSeq: number
  status: 'active' | 'blocked'
  points: number
  bonusCount: number
  total: number
  pct: number
  rank: number | null
  rankOf: number
  videosWatched: string[]
  recording: LpRecStatus
  result: LpRecStatus
  resultUnlocked: boolean
  sharedAt: string | null
  roundKey: string
  invited: number
  invitedMax: number
  winner: boolean
  winnerRank: number | null
}

export type LpPageData = { campaign: LpCampaign; leaderboard: LpLeader[] }
