/**
 * Tầng dữ liệu cho catalog nguyên liệu — PHÂN TRANG SERVER-SIDE.
 *
 * VÌ SAO
 *   Lấy cả 1.591 mục mỗi lần render (để lọc client-side) khiến query CMS ~7s và
 *   HTML nặng 1.5MB. Thay bằng:
 *     - getCatalogSummary: index siêu nhẹ (chỉ ID thẻ + xuất xứ + type, ~1.8s,
 *       cache 10 phút) → đếm số lượng cho tag cloud + tuỳ chọn bộ lọc. Chỉ chạy
 *       ở server, trả về dữ liệu nhỏ.
 *     - getCatalogPage: mỗi lần chỉ lấy 12 thẻ, lọc/tìm kiếm bằng `where` ở CMS
 *       (~0.3s/trang).
 */
import { cmsFetch, mediaUrl } from '@/lib/payload'
import type { Locale } from '@/lib/i18n/config'
import { originLabel, industryLabel } from '@/lib/cms/ingredients'
import { pickLocaleText } from '@/lib/i18n/pick-locale-text'

export const PAGE_SIZE = 12

export type FacetGroup = 'primaries' | 'functions' | 'natures' | 'forms' | 'properties'
export type FacetOption = { slug: string; name: string; count: number }
export type OriginOption = { code: string; label: string; count: number }
export type IndustryOption = { value: string; label: string; count: number }

export type CatalogSummary = {
  total: number
  primaries: FacetOption[]
  functions: FacetOption[]
  natures: FacetOption[]
  forms: FacetOption[]
  properties: FacetOption[]
  origins: OriginOption[]
  industries: IndustryOption[]
}

export type CatalogCard = {
  slug: string
  name: string
  shortDesc: string
  category: string
  origin: string
  moq: string
  badges: string[]
  imageSrc?: string
  tag?: string
  industry: string
}

export type CatalogFilters = {
  q?: string
  primary?: string // facet slug
  origin?: string // country code
  group?: string // function facet slug
  // Nâng cao (chọn nhiều, slug) — theo nhóm facet + ngành.
  primaries?: string[]
  functions?: string[]
  natures?: string[]
  forms?: string[]
  properties?: string[]
  industries?: string[] // type values
  origins?: string[]
}

// ── Summary ────────────────────────────────────────────────────────────────

type FacetDoc = { id: number | string; slug?: string; name?: string; group?: string; order?: number }
type IndexDoc = {
  primaries?: (number | string)[]
  functions?: (number | string)[]
  natures?: (number | string)[]
  forms?: (number | string)[]
  properties?: (number | string)[]
  originCountry?: string
  type?: string
}

const FACET_FIELDS: FacetGroup[] = ['primaries', 'functions', 'natures', 'forms', 'properties']
const INDEX_SELECT = [...FACET_FIELDS, 'originCountry', 'type'].map((f) => `select[${f}]=true`).join('&')

/** Đếm số lượng cho tag cloud + tuỳ chọn bộ lọc. Cache dài vì thay đổi chậm. */
export async function getCatalogSummary(locale: Locale): Promise<CatalogSummary | null> {
  const [index, facetList] = await Promise.all([
    cmsFetch<{ docs: IndexDoc[]; totalDocs: number }>(
      `ingredients?limit=5000&depth=0&where[hidden][not_equals]=true&${INDEX_SELECT}`,
      { locale, revalidate: 600, timeoutMs: 20000 },
    ),
    cmsFetch<{ docs: FacetDoc[] }>(`ingredient-facets?limit=300&depth=0&sort=order`, {
      locale,
      revalidate: 600,
    }),
  ])
  if (!index?.docs) return null

  // id -> facet (slug/name/group) để quy đổi ID trong index thành tên.
  const byId = new Map<string, FacetDoc>()
  for (const f of facetList?.docs ?? []) byId.set(String(f.id), f)

  // Đếm theo từng nhóm.
  const counts: Record<FacetGroup, Map<string, number>> = {
    primaries: new Map(), functions: new Map(), natures: new Map(), forms: new Map(), properties: new Map(),
  }
  const originCount = new Map<string, number>()
  const typeCount = new Map<string, number>()

  for (const doc of index.docs) {
    for (const field of FACET_FIELDS) {
      for (const id of doc[field] ?? []) {
        const key = String(id)
        counts[field].set(key, (counts[field].get(key) ?? 0) + 1)
      }
    }
    if (doc.originCountry) originCount.set(doc.originCountry, (originCount.get(doc.originCountry) ?? 0) + 1)
    if (doc.type) typeCount.set(doc.type, (typeCount.get(doc.type) ?? 0) + 1)
  }

  const toOptions = (field: FacetGroup): FacetOption[] =>
    [...counts[field].entries()]
      .map(([id, count]) => {
        const f = byId.get(id)
        return f?.slug ? { slug: f.slug, name: pickLocaleText(f.name, locale) || f.slug, count } : null
      })
      .filter((x): x is FacetOption => x !== null)
      .sort((a, b) => b.count - a.count)

  const origins: OriginOption[] = [...originCount.entries()]
    .map(([code, count]) => ({ code, label: originLabel(code, locale), count }))
    .sort((a, b) => a.label.localeCompare(b.label, 'vi'))

  const industries: IndustryOption[] = [...typeCount.entries()]
    .map(([value, count]) => ({ value, label: industryLabel(value, locale), count }))
    .sort((a, b) => b.count - a.count)

  return {
    total: index.totalDocs ?? index.docs.length,
    primaries: toOptions('primaries'),
    functions: toOptions('functions'),
    natures: toOptions('natures'),
    forms: toOptions('forms'),
    properties: toOptions('properties'),
    origins,
    industries,
  }
}

