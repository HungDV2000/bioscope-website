import type { Block, Field } from 'payload'

/**
 * Section blocks for the static (non-home) pages — About, Solutions, etc.
 * Field names mirror the frontend i18n shape (messages.<page>.<section>) so the
 * page can overlay CMS values onto the static fallback, exactly like the home
 * blocks. Added to the Pages `layout` field by bioscopePlugin.
 */

const T = (name: string, label?: Record<string, string>): Field => ({ name, type: 'text', localized: true, ...(label ? { label } : {}) })
const A = (name: string, label?: Record<string, string>): Field => ({ name, type: 'textarea', localized: true, ...(label ? { label } : {}) })
const LIST = (name: string, label?: Record<string, string>): Field => ({ name, type: 'text', hasMany: true, localized: true, ...(label ? { label } : {}) })

// ── About page ─────────────────────────────────────────────────────────────

export const AboutMissionBlock: Block = {
  slug: 'aboutMission',
  interfaceName: 'AboutMissionBlock',
  labels: { singular: { en: 'About · Mission', vi: 'Về chúng tôi · Sứ mệnh' }, plural: { en: 'About · Mission', vi: 'Về chúng tôi · Sứ mệnh' } },
  fields: [
    {
      name: 'mission',
      type: 'array',
      label: { en: 'Mission cards (3)', vi: 'Thẻ sứ mệnh (3)' },
      admin: { description: { en: 'The three mission cards.', vi: 'Ba thẻ sứ mệnh.' } },
      fields: [T('title', { en: 'Title', vi: 'Tiêu đề' }), A('desc', { en: 'Description', vi: 'Mô tả' })],
    },
  ],
}

export const AboutDifferentiationBlock: Block = {
  slug: 'aboutDifferentiation',
  interfaceName: 'AboutDifferentiationBlock',
  labels: { singular: { en: 'About · Differentiation', vi: 'Về chúng tôi · Khác biệt' }, plural: { en: 'About · Differentiation', vi: 'Về chúng tôi · Khác biệt' } },
  fields: [
    T('eyebrow'),
    LIST('bullets', { en: 'Bullets', vi: 'Gạch đầu dòng' }),
    A('quote'), T('quoteHighlight'), A('quoteAfter'),
    T('company'), T('companyRole'),
  ],
}

export const AboutJourneyBlock: Block = {
  slug: 'aboutJourney',
  interfaceName: 'AboutJourneyBlock',
  labels: { singular: { en: 'About · Journey', vi: 'Về chúng tôi · Hành trình' }, plural: { en: 'About · Journey', vi: 'Về chúng tôi · Hành trình' } },
  fields: [
    T('eyebrow'), T('title'), T('subtitle'), A('description'),
    { name: 'stats', type: 'array', label: { en: 'Stats (labels)', vi: 'Chỉ số (nhãn)' }, fields: [T('label', { en: 'Label', vi: 'Nhãn' })] },
    T('highlight'), T('highlightBold'),
  ],
}

export const AboutPartnersBlock: Block = {
  slug: 'aboutPartners',
  interfaceName: 'AboutPartnersBlock',
  labels: { singular: { en: 'About · Partners', vi: 'Về chúng tôi · Đối tác' }, plural: { en: 'About · Partners', vi: 'Về chúng tôi · Đối tác' } },
  fields: [T('eyebrow'), T('title'), A('description')],
}

export const AboutValuesBlock: Block = {
  slug: 'aboutValues',
  interfaceName: 'AboutValuesBlock',
  labels: { singular: { en: 'About · Core values', vi: 'Về chúng tôi · Giá trị cốt lõi' }, plural: { en: 'About · Core values', vi: 'Về chúng tôi · Giá trị cốt lõi' } },
  fields: [
    T('eyebrow'), T('title'),
    { name: 'items', type: 'array', label: { en: 'Values', vi: 'Giá trị' }, fields: [T('title', { en: 'Title', vi: 'Tiêu đề' }), A('desc', { en: 'Description', vi: 'Mô tả' })] },
  ],
}

export const AboutProcessBlock: Block = {
  slug: 'aboutProcess',
  interfaceName: 'AboutProcessBlock',
  labels: { singular: { en: 'About · Product process', vi: 'Về chúng tôi · Quy trình' }, plural: { en: 'About · Product process', vi: 'Về chúng tôi · Quy trình' } },
  fields: [
    T('eyebrow'), T('title'), A('description'), T('imageAlt'),
    { name: 'image', type: 'upload', relationTo: 'media', label: { en: 'Process image', vi: 'Ảnh quy trình' } },
    { name: 'steps', type: 'array', label: { en: 'Steps', vi: 'Các bước' }, fields: [T('title', { en: 'Title', vi: 'Tiêu đề' }), A('desc', { en: 'Description', vi: 'Mô tả' })] },
  ],
}

