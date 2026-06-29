import type { GlobalConfig } from 'payload'
import { anyone, isAdminOrEditor } from '../access/index.js'
import { ADMIN_GROUP_SYSTEM } from '../i18n/admin-groups.js'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: { group: ADMIN_GROUP_SYSTEM },
  access: { read: anyone, update: isAdminOrEditor },
  fields: [
    { name: 'siteName', type: 'text', localized: true },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'logoDark', type: 'upload', relationTo: 'media' },
    {
      name: 'contact',
      type: 'group',
      fields: [
        { name: 'address', type: 'textarea', localized: true },
        { name: 'phone', type: 'text' },
        { name: 'email', type: 'text' },
        { name: 'mst', type: 'text', label: 'Mã số thuế' },
      ],
    },
    {
      name: 'social',
      type: 'array',
      fields: [
        {
          name: 'platform',
          type: 'select',
          options: ['facebook', 'linkedin', 'youtube', 'instagram', 'zalo', 'x', 'tiktok'],
        },
        { name: 'url', type: 'text', required: true },
      ],
    },
    {
      name: 'tracking',
      type: 'group',
      admin: { description: 'ID đo lường (để trống nếu chưa dùng).' },
      fields: [
        { name: 'ga4', type: 'text', label: 'GA4 Measurement ID' },
        { name: 'gtm', type: 'text', label: 'Google Tag Manager ID' },
        { name: 'pixel', type: 'text', label: 'Meta Pixel ID' },
      ],
    },
    {
      name: 'defaultSeo',
      type: 'group',
      label: 'SEO mặc định',
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'description', type: 'textarea', localized: true },
        { name: 'image', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}
