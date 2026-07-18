import type { Metadata } from 'next'
import { cmsFetch, mediaUrl } from '@/lib/payload'
import { getPageI18n } from '@/lib/i18n/pages'
import type { Locale } from '@/lib/i18n/config'

/** Route slug → static i18n key (fallback source). */
const SLUG_TO_KEY: Record<string, string> = {
  'trang-chu': 'home',
  've-chung-toi': 'about',
  'giai-phap': 'solutions',
  'dong-kien-tao': 'coCreate',
  rd: 'rd',
  'tai-nguyen': 'resources',
  'case-study': 'caseStudies',
  'lien-he': 'contact',
  'cau-hoi-thuong-gap': 'faq',
  'blog-chuyen-mon': 'blog',
  'chinh-sach-bao-mat': 'privacy',
  'dieu-khoan-su-dung': 'terms',
  'bioscope-ai': 'bioscopeAi',
}

type AnyBlock = { blockType?: string } & Record<string, unknown>
type PageDoc = {
  title?: string
  layout?: AnyBlock[]
  hero?: { url?: string } | null
  seo?: { title?: string; description?: string; image?: { url?: string } | null }
}

export type PageHeroData = {
  eyebrow: string
  title: string
  description: string
  crumbs: { label: string; href?: string }[]
}

export type PageContent = {
  hero: PageHeroData
  /** CMS hero image URL (the Page's `hero` upload) — overrides the static image. */
  heroImage?: string
  metadata: Metadata
  /** Raw block layout of the CMS Page (empty when unavailable). */
  blocks: AnyBlock[]
}

const str = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() ? v : undefined)

/**
 * Page hero + SEO sourced from the matching CMS Page (by slug), overlaid on the
 * static i18n fallback so pages keep working when the backend is unreachable.
 * The hero comes from the page's first hero-type block; SEO from the `seo` group.
 */
export async function getPageContent(slug: string, locale: Locale): Promise<PageContent> {
  const key = SLUG_TO_KEY[slug] ?? slug
  const fb = getPageI18n(key, locale)

  const res = await cmsFetch<{ docs: PageDoc[] }>(
    `pages?where[slug][equals]=${encodeURIComponent(slug)}&depth=1&limit=1`,
    { locale, revalidate: 60 },
  )
  const doc = res?.docs?.[0]
  const canonicalPath = slug === 'trang-chu' ? '/' : `/${slug}`
  if (!doc) {
    return {
      hero: fb.hero,
      metadata: { ...fb.metadata, alternates: { canonical: canonicalPath } },
      blocks: [],
    }
  }

  const heroBlock = doc.layout?.find((b) => b.blockType === 'hero' || b.blockType === 'homeHero')
  const hero: PageHeroData = {
    eyebrow: str(heroBlock?.eyebrow) ?? fb.hero.eyebrow,
    title: str(heroBlock?.heading) ?? str(heroBlock?.title) ?? fb.hero.title,
    description: str(heroBlock?.subheading) ?? str(heroBlock?.description) ?? fb.hero.description,
    crumbs: fb.hero.crumbs,
  }

  const ogImage = mediaUrl(doc.seo?.image?.url)
  const metadata: Metadata = {
    ...fb.metadata,
    title: str(doc.seo?.title) ?? str(doc.title) ?? fb.metadata.title,
    description: str(doc.seo?.description) ?? fb.metadata.description,
    alternates: { canonical: canonicalPath },
    ...(ogImage ? { openGraph: { ...(fb.metadata.openGraph ?? {}), images: [ogImage] } } : {}),
  }

  // Hero image: the hero block's own `media` upload wins (that's what editors
  // change on the page), falling back to the Page's sidebar `hero` upload.
  const blockMedia = (heroBlock?.media ?? heroBlock?.image) as { url?: string } | null | undefined
  const heroImage =
    mediaUrl(blockMedia?.url) ?? mediaUrl((doc.hero as { url?: string } | null)?.url) ?? undefined
  return { hero, heroImage, metadata, blocks: doc.layout ?? [] }
}
