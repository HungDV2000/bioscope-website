import type { GlobalConfig } from 'payload'
import { anyone, isAdminOrEditor } from '../access/index.js'
import { ADMIN_GROUP_SYSTEM } from '../i18n/admin-groups.js'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: { group: ADMIN_GROUP_SYSTEM },
  access: { read: anyone, update: isAdminOrEditor },
  fields: [
    { name: 'siteName', type: 'text', localized: true },
    {
      name: 'homePage',
      type: 'relationship',
      relationTo: 'pages',
      label: { en: 'Home page', vi: 'Trang chủ' },
      admin: {
        description: {
          en: 'The Page rendered at the site root (/).',
          vi: 'Trang được hiển thị ở đường dẫn gốc (/).',
        },
      },
    },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'logoDark', type: 'upload', relationTo: 'media' },
    {
      name: 'contact',
      type: 'group',
      fields: [
        { name: 'address', type: 'textarea', localized: true },
        { name: 'phone', type: 'text' },
        {
          name: 'email',
          type: 'text',
          label: { en: 'Email', vi: 'Email' },
          admin: {
            description: 'Email liên hệ chung, hiển thị công khai trên website.',
          },
        },
        {
          name: 'invoiceEmail',
          type: 'text',
          label: { en: 'Invoice email', vi: 'Email nhận hoá đơn' },
          admin: {
            description:
              'Email nhận hoá đơn điện tử / chứng từ kế toán. Tách riêng vì đây là địa chỉ nghiệp vụ, thường khác email liên hệ chung.',
          },
        },
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
