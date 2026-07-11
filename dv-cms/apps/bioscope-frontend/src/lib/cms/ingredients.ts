import { cmsFetch, mediaUrl } from '@/lib/payload'
import type { Locale } from '@/lib/i18n/config'
import type { Ingredient } from '@/lib/content'

type Paginated<T> = { docs: T[]; totalDocs: number }

type IngredientDoc = {
  slug: string
  name: string
  subtitle?: string
  type?: 'supplement' | 'cosmetic'
  category?: { title?: string; name?: string } | null
  originCountry?: string
  brandName?: string
  moq?: string
  description?: unknown
  benefits?: string[]
  applications?: string[]
  badges?: string[]
  featuredImage?: { url?: string } | null
  specs?: { label?: string; value?: string }[]
}

/** supplement/cosmetic → the localized industry label used by the catalog filters. */
function industryLabel(type: string | undefined, locale: Locale): string {
  const map =
    locale === 'en'
      ? { supplement: 'Nutraceuticals', cosmetic: 'Cosmetics' }
      : { supplement: 'Thực phẩm chức năng', cosmetic: 'Mỹ phẩm' }
  return map[(type ?? 'supplement') as 'supplement' | 'cosmetic'] ?? map.supplement
}

const COUNTRY: Record<string, { vi: string; en: string }> = {
  JP: { vi: 'Nhật Bản', en: 'Japan' },
  KR: { vi: 'Hàn Quốc', en: 'South Korea' },
  US: { vi: 'Mỹ', en: 'USA' },
  IN: { vi: 'Ấn Độ', en: 'India' },
  FR: { vi: 'Pháp', en: 'France' },
  IT: { vi: 'Ý', en: 'Italy' },
  DE: { vi: 'Đức', en: 'Germany' },
  CN: { vi: 'Trung Quốc', en: 'China' },
  VN: { vi: 'Việt Nam', en: 'Vietnam' },
  CH: { vi: 'Thụy Sĩ', en: 'Switzerland' },
  AR: { vi: 'Argentina', en: 'Argentina' },
  NO: { vi: 'Na Uy', en: 'Norway' },
  ES: { vi: 'Tây Ban Nha', en: 'Spain' },
  TH: { vi: 'Thái Lan', en: 'Thailand' },
}

function originLabel(code: string | undefined, locale: Locale): string {
  if (!code) return ''
  return COUNTRY[code.toUpperCase()]?.[locale] ?? code
}

/** Flatten a Lexical richText value into plain paragraphs. */
function lexicalToText(value: unknown): string {
  const root = (value as { root?: { children?: unknown[] } } | undefined)?.root
  if (!root?.children) return ''
  const readNode = (node: unknown): string => {
    const n = node as { text?: string; children?: unknown[] }
    if (typeof n.text === 'string') return n.text
    if (Array.isArray(n.children)) return n.children.map(readNode).join('')
    return ''
  }
  return root.children
    .map(readNode)
    .filter((s) => s.trim())
    .join('\n\n')
}

function toIngredient(d: IngredientDoc, locale: Locale): Ingredient {
  const overview = lexicalToText(d.description)
  return {
    slug: d.slug,
    name: d.name,
    category: d.category?.title ?? d.category?.name ?? industryLabel(d.type, locale),
    industry: industryLabel(d.type, locale) as Ingredient['industry'],
    origin: originLabel(d.originCountry, locale),
    manufacturer: d.brandName || undefined,
    shortDesc: d.subtitle ?? overview.split('\n')[0] ?? '',
    overview: overview || undefined,
    benefits: d.benefits ?? [],
    moq: d.moq ?? '',
    badges: d.badges ?? [],
    image: 'powder',
    imageSrc: mediaUrl(d.featuredImage?.url) ?? undefined,
    specs: (d.specs ?? []).map((s) => ({ label: s.label ?? '', value: s.value ?? '' })),
    applications: d.applications ?? [],
  }
}

/** All published ingredients from the CMS. Returns null on failure/empty (caller falls back to static). */
export async function getIngredients(locale: Locale): Promise<Ingredient[] | null> {
  // TODO(scale): the catalog filters client-side, so we fetch the full set.
  // For very large catalogs, move filtering/pagination server-side instead.
  const res = await cmsFetch<Paginated<IngredientDoc>>('ingredients?limit=2000&sort=name&depth=1', {
    locale,
    revalidate: 60,
    // Fetching the whole catalog (depth=1) can exceed the default 4s timeout.
    timeoutMs: 20000,
  })
  if (!res?.docs?.length) return null
  return res.docs.map((d) => toIngredient(d, locale))
}

/** Single ingredient by slug. Returns null on failure/not found. */
export async function getIngredient(slug: string, locale: Locale): Promise<Ingredient | null> {
  const res = await cmsFetch<Paginated<IngredientDoc>>(
    `ingredients?where[slug][equals]=${encodeURIComponent(slug)}&depth=1&limit=1`,
    { locale, revalidate: 60 },
  )
  const doc = res?.docs?.[0]
  return doc ? toIngredient(doc, locale) : null
}
