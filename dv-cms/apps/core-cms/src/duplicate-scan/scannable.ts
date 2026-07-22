/**
 * Các loại nội dung có thể quét trùng lặp.
 *
 * Khai báo tường minh thay vì tự dò mọi collection: quét chỉ có nghĩa với những
 * collection có "tên" do người nhập, và mỗi loại lại có trường định danh riêng
 * (nguyên liệu có mã CAS, bài viết thì không).
 */
export type ScannableField = {
  /** Đường dẫn tới giá trị trong document, hỗ trợ lồng: 'technical.casNumber'. */
  path: string
  label: { en: string; vi: string }
  /** Trường có bản dịch theo ngôn ngữ hay không. */
  localized: boolean
}

export type Scannable = {
  slug: string
  label: { en: string; vi: string }
  /** Trường tên chính — luôn được so khớp. */
  nameField: ScannableField
  /** Trường định danh phụ, admin bật thêm nếu muốn. */
  extraFields: ScannableField[]
}

const NAME_VI: ScannableField = { path: 'name', label: { en: 'Name', vi: 'Tên' }, localized: true }
const TITLE_VI: ScannableField = { path: 'title', label: { en: 'Title', vi: 'Tiêu đề' }, localized: true }

export const SCANNABLE: Scannable[] = [
  {
    slug: 'ingredients',
    label: { en: 'Ingredients', vi: 'Nguyên liệu' },
    nameField: NAME_VI,
    extraFields: [
      { path: 'technical.casNumber', label: { en: 'CAS number', vi: 'Mã CAS' }, localized: false },
      { path: 'inci', label: { en: 'INCI', vi: 'INCI / tên khoa học' }, localized: true },
      { path: 'regulatory.registrationNo', label: { en: 'Registration no.', vi: 'Số công bố' }, localized: false },
      { path: 'externalId', label: { en: 'Internal code', vi: 'Mã nội bộ' }, localized: false },
    ],
  },
  { slug: 'technologies', label: { en: 'Technologies', vi: 'Công nghệ' }, nameField: NAME_VI, extraFields: [] },
  { slug: 'services', label: { en: 'Services', vi: 'Giải pháp' }, nameField: TITLE_VI, extraFields: [] },
  { slug: 'certifications', label: { en: 'Certifications', vi: 'Chứng nhận' }, nameField: NAME_VI, extraFields: [] },
  { slug: 'case-studies', label: { en: 'Case studies', vi: 'Case study' }, nameField: TITLE_VI, extraFields: [] },
  { slug: 'partners', label: { en: 'Partners', vi: 'Đối tác' }, nameField: NAME_VI, extraFields: [] },
  { slug: 'posts', label: { en: 'Posts', vi: 'Bài viết' }, nameField: TITLE_VI, extraFields: [] },
  { slug: 'pages', label: { en: 'Pages', vi: 'Trang' }, nameField: TITLE_VI, extraFields: [] },
  {
    slug: 'ingredient-categories',
    label: { en: 'Ingredient categories', vi: 'Danh mục nguyên liệu' },
    nameField: NAME_VI,
    extraFields: [],
  },
]

export function findScannable(slug: string): Scannable | undefined {
  return SCANNABLE.find((s) => s.slug === slug)
}

/** Đọc giá trị theo đường dẫn lồng, trả chuỗi rỗng nếu thiếu. */
export function readPath(doc: Record<string, unknown>, path: string): string {
  let cur: unknown = doc
  for (const part of path.split('.')) {
    if (cur == null || typeof cur !== 'object') return ''
    cur = (cur as Record<string, unknown>)[part]
  }
  if (cur == null) return ''
  // Trường localized có thể trả về object {vi,en} khi đọc với locale 'all'.
  if (typeof cur === 'object') {
    const o = cur as { vi?: unknown; en?: unknown }
    const v = typeof o.vi === 'string' ? o.vi : typeof o.en === 'string' ? o.en : ''
    return v
  }
  return String(cur)
}
