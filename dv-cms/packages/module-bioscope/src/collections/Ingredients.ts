import type { CollectionConfig } from 'payload'
import { isAdminOrEditor, readPublishedOrStaff, seoField, slugField } from '@dv/cms-core'
import { specsField } from '@dv/module-catalog'

/** Imported nutraceutical / cosmetic raw ingredients. */
export const Ingredients: CollectionConfig = {
  slug: 'ingredients',
  admin: {
    useAsTitle: 'name',
    group: 'Bioscope',
    defaultColumns: ['name', 'type', 'originCountry', 'featured', '_status'],
  },
  versions: { drafts: { autosave: false }, maxPerDoc: 10 },
  access: {
    read: readPublishedOrStaff,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    { name: 'name', type: 'text', localized: true, required: true },
    slugField('name'),
    { name: 'subtitle', type: 'text', localized: true },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'supplement',
      options: [
        { label: 'Supplement (TPCN)', value: 'supplement' },
        { label: 'Cosmetic (Mỹ phẩm)', value: 'cosmetic' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'ingredient-categories',
      admin: { position: 'sidebar' },
    },
    { name: 'originCountry', type: 'text', admin: { description: 'Mã quốc gia, vd JP.' } },
    { name: 'brandName', type: 'text', admin: { description: 'Thương hiệu OEM.' } },
    {
      name: 'partner',
      type: 'relationship',
      relationTo: 'partners',
      admin: { position: 'sidebar' },
    },
    { name: 'moq', type: 'text', label: 'MOQ' },
    { name: 'description', type: 'richText', localized: true },
    {
      name: 'benefits',
      type: 'text',
      hasMany: true,
      localized: true,
      admin: { description: 'Mỗi mục là một lợi ích.' },
    },
    {
      name: 'applications',
      type: 'text',
      hasMany: true,
      localized: true,
      admin: { description: 'Ứng dụng / dạng bào chế.' },
    },
    {
      name: 'badges',
      type: 'text',
      hasMany: true,
      admin: { description: 'Nhãn chứng nhận hiển thị trên thẻ (Halal, Non-GMO…).' },
    },
    { name: 'featuredImage', type: 'upload', relationTo: 'media' },
    {
      name: 'gallery',
      type: 'array',
      fields: [{ name: 'image', type: 'upload', relationTo: 'media' }],
    },
    {
      name: 'technologies',
      type: 'relationship',
      relationTo: 'technologies',
      hasMany: true,
    },
    specsField('specs'),
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    seoField(),
  ],
}
