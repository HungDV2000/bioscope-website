import type { CollectionConfig } from 'payload'
import { anyone, isAdminOrEditor } from '../access/index.js'
import { ADMIN_GROUP_SYSTEM } from '../i18n/admin-groups.js'

const MEDIA_LIBRARY_REDIRECT = '@dv/cms-core/admin#MediaLibraryRedirect'

/** Uploads: images (with responsive sizes + focal point), PDFs, video. */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: { en: 'Media file', vi: 'Tệp media' },
    plural: { en: 'Media library', vi: 'Thư viện ảnh' },
  },
  folders: true,
  admin: {
    group: ADMIN_GROUP_SYSTEM,
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'alt', 'mimeType', 'filesize', 'updatedAt'],
    description: {
      en: 'Upload and organize images, PDFs, and videos. Grid view shows thumbnails like a photo library.',
      vi: 'Tải lên và sắp xếp ảnh, PDF, video. Chế độ thư mục hiển thị thumbnail như thư viện ảnh.',
    },
    components: {
      views: {
        list: {
          Component: MEDIA_LIBRARY_REDIRECT,
        },
      },
    },
  },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  upload: {
    mimeTypes: ['image/*', 'application/pdf', 'video/*'],
    focalPoint: true,
    displayPreview: true,
    bulkUpload: true,
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
