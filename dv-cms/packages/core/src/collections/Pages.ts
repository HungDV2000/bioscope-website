import type { CollectionConfig } from 'payload'
import { isAdminOrEditor, readPublishedOrStaff } from '../access/index.js'
import { slugField } from '../fields/slug.js'
import { seoField } from '../fields/seo.js'
import { ADMIN_GROUP_CONTENT } from '../i18n/admin-groups.js'

/** Frontend URL for a page (live preview + preview button). */
function previewUrl(doc: { slug?: unknown }): string {
  const slug = typeof doc?.slug === 'string' ? doc.slug : ''
  if (!slug) return ''
  const base = process.env.PREVIEW_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000'
  const routes: Record<string, string> = { 'trang-chu': '/', 'blog-chuyen-mon': '/tai-nguyen/blog-chuyen-mon' }
  return `${base}${routes[slug] ?? `/${slug}`}`
}

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
    // Official Payload Live Preview — side-by-side iframe that refreshes as the
    // document is saved (RefreshRouteOnSave on the frontend). Works cross-origin
    // via postMessage — no same-origin proxy needed.
    livePreview: {
      url: ({ data }) => previewUrl(data as { slug?: unknown }),
      breakpoints: [
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Mobile', name: 'mobile', width: 390, height: 844 },
      ],
    },
    preview: (doc) => previewUrl(doc as { slug?: unknown }),
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
