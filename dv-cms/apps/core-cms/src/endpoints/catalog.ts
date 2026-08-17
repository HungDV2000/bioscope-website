/**
 * API danh mục nguyên liệu cho hệ thống bên ngoài (chatbot Telegram của khách).
 *
 *   GET /api/catalog/manifest              → tổng số + thời điểm cập nhật cuối
 *   GET /api/catalog/search?q=             → tìm theo câu hỏi (dùng cho chatbot)
 *   GET /api/catalog/ingredients?page=     → toàn bộ danh mục, phân trang (đồng bộ)
 *   GET /api/catalog/ingredients/:slug     → chi tiết một nguyên liệu
 *
 * ══ BẢO MẬT — BA LỚP CHỐNG LỘ DỮ LIỆU ══
 *  1. `overrideAccess: false` + KHÔNG truyền user → Payload tự áp
 *     `readPublishedOrStaff` (chỉ bản đã xuất bản) và tự CẮT các trường gắn
 *     `isStaffFieldLevel` — trong đó có BẢNG GIÁ.
 *  2. `select` chỉ lấy đúng các trường được phép: giá không hề rời khỏi CSDL.
 *  3. Hàm `shape()` liệt kê tay từng trường trả ra. KHÔNG bao giờ trải toàn bộ
 *     tài liệu — thêm trường nhạy cảm về sau cũng không tự lọt ra ngoài.
 *
 * Ba lớp này độc lập: sai sót ở một lớp vẫn còn hai lớp chặn.
 */
import type { Endpoint, PayloadRequest, Where } from 'payload'
import { authenticateApiKey, hasScope, type ApiKeyDoc, type CatalogScope } from '../lib/catalogAuth.js'
import { lexicalToPlainText } from '../lib/richText.js'

export const json = (data: unknown, status = 200) =>
  Response.json(data as never, {
    status,
    // Dữ liệu theo khoá riêng → không cho proxy/CDN nào đệm lại.
    headers: { 'Cache-Control': 'private, no-store' },
  })

export const SITE = (process.env.FRONTEND_URL || 'https://bioscope.vn').replace(/\/$/, '')

/** Trường được phép rời khỏi CSDL. Giá và tài liệu B2B KHÔNG có ở đây. */
const SELECT = {
  slug: true,
  name: true,
  subtitle: true,
  inci: true,
  description: true,
  specs: true,
  technologies: true,
  gallery: true,
  suggestedDosage: true,
  category: true,
  originCountry: true,
  brandName: true,
  moq: true,
  benefits: true,
  applications: true,
  primaries: true,
  functions: true,
  natures: true,
  forms: true,
  properties: true,
  badges: true,
  featuredImage: true,
  technical: true,
  updatedAt: true,
} as const

type Rel = { name?: string; title?: string; url?: string } | string | number | null | undefined
const relName = (v: Rel): string | undefined =>
  v && typeof v === 'object' ? (v.name ?? v.title ?? undefined) : undefined
const relNames = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((x) => relName(x as Rel)).filter((s): s is string => Boolean(s)) : []

type Tech = Record<string, unknown> | undefined
const techStr = (t: Tech, k: string): string | undefined => {
  const v = t?.[k]
  return typeof v === 'string' && v.trim() ? v.trim() : undefined
}

/**
 * Chuyển tài liệu sang hình dạng công khai.
 * Liệt kê TAY từng trường — đây là lớp chặn cuối cùng.
 */
