import type { CollectionConfig } from 'payload'
import { isAdminOrEditor, readPublishedOrStaff } from '../access/index.js'
import { slugField } from '../fields/slug.js'
import { seoField } from '../fields/seo.js'
import { ADMIN_GROUP_CONTENT } from '../i18n/admin-groups.js'

/**
 * Composable marketing/content pages. The block-based `layout` field is added
 * by the installable `@dv/module-blocks` plugin so each site picks its own
 * block set (see blocksPlugin). Without that module, pages are title/hero/SEO.
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    group: ADMIN_GROUP_CONTENT,
    livePreview: undefined,
  },
  versions: { drafts: { autosave: false }, maxPerDoc: 20 },
  access: {
    read: readPublishedOrStaff,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    slugField('title'),
    { name: 'hero', type: 'upload', relationTo: 'media', admin: { position: 'sidebar' } },
    seoField(),
  ],
}
