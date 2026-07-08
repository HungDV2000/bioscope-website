import type { GlobalConfig, Field } from 'payload'
import { anyone, isAdminOrEditor } from '@dv/cms-core'

/** Ping the frontend to revalidate the home route right after an edit. */
async function revalidateHome() {
  const base = process.env.FRONTEND_URL
  const secret = process.env.REVALIDATE_SECRET
  if (!base) return
  const url = `${base}/api/revalidate?secret=${encodeURIComponent(secret ?? '')}&path=${encodeURIComponent('/')}`
  try {
    await fetch(url, { method: 'POST' })
  } catch {
    /* frontend may be offline in dev */
  }
}

/** Localized single-line text. */
const T = (name: string, label?: Record<string, string>): Field => ({
  name,
  type: 'text',
  localized: true,
  ...(label ? { label } : {}),
})
/** Localized multi-line text. */
const A = (name: string, label?: Record<string, string>): Field => ({
  name,
  type: 'textarea',
  localized: true,
  ...(label ? { label } : {}),
})
/** Localized list of short strings (returns string[]). */
const LIST = (name: string, label?: Record<string, string>): Field => ({
  name,
  type: 'text',
  hasMany: true,
  localized: true,
  ...(label ? { label } : {}),
})
const group = (name: string, label: Record<string, string>, fields: Field[]): Field => ({
  name,
  type: 'group',
  label,
  fields,
})

/**
 * Home page content. Mirrors the frontend `messages.home` shape 1:1 so the
 * site can render the home page straight from the CMS (with static i18n as
 * fallback). All copy is localized (vi / en).
 */
export const Home: GlobalConfig = {
  slug: 'home',
  label: { en: 'Home page', vi: 'Trang chủ' },
  // Hidden: the home page is now composed in Pages (home blocks) + Site
  // Settings → homePage. The global stays registered so its DB tables are
  // kept (dropping them would require an interactive dev-push confirmation).
  admin: {
    group: 'Bioscope',
    hidden: true,
    description: { en: 'Home page content (all sections).', vi: 'Nội dung trang chủ (tất cả section).' },
  },
  access: { read: anyone, update: isAdminOrEditor },
  hooks: { afterChange: [async () => revalidateHome()] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: { en: 'Hero', vi: 'Hero' },
          fields: [
            group('hero', { en: 'Hero', vi: 'Hero' }, [
              T('eyebrow'),
              T('titleBefore'), T('titleHighlight'), T('titleMid'), T('titleAccent'),
              A('description'),
              T('ctaPrimary'), T('ctaSecondary'),
              LIST('trust', { en: 'Trust badges', vi: 'Nhãn tin cậy' }),
              { name: 'bannerImage', type: 'upload', relationTo: 'media', label: { en: 'Banner image', vi: 'Ảnh banner' } },
            ]),
          ],
        },
        {
          label: { en: 'Brands & Process', vi: 'Thương hiệu & Quy trình' },
          fields: [
            group('brands', { en: 'Brands strip', vi: 'Dải thương hiệu' }, [
              T('title'),
              LIST('categories', { en: 'Category chips', vi: 'Chip danh mục' }),
            ]),
            group('process', { en: 'Process', vi: 'Quy trình' }, [
              T('title'), A('description'),
              {
                name: 'steps', type: 'array', label: { en: 'Steps', vi: 'Các bước' },
                fields: [T('title', { en: 'Title', vi: 'Tiêu đề' }), A('desc', { en: 'Description', vi: 'Mô tả' })],
              },
            ]),
          ],
        },
        {
          label: { en: 'Categories', vi: 'Danh mục' },
          fields: [
            group('categories', { en: 'Ingredient categories', vi: 'Danh mục nguyên liệu' }, [
              T('title'), A('description'), T('viewAll'),
              group('featured', { en: 'Featured card', vi: 'Thẻ nổi bật' }, [T('name'), A('desc'), T('cta')]),
              {
                name: 'items', type: 'array', label: { en: 'Cards', vi: 'Thẻ' },
                fields: [T('name', { en: 'Name', vi: 'Tên' }), A('desc', { en: 'Description', vi: 'Mô tả' })],
              },
            ]),
          ],
        },
        {
          label: { en: 'Certifications & Case studies', vi: 'Chứng nhận & Case study' },
          fields: [
            group('certifications', { en: 'Certifications', vi: 'Chứng nhận' }, [
              T('title'), A('description'), T('countries'),
              {
                name: 'items', type: 'array', label: { en: 'Items', vi: 'Mục' },
                fields: [T('name', { en: 'Name', vi: 'Tên' }), T('sub', { en: 'Subtitle', vi: 'Phụ đề' })],
              },
            ]),
            group('caseStudies', { en: 'Case studies strip', vi: 'Dải case study' }, [T('title'), T('viewAll')]),
          ],
        },
        {
          label: { en: 'Experts', vi: 'Chuyên gia' },
          fields: [
            group('experts', { en: 'Experts', vi: 'Đội ngũ chuyên gia' }, [
              T('eyebrow'), T('title'),
              LIST('paragraphs', { en: 'Paragraphs', vi: 'Đoạn văn' }),
              T('cta'), T('imageAlt'),
              {
                name: 'stats', type: 'array', label: { en: 'Stats (labels)', vi: 'Chỉ số (nhãn)' },
                admin: { description: { en: 'Numbers are fixed in the design; edit labels only.', vi: 'Số cố định theo thiết kế; chỉ sửa nhãn.' } },
                fields: [T('label', { en: 'Label', vi: 'Nhãn' })],
              },
            ]),
          ],
        },
        {
          label: { en: 'AI promo & CTA', vi: 'Quảng bá AI & CTA' },
          fields: [
            group('aiChat', { en: 'AI chat promo', vi: 'Quảng bá AI chat' }, [
              T('badge'), T('titleBefore'), T('titleHighlight'), A('description'),
              LIST('features', { en: 'Features', vi: 'Tính năng' }),
              T('cta'), T('ctaHref'),
              T('chatName'), T('chatStatus'), T('typing'),
              LIST('suggestions', { en: 'Suggestion chips', vi: 'Chip gợi ý' }),
              T('demoUser'), A('demoAi1'), A('demoAi2'), A('replyAntiAging'), A('replyOmega3'),
            ]),
            group('cta', { en: 'Closing CTA', vi: 'CTA cuối trang' }, [
              T('title'), A('description'), T('primary'), T('secondary'),
            ]),
          ],
        },
      ],
    },
  ],
}
