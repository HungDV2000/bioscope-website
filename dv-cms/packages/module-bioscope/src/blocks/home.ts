import type { Block, Field } from 'payload'

/** Localized single-line text. */
const T = (name: string, label?: Record<string, string>): Field => ({ name, type: 'text', localized: true, ...(label ? { label } : {}) })
/** Localized multi-line text. */
const A = (name: string, label?: Record<string, string>): Field => ({ name, type: 'textarea', localized: true, ...(label ? { label } : {}) })
/** Localized richText (Word-like styling: bold/italic/lists/links). */
const R = (name: string, label?: Record<string, string>): Field => ({ name, type: 'richText', localized: true, ...(label ? { label } : {}) })
/** Localized list of short strings (returns string[]). */
const LIST = (name: string, label?: Record<string, string>): Field => ({ name, type: 'text', hasMany: true, localized: true, ...(label ? { label } : {}) })
/** Image upload (not localized). */
const IMG = (name = 'image', label?: Record<string, string>): Field => ({ name, type: 'upload', relationTo: 'media', ...(label ? { label } : {}) })
/** Relationship to an ingredient category (for "link to category"). */
const CAT = (name = 'category', label?: Record<string, string>): Field => ({
  name,
  type: 'relationship',
  relationTo: 'ingredient-categories',
  ...(label ? { label } : {}),
  admin: { description: { en: 'Link this card to an ingredient category.', vi: 'Liên kết thẻ này tới một danh mục nguyên liệu.' } },
})

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
      R('description'),
      {
        type: 'row',
        fields: [
          T('ctaPrimary', { en: 'Primary CTA label', vi: 'Nút chính - chữ' }),
          { name: 'ctaPrimaryHref', type: 'text', label: { en: 'Primary CTA link', vi: 'Nút chính - link' }, admin: { description: { en: 'e.g. /nguyen-lieu or https://…', vi: 'VD: /nguyen-lieu hoặc https://…' } } },
        ],
      },
      {
        type: 'row',
        fields: [
          T('ctaSecondary', { en: 'Secondary CTA label', vi: 'Nút phụ - chữ' }),
          { name: 'ctaSecondaryHref', type: 'text', label: { en: 'Secondary CTA link', vi: 'Nút phụ - link' }, admin: { description: { en: 'e.g. /dong-kien-tao', vi: 'VD: /dong-kien-tao' } } },
        ],
      },
      LIST('trust', { en: 'Trust badges', vi: 'Nhãn tin cậy' }),
      IMG('image', { en: 'Hero image', vi: 'Ảnh Hero' }),
      {
        name: 'video',
        type: 'upload',
        relationTo: 'media',
        label: { en: 'Background video (optional)', vi: 'Video nền (tùy chọn)' },
        filterOptions: { mimeType: { contains: 'video' } },
        admin: { description: { en: 'If set, plays as the hero background instead of the image.', vi: 'Nếu có, phát làm nền Hero thay cho ảnh.' } },
      },
    ],
  },
  {
    slug: 'homeBrands',
    interfaceName: 'HomeBrandsBlock',
    labels: { singular: { en: 'Brands strip', vi: 'Dải thương hiệu' }, plural: { en: 'Brands strip', vi: 'Dải thương hiệu' } },
    fields: [
      T('title'),
      {
        name: 'categories',
        type: 'relationship',
        relationTo: 'ingredient-categories',
        hasMany: true,
        label: { en: 'Category chips (from collection)', vi: 'Chip danh mục (lấy từ collection)' },
        admin: {
          description: {
            en: 'Search + select ingredient categories. Leave empty to use the custom chips below.',
            vi: 'Tìm + chọn danh mục nguyên liệu. Để trống nếu muốn dùng danh sách chip tự nhập bên dưới.',
          },
        },
      },
      {
        name: 'customChips',
        type: 'array',
        label: { en: 'Custom chips', vi: 'Chip tự nhập' },
        admin: {
          description: {
            en: 'Full control over the chip strip: label, icon and link. Used when no categories are selected above.',
            vi: 'Tự quyết định dải chip: nhãn, icon và liên kết. Dùng khi ở trên không chọn danh mục nào.',
          },
        },
        fields: [
          T('label', { en: 'Label', vi: 'Nhãn hiển thị' }),
          {
            name: 'icon',
            type: 'select',
            label: { en: 'Icon', vi: 'Biểu tượng' },
            defaultValue: 'sprout',
            options: [
              { label: { en: 'Sprout (leafy)', vi: 'Mầm cây' }, value: 'sprout' },
              { label: { en: 'Sparkles (cosmetic)', vi: 'Lấp lánh (mỹ phẩm)' }, value: 'sparkles' },
              { label: { en: 'Leaf (botanical)', vi: 'Lá (thực vật)' }, value: 'leaf' },
              { label: { en: 'Flask (lab)', vi: 'Bình thí nghiệm' }, value: 'flask' },
              { label: { en: 'Heart pulse (health)', vi: 'Nhịp tim (sức khoẻ)' }, value: 'heart' },
              { label: { en: 'Pill (pharma)', vi: 'Viên thuốc (dược)' }, value: 'pill' },
            ],
          },
          {
            name: 'href',
            type: 'text',
            label: { en: 'Link', vi: 'Liên kết' },
            admin: { description: { en: 'e.g. /nguyen-lieu?category=omega', vi: 'Ví dụ: /nguyen-lieu?category=omega' } },
          },
        ],
      },
      {
        name: 'logos',
        type: 'array',
        label: { en: 'Partner logos', vi: 'Logo đối tác' },
        admin: {
          description: {
            en: 'Logos shown in the scrolling strip. Leave empty to hide the strip.',
            vi: 'Logo hiển thị ở dải chạy. Để trống thì ẩn dải logo.',
          },
        },
        fields: [IMG('logo', { en: 'Logo', vi: 'Logo' }), { name: 'name', type: 'text', label: { en: 'Name', vi: 'Tên' } }],
      },
    ],
  },
  {
    slug: 'homeProcess',
    interfaceName: 'HomeProcessBlock',
    labels: { singular: { en: 'Process', vi: 'Quy trình' }, plural: { en: 'Process', vi: 'Quy trình' } },
    fields: [
      T('title'), R('description'),
      { name: 'steps', type: 'array', label: { en: 'Steps', vi: 'Các bước' }, fields: [T('title', { en: 'Title', vi: 'Tiêu đề' }), A('desc', { en: 'Description', vi: 'Mô tả' })] },
    ],
  },
  {
    slug: 'homeCategories',
    interfaceName: 'HomeCategoriesBlock',
    labels: { singular: { en: 'Ingredient categories', vi: 'Danh mục nguyên liệu' }, plural: { en: 'Ingredient categories', vi: 'Danh mục nguyên liệu' } },
    fields: [
      T('title'), R('description'), T('viewAll'),
      { name: 'featured', type: 'group', label: { en: 'Featured card', vi: 'Thẻ nổi bật' }, fields: [T('name'), A('desc'), T('cta'), IMG('image', { en: 'Image', vi: 'Ảnh' }), CAT()] },
      { name: 'items', type: 'array', label: { en: 'Cards', vi: 'Thẻ' }, fields: [T('name', { en: 'Name', vi: 'Tên' }), A('desc', { en: 'Description', vi: 'Mô tả' }), IMG('image', { en: 'Image', vi: 'Ảnh' }), CAT()] },
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
      T('title'), R('description'), T('countries'),
      { name: 'items', type: 'array', label: { en: 'Items', vi: 'Mục' }, fields: [T('name', { en: 'Name', vi: 'Tên' }), T('sub', { en: 'Subtitle', vi: 'Phụ đề' }), IMG('logo', { en: 'Logo', vi: 'Logo' })] },
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
      IMG('image', { en: 'Team image', vi: 'Ảnh đội ngũ' }),
      { name: 'stats', type: 'array', label: { en: 'Stats (labels)', vi: 'Chỉ số (nhãn)' }, admin: { description: { en: 'Numbers are fixed in the design; edit labels only.', vi: 'Số cố định theo thiết kế; chỉ sửa nhãn.' } }, fields: [T('label', { en: 'Label', vi: 'Nhãn' })] },
    ],
  },
  {
    slug: 'homeAiPromo',
    interfaceName: 'HomeAiPromoBlock',
    labels: { singular: { en: 'AI chat promo', vi: 'Quảng bá AI chat' }, plural: { en: 'AI chat promo', vi: 'Quảng bá AI chat' } },
    fields: [
      T('badge'), T('titleBefore'), T('titleHighlight'), R('description'),
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
    fields: [T('title'), R('description'), T('primary'), T('secondary'), IMG('image', { en: 'Background image', vi: 'Ảnh nền' })],
  },
]

export const HOME_BLOCK_SLUGS = HOME_BLOCKS.map((b) => b.slug)
