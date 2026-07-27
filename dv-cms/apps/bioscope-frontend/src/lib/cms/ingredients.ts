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
export function industryLabel(type: string | undefined, locale: Locale): string {
  const map =
    locale === 'en'
      ? { supplement: 'Nutraceuticals', cosmetic: 'Cosmetics' }
      : { supplement: 'Thực phẩm chức năng', cosmetic: 'Mỹ phẩm' }
  return map[(type ?? 'supplement') as 'supplement' | 'cosmetic'] ?? map.supplement
}

// Bảng mã ISO-3166 alpha-2 → tên nước. Gom đủ mọi mã xuất hiện trong dữ liệu
// (khảo sát danh mục thật) để bộ lọc không lẫn "Hàn Quốc" với "TW", "IE"...
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
  IE: { vi: 'Ireland', en: 'Ireland' },
  DK: { vi: 'Đan Mạch', en: 'Denmark' },
  CA: { vi: 'Canada', en: 'Canada' },
  IL: { vi: 'Israel', en: 'Israel' },
  NL: { vi: 'Hà Lan', en: 'Netherlands' },
  TW: { vi: 'Đài Loan', en: 'Taiwan' },
  BR: { vi: 'Brazil', en: 'Brazil' },
  MY: { vi: 'Malaysia', en: 'Malaysia' },
  ID: { vi: 'Indonesia', en: 'Indonesia' },
  BE: { vi: 'Bỉ', en: 'Belgium' },
  NZ: { vi: 'New Zealand', en: 'New Zealand' },
  NP: { vi: 'Nepal', en: 'Nepal' },
  GB: { vi: 'Anh', en: 'United Kingdom' },
  UK: { vi: 'Anh', en: 'United Kingdom' },
  AU: { vi: 'Úc', en: 'Australia' },
  SG: { vi: 'Singapore', en: 'Singapore' },
  SE: { vi: 'Thụy Điển', en: 'Sweden' },
  FI: { vi: 'Phần Lan', en: 'Finland' },
  PL: { vi: 'Ba Lan', en: 'Poland' },
  AT: { vi: 'Áo', en: 'Austria' },
  PT: { vi: 'Bồ Đào Nha', en: 'Portugal' },
  RU: { vi: 'Nga', en: 'Russia' },
  MX: { vi: 'Mexico', en: 'Mexico' },
  PE: { vi: 'Peru', en: 'Peru' },
  CL: { vi: 'Chile', en: 'Chile' },
  ZA: { vi: 'Nam Phi', en: 'South Africa' },
  EG: { vi: 'Ai Cập', en: 'Egypt' },
  TR: { vi: 'Thổ Nhĩ Kỳ', en: 'Turkey' },
  GR: { vi: 'Hy Lạp', en: 'Greece' },
  HK: { vi: 'Hồng Kông', en: 'Hong Kong' },
}

export function originLabel(code: string | undefined, locale: Locale): string {
  if (!code) return ''
  // Một số bản ghi ghép nhiều mã ("IN, NP", "CN/VN") — tách, map từng mã rồi
  // ghép lại để không hiện mã thô lẫn lộn với tên nước.
  return code
    .split(/[,/;]+/)
    .map((c) => c.trim())
    .filter(Boolean)
    .map((c) => COUNTRY[c.toUpperCase()]?.[locale] ?? c)
    .join(', ')
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
// CHỈ lấy đúng trường mà DANH SÁCH + BỘ LỌC dùng. Trên 1.591 mục, mỗi trường
// mảng chuỗi dài nhân lên rất nặng: đo thực tế, bỏ `benefits` (câu dài) và
// `specs` (mảng cấu trúc) cắt response 1.86MB→0.9MB và query CMS 8.5s→3.4s.
// Đánh đổi: tìm kiếm không còn khớp theo mô tả lợi ích, và bộ lọc "Dạng bào
// chế" chỉ dựa vào thẻ facet (không suy từ specs cho mục chưa gắn thẻ). Trang
// CHI TIẾT vẫn lấy đủ mọi trường nên không ảnh hưởng.
const LIST_SELECT = [
  'slug',
  'name',
  'subtitle',
  'type',
  'category',
  'originCountry',
  'brandName',
  'moq',
  'applications',
  'badges',
  'featuredImage',
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
    // `hidden` bật = ẩn hoàn toàn khỏi web. not_equals:true cũng nhận bản ghi
    // chưa từng set (null) nên nguyên liệu cũ vẫn hiển thị bình thường.
    `ingredients?limit=2000&sort=name&depth=1&where[hidden][not_equals]=true&${LIST_SELECT}&${LIST_POPULATE}`,
    {
      locale,
      // Danh mục đổi không thường xuyên; cache 5 phút để hầu hết lượt tải lấy
      // bản đã cache (tức thì, stale-while-revalidate) thay vì chờ query CMS ~3s.
      // Nút "Xoá cache" trong admin đẩy ngay khi cần cập nhật gấp.
      revalidate: 300,
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
    // Ẩn = trang chi tiết cũng không truy cập được (trả null → 404).
    `ingredients?where[slug][equals]=${encodeURIComponent(slug)}&where[hidden][not_equals]=true&depth=1&limit=1`,
    { locale, revalidate: 60 },
  )
  const doc = res?.docs?.[0]
  return doc ? toIngredient(doc, locale) : null
}
