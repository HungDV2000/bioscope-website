import { cmsFetch, mediaUrl } from '@/lib/payload'
import { SITE_URL as ENV_SITE_URL } from '@/lib/seo'
import type { Locale } from '@/lib/i18n/config'

type Social = { facebook?: string; x?: string; linkedin?: string; youtube?: string; instagram?: string; tiktok?: string }

type SeoDoc = {
  siteUrl?: string
  siteName?: string
  titleSeparator?: string
  homeTitle?: string
  homeDescription?: string
  defaultImage?: { url?: string } | null
  siteRepresents?: 'organization' | 'person'
  orgName?: string
  orgLogo?: { url?: string } | null
  social?: Social
  discourageSearchEngines?: boolean
  googleVerification?: string
  bingVerification?: string
  enableSitemap?: boolean
  sitemapExclude?: string[]
  robotsExtra?: string
}

export type SeoSettings = {
  siteUrl: string
  siteName?: string
  titleSeparator: string
  homeTitle?: string
  homeDescription?: string
  defaultImage?: string
  siteRepresents: 'organization' | 'person'
  orgName?: string
  orgLogo?: string
  sameAs: string[]
  discourageSearchEngines: boolean
  googleVerification?: string
  bingVerification?: string
  enableSitemap: boolean
  sitemapExclude: string[]
  robotsExtra?: string
}

const DEFAULTS: SeoSettings = {
  siteUrl: ENV_SITE_URL,
  titleSeparator: '·',
  siteRepresents: 'organization',
  sameAs: [],
  discourageSearchEngines: false,
  enableSitemap: true,
  sitemapExclude: [],
}

/**
 * Site-wide SEO config from the `seo-settings` global (Yoast-style). Falls back
 * to safe defaults (env `NEXT_PUBLIC_SITE_URL`, indexable, sitemap on) when the
 * CMS is unreachable, so robots/sitemap/metadata never break.
 */
export async function getSeoSettings(locale?: Locale): Promise<SeoSettings> {
  const doc = await cmsFetch<SeoDoc>('globals/seo-settings?depth=1', { locale, revalidate: 300 })
  if (!doc) return DEFAULTS

  const sameAs = Object.values(doc.social ?? {})
    .map((v) => (typeof v === 'string' ? v.trim() : ''))
    .filter(Boolean)

  return {
    siteUrl: (doc.siteUrl?.trim() || ENV_SITE_URL).replace(/\/$/, ''),
    siteName: doc.siteName?.trim() || undefined,
    titleSeparator: doc.titleSeparator || '·',
    homeTitle: doc.homeTitle?.trim() || undefined,
    homeDescription: doc.homeDescription?.trim() || undefined,
    defaultImage: mediaUrl(doc.defaultImage?.url) ?? undefined,
    siteRepresents: doc.siteRepresents ?? 'organization',
    orgName: doc.orgName?.trim() || undefined,
    orgLogo: mediaUrl(doc.orgLogo?.url) ?? undefined,
    sameAs,
    discourageSearchEngines: Boolean(doc.discourageSearchEngines),
    googleVerification: doc.googleVerification?.trim() || undefined,
    bingVerification: doc.bingVerification?.trim() || undefined,
    enableSitemap: doc.enableSitemap !== false,
    sitemapExclude: (doc.sitemapExclude ?? []).map((s) => s.trim()).filter(Boolean),
    robotsExtra: doc.robotsExtra?.trim() || undefined,
  }
}