export const AboutTimelineBlock: Block = {
  slug: 'aboutTimeline',
  interfaceName: 'AboutTimelineBlock',
  labels: { singular: { en: 'About · Timeline', vi: 'Về chúng tôi · Dòng thời gian' }, plural: { en: 'About · Timeline', vi: 'Về chúng tôi · Dòng thời gian' } },
  fields: [
    { name: 'items', type: 'array', label: { en: 'Milestones', vi: 'Cột mốc' }, fields: [T('year', { en: 'Year', vi: 'Năm' }), A('text', { en: 'Text', vi: 'Nội dung' })] },
  ],
}

// ── Solutions page ───────────────────────────────────────────────────────

export const SolutionsIntroBlock: Block = {
  slug: 'solutionsIntro',
  interfaceName: 'SolutionsIntroBlock',
  labels: { singular: { en: 'Solutions · Intro (ICP)', vi: 'Giải pháp · Mở đầu (ICP)' }, plural: { en: 'Solutions · Intro (ICP)', vi: 'Giải pháp · Mở đầu (ICP)' } },
  fields: [
    T('icpTitle', { en: 'Section title', vi: 'Tiêu đề mục' }),
    A('icpDesc', { en: 'Section description', vi: 'Mô tả mục' }),
    {
      name: 'icp',
      type: 'array',
      label: { en: 'ICP cards', vi: 'Thẻ ICP' },
      admin: { description: { en: 'Order must match the design; the target solution link is kept from config.', vi: 'Thứ tự phải khớp thiết kế; link tới giải pháp giữ theo cấu hình.' } },
      fields: [T('priority', { en: 'Priority label', vi: 'Nhãn ưu tiên' }), T('title', { en: 'Title', vi: 'Tiêu đề' }), A('desc', { en: 'Description', vi: 'Mô tả' })],
    },
  ],
}

export const SolutionsListBlock: Block = {
  slug: 'solutionsList',
  interfaceName: 'SolutionsListBlock',
  labels: { singular: { en: 'Solutions · Cards', vi: 'Giải pháp · Thẻ' }, plural: { en: 'Solutions · Cards', vi: 'Giải pháp · Thẻ' } },
  fields: [
    {
      name: 'items',
      type: 'array',
      label: { en: 'Solution cards', vi: 'Thẻ giải pháp' },
      admin: { description: { en: 'Order must match the design; slug/route is kept from config.', vi: 'Thứ tự phải khớp thiết kế; slug/route giữ theo cấu hình.' } },
      fields: [
        T('title', { en: 'Title', vi: 'Tiêu đề' }),
        A('forWho', { en: 'For whom', vi: 'Dành cho ai' }),
        LIST('receive', { en: 'What you receive', vi: 'Bạn nhận được' }),
        T('cta', { en: 'CTA label', vi: 'Nhãn nút' }),
      ],
    },
  ],
}

// ── Co-create page ───────────────────────────────────────────────────────

export const CoCreateCompareBlock: Block = {
  slug: 'coCreateCompare',
  interfaceName: 'CoCreateCompareBlock',
  labels: { singular: { en: 'Co-create · Comparison', vi: 'Đồng kiến tạo · So sánh' }, plural: { en: 'Co-create · Comparison', vi: 'Đồng kiến tạo · So sánh' } },
  fields: [
    T('compareTitle', { en: 'Title', vi: 'Tiêu đề' }), A('compareDesc', { en: 'Description', vi: 'Mô tả' }),
    T('traditionalTitle', { en: 'Traditional column title', vi: 'Tiêu đề cột truyền thống' }),
    LIST('traditional', { en: 'Traditional points', vi: 'Ý truyền thống' }),
    T('bioscopeTitle', { en: 'Bioscope column title', vi: 'Tiêu đề cột Bioscope' }),
    LIST('bioscope', { en: 'Bioscope points', vi: 'Ý Bioscope' }),
  ],
}

export const CoCreateJourneyBlock: Block = {
  slug: 'coCreateJourney',
  interfaceName: 'CoCreateJourneyBlock',
  labels: { singular: { en: 'Co-create · Journey', vi: 'Đồng kiến tạo · Hành trình' }, plural: { en: 'Co-create · Journey', vi: 'Đồng kiến tạo · Hành trình' } },
  fields: [
    T('stepLabel', { en: 'Step label prefix', vi: 'Tiền tố nhãn bước' }),
    { name: 'journey', type: 'array', label: { en: 'Steps (5)', vi: 'Các bước (5)' }, fields: [T('title', { en: 'Title', vi: 'Tiêu đề' }), A('desc', { en: 'Description', vi: 'Mô tả' }), T('duration', { en: 'Duration badge', vi: 'Nhãn thời lượng' })] },
  ],
}

