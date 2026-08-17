/**
 * API NỘI DUNG — mở phần còn lại của CMS cho hệ thống bên ngoài (chatbot).
 *
 *   GET /api/catalog/content              → các loại nội dung khoá được phép đọc
 *   GET /api/catalog/content/:type        → danh sách, phân trang
 *   GET /api/catalog/content/:type/:key   → chi tiết theo slug hoặc id
 *   GET /api/catalog/site                 → thông tin công ty (liên hệ, mạng xã hội)
 *
 * ══ VÌ SAO LÀ DANH SÁCH TRẮNG, KHÔNG PHẢI DANH SÁCH ĐEN ══
 * CMS có ~35 collection, trong đó có tài khoản thành viên, lịch sử chat, nhật ký
 * bảo mật, log đồng ý cookie, tài liệu B2B. Nếu mặc định là "mở hết rồi chặn dần"
 * thì mỗi lần thêm collection mới là một lần rò rỉ tiềm tàng — người thêm phải
 * NHỚ đi chặn. Ở đây ngược lại: collection không có tên trong REGISTRY thì không
 * có đường nào ra API, kể cả khi khoá được cấp đủ mọi quyền.
 *
 * Ba lớp chặn giống hệt module nguyên liệu:
 *  1. `overrideAccess: false` → Payload tự áp quyền khách vãng lai, cắt bản nháp.
 *  2. `select` chỉ lấy đúng trường được phép rời khỏi CSDL.
 *  3. `shape()` liệt kê TAY từng trường trả ra.
 */
import type { Endpoint, PayloadRequest, Where } from 'payload'
import type { CatalogScope } from '../lib/catalogAuth.js'
import { lexicalToPlainText } from '../lib/richText.js'
import { json, okLocale, clampLimit, guarded, SITE } from './catalog.js'

type Doc = Record<string, unknown>

const str = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim() ? v.trim() : undefined
const strs = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((x) => str(x)).filter((s): s is string => Boolean(s)) : []
const rich = (v: unknown, max = 4000) => lexicalToPlainText(v, max) || undefined

/** Tên của quan hệ đã populate. Chỉ lấy nhãn, không kéo theo cả tài liệu. */
const relName = (v: unknown): string | undefined =>
  v && typeof v === 'object' ? str((v as Doc).name ?? (v as Doc).title) : undefined
const relNames = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(relName).filter((s): s is string => Boolean(s)) : []

/**
 * Gom chữ từ cây block của trang.
 *
 * Trang được dựng bằng block lồng nhau, mỗi loại block một hình dạng riêng —
 * liệt kê tay từng loại sẽ hỏng ngay khi ai đó thêm block mới. Thay vào đó đi
 * đệ quy và chỉ nhặt chuỗi, nên block lạ vẫn ra chữ đọc được.
 *
 * CHẶN theo tên khoá: `blockType`, `id`, `url`… là dữ liệu kỹ thuật, đưa vào
 * ngữ cảnh AI chỉ tổ nhiễu.
 */
const SKIP_KEYS = new Set([
  'id', 'blockType', 'blockName', '_status', 'url', 'href', 'icon', 'anchor',
  'variant', 'align', 'size', 'color', 'width', 'createdAt', 'updatedAt',
])
function blocksToText(value: unknown, depth = 0, out: string[] = []): string[] {
  if (depth > 8 || out.length > 200) return out
  if (Array.isArray(value)) {
    for (const v of value) blocksToText(v, depth + 1, out)
    return out
  }
  if (value && typeof value === 'object') {
    const o = value as Doc
    // Lexical richText có dạng { root: {...} } → để hàm chuyên dụng xử lý.
    if (o.root && typeof o.root === 'object') {
      const t = rich(o, 2000)
      if (t) out.push(t)
      return out
    }
    for (const [k, v] of Object.entries(o)) {
      if (SKIP_KEYS.has(k)) continue
      blocksToText(v, depth + 1, out)
    }
    return out
  }
  const s = str(value)
  // Bỏ chuỗi quá ngắn (mã màu, cờ bật/tắt) và quá dài bất thường.
  if (s && s.length >= 3 && s.length <= 4000) out.push(s)
  return out
}

// ─────────────────────────────────────────────────────────────────────────────
// DANH SÁCH TRẮNG
// ─────────────────────────────────────────────────────────────────────────────

