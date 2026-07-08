import type { CollectionConfig } from 'payload'
import { anyone, isAdminOrEditor } from '../access/index.js'
import { ADMIN_GROUP_CONTENT } from '../i18n/admin-groups.js'

/** Stored submissions for any Form. Public create, staff-only read. */
export const FormSubmissions: CollectionConfig = {
  slug: 'form-submissions',
  admin: {
    useAsTitle: 'id',
    group: ADMIN_GROUP_CONTENT,
    defaultColumns: ['form', 'createdAt'],
  },
  access: {
    create: anyone,
    read: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return
        try {
          const formId = typeof doc.form === 'object' ? doc.form?.id : doc.form
          if (!formId) return
          const form = await req.payload.findByID({ collection: 'forms', id: formId, depth: 0 })
          const recipients = (form?.emails ?? []) as { to?: string; subject?: string }[]
          if (recipients.length === 0) return
          const rows = (doc.submissionData ?? []) as { field?: string; value?: string }[]
          const body = rows.map((r) => `${r.field}: ${r.value ?? ''}`).join('\n')
          for (const r of recipients) {
            if (!r.to) continue
            // No-ops with a warning if no email adapter is configured (dev); wire SMTP for production.
            await req.payload.sendEmail({
              to: r.to,
              subject: r.subject || `Lượt gửi form mới: ${form.title}`,
              text: `Form: ${form.title}\n\n${body}`,
            })
          }
        } catch (err) {
          req.payload.logger.error({ err }, 'form-submission notification failed')
        }
      },
    ],
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
