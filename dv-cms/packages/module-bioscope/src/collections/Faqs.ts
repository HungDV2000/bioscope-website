import type { CollectionConfig } from 'payload'
import { isAdminOrEditor, readPublishedOrStaff } from '@dv/cms-core'

/** Frequently asked questions, grouped by topic. */
export const Faqs: CollectionConfig = {
  slug: 'faqs',
  labels: {
    singular: { en: 'FAQ', vi: 'Câu hỏi thường gặp' },
    plural: { en: 'FAQs', vi: 'Câu hỏi thường gặp' },
  },
  admin: {
    useAsTitle: 'question',
    group: 'Bioscope',
    defaultColumns: ['question', 'category', 'order', '_status'],
    description: {
      en: 'Q&A shown on the FAQ and Contact pages.',
      vi: 'Hỏi đáp hiển thị ở trang Câu hỏi thường gặp và trang Liên hệ.',
    },
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
    { name: 'question', type: 'text', localized: true, required: true, label: { en: 'Question', vi: 'Câu hỏi' } },
    { name: 'answer', type: 'textarea', localized: true, required: true, label: { en: 'Answer', vi: 'Trả lời' } },
    {
      name: 'category',
      type: 'select',
      label: { en: 'Topic', vi: 'Chủ đề' },
      defaultValue: 'ingredients',
      admin: { position: 'sidebar' },
      options: [
        { label: { en: 'Ingredients & samples', vi: 'Nguyên liệu & mẫu thử' }, value: 'ingredients' },
        { label: { en: 'Solutions & co-creation', vi: 'Giải pháp & đồng kiến tạo' }, value: 'solutions' },
        { label: { en: 'Contact & support', vi: 'Liên hệ & hỗ trợ' }, value: 'support' },
      ],
    },
    {
      name: 'showOnContact',
      type: 'checkbox',
      defaultValue: false,
      label: { en: 'Show on Contact page', vi: 'Hiện ở trang Liên hệ' },
      admin: { position: 'sidebar' },
    },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
