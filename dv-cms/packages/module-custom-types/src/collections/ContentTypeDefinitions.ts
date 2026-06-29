import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '@dv/cms-core'

import { ADMIN_GROUP_CUSTOM_TYPES } from '../i18n/admin-groups.js'
import { customFieldDefFields } from '../fields/customFieldDefFields.js'
import { assertValidSlug } from '../lib/reserved-slugs.js'
import { cascadeDeleteContentType } from '../hooks/cascadeDeleteContentType.js'
import { syncManifestAfterChange, syncManifestAfterDelete } from '../hooks/syncManifest.js'

/** Content type definition — admin-defined CPT; codegen materializes a real Payload collection. */
export const ContentTypeDefinitions: CollectionConfig = {
  slug: 'ct-definitions',
  labels: {
    singular: { en: 'Content type', vi: 'Loại nội dung' },
    plural: { en: 'Content types', vi: 'Loại nội dung' },
  },
  trash: false,
  admin: {
    useAsTitle: 'slug',
    group: ADMIN_GROUP_CUSTOM_TYPES,
    defaultColumns: ['slug', 'status', 'updatedAt'],
    description: {
      en: 'Define custom post types. Set status to Published, then run `pnpm ct:apply` to create DB tables & REST API.',
      vi: 'Định nghĩa loại nội dung tùy chỉnh. Chuyển trạng thái Published, rồi chạy `pnpm ct:apply` để tạo bảng DB & REST API.',
    },
  },
  access: {
    read: isAdminOrEditor,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.slug) assertValidSlug(String(data.slug), 'Content type slug')
      },
    ],
    beforeDelete: [cascadeDeleteContentType],
    afterChange: [syncManifestAfterChange],
    afterDelete: [syncManifestAfterDelete],
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Slug collection (vd: testimonials). Dùng cho REST /api/{slug}.',
      },
    },
    {
      name: 'labels',
      type: 'group',
      fields: [
        { name: 'singular', type: 'text', localized: true, required: true },
        { name: 'plural', type: 'text', localized: true, required: true },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: { en: 'Draft', vi: 'Nháp' }, value: 'draft' },
        { label: { en: 'Published', vi: 'Đã xuất bản' }, value: 'published' },
        { label: { en: 'Archived', vi: 'Lưu trữ' }, value: 'archived' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'supports',
      type: 'group',
      label: { en: 'Supports', vi: 'Tính năng' },
      fields: [
        { name: 'drafts', type: 'checkbox', defaultValue: true, label: 'Drafts / versions' },
        { name: 'localization', type: 'checkbox', defaultValue: true, label: 'Localization (vi/en)' },
        { name: 'slug', type: 'checkbox', defaultValue: true, label: 'URL slug' },
        { name: 'seo', type: 'checkbox', defaultValue: false, label: 'SEO group' },
      ],
    },
    {
      name: 'fields',
      type: 'array',
      labels: { singular: 'Field', plural: 'Fields' },
      admin: {
        description:
          'Khai báo field riêng cho loại nội dung này. Field Groups dùng chung gắn thêm qua menu Nhóm field.',
      },
      fields: customFieldDefFields(),
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
  ],
}
