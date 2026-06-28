import type { CollectionConfig } from 'payload'
import { anyone, isAdminOrEditor } from '../access/index.js'

/** Stored submissions for any Form. Public create, staff-only read. */
export const FormSubmissions: CollectionConfig = {
  slug: 'form-submissions',
  admin: {
    useAsTitle: 'id',
    group: 'Nội dung',
    defaultColumns: ['form', 'createdAt'],
  },
  access: {
    create: anyone,
    read: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    { name: 'form', type: 'relationship', relationTo: 'forms', required: true },
    {
      name: 'submissionData',
      type: 'array',
      fields: [
        { name: 'field', type: 'text', required: true },
        { name: 'value', type: 'text' },
      ],
    },
  ],
}
