import type { Block, Field } from 'payload'

/** Localized single-line text. */
const T = (name: string, label?: Record<string, string>): Field => ({ name, type: 'text', localized: true, ...(label ? { label } : {}) })
/** Localized multi-line text. */
const A = (name: string, label?: Record<string, string>): Field => ({ name, type: 'textarea', localized: true, ...(label ? { label } : {}) })
/** Localized list of short strings (returns string[]). */
const LIST = (name: string, label?: Record<string, string>): Field => ({ name, type: 'text', hasMany: true, localized: true, ...(label ? { label } : {}) })

/**
 * Home page section blocks — one per section of the real home design.
 * Field names mirror the frontend `messages.home.<section>` shape 1:1 so the
 * site renders each block straight through the matching React component.
 */
export const HOME_BLOCKS: Block[] = [
  {
    slug: 'homeHero',
    interfaceName: 'HomeHeroBlock',
    labels: { singular: { en: 'Hero', vi: 'Hero' }, plural: { en: 'Hero', vi: 'Hero' } },
    fields: [
      T('eyebrow'),
      T('titleBefore'), T('titleHighlight'), T('titleMid'), T('titleAccent'),
      A('description'),
      T('ctaPrimary'), T('ctaSecondary'),
      LIST('trust', { en: 'Trust badges', vi: 'Nhãn tin cậy' }),
    ],
  },
  {
    slug: 'homeBrands',
    interfaceName: 'HomeBrandsBlock',
    labels: { singular: { en: 'Brands strip', vi: 'Dải thương hiệu' }, plural: { en: 'Brands strip', vi: 'Dải thương hiệu' } },
    fields: [
      T('title'),
      LIST('categories', { en: 'Category chips', vi: 'Chip danh mục' }),
    ],
  },
  {
    slug: 'homeProcess',
    interfaceName: 'HomeProcessBlock',
    labels: { singular: { en: 'Process', vi: 'Quy trình' }, plural: { en: 'Process', vi: 'Quy trình' } },
    fields: [
      T('title'), A('description'),
      { name: 'steps', type: 'array', label: { en: 'Steps', vi: 'Các bước' }, fields: [T('title', { en: 'Title', vi: 'Tiêu đề' }), A('desc', { en: 'Description', vi: 'Mô tả' })] },
    ],
  },
  {
    slug: 'homeCategories',
    interfaceName: 'HomeCategoriesBlock',
    labels: { singular: { en: 'Ingredient categories', vi: 'Danh mục nguyên liệu' }, plural: { en: 'Ingredient categories', vi: 'Danh mục nguyên liệu' } },
    fields: [
      T('title'), A('description'), T('viewAll'),
      { name: 'featured', type: 'group', label: { en: 'Featured card', vi: 'Thẻ nổi bật' }, fields: [T('name'), A('desc'), T('cta')] },
      { name: 'items', type: 'array', label: { en: 'Cards', vi: 'Thẻ' }, fields: [T('name', { en: 'Name', vi: 'Tên' }), A('desc', { en: 'Description', vi: 'Mô tả' })] },
    ],
  },
  {
    slug: 'homeCaseStudies',
    interfaceName: 'HomeCaseStudiesBlock',
    labels: { singular: { en: 'Case studies strip', vi: 'Dải case study' }, plural: { en: 'Case studies strip', vi: 'Dải case study' } },
    fields: [T('title'), T('viewAll')],
  },
  {
    slug: 'homeCertifications',
    interfaceName: 'HomeCertificationsBlock',
    labels: { singular: { en: 'Certifications', vi: 'Chứng nhận' }, plural: { en: 'Certifications', vi: 'Chứng nhận' } },
    fields: [
      T('title'), A('description'), T('countries'),
      { name: 'items', type: 'array', label: { en: 'Items', vi: 'Mục' }, fields: [T('name', { en: 'Name', vi: 'Tên' }), T('sub', { en: 'Subtitle', vi: 'Phụ đề' })] },
    ],
  },
  {
    slug: 'homeExperts',
    interfaceName: 'HomeExpertsBlock',
    labels: { singular: { en: 'Experts', vi: 'Đội ngũ chuyên gia' }, plural: { en: 'Experts', vi: 'Đội ngũ chuyên gia' } },
    fields: [
      T('eyebrow'), T('title'),
      LIST('paragraphs', { en: 'Paragraphs', vi: 'Đoạn văn' }),
      T('cta'), T('imageAlt'),
      { name: 'stats', type: 'array', label: { en: 'Stats (labels)', vi: 'Chỉ số (nhãn)' }, admin: { description: { en: 'Numbers are fixed in the design; edit labels only.', vi: 'Số cố định theo thiết kế; chỉ sửa nhãn.' } }, fields: [T('label', { en: 'Label', vi: 'Nhãn' })] },
    ],
  },
  {
    slug: 'homeAiPromo',
    interfaceName: 'HomeAiPromoBlock',
    labels: { singular: { en: 'AI chat promo', vi: 'Quảng bá AI chat' }, plural: { en: 'AI chat promo', vi: 'Quảng bá AI chat' } },
    fields: [
      T('badge'), T('titleBefore'), T('titleHighlight'), A('description'),
      LIST('features', { en: 'Features', vi: 'Tính năng' }),
      T('cta'), T('ctaHref'),
      T('chatName'), T('chatStatus'), T('typing'),
      LIST('suggestions', { en: 'Suggestion chips', vi: 'Chip gợi ý' }),
      T('demoUser'), A('demoAi1'), A('demoAi2'), A('replyAntiAging'), A('replyOmega3'),
    ],
  },
  {
    slug: 'homeCta',
    interfaceName: 'HomeCtaBlock',
    labels: { singular: { en: 'Closing CTA', vi: 'CTA cuối trang' }, plural: { en: 'Closing CTA', vi: 'CTA cuối trang' } },
    fields: [T('title'), A('description'), T('primary'), T('secondary')],
  },
]

export const HOME_BLOCK_SLUGS = HOME_BLOCKS.map((b) => b.slug)
