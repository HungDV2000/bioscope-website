import { cmsFetch } from '@/lib/payload'
import type { Locale } from '@/lib/i18n/config'

type Paginated<T> = { docs: T[] }

/* ── FAQs ─────────────────────────────────────────────── */

type FaqDoc = { question: string; answer: string; category?: string; showOnContact?: boolean }
export type FaqGroup = { title: string; items: { q: string; a: string }[] }

const FAQ_GROUP_TITLES: Record<Locale, Record<string, string>> = {
  vi: { ingredients: 'Nguyên liệu & mẫu thử', solutions: 'Giải pháp & đồng kiến tạo', support: 'Liên hệ & hỗ trợ' },
  en: { ingredients: 'Ingredients & samples', solutions: 'Solutions & co-creation', support: 'Contact & support' },
}
const FAQ_ORDER = ['ingredients', 'solutions', 'support']

/** FAQs grouped by topic — from the `faqs` collection. Returns null on failure. */
export async function getFaqGroups(locale: Locale): Promise<FaqGroup[] | null> {
  const res = await cmsFetch<Paginated<FaqDoc>>('faqs?limit=100&sort=order&depth=0', { locale, revalidate: 60 })
  if (!res?.docs?.length) return null
  const titles = FAQ_GROUP_TITLES[locale]
  const byCat = new Map<string, { q: string; a: string }[]>()
  for (const d of res.docs) {
    const cat = d.category ?? 'ingredients'
    if (!byCat.has(cat)) byCat.set(cat, [])
    byCat.get(cat)!.push({ q: d.question, a: d.answer })
  }
  const cats = [...byCat.keys()].sort((a, b) => FAQ_ORDER.indexOf(a) - FAQ_ORDER.indexOf(b))
  return cats.map((cat) => ({ title: titles[cat] ?? cat, items: byCat.get(cat)! }))
}

/* ── Case studies ─────────────────────────────────────── */

type CaseStudyDoc = {
  slug: string
  brand: string
  partner?: string
  industry?: string
  kpi?: string
  kpiLabel?: string
  summary?: string
  problem?: string
  solution?: string
  results?: string[]
  coCreateSteps?: string[]
  testimonial?: string
  tags?: string[]
  coverImage?: { url?: string } | null
}

export type CaseStudyCard = {
  slug: string
  brand: string
  partner: string
  industry: string
  kpi: string
  kpiLabel: string
  summary?: string
  problem: string
  solution: string
  result: string[]
  coCreateSteps?: string[]
  testimonial?: string
  tags: string[]
  coverImage?: string
}

import { mediaUrl } from '@/lib/payload'

const toCard = (d: CaseStudyDoc): CaseStudyCard => ({
  slug: d.slug,
  brand: d.brand,
  partner: d.partner ?? '',
  industry: d.industry ?? '',
  kpi: d.kpi ?? '',
  kpiLabel: d.kpiLabel ?? '',
  summary: d.summary,
  problem: d.problem ?? '',
  solution: d.solution ?? '',
  result: d.results ?? [],
  coCreateSteps: d.coCreateSteps,
  testimonial: d.testimonial,
  tags: d.tags ?? [],
  coverImage: mediaUrl(d.coverImage?.url) ?? undefined,
})

/** All published case studies (ordered). Returns null on failure. */
export async function getCaseStudies(locale: Locale): Promise<CaseStudyCard[] | null> {
  const res = await cmsFetch<Paginated<CaseStudyDoc>>('case-studies?limit=50&sort=order&depth=1', { locale, revalidate: 60 })
  if (!res?.docs?.length) return null
  return res.docs.map(toCard)
}

/** Single case study by slug. Returns null on failure/not found. */
export async function getCaseStudy(slug: string, locale: Locale): Promise<CaseStudyCard | null> {
  const res = await cmsFetch<Paginated<CaseStudyDoc>>(
    `case-studies?where[slug][equals]=${encodeURIComponent(slug)}&depth=1&limit=1`,
    { locale, revalidate: 60 },
  )
  const doc = res?.docs?.[0]
  return doc ? toCard(doc) : null
}