type Entry = {
  /** Slug collection trong Payload. */
  collection: string
  label: string
  /** Mô tả để bên tích hợp biết dùng làm gì. */
  hint: string
  select: Record<string, true>
  /** Trường tìm kiếm dạng text. KHÔNG dùng trường hasMany đa ngữ — Payload sinh SQL hỏng. */
  searchFields: string[]
  sort: string
  /** Đường dẫn trên website để dựng link; bỏ trống = không có trang riêng. */
  path?: string
  shape: (d: Doc) => Doc
  /** Một khối văn bản cho ngữ cảnh AI. */
  text: (i: Doc) => string
}

const line = (label: string, v: unknown): string => {
  const s = Array.isArray(v) ? strs(v).join(', ') : str(v)
  return s ? `${label}: ${s}\n` : ''
}

const REGISTRY: Record<string, Entry> = {
  faqs: {
    collection: 'faqs',
    label: 'Câu hỏi thường gặp',
    hint: 'Nguồn trả lời tốt nhất cho chatbot — câu hỏi và câu trả lời do Bioscope duyệt.',
    select: { question: true, answer: true, category: true, order: true, updatedAt: true },
    searchFields: ['question', 'answer'],
    sort: 'order',
    shape: (d) => ({
      id: d.id,
      question: str(d.question),
      answer: str(d.answer),
      category: str(d.category),
      updatedAt: d.updatedAt,
    }),
    text: (i) => `### ${i.question}\n${line('Nhóm', i.category)}${i.answer}\n`,
  },

  services: {
    collection: 'services',
    label: 'Dịch vụ',
    hint: 'Bioscope cung cấp dịch vụ gì, cho ai, quy trình ra sao.',
    select: {
      title: true, slug: true, forWho: true, summary: true, heroQuote: true,
      receive: true, idealFor: true, expectedOutcomes: true, process: true,
      faq: true, description: true, features: true, order: true, updatedAt: true,
    },
    searchFields: ['title', 'summary', 'forWho'],
    sort: 'order',
    path: '/dich-vu',
    shape: (d) => ({
      id: d.id,
      slug: str(d.slug),
      title: str(d.title),
      forWho: str(d.forWho),
      summary: str(d.summary),
      description: rich(d.description),
      receive: strs(d.receive),
      idealFor: strs(d.idealFor),
      expectedOutcomes: strs(d.expectedOutcomes),
      features: strs(d.features),
      process: Array.isArray(d.process)
        ? (d.process as Doc[]).map((p) => ({ step: str(p.step), desc: str(p.desc) }))
        : [],
      faq: Array.isArray(d.faq)
        ? (d.faq as Doc[]).map((f) => ({ q: str(f.q), a: str(f.a) }))
        : [],
      updatedAt: d.updatedAt,
    }),
    text: (i) =>
      `### ${i.title}\n` +
      line('Dành cho', i.forWho) +
      line('Tóm tắt', i.summary) +
      line('Bạn nhận được', i.receive) +
      line('Phù hợp với', i.idealFor) +
      line('Kết quả kỳ vọng', i.expectedOutcomes) +
      line('Quy trình', (i.process as Doc[])?.map((p) => [p.step, p.desc].filter(Boolean).join(' — '))) +
      (i.description ? `Mô tả: ${i.description}\n` : '') +
      ((i.faq as Doc[]) ?? []).map((f) => `Hỏi: ${f.q}\nĐáp: ${f.a}\n`).join(''),
  },

  'case-studies': {
    collection: 'case-studies',
    label: 'Dự án tiêu biểu',
    hint: 'Bằng chứng năng lực — dùng khi khách hỏi "đã làm cho ai", "kết quả thế nào".',
    select: {
      brand: true, slug: true, partner: true, industry: true, summary: true,
      kpi: true, kpiLabel: true, problem: true, solution: true, results: true,
      coCreateSteps: true, testimonial: true, tags: true, featured: true,
      order: true, updatedAt: true,
    },
    searchFields: ['brand', 'summary', 'partner'],
    sort: 'order',
    path: '/case-study',
    shape: (d) => ({
      id: d.id,
      slug: str(d.slug),
      brand: str(d.brand),
      partner: str(d.partner),
      industry: str(d.industry),
      summary: str(d.summary),
      kpi: str(d.kpi),
      kpiLabel: str(d.kpiLabel),
      problem: str(d.problem),
      solution: str(d.solution),
      results: strs(d.results),
      coCreateSteps: strs(d.coCreateSteps),
      testimonial: str(d.testimonial),
      tags: strs(d.tags),
      featured: Boolean(d.featured),
      updatedAt: d.updatedAt,
    }),
    text: (i) =>
      `### ${i.brand}\n` +
      line('Ngành hàng', i.industry) +
      line('Đối tác / Công nghệ', i.partner) +
      line('Tóm tắt', i.summary) +
      line('Chỉ số nổi bật', [i.kpi, i.kpiLabel].filter(Boolean).join(' — ')) +
      line('Vấn đề', i.problem) +
      line('Giải pháp', i.solution) +
      line('Kết quả', i.results) +
      line('Các bước đồng kiến tạo', i.coCreateSteps) +
      line('Cảm nhận', i.testimonial) +
      line('Thẻ', i.tags),
  },

  technologies: {
    collection: 'technologies',
    label: 'Công nghệ',
    hint: 'Công nghệ Bioscope áp dụng và cơ chế hoạt động.',
    select: { name: true, slug: true, tagline: true, description: true, mechanism: true, order: true, updatedAt: true },
    searchFields: ['name', 'tagline'],
    sort: 'order',
    path: '/cong-nghe',
    shape: (d) => ({
      id: d.id,
      slug: str(d.slug),
      name: str(d.name),
      tagline: str(d.tagline),
      description: rich(d.description),
      mechanism: rich(d.mechanism),
      updatedAt: d.updatedAt,
    }),
    text: (i) =>
      `### ${i.name}\n` +
      line('Tagline', i.tagline) +
      (i.description ? `Mô tả: ${i.description}\n` : '') +
      (i.mechanism ? `Cơ chế: ${i.mechanism}\n` : ''),
  },

  certifications: {
    collection: 'certifications',
    label: 'Chứng nhận & năng lực',
    hint: 'Chứng nhận, con số năng lực (GMP, số dự án R&D…).',
    select: { title: true, kind: true, value: true, suffix: true, order: true, updatedAt: true },
    searchFields: ['title'],
    sort: 'order',
    shape: (d) => ({
      id: d.id,
      title: str(d.title),
      kind: str(d.kind),
      value: str(d.value),
      suffix: str(d.suffix),
      updatedAt: d.updatedAt,
    }),
    text: (i) => `### ${i.title}\n${line('Loại', i.kind)}${line('Giá trị', [i.value, i.suffix].filter(Boolean).join(' '))}`,
  },

  posts: {
    collection: 'posts',
    label: 'Bài viết',
    hint: 'Blog / tin tức. Nội dung dài, nên dùng khi khách hỏi kiến thức chuyên sâu.',
    select: {
      title: true, slug: true, excerpt: true, content: true,
      publishedAt: true, categories: true, tags: true, updatedAt: true,
    },
    searchFields: ['title', 'excerpt'],
    sort: '-publishedAt',
    path: '/tin-tuc',
    shape: (d) => ({
      id: d.id,
      slug: str(d.slug),
      title: str(d.title),
      excerpt: str(d.excerpt),
      content: rich(d.content, 6000),
      categories: relNames(d.categories),
      tags: relNames(d.tags),
      publishedAt: d.publishedAt ?? undefined,
      updatedAt: d.updatedAt,
    }),
    text: (i) =>
      `### ${i.title}\n` +
      line('Chuyên mục', i.categories) +
      line('Thẻ', i.tags) +
      line('Đăng ngày', typeof i.publishedAt === 'string' ? i.publishedAt.slice(0, 10) : undefined) +
      (i.excerpt ? `Tóm tắt: ${i.excerpt}\n` : '') +
      (i.content ? `Nội dung: ${i.content}\n` : ''),
  },

  pages: {
    collection: 'pages',
    label: 'Trang nội dung',
    hint: 'Trang giới thiệu, năng lực… Nội dung dựng bằng block nên trả về dạng chữ đã gom.',
    select: { title: true, slug: true, layout: true, updatedAt: true },
    searchFields: ['title'],
    sort: 'title',
    path: '',
    shape: (d) => ({
      id: d.id,
      slug: str(d.slug),
      title: str(d.title),
      body: blocksToText(d.layout).join('\n').slice(0, 6000) || undefined,
      updatedAt: d.updatedAt,
    }),
    text: (i) => `### ${i.title}\n${i.body ? `${i.body}\n` : ''}`,
  },

  'ingredient-categories': {
    collection: 'ingredient-categories',
    label: 'Danh mục nguyên liệu',
    hint: 'Cây danh mục để gợi ý khách duyệt theo nhóm.',
    select: { name: true, slug: true, updatedAt: true },
    searchFields: ['name'],
    sort: 'name',
    path: '/nguyen-lieu',
    shape: (d) => ({
      id: d.id,
      slug: str(d.slug),
      name: str(d.name),
      updatedAt: d.updatedAt,
    }),
    text: (i) => `### ${i.name}\n`,
  },

  partners: {
    collection: 'partners',
    label: 'Đối tác',
    hint: 'Nhà cung cấp / đối tác công nghệ của Bioscope.',
    // Collection này chỉ có name/country/logo/website — không có trường mô tả.
    select: { name: true, country: true, website: true, updatedAt: true },
    searchFields: ['name'],
    sort: 'name',
    shape: (d) => ({
      id: d.id,
      name: str(d.name),
      country: str(d.country),
      website: str(d.website),
      updatedAt: d.updatedAt,
    }),
    text: (i) => `### ${i.name}\n${line('Quốc gia', i.country)}${line('Website', i.website)}`,
  },
}

