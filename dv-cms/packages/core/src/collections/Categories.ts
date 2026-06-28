import type { CollectionConfig } from 'payload'
import { anyone, isAdminOrEditor } from '../access/index.js'
import { slugField } from '../fields/slug.js'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: { useAsTitle: 'name', group: 'Nội dung' },
  access: { read: anyone, create: isAdminOrEditor, update: isAdminOrEditor, delete: isAdminOrEditor },
  fields: [
    { name: 'name', type: 'text', localized: true, required: true },
    slugField('name'),
  ],
}
