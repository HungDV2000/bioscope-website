import type { CollectionConfig, CollectionSlug } from 'payload'
import { anyone, isAdminOrEditor, slugField } from '@dv/cms-core'

/** Generic product taxonomy (self-nesting). Sites may use this or their own. */
export const ProductCategories: CollectionConfig = {
  slug: 'product-categories',
  admin: { useAsTitle: 'name', group: 'Catalog' },
  access: { read: anyone, create: isAdminOrEditor, update: isAdminOrEditor, delete: isAdminOrEditor },
  fields: [
    { name: 'name', type: 'text', localized: true, required: true },
    slugField('name'),
    { name: 'description', type: 'textarea', localized: true },
    {
      name: 'parent',
      type: 'relationship',
      // Self-reference; cast keeps the generic package decoupled from any one
      // app's generated CollectionSlug union (this collection may be opt-out).
      relationTo: 'product-categories' as unknown as CollectionSlug,
      admin: { position: 'sidebar' },
    },
  ],
}
