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
    // Preview URL for the Better Editor toggle. Points at the live frontend so
    // the iframe renders the real (hydrated) site with content + animations.
    // Set PREVIEW_ORIGIN to a same-origin reverse-proxy in production to also
    // enable click-to-edit (needs same origin as the admin).
    preview: (doc) => {
      const slug = typeof (doc as { slug?: unknown })?.slug === 'string' ? (doc as { slug: string }).slug : ''
      if (!slug) return ''
      const base = process.env.PREVIEW_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000'
      const routes: Record<string, string> = { 'trang-chu': '/', 'blog-chuyen-mon': '/tai-nguyen/blog-chuyen-mon' }
      return `${base}${routes[slug] ?? `/${slug}`}`
    },
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
