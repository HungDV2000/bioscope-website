import type { CollectionConfig } from 'payload'
import { isAdminOrEditor, readPublishedOrStaff, seoField, slugField } from '@dv/cms-core'

/** Câu chuyện thành công / case study đồng kiến tạo. */
export const CaseStudies: CollectionConfig = {
  slug: 'case-studies',
  labels: { singular: 'Case study', plural: 'Case studies' },
  admin: {
    useAsTitle: 'brand',
    group: 'Bioscope',
    defaultColumns: ['brand', 'industry', 'kpi', 'featured', '_status'],
    description: 'Câu chuyện thương hiệu đã đồng kiến tạo cùng Bioscope.',
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
    { name: 'brand', type: 'text', localized: true, required: true, label: 'Thương hiệu' },
    slugField('brand'),
    {
      name: 'partner',
      type: 'text',
      localized: true,
      label: 'Đối tác / Công nghệ',
      admin: { description: 'Đối tác nguyên liệu hoặc công nghệ áp dụng (vd GC Rieber Oils, Phytosome ướt).' },
    },
    {
      name: 'industry',
      type: 'select',
      label: 'Ngành hàng',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Thực phẩm chức năng', value: 'Thực phẩm chức năng' },
        { label: 'Dược phẩm', value: 'Dược phẩm' },
        { label: 'Mỹ phẩm', value: 'Mỹ phẩm' },
        { label: 'Dinh dưỡng', value: 'Dinh dưỡng' },
      ],
    },
    { name: 'summary', type: 'textarea', localized: true, label: 'Tóm tắt' },
    {
      type: 'row',
      fields: [
        { name: 'kpi', type: 'text', label: 'Chỉ số nổi bật', admin: { width: '40%', description: 'vd 500K USD, 70%+, #1' } },
        { name: 'kpiLabel', type: 'text', localized: true, label: 'Diễn giải chỉ số', admin: { width: '60%' } },
      ],
    },
    { name: 'problem', type: 'textarea', localized: true, label: 'Vấn đề' },
    { name: 'solution', type: 'textarea', localized: true, label: 'Giải pháp' },
    {
      name: 'results',
      type: 'text',
      hasMany: true,
      localized: true,
      label: 'Kết quả',
      admin: { description: 'Mỗi mục là một kết quả đo lường được.' },
    },
    {
      name: 'coCreateSteps',
      type: 'text',
      hasMany: true,
      localized: true,
      label: 'Các bước đồng kiến tạo',
    },
    { name: 'testimonial', type: 'textarea', localized: true, label: 'Trích dẫn / Cảm nhận' },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      label: 'Thẻ',
      admin: { description: 'Nhãn hiển thị trên thẻ (vd Đồng kiến tạo, Dầu & Omega).' },
    },
    { name: 'coverImage', type: 'upload', relationTo: 'media', label: 'Ảnh bìa' },
    { name: 'featured', type: 'checkbox', defaultValue: false, label: 'Nổi bật', admin: { position: 'sidebar' } },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
    seoField(),
  ],
}