function shape(doc: Record<string, unknown>) {
  const t = doc.technical as Tech
  const img = doc.featuredImage as Rel
  return {
    slug: doc.slug as string,
    name: doc.name as string,
    subtitle: (doc.subtitle as string) || undefined,
    inci: (doc.inci as string) || undefined,
    // Mô tả là nội dung chính để tư vấn — chuyển sang văn bản thuần cho AI đọc.
    description: lexicalToPlainText(doc.description) || undefined,
    category: relName(doc.category as Rel),
    primaryCategories: relNames(doc.primaries),
    functions: relNames(doc.functions),
    natures: relNames(doc.natures),
    forms: relNames(doc.forms),
    properties: relNames(doc.properties),
    benefits: Array.isArray(doc.benefits) ? (doc.benefits as string[]) : [],
    applications: Array.isArray(doc.applications) ? (doc.applications as string[]) : [],
    suggestedDosage: (doc.suggestedDosage as string) || undefined,
    originCountry: (doc.originCountry as string) || undefined,
    brandName: (doc.brandName as string) || undefined,
    moq: (doc.moq as string) || undefined,
    badges: Array.isArray(doc.badges) ? (doc.badges as string[]) : [],
    technologies: relNames(doc.technologies),
    // Thông số dạng bảng (nhãn – giá trị – đơn vị).
    specs: Array.isArray(doc.specs)
      ? (doc.specs as Record<string, unknown>[])
          .map((r) => ({
            label: (r.label as string) || undefined,
            value: (r.value as string) || undefined,
            unit: (r.unit as string) || undefined,
          }))
          .filter((r) => r.value)
      : [],
    technical: {
      casNumber: techStr(t, 'casNumber'),
      hsCode: techStr(t, 'hsCode'),
      eNumber: techStr(t, 'eNumber'),
      assay: techStr(t, 'assay'),
      standardization: techStr(t, 'standardization'),
      appearance: techStr(t, 'appearance'),
      solubility: techStr(t, 'solubility'),
      particleSize: techStr(t, 'particleSize'),
      shelfLife: techStr(t, 'shelfLife'),
      storage: techStr(t, 'storage'),
      packaging: techStr(t, 'packaging'),
    },
    image: img && typeof img === 'object' ? img.url : undefined,
    gallery: Array.isArray(doc.gallery)
      ? (doc.gallery as Rel[]).map((g) => (g && typeof g === 'object' ? g.url : undefined)).filter(Boolean)
      : [],
    url: `${SITE}/nguyen-lieu/${doc.slug as string}`,
    updatedAt: doc.updatedAt as string,
  }
}

type Shaped = ReturnType<typeof shape> & { pricing?: unknown }

/**
 * Bản văn bản gọn để nhồi thẳng vào ngữ cảnh AI. Đưa JSON lồng nhau cho mô hình
 * vừa tốn token vừa khó đọc; dạng này ngắn hơn khoảng một nửa.
 */
function toText(items: Shaped[]): string {
  // Chỉ có khi khoá được bật quyền xem giá.
  const priceLine = (i: Shaped) => {
    const p = i.pricing as
      | { currency?: string; quoteDate?: string; terms?: string; tiers?: { moq?: string; price?: number; unit?: string }[] }
      | undefined
    if (!p) return ''
    const tiers = (p.tiers ?? [])
      .map((t) => [t.moq, t.price != null ? `${t.price}${p.currency ? ' ' + p.currency : ''}` : '', t.unit && `/${t.unit}`].filter(Boolean).join(' '))
      .filter(Boolean)
      .join(' · ')
    return (
      (tiers ? `Giá: ${tiers}\n` : '') +
      (p.quoteDate ? `Ngày báo giá: ${String(p.quoteDate).slice(0, 10)}\n` : '') +
      (p.terms ? `Điều khoản: ${p.terms}\n` : '')
    )
  }
  const line = (label: string, v?: string | string[]) => {
    const s = Array.isArray(v) ? v.filter(Boolean).join(', ') : v
    return s ? `${label}: ${s}\n` : ''
  }
  return items
    .map((i) => {
      const tech = [
        i.technical.casNumber && `CAS ${i.technical.casNumber}`,
        i.technical.assay && `hàm lượng ${i.technical.assay}`,
        i.technical.standardization && `chuẩn hoá ${i.technical.standardization}`,
        i.technical.appearance,
        i.technical.solubility && `độ tan ${i.technical.solubility}`,
        i.technical.shelfLife && `hạn ${i.technical.shelfLife}`,
        i.technical.storage,
        i.technical.packaging,
      ]
        .filter(Boolean)
        .join(' · ')
      return (
        `### ${i.name}${i.subtitle ? ` — ${i.subtitle}` : ''}\n` +
        line('Danh mục', [i.category ?? '', ...i.primaryCategories]) +
        line('Công dụng', i.functions) +
        line('Bản chất', i.natures) +
        line('Dạng', i.forms) +
        line('Đặc tính', i.properties) +
        line('Lợi ích', i.benefits) +
        line('Ứng dụng', i.applications) +
        line('INCI', i.inci) +
        line('Kỹ thuật', tech) +
        line('Liều gợi ý', i.suggestedDosage) +
        line('Xuất xứ', i.originCountry) +
        line('Thương hiệu', i.brandName) +
        line('MOQ', i.moq) +
        line('Chứng nhận', i.badges) +
        line('Công nghệ', i.technologies) +
        line(
          'Thông số',
          i.specs.map((sp) => [sp.label, sp.value, sp.unit].filter(Boolean).join(' ')),
        ) +
        (i.description ? `Mô tả: ${i.description}\n` : '') +
        priceLine(i) +
        `Link: ${i.url}\n`
      )
    })
    .join('\n')
}