export const CoCreateCasesBlock: Block = {
  slug: 'coCreateCases',
  interfaceName: 'CoCreateCasesBlock',
  labels: { singular: { en: 'Co-create · Cases heading', vi: 'Đồng kiến tạo · Tiêu đề case' }, plural: { en: 'Co-create · Cases heading', vi: 'Đồng kiến tạo · Tiêu đề case' } },
  fields: [T('casesTitle', { en: 'Title', vi: 'Tiêu đề' }), A('casesDesc', { en: 'Description', vi: 'Mô tả' }), T('readCase', { en: 'Read case label', vi: 'Nhãn xem case' })],
}

// ── R&D page ─────────────────────────────────────────────────────────────

export const RdContentBlock: Block = {
  slug: 'rdContent',
  interfaceName: 'RdContentBlock',
  labels: { singular: { en: 'R&D · Content', vi: 'R&D · Nội dung' }, plural: { en: 'R&D · Content', vi: 'R&D · Nội dung' } },
  fields: [
    { name: 'stats', type: 'array', label: { en: 'Stat labels', vi: 'Nhãn chỉ số' }, admin: { description: { en: 'Numbers are fixed; edit labels only.', vi: 'Số cố định; chỉ sửa nhãn.' } }, fields: [T('label', { en: 'Label', vi: 'Nhãn' })] },
    T('techTitle', { en: 'Technologies title', vi: 'Tiêu đề công nghệ' }),
    T('researchTitle', { en: 'Research title', vi: 'Tiêu đề nghiên cứu' }), A('researchDesc', { en: 'Research description', vi: 'Mô tả nghiên cứu' }),
    LIST('researchAreas', { en: 'Research areas', vi: 'Lĩnh vực nghiên cứu' }),
    T('partnersTitle', { en: 'Partners title', vi: 'Tiêu đề đối tác' }), A('partnersDesc', { en: 'Partners description', vi: 'Mô tả đối tác' }),
    T('papersTitle', { en: 'Papers title', vi: 'Tiêu đề tài liệu' }), A('papersDesc', { en: 'Papers description', vi: 'Mô tả tài liệu' }), T('gated', { en: 'Gated label', vi: 'Nhãn tài liệu bảo vệ' }),
    { name: 'papers', type: 'array', label: { en: 'Whitepapers', vi: 'Tài liệu' }, fields: [T('title', { en: 'Title', vi: 'Tiêu đề' }), T('type', { en: 'Type', vi: 'Loại' })] },
  ],
}

// ── Contact page ─────────────────────────────────────────────────────────

export const ContactInfoBlock: Block = {
  slug: 'contactInfo',
  interfaceName: 'ContactInfoBlock',
  labels: { singular: { en: 'Contact · Info', vi: 'Liên hệ · Thông tin' }, plural: { en: 'Contact · Info', vi: 'Liên hệ · Thông tin' } },
  fields: [
    T('quick', { en: 'Fast-response label', vi: 'Nhãn phản hồi nhanh' }),
    T('within', { en: 'Response time', vi: 'Thời gian phản hồi' }),
    T('office', { en: 'Office address', vi: 'Địa chỉ văn phòng' }),
    T('hotline', { en: 'Hotline', vi: 'Hotline' }),
    T('email', { en: 'Email', vi: 'Email' }),
    T('faqTitle', { en: 'FAQ title', vi: 'Tiêu đề FAQ' }),
    { name: 'faq', type: 'array', label: { en: 'FAQ', vi: 'Câu hỏi thường gặp' }, fields: [T('q', { en: 'Question', vi: 'Câu hỏi' }), A('a', { en: 'Answer', vi: 'Trả lời' })] },
  ],
}

/** All static-page section blocks, appended to the Pages layout. */
export const PAGE_BLOCKS: Block[] = [
  AboutMissionBlock,
  AboutDifferentiationBlock,
  AboutJourneyBlock,
  AboutPartnersBlock,
  AboutValuesBlock,
  AboutProcessBlock,
  AboutTimelineBlock,
  SolutionsIntroBlock,
  SolutionsListBlock,
  CoCreateCompareBlock,
  CoCreateJourneyBlock,
  CoCreateCasesBlock,
  RdContentBlock,
  ContactInfoBlock,
]

export const PAGE_BLOCK_SLUGS = PAGE_BLOCKS.map((b) => b.slug)
