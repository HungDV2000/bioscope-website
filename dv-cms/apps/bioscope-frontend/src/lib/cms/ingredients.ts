import { cmsFetch, mediaUrl } from '@/lib/payload'

/** Thẻ lọc trả về từ CMS ở depth=1. */
type FacetRef = { id?: string | number; name?: string; slug?: string }
import type { Locale } from '@/lib/i18n/config'
import type { Ingredient } from '@/lib/content'
import { pickLocaleText } from '@/lib/i18n/pick-locale-text'

type Paginated<T> = { docs: T[]; totalDocs: number }

type IngredientDoc = {
  slug: string
  name: string
  subtitle?: string
  inci?: string
  suggestedDosage?: string
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
  primaries?: FacetRef[] | null
  functions?: FacetRef[] | null
  natures?: FacetRef[] | null
  forms?: FacetRef[] | null
  properties?: FacetRef[] | null
  specs?: { label?: string; value?: string }[]
  technical?: Record<string, string | undefined>
  documents?: { title?: string; file?: { url?: string } | null }[]
  regulatory?: {
    status?: string[]
    registrationNo?: string
    usageLimit?: string
    documents?: { title?: string; file?: { url?: string } | null }[]
  }
  research?: {
    mechanism?: unknown
    studies?: { title?: string; summary?: string; url?: string }[]
  }
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
  const overview = pickLocaleText(lexicalToText(d.description), locale)
  const pick = (v?: string) => pickLocaleText(v, locale)
  return {
    slug: d.slug,
    name: d.name,
    category: d.category?.title ?? d.category?.name ?? industryLabel(d.type, locale),
    industry: industryLabel(d.type, locale) as Ingredient['industry'],
    origin: originLabel(d.originCountry, locale),
    manufacturer: d.brandName || undefined,
    inci: pick(d.inci) || undefined,
    suggestedDosage: pick(d.suggestedDosage) || undefined,
    shortDesc: pick(d.subtitle) || overview.split('\n')[0] || '',
    overview: overview || undefined,
    benefits: (d.benefits ?? []).map(pick).filter(Boolean),
    moq: d.moq ?? '',
    badges: d.badges ?? [],
    image: 'powder',
    imageSrc: mediaUrl(d.featuredImage?.url) ?? undefined,
    facets: {
      primaries: facetNames(d.primaries, pick),
      functions: facetNames(d.functions, pick),
      natures: facetNames(d.natures, pick),
      forms: facetNames(d.forms, pick),
      properties: facetNames(d.properties, pick),
    },
    specs: (d.specs ?? []).map((s) => ({ label: pick(s.label), value: pick(s.value) })),
    applications: (d.applications ?? []).map(pick).filter(Boolean),
    technical: d.technical
      ? {
          casNumber: d.technical.casNumber || undefined,
          hsCode: d.technical.hsCode || undefined,
          eNumber: d.technical.eNumber || undefined,
          assay: pick(d.technical.assay) || undefined,
          standardization: pick(d.technical.standardization) || undefined,
          appearance: pick(d.technical.appearance) || undefined,
          solubility: pick(d.technical.solubility) || undefined,
          particleSize: d.technical.particleSize || undefined,
          shelfLife: pick(d.technical.shelfLife) || undefined,
          storage: pick(d.technical.storage) || undefined,
          packaging: pick(d.technical.packaging) || undefined,
          leadTime: pick(d.technical.leadTime) || undefined,
          incompatibility: pick(d.technical.incompatibility) || undefined,
        }
      : undefined,
    regulatory: (() => {
      // Documents moved to a top-level `documents` field (own "Tài liệu" tab);
      // fall back to legacy `regulatory.documents` for older records.
      const docs = ((d.documents?.length ? d.documents : d.regulatory?.documents) ?? [])
        .map((doc) => ({ title: pick(doc.title) || undefined, url: mediaUrl(doc.file?.url) ?? undefined }))
        .filter((doc) => doc.url)
      if (!d.regulatory && docs.length === 0) return undefined
      return {
        status: d.regulatory?.status ?? [],
        registrationNo: d.regulatory?.registrationNo || undefined,
        usageLimit: pick(d.regulatory?.usageLimit) || undefined,
        documents: docs,
      }
    })(),
    research: d.research
      ? {
          mechanism: pickLocaleText(lexicalToText(d.research.mechanism), locale) || undefined,
          studies: (d.research.studies ?? [])
            .map((s) => ({ title: pick(s.title) || undefined, summary: pick(s.summary) || undefined, url: s.url || undefined }))
            .filter((s) => s.title),
        }
      : undefined,
  }
}

/** Tên thẻ đã bản địa hoá; bỏ qua mục chưa populate (depth=0 trả về id thô). */
function facetNames(list: FacetRef[] | null | undefined, pick: (v?: string) => string): string[] {
  if (!Array.isArray(list)) return []
  return list.map((f) => (typeof f === 'object' && f ? pick(f.name) : '')).filter(Boolean)
}

/** All published ingredients from the CMS. Returns null on failure/empty (caller falls back to static). */
// Only the fields the catalog list + filters actually use. Dropping the heavy
// `description` richText keeps the full-catalog response under Next's 2MB data
// cache limit (it was ~4.3MB with every field).
const LIST_SELECT = [
  'slug',
  'name',
  'subtitle',
  'type',
  'category',
  'originCountry',
  'brandName',
  'moq',
  'benefits',
  'applications',
  'badges',
  'featuredImage',
  'specs',
  // Thẻ lọc — bắt buộc có trong select, nếu không bộ lọc trên web sẽ rỗng.
  'primaries',
  'functions',
  'natures',
  'forms',
  'properties',
]
  .map((f) => `select[${f}]=true`)
  .join('&')

// Ở depth=1, Payload nhồi TOÀN BỘ facet object (keywords, description, ngày...)
// khiến response phình >2MB — vượt ngưỡng cache của Next (không cache được →
// mỗi lần tải lại phải fetch ~6s, và dễ dính bản cũ). Ta chỉ cần TÊN thẻ, nên
// giới hạn trường populate: response tụt còn ~1.5MB, cache được, tươi trong 60s.
const LIST_POPULATE = [
  'populate[ingredient-facets][name]=true',
  'populate[ingredient-facets][slug]=true',
  'populate[ingredient-categories][title]=true',
  'populate[ingredient-categories][name]=true',
].join('&')

export async function getIngredients(locale: Locale): Promise<Ingredient[] | null> {
  // TODO(scale): the catalog filters client-side, so we fetch the full set.
  // For very large catalogs, move filtering/pagination server-side instead.
  const res = await cmsFetch<Paginated<IngredientDoc>>(
    `ingredients?limit=2000&sort=name&depth=1&${LIST_SELECT}&${LIST_POPULATE}`,
    {
      locale,
      revalidate: 60,
      // Fetching the whole catalog can exceed the default 4s timeout.
      timeoutMs: 20000,
    },
  )
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