/**
 * Bảng giá — CHỈ khi khoá được bật ô "Cho phép lấy bảng giá".
 *
 * Cố ý tách thành truy vấn RIÊNG với `overrideAccess: true` thay vì nới lỏng
 * truy vấn chính: đường lấy dữ liệu thường vẫn giữ nguyên ba lớp chặn, còn giá
 * đi theo một nhánh hẹp, dễ soát và dễ tắt.
 */
async function fetchPricing(
  req: PayloadRequest,
  slugs: string[],
  locale: string,
): Promise<Map<string, unknown>> {
  const out = new Map<string, unknown>()
  if (!slugs.length) return out
  try {
    const res = await req.payload.find({
      collection: 'ingredients',
      where: { slug: { in: slugs } },
      limit: slugs.length,
      depth: 0,
      locale: locale as 'vi',
      overrideAccess: true, // bắt buộc: `pricing` gắn quyền chỉ-nhân-viên
      select: { slug: true, pricing: true } as never,
    })
    for (const d of res.docs) {
      const doc = d as Record<string, unknown>
      const p = doc.pricing as Record<string, unknown> | undefined
      if (!p) continue
      const tiers = Array.isArray(p.tiers)
        ? (p.tiers as Record<string, unknown>[]).map((t) => ({
            moq: (t.moq as string) || undefined,
            price: typeof t.price === 'number' ? t.price : undefined,
            unit: (t.unit as string) || undefined,
            note: (t.note as string) || undefined,
          }))
        : []
      if (!tiers.length && !p.terms && !p.quoteDate) continue
      out.set(String(doc.slug), {
        quoteDate: (p.quoteDate as string) || undefined,
        currency: (p.currency as string) || undefined,
        terms: lexicalToPlainText(p.terms, 1000) || undefined,
        tiers,
      })
    }
  } catch (e) {
    // Giá hỏng thì bỏ qua — không được làm chết cả lời gọi danh mục.
    req.payload.logger.warn(`[catalog] không lấy được bảng giá: ${String(e)}`)
  }
  return out
}

/** Gắn giá vào kết quả nếu khoá được phép. */
async function withPricing(
  req: PayloadRequest,
  key: ApiKeyDoc,
  items: Shaped[],
  locale: string,
): Promise<Shaped[]> {
  if (!key.allowPricing) return items
  const map = await fetchPricing(req, items.map((i) => i.slug), locale)
  return items.map((i) => ({ ...i, pricing: map.get(i.slug) }))
}