// ── Page of cards ────────────────────────────────────────────────────────────

type CardDoc = {
  slug: string
  name: string
  subtitle?: string
  type?: string
  category?: { title?: string; name?: string } | null
  originCountry?: string
  moq?: string
  badges?: string[]
  featuredImage?: { url?: string } | null
  tag?: string
}

const CARD_SELECT = ['slug', 'name', 'subtitle', 'type', 'category', 'originCountry', 'moq', 'badges', 'featuredImage', 'tag']
  .map((f) => `select[${f}]=true`)
  .join('&')
const CARD_POPULATE = [
  'populate[ingredient-categories][title]=true',
  'populate[ingredient-categories][name]=true',
].join('&')

/** Dựng chuỗi `where[...]` cho Payload REST từ bộ lọc. Lọc thẻ theo SLUG. */
export function buildCatalogWhere(f: CatalogFilters): string {
  const and: string[] = ['where[and][0][hidden][not_equals]=true']
  let i = 1
  const push = (frag: string) => and.push(`where[and][${i++}]${frag}`)

  if (f.q?.trim()) push(`[name][like]=${encodeURIComponent(f.q.trim())}`)

  // Tab danh mục + tag cloud gộp chung vào primaries; select nhóm gộp vào functions.
  const primaries = [...new Set([...(f.primaries ?? []), ...(f.primary ? [f.primary] : [])])].filter(Boolean)
  const functions = [...new Set([...(f.functions ?? []), ...(f.group ? [f.group] : [])])].filter(Boolean)
  const origins = [...new Set([...(f.origins ?? []), ...(f.origin ? [f.origin] : [])])].filter(Boolean)

  // Nhiều slug cùng nhóm → [in] danh sách = match BẤT KỲ (OR trong nhóm).
  if (primaries.length) push(`[primaries.slug][in]=${primaries.map(encodeURIComponent).join(',')}`)
  if (functions.length) push(`[functions.slug][in]=${functions.map(encodeURIComponent).join(',')}`)
  for (const field of ['natures', 'forms', 'properties'] as const) {
    const list = (f[field] ?? []).filter(Boolean)
    if (list.length) push(`[${field}.slug][in]=${list.map(encodeURIComponent).join(',')}`)
  }
  if (f.industries?.length) push(`[type][in]=${f.industries.map(encodeURIComponent).join(',')}`)
  if (origins.length) push(`[originCountry][in]=${origins.map(encodeURIComponent).join(',')}`)

  return and.join('&')
}

export type CatalogPage = { cards: CatalogCard[]; total: number; totalPages: number; page: number }

/** Một trang thẻ, đã lọc + phân trang ở server. */
export async function getCatalogPage(
  locale: Locale,
  filters: CatalogFilters,
  page: number,
): Promise<CatalogPage | null> {
  const where = buildCatalogWhere(filters)
  const res = await cmsFetch<{ docs: CardDoc[]; totalDocs: number; totalPages: number; page: number }>(
    `ingredients?limit=${PAGE_SIZE}&page=${Math.max(1, page)}&sort=name&depth=1&${where}&${CARD_SELECT}&${CARD_POPULATE}`,
    { locale, revalidate: 120, timeoutMs: 15000 },
  )
  if (!res?.docs) return null
  return {
    cards: res.docs.map((d) => toCard(d, locale)),
    total: res.totalDocs ?? 0,
    totalPages: res.totalPages ?? 1,
    page: res.page ?? page,
  }
}

function toCard(d: CardDoc, locale: Locale): CatalogCard {
  return {
    slug: d.slug,
    name: d.name,
    shortDesc: pickLocaleText(d.subtitle, locale) || '',
    category: d.category?.title ?? d.category?.name ?? industryLabel(d.type, locale),
    origin: originLabel(d.originCountry, locale),
    moq: d.moq ?? '',
    badges: d.badges ?? [],
    imageSrc: mediaUrl(d.featuredImage?.url) ?? undefined,
    tag: d.tag,
    industry: industryLabel(d.type, locale),
  }
}
