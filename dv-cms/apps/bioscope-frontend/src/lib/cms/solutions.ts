import { cmsFetch } from '@/lib/payload'
import type { Locale } from '@/lib/i18n/config'
import type { Solution } from '@/lib/content'

type Paginated<T> = { docs: T[]; totalDocs: number }

type ServiceDoc = {
  slug: string
  title: string
  forWho?: string
  summary?: string
  heroQuote?: string
  cta?: string
  receive?: string[]
  idealFor?: string[]
  expectedOutcomes?: string[]
  process?: { step?: string; desc?: string }[]
  faq?: { q?: string; a?: string }[]
  relatedCaseSlugs?: string[]
}

function toSolution(d: ServiceDoc): Solution {
  return {
    slug: d.slug,
    title: d.title,
    forWho: d.forWho ?? '',
    cta: d.cta ?? '',
    summary: d.summary || undefined,
    heroQuote: d.heroQuote || undefined,
    receive: d.receive ?? [],
    idealFor: d.idealFor ?? [],
    expectedOutcomes: d.expectedOutcomes ?? [],
    process: (d.process ?? [])
      .filter((p) => p.step)
      .map((p) => ({ step: p.step!, desc: p.desc ?? '' })),
    faq: (d.faq ?? []).filter((f) => f.q).map((f) => ({ q: f.q!, a: f.a ?? '' })),
    relatedCaseSlugs: d.relatedCaseSlugs ?? [],
  }
}

/** All solution landing pages from the CMS `services` collection. Returns null on failure/empty. */
export async function getSolutions(locale: Locale): Promise<Solution[] | null> {
  const res = await cmsFetch<Paginated<ServiceDoc>>('services?limit=50&sort=order&depth=0', { locale, revalidate: 60 })
  if (!res?.docs?.length) return null
  return res.docs.map(toSolution)
}

/** Single solution by slug. Returns null on failure/not found. */
export async function getSolution(slug: string, locale: Locale): Promise<Solution | null> {
  const res = await cmsFetch<Paginated<ServiceDoc>>(
    `services?where[slug][equals]=${encodeURIComponent(slug)}&depth=0&limit=1`,
    { locale, revalidate: 60 },
  )
  const doc = res?.docs?.[0]
  return doc ? toSolution(doc) : null
}
