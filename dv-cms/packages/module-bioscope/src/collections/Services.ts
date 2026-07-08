import type { CollectionConfig } from 'payload'
import { anyone, isAdminOrEditor, seoField, slugField } from '@dv/cms-core'

/** ODM / service offerings — powers the `/giai-phap/[slug]` landing pages. */
export const Services: CollectionConfig = {
  slug: 'services',
  admin: { useAsTitle: 'title', group: 'Bioscope', defaultColumns: ['title', 'order'] },
  defaultSort: 'order',
  access: { read: anyone, create: isAdminOrEditor, update: isAdminOrEditor, delete: isAdminOrEditor },
  fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    slugField('title'),
    { name: 'forWho', type: 'textarea', localized: true, admin: { description: 'Đối tượng phù hợp (mô tả ngắn dưới tiêu đề).' } },
    { name: 'summary', type: 'textarea', localized: true, admin: { description: 'Tóm tắt hiển thị dưới hero.' } },
    { name: 'heroQuote', type: 'textarea', localized: true, admin: { description: 'Trích dẫn nổi bật (tùy chọn).' } },
    { name: 'cta', type: 'text', localized: true, admin: { description: 'Nhãn nút CTA.' } },
    { name: 'receive', type: 'text', hasMany: true, localized: true, admin: { description: 'Bạn nhận được gì.' } },
    { name: 'idealFor', type: 'text', hasMany: true, localized: true, admin: { description: 'Ai phù hợp.' } },
    { name: 'expectedOutcomes', type: 'text', hasMany: true, localized: true, admin: { description: 'Kết quả kỳ vọng.' } },
    {
      name: 'process',
      type: 'array',
      localized: true,
      labels: { singular: 'Bước', plural: 'Quy trình' },
      fields: [
        { name: 'step', type: 'text', required: true },
        { name: 'desc', type: 'textarea' },
      ],
    },
    {
      name: 'faq',
      type: 'array',
      localized: true,
      labels: { singular: 'FAQ', plural: 'FAQ' },
      fields: [
        { name: 'q', type: 'text', required: true },
        { name: 'a', type: 'textarea' },
      ],
    },
    {
      name: 'relatedCaseSlugs',
      type: 'text',
      hasMany: true,
      admin: { description: 'Slug case study liên quan (vd: vivomega).' },
    },
    { name: 'description', type: 'richText', localized: true },
    { name: 'icon', type: 'text', admin: { description: 'Tên icon (lucide).' } },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'features', type: 'text', hasMany: true, localized: true },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
    seoField(),
  ],
}
