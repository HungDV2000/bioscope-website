/**
 * ImageSettings — visibility into the boot-time optimization config (format,
 * quality, max width) plus a live "space saved" stat. Upload options are static
 * in Payload, so the numeric fields here are read-only mirrors of the env; edit
 * env + restart to change. Lazy-loading toggle is consumed by the frontend.
 */

import type { GlobalConfig } from 'payload'
import { isAdmin, isAdminOrEditor } from '@dv/cms-core'
import { resolveImageConfig } from '../lib/config.js'

export const ImageSettings: GlobalConfig = {
  slug: 'image-settings',
  label: 'Image Optimization',
  admin: {
    group: 'System',
    description: 'Tối ưu ảnh: chuyển WebP/AVIF, nén, ảnh responsive (tham khảo image-optimization).',
  },
  access: { read: isAdminOrEditor, update: isAdmin },
  fields: [
    {
      name: 'stats',
      type: 'ui',
      admin: { components: { Field: '/components/ImageStats/ImageStats#ImageStats' } },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'format',
          type: 'text',
          admin: {
            readOnly: true,
            description: 'Định dạng đích (env OPTIMIZE_IMAGE_FORMAT: webp|avif|off).',
          },
          defaultValue: resolveImageConfig().format,
        },
        {
          name: 'quality',
          type: 'number',
          admin: { readOnly: true, description: 'Chất lượng nén (env OPTIMIZE_IMAGE_QUALITY).' },
          defaultValue: resolveImageConfig().quality,
        },
        {
          name: 'maxWidth',
          type: 'number',
          admin: { readOnly: true, description: 'Chiều rộng tối đa (env OPTIMIZE_IMAGE_MAX_WIDTH).' },
          defaultValue: resolveImageConfig().maxWidth,
        },
      ],
    },
    {
      name: 'lazyLoad',
      type: 'checkbox',
      defaultValue: true,
      label: 'Bật lazy-load ảnh ở frontend',
    },
  ],
}
