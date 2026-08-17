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
import { authenticateApiKey } from '../lib/catalogAuth.js'

const json = (data: unknown, status = 200) =>
  Response.json(data as never, {
    status,
    // Dữ liệu theo khoá riêng → không cho proxy/CDN nào đệm lại.
    headers: { 'Cache-Control': 'private, no-store' },
  })

const SITE = (process.env.FRONTEND_URL || 'https://bioscope.vn').replace(/\/$/, '')

/** Trường được phép rời khỏi CSDL. Giá và tài liệu B2B KHÔNG có ở đây. */
const SELECT = {
  slug: true,
  name: true,
  subtitle: true,
  inci: true,
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
    url: `${SITE}/nguyen-lieu/${doc.slug as string}`,
    updatedAt: doc.updatedAt as string,
  }
}

type Shaped = ReturnType<typeof shape>

/**
 * Bản văn bản gọn để nhồi thẳng vào ngữ cảnh AI. Đưa JSON lồng nhau cho mô hình
 * vừa tốn token vừa khó đọc; dạng này ngắn hơn khoảng một nửa.
 */
function toText(items: Shaped[]): string {
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
        `Link: ${i.url}\n`
      )
    })
    .join('\n')
}

const okLocale = (v: unknown) => (String(v ?? '') === 'en' ? 'en' : 'vi')
const clampLimit = (v: unknown, def: number, max: number) => {
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

/** Bọc xác thực cho mọi endpoint danh mục. */
const guarded =
  (handler: (req: PayloadRequest) => Promise<Response>) =>
  async (req: PayloadRequest): Promise<Response> => {
    const auth = await authenticateApiKey(req)
    if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status)
    try {
      return await handler(req)
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
  handler: guarded(async (req) => {
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
    const items = res.docs.map((d) => shape(d as Record<string, unknown>))
    if (String(req.query?.format ?? '') === 'text') {
      return json({ ok: true, total: res.totalDocs, count: items.length, text: toText(items) })
    }
    return json({ ok: true, total: res.totalDocs, count: items.length, items })
  }),
}

// ── GET /api/catalog/ingredients ─────────────────────────────────────────────
const listEndpoint: Endpoint = {
  path: '/catalog/ingredients',
  method: 'get',
  handler: guarded(async (req) => {
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
    const items = res.docs.map((d) => shape(d as Record<string, unknown>))
    const meta = { total: res.totalDocs, page: res.page, totalPages: res.totalPages, hasNextPage: res.hasNextPage }
    if (String(req.query?.format ?? '') === 'text') {
      return json({ ok: true, ...meta, text: toText(items) })
    }
    return json({ ok: true, ...meta, items })
  }),
}

// ── GET /api/catalog/ingredients/:slug ───────────────────────────────────────
const detailEndpoint: Endpoint = {
  path: '/catalog/ingredients/:slug',
  method: 'get',
  handler: guarded(async (req) => {
    const slug = String(req.routeParams?.slug ?? '').trim()
    if (!slug) return json({ ok: false, error: 'Thiếu slug.' }, 400)
    const locale = okLocale(req.query?.locale)

    const res = await findPublic(req, { slug: { equals: slug } }, 1, 1, locale)
    const doc = res.docs[0]
    if (!doc) return json({ ok: false, error: 'Không tìm thấy.' }, 404)

    const item = shape(doc as Record<string, unknown>)
    if (String(req.query?.format ?? '') === 'text') {
      return json({ ok: true, text: toText([item]) })
    }
    return json({ ok: true, item })
  }),
}

export const catalogEndpoints: Endpoint[] = [
  manifestEndpoint,
  searchEndpoint,
  listEndpoint,
  detailEndpoint,
]
