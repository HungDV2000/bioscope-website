import type { CollectionConfig } from 'payload'
import { isAdminOrEditor, readPublishedOrStaff, seoField, slugField } from '@dv/cms-core'
import { specsField } from '@dv/module-catalog'

/** Proprietary technologies (storytelling pages + specs/data viz). */
export const Technologies: CollectionConfig = {
  slug: 'technologies',
  admin: {
    useAsTitle: 'name',
    group: 'Bioscope',
    defaultColumns: ['name', 'order', '_status'],
  },
  defaultSort: 'order',
  versions: { drafts: { autosave: false }, maxPerDoc: 10 },
  access: {
    read: readPublishedOrStaff,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    { name: 'name', type: 'text', localized: true, required: true },
    slugField('name'),
    { name: 'tagline', type: 'text', localized: true },
    { name: 'description', type: 'richText', localized: true },
    { name: 'mechanism', type: 'richText', localized: true, admin: { description: 'Cơ chế hoạt động.' } },
    { name: 'featuredImage', type: 'upload', relationTo: 'media' },
    { name: 'videoUrl', type: 'text' },
    {
      name: 'gallery',
      type: 'array',
      fields: [{ name: 'image', type: 'upload', relationTo: 'media' }],
    },
    specsField('specs'),
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
    seoField(),
  ],
}
