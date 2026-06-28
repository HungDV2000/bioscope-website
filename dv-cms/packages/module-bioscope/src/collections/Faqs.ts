import type { CollectionConfig } from 'payload'
import { isAdminOrEditor, readPublishedOrStaff } from '@dv/cms-core'

/** Câu hỏi thường gặp, nhóm theo chủ đề. */
export const Faqs: CollectionConfig = {
  slug: 'faqs',
  labels: { singular: 'Câu hỏi thường gặp', plural: 'Câu hỏi thường gặp' },
  admin: {
    useAsTitle: 'question',
    group: 'Bioscope',
    defaultColumns: ['question', 'category', 'order', '_status'],
    description: 'Hỏi đáp hiển thị ở trang Câu hỏi thường gặp và trang Liên hệ.',
  },
  defaultSort: 'order',
  versions: { drafts: { autosave: false }, maxPerDoc: 10 },
  access: {
    read: readPublishedOrStaff,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    { name: 'question', type: 'text', localized: true, required: true, label: 'Câu hỏi' },
    { name: 'answer', type: 'textarea', localized: true, required: true, label: 'Trả lời' },
    {
      name: 'category',
      type: 'select',
      label: 'Chủ đề',
      defaultValue: 'ingredients',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Nguyên liệu & mẫu thử', value: 'ingredients' },
        { label: 'Giải pháp & đồng kiến tạo', value: 'solutions' },
        { label: 'Liên hệ & hỗ trợ', value: 'support' },
      ],
    },
    {
      name: 'showOnContact',
      type: 'checkbox',
      defaultValue: false,
      label: 'Hiện ở trang Liên hệ',
      admin: { position: 'sidebar' },
    },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