/**
 * Collection TUYỆT ĐỐI không được có mặt trong REGISTRY.
 *
 * Danh sách trắng ở trên đã đủ chặn về mặt kỹ thuật; bảng này là chốt chặn thứ
 * hai cho con người — ai đó thêm nhầm vào REGISTRY thì máy chủ không khởi động
 * được, thay vì âm thầm rò rỉ dữ liệu lên mạng.
 */
const NEVER_EXPOSE = new Set([
  'users', 'members', 'chat-conversations', 'chat-messages', 'api-keys',
  'audit-logs', 'security-events', 'blocked-ips', 'consent-log',
  'form-submissions', 'forms', 'gated-documents', 'staff-roles',
  'drive-sync-jobs', 'cms-sync-runs', 'ai-generate-jobs', 'duplicate-scans',
  'redirects', 'languages', 'media',
  'content-type-definitions', 'taxonomy-definitions', 'field-groups',
])
for (const [type, e] of Object.entries(REGISTRY)) {
  if (NEVER_EXPOSE.has(e.collection)) {
    throw new Error(
      `[catalog/content] Collection "${e.collection}" (kiểu "${type}") nằm trong danh sách cấm ` +
        `nhưng lại được khai báo trong REGISTRY. Đây là dữ liệu nội bộ hoặc dữ liệu cá nhân — không được xuất ra API.`,
    )
  }
}