export const okLocale = (v: unknown) => (String(v ?? '') === 'en' ? 'en' : 'vi')
export const clampLimit = (v: unknown, def: number, max: number) => {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? Math.min(Math.floor(n), max) : def
}

/** Chạy truy vấn với quyền của KHÁCH VÃNG LAI — Payload tự chặn nháp + trường nội bộ. */
async function findPublic(req: PayloadRequest, where: Where, limit: number, page: number, locale: string) {
  return req.payload.find({
    collection: 'ingredients',
    where,
    limit,
    page,
    depth: 1, // đủ để lấy TÊN thẻ lọc và ảnh, không sâu hơn
    locale: locale as 'vi',
    sort: '-updatedAt',
    overrideAccess: false, // ← lớp 1: chỉ bản đã xuất bản, tự cắt trường nội bộ
    select: SELECT as never, // ← lớp 2: giá không rời khỏi CSDL
  })
}

/**
 * Bọc xác thực + kiểm phạm vi cho endpoint danh mục.
 * `scope` bỏ trống = ai có khoá hợp lệ đều gọi được (dùng cho /manifest, vốn chỉ
 * trả số lượng chứ không có dữ liệu nguyên liệu).
 */
export const guarded =
  (handler: (req: PayloadRequest, key: ApiKeyDoc) => Promise<Response>, scope?: CatalogScope) =>
  async (req: PayloadRequest): Promise<Response> => {
    const auth = await authenticateApiKey(req)
    if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status)
    if (scope && !hasScope(auth.key, scope)) {
      return json({ ok: false, error: `Khoá không được cấp quyền cho endpoint này (${scope}).` }, 403)
    }
    try {
      return await handler(req, auth.key)
    } catch (e) {
      req.payload.logger.error(`[catalog] lỗi: ${String(e)}`)
      // Không trả chi tiết lỗi ra ngoài — tránh lộ cấu trúc hệ thống.
      return json({ ok: false, error: 'Lỗi máy chủ.' }, 500)
    }
  }

// ── GET /api/catalog/manifest ────────────────────────────────────────────────
const manifestEndpoint: Endpoint = {
  path: '/catalog/manifest',
  method: 'get',
  handler: guarded(async (req) => {
    const locale = okLocale(req.query?.locale)
    const res = await findPublic(req, {}, 1, 1, locale)
    return json({
      ok: true,
      total: res.totalDocs,
      lastUpdatedAt: (res.docs[0] as { updatedAt?: string } | undefined)?.updatedAt ?? null,
      pageSizeMax: 100,
    })
  }),
}

