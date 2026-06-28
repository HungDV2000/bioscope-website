import type { CollectionConfig } from 'payload'
import { anyone, isAdminOrEditor } from '../access/index.js'

/** URL redirects consumed by the frontend middleware. */
export const Redirects: CollectionConfig = {
  slug: 'redirects',
  admin: { useAsTitle: 'from', group: 'Hệ thống', defaultColumns: ['from', 'to', 'type'] },
  access: { read: anyone, create: isAdminOrEditor, update: isAdminOrEditor, delete: isAdminOrEditor },
  fields: [
    { name: 'from', type: 'text', required: true, index: true, admin: { description: 'Đường dẫn nguồn, vd /cu' } },
    { name: 'to', type: 'text', required: true, admin: { description: 'Đường dẫn đích, vd /moi' } },
    {
      name: 'type',
      type: 'select',
      defaultValue: '301',
      options: [
        { label: '301 — Permanent', value: '301' },
        { label: '302 — Temporary', value: '302' },
      ],
    },
  ],
}
