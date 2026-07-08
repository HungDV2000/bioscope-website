import type { MetadataRoute } from 'next'
import { getSeoSettings } from '@/lib/cms/seo-settings'

export const revalidate = 300

/** robots.txt driven by the `seo-settings` global (Yoast-style). */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const s = await getSeoSettings()

  // "Discourage search engines" → block the whole site (pre-launch).
  if (s.discourageSearchEngines) {
    return { rules: [{ userAgent: '*', disallow: '/' }], host: s.siteUrl }
  }

  // Extra `Disallow:` lines authored in the CMS robots box.
  const extraDisallow = (s.robotsExtra ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => /^disallow:/i.test(l))
    .map((l) => l.replace(/^disallow:/i, '').trim())
    .filter(Boolean)

  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/member/', '/api/', ...extraDisallow] }],
    ...(s.enableSitemap ? { sitemap: `${s.siteUrl}/sitemap.xml` } : {}),
    host: s.siteUrl,
  }
}
