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
  admin: { description: 'Meta cho công cụ tìm kiếm & mạng xã hội (phân tích kiểu Yoast).' },
  fields: [
    // Yoast-style live analysis: snippet preview + focus-keyphrase & readability.
    {
      name: 'analysis',
      type: 'ui',
      admin: { components: { Field: '/components/SeoAnalysis/SeoAnalysis#SeoAnalysis' } },
    },
    {
      name: 'focusKeyphrase',
      type: 'text',
      localized: true,
      admin: { description: 'Từ khóa trọng tâm — nội dung sẽ được chấm điểm theo từ khóa này.' },
    },
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
    {
      name: 'cornerstone',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Nội dung nền tảng (cornerstone) — bài quan trọng, chấm điểm chặt hơn.' },
    },
    // Social overrides (Open Graph / Twitter) — fall back to title/description.
    {
      type: 'collapsible',
      label: 'Mạng xã hội (Open Graph / Twitter)',
      admin: { initCollapsed: true },
      fields: [
        { name: 'ogTitle', type: 'text', localized: true, admin: { description: 'Tiêu đề khi chia sẻ Facebook/Zalo.' } },
        { name: 'ogDescription', type: 'textarea', localized: true },
        { name: 'twitterTitle', type: 'text', localized: true },
        { name: 'twitterDescription', type: 'textarea', localized: true },
      ],
    },
  ],
})
