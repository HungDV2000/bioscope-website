import type { MetadataRoute } from 'next'
import { DEFAULT_LOCALE } from '@/lib/i18n/config'
import { STATIC_ROUTES } from '@/lib/seo'
import { getSeoSettings } from '@/lib/cms/seo-settings'
import { getIngredients } from '@/lib/cms/ingredients'
import { getPosts } from '@/lib/cms/blog'
import { getSolutions } from '@/lib/cms/solutions'
import { getCaseStudies } from '@/lib/cms/collections'
import { INGREDIENTS, SOLUTIONS, BLOG_POSTS, CASE_STUDIES } from '@/lib/content'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const seo = await getSeoSettings()

  // Editors can turn the sitemap off entirely from the CMS.
  if (!seo.enableSitemap) return []

  const abs = (p: string) => `${seo.siteUrl}${p.startsWith('/') ? p : `/${p}`}`
  const excluded = new Set(seo.sitemapExclude)

  // Dynamic slugs from the CMS, falling back to static content when unreachable.
  const [ings, sols, posts, cases] = await Promise.all([
    getIngredients(DEFAULT_LOCALE),
    getSolutions(DEFAULT_LOCALE),
    getPosts(DEFAULT_LOCALE),
    getCaseStudies(DEFAULT_LOCALE),
  ])

  const detail = (prefix: string, slugs: string[], priority: number): MetadataRoute.Sitemap =>
    [...new Set(slugs)]
      .map((slug) => `${prefix}/${slug}`)
      .filter((path) => !excluded.has(path))
      .map((path) => ({ url: abs(path), lastModified: now, changeFrequency: 'monthly' as const, priority }))

  return [
    ...STATIC_ROUTES.filter((r) => !excluded.has(r.path)).map((r) => ({
      url: abs(r.path),
      lastModified: now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...detail('/nguyen-lieu', (ings ?? INGREDIENTS).map((i) => i.slug), 0.7),
    ...detail('/giai-phap', (sols ?? SOLUTIONS).map((s) => s.slug), 0.7),
    // Bản tin có hai địa chỉ theo ngôn ngữ; khai cả hai để công cụ tìm kiếm
    // lập chỉ mục đúng bản của từng ngôn ngữ.
    ...detail('/ban-tin', (posts ?? BLOG_POSTS).map((p) => p.slug), 0.6),
    ...detail('/news', (posts ?? BLOG_POSTS).map((p) => p.slug), 0.6),
    ...detail('/case-study', (cases ?? CASE_STUDIES).map((c) => c.slug), 0.6),
  ]
}