const urlOf = (e: Entry, i: Doc): string | undefined =>
  e.path !== undefined && i.slug ? `${SITE}${e.path}/${i.slug}`.replace(/([^:])\/\//g, '$1/') : undefined

// ── GET /api/catalog/content ─────────────────────────────────────────────────
const typesEndpoint: Endpoint = {
  path: '/catalog/content',
  method: 'get',
  handler: guarded(async () => {
    const types = Object.entries(REGISTRY).map(([type, e]) => ({
      type,
      label: e.label,
      hint: e.hint,
      endpoint: `/catalog/content/${type}`,
    }))
    return json({ ok: true, count: types.length, types })
  }, 'content'),
}

// ── GET /api/catalog/content/:type ───────────────────────────────────────────
const listEndpoint: Endpoint = {
  path: '/catalog/content/:type',
  method: 'get',
  handler: guarded(async (req) => {
    const type = String((req.routeParams as Doc | undefined)?.type ?? '')
    const entry = REGISTRY[type]
    if (!entry) {
      return json(
        { ok: false, error: `Không có loại nội dung "${type}". Gọi /catalog/content để xem danh sách.` },
        404,
      )
    }

    const locale = okLocale(req.query?.locale)
    const limit = clampLimit(req.query?.limit, 25, 100)
    const page = clampLimit(req.query?.page, 1, 10_000)
    const q = String(req.query?.q ?? '').trim().slice(0, 200)

    const where: Where = {}
    if (q) {
      Object.assign(where, { or: entry.searchFields.map((f) => ({ [f]: { like: q } })) })
    }
    const since = String(req.query?.updatedSince ?? '').trim()
    if (since && !Number.isNaN(Date.parse(since))) {
      Object.assign(where, { updatedAt: { greater_than: new Date(since).toISOString() } })
    }

    const res = await req.payload.find({
      collection: entry.collection as 'faqs',
      where,
      limit,
      page,
      depth: 1,
      locale: locale as 'vi',
      sort: entry.sort,
      overrideAccess: false, // ← lớp 1: chỉ bản đã xuất bản
      select: entry.select as never, // ← lớp 2
    })

    const items = res.docs.map((d) => {
      const i = entry.shape(d as Doc) // ← lớp 3
      const url = urlOf(entry, i)
      return url ? { ...i, url } : i
    })
    const meta = { type, total: res.totalDocs, page: res.page, totalPages: res.totalPages, hasNextPage: res.hasNextPage }

    if (String(req.query?.format ?? '') === 'text') {
      const text = items
        .map((i) => entry.text(i) + (i.url ? `Link: ${i.url}\n` : ''))
        .join('\n')
      return json({ ok: true, ...meta, count: items.length, text })
    }
    return json({ ok: true, ...meta, count: items.length, items })
  }, 'content'),
}

// ── GET /api/catalog/content/:type/:key ──────────────────────────────────────
const detailEndpoint: Endpoint = {
  path: '/catalog/content/:type/:key',
  method: 'get',
  handler: guarded(async (req) => {
    const params = (req.routeParams ?? {}) as Doc
    const type = String(params.type ?? '')
    const key = String(params.key ?? '')
    const entry = REGISTRY[type]
    if (!entry) return json({ ok: false, error: `Không có loại nội dung "${type}".` }, 404)

    const locale = okLocale(req.query?.locale)
    // Có collection dùng slug, có collection chỉ có id — nhận cả hai để bên gọi
    // không phải nhớ cái nào dùng kiểu nào.
    const where: Where = /^\d+$/.test(key)
      ? { id: { equals: Number(key) } }
      : { slug: { equals: key } }

    const res = await req.payload.find({
      collection: entry.collection as 'faqs',
      where,
      limit: 1,
      depth: 1,
      locale: locale as 'vi',
      overrideAccess: false,
      select: entry.select as never,
    })
    if (!res.docs.length) return json({ ok: false, error: 'Không tìm thấy.' }, 404)

    const item = entry.shape(res.docs[0] as Doc)
    const url = urlOf(entry, item)
    const full = url ? { ...item, url } : item
    if (String(req.query?.format ?? '') === 'text') {
      return json({ ok: true, type, text: entry.text(full) + (url ? `Link: ${url}\n` : '') })
    }
    return json({ ok: true, type, item: full })
  }, 'content'),
}

// ── GET /api/catalog/site ────────────────────────────────────────────────────
/**
 * Thông tin doanh nghiệp cho chatbot trả lời "địa chỉ ở đâu", "gọi số nào".
 *
 * CHỈ lấy đúng các ô liên hệ công khai — global Cài đặt website còn chứa mã
 * theo dõi GA4/GTM/Pixel và cờ bật/tắt module, không được lọt ra ngoài.
 */
const siteEndpoint: Endpoint = {
  path: '/catalog/site',
  method: 'get',
  handler: guarded(async (req) => {
    const locale = okLocale(req.query?.locale)
    const g = (await req.payload.findGlobal({
      slug: 'site-settings',
      depth: 1,
      locale: locale as 'vi',
      overrideAccess: false,
    })) as unknown as Doc

    const c = (g.contact ?? {}) as Doc
    const social = Array.isArray(g.social)
      ? (g.social as Doc[]).map((s) => ({ platform: str(s.platform), url: str(s.url) })).filter((s) => s.url)
      : []

    const site = {
      siteName: str(g.siteName),
      companyName: str(c.companyName),
      tagline: str(c.tagline),
      taxCode: str(c.mst),
      phone: str(c.phone),
      email: str(c.email),
      address: str(c.address),
      officeAddress: str(c.officeAddress),
      website: str(c.website) ?? SITE,
      social,
    }

    if (String(req.query?.format ?? '') === 'text') {
      const text =
        `### ${site.companyName ?? site.siteName ?? 'Bioscope'}\n` +
        line('Slogan', site.tagline) +
        line('Mã số thuế', site.taxCode) +
        line('Điện thoại', site.phone) +
        line('Email', site.email) +
        line('Địa chỉ', site.address) +
        line('Văn phòng', site.officeAddress) +
        line('Website', site.website) +
        line('Mạng xã hội', social.map((s) => `${s.platform}: ${s.url}`))
      return json({ ok: true, text })
    }
    return json({ ok: true, site })
  }, 'site'),
}

export const contentEndpoints: Endpoint[] = [
  typesEndpoint,
  siteEndpoint, // đặt TRƯỚC /catalog/content/:type để không bị nuốt mất
  listEndpoint,
  detailEndpoint,
]

export const contentScopes: CatalogScope[] = ['content', 'site']
