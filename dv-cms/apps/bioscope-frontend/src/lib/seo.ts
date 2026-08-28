/** Canonical site origin (no trailing slash). Override via NEXT_PUBLIC_SITE_URL. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://web.bioscope.vn').replace(/\/$/, '')

/** Default Open Graph / Twitter image (design asset can replace `/og.png` later). */
export const DEFAULT_OG_IMAGE = '/logo.avif'

/** Absolute URL for a site-relative path. */
export function absUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

/** Static, indexable routes and their change cadence for the sitemap. */
export const STATIC_ROUTES: { path: string; priority: number; changeFrequency: ChangeFreq }[] = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/nguyen-lieu', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/giai-phap', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/dong-kien-tao', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/rd', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/tai-nguyen', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/ban-tin', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/news', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/case-study', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/ve-chung-toi', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/lien-he', priority: 0.6, changeFrequency: 'yearly' },
  { path: '/cau-hoi-thuong-gap', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/bioscope-ai', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/chinh-sach-bao-mat', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/dieu-khoan-su-dung', priority: 0.3, changeFrequency: 'yearly' },
]
