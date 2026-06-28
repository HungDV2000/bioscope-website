import type { CollectionConfig } from 'payload'
import { anyone, isAdminOrEditor } from '@dv/cms-core'

/** Trust signals: certificates, stats and awards. */
export const Certifications: CollectionConfig = {
  slug: 'certifications',
  admin: { useAsTitle: 'title', group: 'Bioscope', defaultColumns: ['title', 'kind', 'value', 'order'] },
  defaultSort: 'order',
  access: { read: anyone, create: isAdminOrEditor, update: isAdminOrEditor, delete: isAdminOrEditor },
  fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    {
      name: 'kind',
      type: 'select',
      defaultValue: 'certificate',
      options: [
        { label: 'Certificate', value: 'certificate' },
        { label: 'Stat', value: 'stat' },
        { label: 'Award', value: 'award' },
      ],
    },
    { name: 'value', type: 'text', admin: { description: 'Vd: GMP / 23 / 14.' } },
    { name: 'suffix', type: 'text', localized: true, admin: { description: 'Vd: dự án R&D.' } },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
