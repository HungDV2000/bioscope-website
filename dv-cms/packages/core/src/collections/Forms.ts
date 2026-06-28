import type { CollectionConfig } from 'payload'
import { anyone, isAdminOrEditor } from '../access/index.js'

/** Form builder — define arbitrary contact/lead forms in the admin. */
export const Forms: CollectionConfig = {
  slug: 'forms',
  admin: { useAsTitle: 'title', group: 'Nội dung' },
  access: { read: anyone, create: isAdminOrEditor, update: isAdminOrEditor, delete: isAdminOrEditor },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'fields',
      type: 'array',
      labels: { singular: 'Field', plural: 'Fields' },
      fields: [
        { name: 'name', type: 'text', required: true, admin: { description: 'Khóa dữ liệu (vd: email).' } },
        { name: 'label', type: 'text', localized: true, required: true },
        {
          name: 'type',
          type: 'select',
          defaultValue: 'text',
          options: ['text', 'email', 'textarea', 'number', 'tel', 'checkbox', 'select'],
        },
        { name: 'required', type: 'checkbox', defaultValue: false },
        {
          name: 'options',
          type: 'array',
          admin: { condition: (_, sibling) => sibling?.type === 'select' },
          fields: [
            { name: 'label', type: 'text', localized: true },
            { name: 'value', type: 'text' },
          ],
        },
      ],
    },
    { name: 'confirmationMessage', type: 'richText', localized: true },
    {
      name: 'emails',
      type: 'array',
      labels: { singular: 'Email', plural: 'Emails' },
      admin: { description: 'Gửi thông báo khi có lượt gửi form.' },
      fields: [
        { name: 'to', type: 'text', required: true },
        { name: 'subject', type: 'text', defaultValue: 'Bạn có lượt gửi form mới' },
      ],
    },
  ],
}
