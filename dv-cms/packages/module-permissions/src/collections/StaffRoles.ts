import type { CollectionConfig } from 'payload'
import { isAdmin } from '@dv/cms-core'

import { ADMIN_GROUP_PERMISSIONS } from '../i18n/admin-groups.js'
import { permissionRuleFields } from '../fields/permissionRuleFields.js'
import { STAFF_ROLES_SLUG } from '../lib/constants.js'

/** Staff role definitions — granular collection/global permissions. */
export const StaffRoles: CollectionConfig = {
  slug: STAFF_ROLES_SLUG,
  labels: {
    singular: { en: 'Role', vi: 'Vai trò' },
    plural: { en: 'Roles', vi: 'Vai trò' },
  },
  trash: false,
  admin: {
    useAsTitle: 'name',
    group: ADMIN_GROUP_PERMISSIONS,
    defaultColumns: ['name', 'slug', 'updatedAt'],
    description: {
      en: 'Define staff roles and assign permissions per collection/global.',
      vi: 'Định nghĩa vai trò nhân viên và phân quyền theo collection/global.',
    },
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
    admin: isAdmin,
  },
  hooks: {
    beforeDelete: [
      ({ id, req }) => {
        return req.payload
          .findByID({ collection: STAFF_ROLES_SLUG, id, depth: 0, overrideAccess: true })
          .then((doc) => {
            if (doc?.isSystem) {
              throw new Error('Không thể xóa vai trò hệ thống.')
            }
          })
      },
    ],
    beforeChange: [
      ({ data, originalDoc }) => {
        if (originalDoc?.isSystem && data?.slug && data.slug !== originalDoc.slug) {
          throw new Error('Không thể đổi slug vai trò hệ thống.')
        }
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: false,
      admin: {
        description: { en: 'Display name', vi: 'Tên hiển thị' },
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: {
          en: 'Machine slug (admin, editor, custom-role). Synced to user.role when assigned.',
          vi: 'Slug máy (admin, editor, custom-role). Đồng bộ sang user.role khi gán.',
        },
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: { en: 'Optional notes', vi: 'Ghi chú tuỳ chọn' },
      },
    },
    {
      name: 'isSystem',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: {
          en: 'System roles cannot be deleted.',
          vi: 'Vai trò hệ thống không thể xóa.',
        },
      },
    },
    {
      name: 'permissions',
      type: 'array',
      label: { en: 'Permissions', vi: 'Phân quyền' },
      labels: {
        singular: { en: 'Rule', vi: 'Quy tắc' },
        plural: { en: 'Rules', vi: 'Quy tắc' },
      },
      admin: {
        description: {
          en: 'Use * as resource to grant on all collections/globals of that type.',
          vi: 'Dùng * làm resource để cấp cho tất cả collection/global cùng loại.',
        },
      },
      fields: permissionRuleFields,
    },
  ],
}
