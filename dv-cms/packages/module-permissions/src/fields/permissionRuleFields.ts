import type { Field } from 'payload'

import { ALL_PERMISSION_ACTIONS } from '../lib/constants.js'

const actionOptions = ALL_PERMISSION_ACTIONS.map((value) => ({
  label: {
    en: value.charAt(0).toUpperCase() + value.slice(1),
    vi: {
      read: 'Đọc',
      create: 'Tạo',
      update: 'Sửa',
      delete: 'Xóa',
      publish: 'Xuất bản',
      admin: 'Hiện menu admin',
    }[value],
  },
  value,
}))

/** Repeatable permission rule rows on a staff role. */
export const permissionRuleFields: Field[] = [
  {
    name: 'resourceType',
    type: 'select',
    required: true,
    defaultValue: 'collection',
    options: [
      { label: { en: 'Collection', vi: 'Collection' }, value: 'collection' },
      { label: { en: 'Global', vi: 'Global' }, value: 'global' },
    ],
  },
  {
    name: 'resource',
    type: 'text',
    required: true,
    admin: {
      description: {
        en: 'Slug (e.g. posts, pages, site-settings) or * for all resources of this type.',
        vi: 'Slug (vd: posts, pages, site-settings) hoặc * cho tất cả tài nguyên cùng loại.',
      },
    },
  },
  {
    name: 'actions',
    type: 'select',
    hasMany: true,
    required: true,
    options: actionOptions,
    admin: {
      description: {
        en: 'admin = show in sidebar; publish = publish drafts.',
        vi: 'admin = hiện trên menu; publish = xuất bản bản nháp.',
      },
    },
  },
]
