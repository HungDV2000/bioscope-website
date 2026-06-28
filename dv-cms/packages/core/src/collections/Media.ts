import type { CollectionConfig } from 'payload'
import { anyone, isAdminOrEditor } from '../access/index.js'

/** Uploads: images (with responsive sizes + focal point), PDFs, video. */
export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Hệ thống' },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  upload: {
    mimeTypes: ['image/*', 'application/pdf', 'video/*'],
    focalPoint: true,
    adminThumbnail: 'thumbnail',
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 768, height: 576, position: 'centre' },
      { name: 'og', width: 1200, height: 630, position: 'centre' },
    ],
  },
  fields: [
    { name: 'alt', type: 'text', localized: true, admin: { description: 'Văn bản thay thế (a11y/SEO).' } },
    { name: 'caption', type: 'text', localized: true },
  ],
}
