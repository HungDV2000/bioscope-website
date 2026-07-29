import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access/index.js'
import { ADMIN_GROUP_SYSTEM } from '../i18n/admin-groups.js'

/**
 * Nhật ký thay đổi — ghi lại ai tạo/sửa/xoá nội dung nào, khi nào.
 *
 * CHỈ được ghi qua hook (overrideAccess), không cho tạo/sửa/xoá tay từ admin
 * hay API → nhật ký không bị giả mạo. Đọc dành cho admin/editor để truy vết.
 */
export const AuditLogs: CollectionConfig = {
  slug: 'audit-logs',
  labels: { singular: { en: 'Audit log', vi: 'Nhật ký thay đổi' }, plural: { en: 'Audit logs', vi: 'Nhật ký thay đổi' } },
  admin: {
    group: ADMIN_GROUP_SYSTEM,
    useAsTitle: 'summary',
    defaultColumns: ['action', 'collectionSlug', 'documentTitle', 'userName', 'createdAt'],
    description: 'Ai đã tạo/sửa/xoá nội dung nào. Chỉ đọc — hệ thống tự ghi.',
    disableCopyToLocale: true,
  },
  access: {
    read: isAdminOrEditor,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: 'summary', type: 'text', admin: { hidden: true } },
    {
      name: 'action',
      type: 'select',
      options: [
        { label: 'Tạo', value: 'create' },
        { label: 'Sửa', value: 'update' },
        { label: 'Xoá', value: 'delete' },
      ],
      index: true,
    },
    { name: 'collectionSlug', type: 'text', label: 'Loại nội dung', index: true },
    { name: 'documentId', type: 'text', label: 'ID bản ghi' },
    { name: 'documentTitle', type: 'text', label: 'Tiêu đề' },
    { name: 'userEmail', type: 'text', label: 'Email người dùng', index: true },
    { name: 'userName', type: 'text', label: 'Người dùng' },
  ],
}
