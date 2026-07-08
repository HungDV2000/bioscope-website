import type { CollectionConfig } from 'payload'
import { isAdminOrEditor, readPublishedOrStaff, seoField, slugField } from '@dv/cms-core'

/** Success stories / co-creation case studies. */
export const CaseStudies: CollectionConfig = {
  slug: 'case-studies',
  labels: {
    singular: { en: 'Case study', vi: 'Case study' },
    plural: { en: 'Case studies', vi: 'Case studies' },
  },
  admin: {
    useAsTitle: 'brand',
    group: 'Bioscope',
    defaultColumns: ['brand', 'industry', 'kpi', 'featured', '_status'],
    description: {
      en: 'Brand stories co-created with Bioscope.',
      vi: 'Câu chuyện thương hiệu đã đồng kiến tạo cùng Bioscope.',
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
    { name: 'brand', type: 'text', localized: true, required: true, label: { en: 'Brand', vi: 'Thương hiệu' } },
    slugField('brand'),
    {
      name: 'partner',
      type: 'text',
      localized: true,
      label: { en: 'Partner / Technology', vi: 'Đối tác / Công nghệ' },
      admin: {
        description: {
          en: 'Ingredient partner or applied technology (e.g. GC Rieber Oils, wet Phytosome).',
          vi: 'Đối tác nguyên liệu hoặc công nghệ áp dụng (vd GC Rieber Oils, Phytosome ướt).',
        },
      },
    },
    {
      name: 'industry',
      type: 'select',
      label: { en: 'Industry', vi: 'Ngành hàng' },
      admin: { position: 'sidebar' },
      options: [
        { label: { en: 'Nutraceuticals', vi: 'Thực phẩm chức năng' }, value: 'Thực phẩm chức năng' },
        { label: { en: 'Pharmaceuticals', vi: 'Dược phẩm' }, value: 'Dược phẩm' },
        { label: { en: 'Cosmetics', vi: 'Mỹ phẩm' }, value: 'Mỹ phẩm' },
        { label: { en: 'Nutrition', vi: 'Dinh dưỡng' }, value: 'Dinh dưỡng' },
      ],
    },
    { name: 'summary', type: 'textarea', localized: true, label: { en: 'Summary', vi: 'Tóm tắt' } },
    {
      type: 'row',
      fields: [
        { name: 'kpi', type: 'text', label: { en: 'Headline KPI', vi: 'Chỉ số nổi bật' }, admin: { width: '40%', description: 'e.g. 500K USD, 70%+, #1' } },
        { name: 'kpiLabel', type: 'text', localized: true, label: { en: 'KPI caption', vi: 'Diễn giải chỉ số' }, admin: { width: '60%' } },
      ],
    },
    { name: 'problem', type: 'textarea', localized: true, label: { en: 'Problem', vi: 'Vấn đề' } },
    { name: 'solution', type: 'textarea', localized: true, label: { en: 'Solution', vi: 'Giải pháp' } },
    {
      name: 'results',
      type: 'text',
      hasMany: true,
      localized: true,
      label: { en: 'Results', vi: 'Kết quả' },
      admin: { description: { en: 'One measurable result per item.', vi: 'Mỗi mục là một kết quả đo lường được.' } },
    },
    {
      name: 'coCreateSteps',
      type: 'text',
      hasMany: true,
      localized: true,
      label: { en: 'Co-creation steps', vi: 'Các bước đồng kiến tạo' },
    },
    { name: 'testimonial', type: 'textarea', localized: true, label: { en: 'Testimonial', vi: 'Trích dẫn / Cảm nhận' } },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      label: { en: 'Tags', vi: 'Thẻ' },
      admin: { description: { en: 'Chips shown on the card (e.g. Co-creation, Oil & Omega).', vi: 'Nhãn hiển thị trên thẻ (vd Đồng kiến tạo, Dầu & Omega).' } },
    },
    { name: 'coverImage', type: 'upload', relationTo: 'media', label: { en: 'Cover image', vi: 'Ảnh bìa' } },
    { name: 'featured', type: 'checkbox', defaultValue: false, label: { en: 'Featured', vi: 'Nổi bật' }, admin: { position: 'sidebar' } },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
    seoField(),
  ],
}
