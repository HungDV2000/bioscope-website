import type { GlobalConfig, Field } from 'payload'
import { anyone, isAdminOrEditor } from '@dv/cms-core'

/** Ping the frontend to revalidate every route after an SEO settings change. */
async function revalidateAll() {
  const base = process.env.FRONTEND_URL
  const secret = process.env.REVALIDATE_SECRET
  if (!base) return
  try {
    await fetch(`${base}/api/revalidate?secret=${encodeURIComponent(secret ?? '')}&path=${encodeURIComponent('/')}`, {
      method: 'POST',
    })
  } catch {
    /* frontend may be offline in dev */
  }
}

const T = (name: string, label: Record<string, string>, admin?: Record<string, unknown>): Field => ({
  name,
  type: 'text',
  localized: true,
  label,
  ...(admin ? { admin } : {}),
})

/**
 * Yoast-style site-wide SEO configuration. Single source of truth for search
 * appearance, knowledge graph, indexing, sitemap and robots — editable by staff,
 * consumed by the frontend (metadata, robots.txt, sitemap.xml, JSON-LD).
 */
export const SeoSettings: GlobalConfig = {
  slug: 'seo-settings',
  label: { en: 'SEO', vi: 'SEO' },
  admin: {
    group: { en: 'SEO', vi: 'SEO' },
    description: { en: 'Site-wide search appearance & indexing.', vi: 'Hiển thị tìm kiếm & lập chỉ mục toàn site.' },
  },
  access: { read: anyone, update: isAdminOrEditor },
  hooks: { afterChange: [async () => revalidateAll()] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: { en: 'Search appearance', vi: 'Hiển thị tìm kiếm' },
          fields: [
            { name: 'siteUrl', type: 'text', label: { en: 'Site URL', vi: 'URL site' }, admin: { description: 'https://… (không dấu / cuối). Cũng đọc từ NEXT_PUBLIC_SITE_URL.' } },
            T('siteName', { en: 'Site name', vi: 'Tên site' }),
            {
              name: 'titleSeparator',
              type: 'select',
              defaultValue: '·',
              label: { en: 'Title separator', vi: 'Dấu ngăn tiêu đề' },
              options: ['-', '–', '—', '·', '•', '|', '»', '~'].map((v) => ({ label: v, value: v })),
            },
            T('homeTitle', { en: 'Homepage title', vi: 'Tiêu đề trang chủ' }),
            { name: 'homeDescription', type: 'textarea', localized: true, label: { en: 'Homepage meta description', vi: 'Meta description trang chủ' } },
            { name: 'defaultImage', type: 'upload', relationTo: 'media', label: { en: 'Default social image (1200×630)', vi: 'Ảnh MXH mặc định (1200×630)' } },
          ],
        },
        {
          label: { en: 'Knowledge graph', vi: 'Sơ đồ tri thức' },
          fields: [
            {
              name: 'siteRepresents',
              type: 'select',
              defaultValue: 'organization',
              label: { en: 'The site represents', vi: 'Site đại diện cho' },
              options: [
                { label: { en: 'Organization', vi: 'Tổ chức' }, value: 'organization' },
                { label: { en: 'Person', vi: 'Cá nhân' }, value: 'person' },
              ],
            },
            { name: 'orgName', type: 'text', label: { en: 'Name', vi: 'Tên' } },
            { name: 'orgLogo', type: 'upload', relationTo: 'media', label: { en: 'Logo', vi: 'Logo' } },
            {
              name: 'social',
              type: 'group',
              label: { en: 'Social profiles (schema sameAs)', vi: 'Hồ sơ MXH (schema sameAs)' },
              fields: [
                { name: 'facebook', type: 'text' },
                { name: 'x', type: 'text', label: { en: 'X / Twitter', vi: 'X / Twitter' } },
                { name: 'linkedin', type: 'text' },
                { name: 'youtube', type: 'text' },
                { name: 'instagram', type: 'text' },
                { name: 'tiktok', type: 'text' },
              ],
            },
          ],
        },
        {
          label: { en: 'Indexing', vi: 'Lập chỉ mục' },
          fields: [
            {
              name: 'discourageSearchEngines',
              type: 'checkbox',
              defaultValue: false,
              label: { en: 'Discourage search engines (noindex whole site)', vi: 'Chặn công cụ tìm kiếm (noindex toàn site)' },
              admin: { description: 'Bật khi site chưa ra mắt. TẮT trước khi go-live.' },
            },
            { name: 'googleVerification', type: 'text', label: { en: 'Google verification code', vi: 'Mã xác minh Google' } },
            { name: 'bingVerification', type: 'text', label: { en: 'Bing verification code', vi: 'Mã xác minh Bing' } },
          ],
        },
        {
          label: { en: 'Sitemap & Robots', vi: 'Sitemap & Robots' },
          fields: [
            { name: 'enableSitemap', type: 'checkbox', defaultValue: true, label: { en: 'Enable XML sitemap', vi: 'Bật sitemap XML' } },
            { name: 'sitemapExclude', type: 'text', hasMany: true, label: { en: 'Exclude paths from sitemap', vi: 'Loại path khỏi sitemap' }, admin: { description: 'vd /lien-he' } },
            { name: 'robotsExtra', type: 'textarea', label: { en: 'Extra robots.txt directives', vi: 'Chỉ thị robots.txt bổ sung' }, admin: { description: 'Thêm dòng thô vào robots.txt.' } },
          ],
        },
      ],
    },
  ],
}
