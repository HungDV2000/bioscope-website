import type { Field } from 'payload'

/**
 * Reusable SEO group — self-contained (no plugin ordering concerns), so any
 * collection in any module can opt in independently.
 * Rendered as a collapsible group; meta fields are localized.
 */
export const seoField = (): Field => ({
  name: 'seo',
  type: 'group',
  label: 'SEO',
  admin: { description: 'Meta cho công cụ tìm kiếm & mạng xã hội.' },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      admin: { description: 'Thẻ <title>. Bỏ trống dùng tiêu đề mặc định.' },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      admin: { description: 'Meta description (~155 ký tự).' },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Ảnh Open Graph (1200×630).' },
    },
    {
      name: 'canonical',
      type: 'text',
      admin: { description: 'Canonical URL (tùy chọn).' },
    },
    {
      name: 'noIndex',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Chặn index trang này.' },
    },
  ],
})
