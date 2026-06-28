import type { CollectionConfig } from 'payload'
import { anyone, isAdminOrEditor, seoField, slugField } from '@dv/cms-core'

/** ODM / service offerings. */
export const Services: CollectionConfig = {
  slug: 'services',
  admin: { useAsTitle: 'title', group: 'Bioscope', defaultColumns: ['title', 'order'] },
  defaultSort: 'order',
  access: { read: anyone, create: isAdminOrEditor, update: isAdminOrEditor, delete: isAdminOrEditor },
  fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    slugField('title'),
    { name: 'description', type: 'richText', localized: true },
    { name: 'icon', type: 'text', admin: { description: 'Tên icon (lucide).' } },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'features', type: 'text', hasMany: true, localized: true },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
    seoField(),
  ],
}
