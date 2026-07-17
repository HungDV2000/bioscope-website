import { cmsFetch, mediaUrl } from '@/lib/payload'
import { getMessages, type Messages } from '@/lib/i18n/messages'
import type { Locale } from '@/lib/i18n/config'

type HomeMessages = Messages['home']
export type HomeSection = keyof HomeMessages

/** blockType (CMS) → section key in `messages.home`. */
const BLOCK_TO_SECTION: Record<string, HomeSection> = {
  homeHero: 'hero',
  homeBrands: 'brands',
  homeProcess: 'process',
  homeCategories: 'categories',
  homeCaseStudies: 'caseStudies',
  homeCertifications: 'certifications',
  homeExperts: 'experts',
  homeAiPromo: 'aiChat',
  homeCta: 'cta',
}

/** Default section order when the CMS is unreachable or homePage is unset. */
const DEFAULT_ORDER: HomeSection[] = [
  'hero', 'brands', 'process', 'categories', 'caseStudies',
  'certifications', 'experts', 'cta', 'aiChat',
]

/** A card's image + (optional) link, extracted from a block outside the i18n overlay. */
export type CardMedia = { image?: string; href?: string }
export type SectionMedia = {
  image?: string
  featured?: CardMedia
  items?: CardMedia[]
  logos?: { image?: string; name?: string }[]
  /** RichText (lexical) description edited in the CMS — overrides the i18n string. */
  descRich?: unknown
  /** Category chips selected from the ingredient-categories collection. */
  categoryChips?: { name: string; href: string }[]
}
export type HomeMedia = Partial<Record<HomeSection, SectionMedia>>

export type HomePageData = {
  /** Sections in the order defined by the home Page's blocks. */
  order: HomeSection[]
  /** `messages.home` with CMS block content overlaid on the static fallback. */
  home: HomeMessages
  /** CMS block row id per section (for Better Editor click-to-edit). */
  blockIds: Partial<Record<HomeSection, string>>
  /** Images + category links per section (bypasses the shape-locked i18n overlay). */
  media: HomeMedia
}

/** Build the public link for an ingredient-category relationship value. */
function categoryHref(cat: unknown): string | undefined {
  const slug = typeof cat === 'object' && cat !== null ? (cat as { slug?: string }).slug : undefined
  return slug ? `/nguyen-lieu?category=${encodeURIComponent(slug)}` : undefined
}

function uploadUrl(v: unknown): string | undefined {
  const url = typeof v === 'object' && v !== null ? (v as { url?: string }).url : undefined
  return mediaUrl(url) ?? undefined
}

/** RichText (lexical) value if the field holds real content, else undefined. */
function richVal(v: unknown): unknown {
  const root = (v as { root?: { children?: unknown[] } } | undefined)?.root
  return root?.children?.length ? v : undefined
}

/** Extract the media (images + category links + rich descriptions) from a block. */
function extractMedia(block: Block): SectionMedia | undefined {
  const b = block as Record<string, unknown>
  switch (block.blockType) {
    case 'homeHero':
    case 'homeCta':
      return { image: uploadUrl(b.image), descRich: richVal(b.description) }
    case 'homeExperts':
      return { image: uploadUrl(b.image) }
    case 'homeProcess':
    case 'homeCertifications':
    case 'homeAiPromo':
      return { descRich: richVal(b.description), ...(block.blockType === 'homeCertifications' ? { items: (Array.isArray(b.items) ? (b.items as Record<string, unknown>[]) : []).map((it) => ({ image: uploadUrl(it.logo) })) } : {}) }
    case 'homeCategories': {
      const f = (b.featured ?? {}) as Record<string, unknown>
      const items = Array.isArray(b.items) ? (b.items as Record<string, unknown>[]) : []
      return {
        descRich: richVal(b.description),
        featured: { image: uploadUrl(f.image), href: categoryHref(f.category) },
        items: items.map((it) => ({ image: uploadUrl(it.image), href: categoryHref(it.category) })),
      }
    }
    case 'homeBrands': {
      const logos = Array.isArray(b.logos) ? (b.logos as Record<string, unknown>[]) : []
      const cats = Array.isArray(b.categories) ? (b.categories as unknown[]) : []
      const categoryChips = cats
        .map((c) => {
          const cat = c as { name?: string; title?: string; slug?: string } | null
          if (!cat || typeof cat !== 'object') return null
          const name = cat.name || cat.title
          if (!name) return null
          return { name, href: cat.slug ? `/nguyen-lieu?category=${encodeURIComponent(cat.slug)}` : '/nguyen-lieu' }
        })
        .filter(Boolean) as { name: string; href: string }[]
      return {
        logos: logos.map((l) => ({ image: uploadUrl(l.logo), name: typeof l.name === 'string' ? l.name : undefined })),
        ...(categoryChips.length ? { categoryChips } : {}),
      }
    }
    default:
      return undefined
  }
}

/**
 * Overlay CMS values onto the static i18n shape. Walks the (fully typed) base
 * so the result always matches the target shape: CMS values win when present,
 * missing/empty CMS fields fall back to the static defaults, and extra CMS
 * keys (id, blockType…) are dropped.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function overlay(base: any, over: any): any {
  if (over == null) return base
  // Type mismatch guard: a richText field (object) must not overwrite an i18n
  // string. Keep the string fallback; the richText is surfaced via `media.descRich`.
  if (typeof base === 'string' && over && typeof over === 'object') return base
  if (Array.isArray(base)) {
    if (!Array.isArray(over) || over.length === 0) return base
    return over.map((o, i) => overlay(base[i] ?? base[0], o))
  }
  if (base && typeof base === 'object') {
    const out: Record<string, unknown> = { ...base }
    for (const k of Object.keys(base)) {
      if (over && typeof over === 'object' && k in over) out[k] = overlay(base[k], over[k])
    }
    return out
  }
  return over ?? base
}

type Block = { blockType: string } & Record<string, unknown>

/**
 * Home page content — the Page selected as Site Settings → homePage, composed
 * of home-section blocks. Returns section order + copy overlaid on the static
 * i18n fallback. Fully static fallback when the backend is unreachable.
 */
export async function getHomePage(locale: Locale): Promise<HomePageData> {
  const base = getMessages(locale).home
  const fallback: HomePageData = { order: DEFAULT_ORDER, home: base, blockIds: {}, media: {} }

  const settings = await cmsFetch<{ homePage?: { id?: string | number } | string | number | null }>(
    'globals/site-settings',
    { locale, revalidate: 60 },
  )
  const rel = settings?.homePage
  const homePageId = typeof rel === 'object' && rel !== null ? rel.id : rel
  if (!homePageId) return fallback

  // depth=1 populates the block uploads (image.url) + category relationships (slug).
  const page = await cmsFetch<{ layout?: Block[] }>(`pages/${homePageId}?depth=1`, { locale, revalidate: 60 })
  const blocks = page?.layout
  if (!blocks?.length) return fallback

  const order: HomeSection[] = []
  const blockIds: Partial<Record<HomeSection, string>> = {}
  const media: HomeMedia = {}
  const home = { ...base }
  for (const block of blocks) {
    const section = BLOCK_TO_SECTION[block.blockType]
    if (!section || order.includes(section)) continue
    order.push(section)
    if (typeof block.id === 'string') blockIds[section] = block.id
    const m = extractMedia(block)
    if (m) media[section] = m
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(home as any)[section] = overlay(base[section], block)
  }
  return order.length ? { order, home, blockIds, media } : fallback
}
