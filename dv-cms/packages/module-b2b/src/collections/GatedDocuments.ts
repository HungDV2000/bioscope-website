import type { CollectionConfig, CollectionSlug, Field } from 'payload'
import { isAdminOrEditor } from '@dv/cms-core'
import { readGated } from '../access/gated.js'

export type GatedDocumentsOptions = {
  /** Collection slug that documents may relate to (e.g. 'ingredients'). */
  relatesTo?: string
}

/** Access-gated downloadable documents (COA, spec sheets, quotes…). */
export const createGatedDocuments = (opts: GatedDocumentsOptions = {}): CollectionConfig => ({
  slug: 'gated-documents',
  admin: { useAsTitle: 'title', group: 'B2B', defaultColumns: ['title', 'docType', 'visibility'] },
  access: {
    read: readGated,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    {
      name: 'docType',
      type: 'select',
      defaultValue: 'COA',
      options: [
        { label: 'CoA', value: 'COA' },
        { label: 'Spec sheet', value: 'spec_sheet' },
        { label: 'Quote', value: 'quote' },
        { label: 'Brochure', value: 'brochure' },
      ],
    },
    { name: 'file', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'visibility',
      type: 'select',
      defaultValue: 'approved_members',
      options: [
        { label: 'All approved members', value: 'approved_members' },
        { label: 'Specific members', value: 'specific' },
      ],
    },
    {
      name: 'allowedMembers',
      type: 'relationship',
      relationTo: 'members',
      hasMany: true,
      admin: { condition: (_, sibling) => sibling?.visibility === 'specific' },
    },
    ...(opts.relatesTo
      ? ([
          {
            name: 'relatesTo',
            type: 'relationship',
            relationTo: opts.relatesTo as CollectionSlug,
            hasMany: true,
          },
        ] as Field[])
      : []),
  ],
})
