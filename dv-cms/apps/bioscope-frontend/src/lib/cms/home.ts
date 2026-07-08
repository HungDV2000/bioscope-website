import { cmsFetch } from '@/lib/payload'
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

export type HomePageData = {
  /** Sections in the order defined by the home Page's blocks. */
  order: HomeSection[]
  /** `messages.home` with CMS block content overlaid on the static fallback. */
  home: HomeMessages
  /** CMS block row id per section (for Better Editor click-to-edit). */
  blockIds: Partial<Record<HomeSection, string>>
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
  const fallback: HomePageData = { order: DEFAULT_ORDER, home: base, blockIds: {} }

  const settings = await cmsFetch<{ homePage?: { id?: string | number } | string | number | null }>(
    'globals/site-settings',
    { locale, revalidate: 60 },
  )
  const rel = settings?.homePage
  const homePageId = typeof rel === 'object' && rel !== null ? rel.id : rel
  if (!homePageId) return fallback

  const page = await cmsFetch<{ layout?: Block[] }>(`pages/${homePageId}?depth=0`, { locale, revalidate: 60 })
  const blocks = page?.layout
  if (!blocks?.length) return fallback

  const order: HomeSection[] = []
  const blockIds: Partial<Record<HomeSection, string>> = {}
  const home = { ...base }
  for (const block of blocks) {
    const section = BLOCK_TO_SECTION[block.blockType]
    if (!section || order.includes(section)) continue
    order.push(section)
    if (typeof block.id === 'string') blockIds[section] = block.id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(home as any)[section] = overlay(base[section], block)
  }
  return order.length ? { order, home, blockIds } : fallback
}
