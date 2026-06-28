import type { CollectionConfig } from 'payload'
import { anyone, isAdminOrEditor } from '@dv/cms-core'

/** Suppliers / brand partners — reusable across product collections. */
export const Partners: CollectionConfig = {
  slug: 'partners',
  admin: { useAsTitle: 'name', group: 'Catalog', defaultColumns: ['name', 'country', 'website'] },
  access: { read: anyone, create: isAdminOrEditor, update: isAdminOrEditor, delete: isAdminOrEditor },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'country', type: 'text', admin: { description: 'Mã/tên quốc gia, vd JP.' } },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'website', type: 'text' },
  ],
}