// ── GET /api/catalog/search ──────────────────────────────────────────────────
// Dùng cho chatbot: lấy ĐÚNG vài nguyên liệu liên quan tới câu hỏi thay vì nhồi
// cả kho vào AI — vừa rẻ hơn nhiều, vừa hết cảnh trả lời thiếu do cắt bớt.
const searchEndpoint: Endpoint = {
  path: '/catalog/search',
  method: 'get',
  handler: guarded(async (req, key) => {
    const q = String(req.query?.q ?? '').trim().slice(0, 200)
    if (!q) return json({ ok: false, error: 'Thiếu tham số q.' }, 400)
    const locale = okLocale(req.query?.locale)
    const limit = clampLimit(req.query?.limit, 8, 25)

    // Tách từ khoá; bỏ từ quá ngắn để tránh khớp bừa.
    const words = q.split(/\s+/).filter((w) => w.length >= 2).slice(0, 6)
    const terms = words.length ? words : [q]

    // Câu hỏi kiểu "kháng viêm", "tăng đề kháng" nằm ở TÊN THẺ LỌC chứ không
    // nằm trong tên nguyên liệu → tra thẻ trước, rồi lọc nguyên liệu theo thẻ.
    const facets = await req.payload.find({
      collection: 'ingredient-facets',
      where: { or: terms.map((t) => ({ name: { like: t } })) },
      limit: 40,
      depth: 0,
      locale: locale as 'vi',
      overrideAccess: false,
    })
    const facetIds = facets.docs.map((d) => d.id)

    // KHÔNG đưa `benefits`/`applications` vào đây: chúng là trường văn bản
    // NHIỀU GIÁ TRỊ + ĐA NGỮ, bộ dựng truy vấn của Payload sinh SQL hỏng
    // ("and  = $3", thiếu vế trái) và cả lượt tìm kiếm sẽ lỗi 500.
    // Ý nghĩa của chúng đã được thẻ lọc bên dưới phủ gần hết.
    const textFields = ['name', 'subtitle', 'inci', 'brandName']
    const or: Where[] = []
    for (const t of terms) for (const f of textFields) or.push({ [f]: { like: t } } as Where)
    if (facetIds.length) {
      for (const f of ['primaries', 'functions', 'natures', 'forms', 'properties']) {
        or.push({ [f]: { in: facetIds } } as Where)
      }
    }

    const res = await findPublic(req, { or }, limit, 1, locale)
    const items = await withPricing(req, key, res.docs.map((d) => shape(d as Record<string, unknown>)), locale)
    if (String(req.query?.format ?? '') === 'text') {
      return json({ ok: true, total: res.totalDocs, count: items.length, text: toText(items) })
    }
    return json({ ok: true, total: res.totalDocs, count: items.length, items })
  }, 'search'),
}

// ── GET /api/catalog/ingredients ─────────────────────────────────────────────
const listEndpoint: Endpoint = {
  path: '/catalog/ingredients',
  method: 'get',
  handler: guarded(async (req, key) => {
    const locale = okLocale(req.query?.locale)
    // Trần 100/lượt: bên gọi muốn lấy hết vẫn phải phân trang, nhờ đó giới hạn
    // tần suất mới có tác dụng chống quét sạch dữ liệu.
    const limit = clampLimit(req.query?.limit, 50, 100)
    const page = clampLimit(req.query?.page, 1, 10_000)

    const where: Where = {}
    const since = String(req.query?.updatedSince ?? '').trim()
    if (since && !Number.isNaN(Date.parse(since))) {
      // Đồng bộ tăng dần: chỉ kéo phần đã đổi kể từ lần trước.
      Object.assign(where, { updatedAt: { greater_than: new Date(since).toISOString() } })
    }

    const res = await findPublic(req, where, limit, page, locale)
    const items = await withPricing(req, key, res.docs.map((d) => shape(d as Record<string, unknown>)), locale)
    const meta = { total: res.totalDocs, page: res.page, totalPages: res.totalPages, hasNextPage: res.hasNextPage }
    if (String(req.query?.format ?? '') === 'text') {
      return json({ ok: true, ...meta, text: toText(items) })
    }
    return json({ ok: true, ...meta, items })
  }, 'list'),
}

// ── GET /api/catalog/ingredients/:slug ───────────────────────────────────────
const detailEndpoint: Endpoint = {
  path: '/catalog/ingredients/:slug',
  method: 'get',
  handler: guarded(async (req, key) => {
    const slug = String(req.routeParams?.slug ?? '').trim()
    if (!slug) return json({ ok: false, error: 'Thiếu slug.' }, 400)
    const locale = okLocale(req.query?.locale)

    const res = await findPublic(req, { slug: { equals: slug } }, 1, 1, locale)
    const doc = res.docs[0]
    if (!doc) return json({ ok: false, error: 'Không tìm thấy.' }, 404)

    const [item] = await withPricing(req, key, [shape(doc as Record<string, unknown>)], locale)
    if (String(req.query?.format ?? '') === 'text') {
      return json({ ok: true, text: toText([item]) })
    }
    return json({ ok: true, item })
  }, 'detail'),
}

export const catalogEndpoints: Endpoint[] = [
  manifestEndpoint,
  searchEndpoint,
  listEndpoint,
  detailEndpoint,
]
