import type { CollectionConfig } from 'payload'
import { anyone, isAdminOrEditor } from '../access/index.js'
import { slugField } from '../fields/slug.js'
import { ADMIN_GROUP_CONTENT } from '../i18n/admin-groups.js'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: { useAsTitle: 'name', group: ADMIN_GROUP_CONTENT },
  access: { read: anyone, create: isAdminOrEditor, update: isAdminOrEditor, delete: isAdminOrEditor },
  fields: [
    { name: 'name', type: 'text', localized: true, required: true },
    slugField('name'),
  ],
}
