import type { CollectionConfig, GlobalConfig, Payload } from 'payload'

import { LEGACY_ROLE_PRESETS } from '../access/legacy.js'
import { STAFF_ROLES_SLUG } from '../lib/constants.js'
import {
  withGlobalStaffPermission,
  withStaffPermission,
  withStaffReadPermission,
} from '../access/wrap.js'

const RBAC_SKIP_COLLECTIONS = new Set([STAFF_ROLES_SLUG])

const DEFAULT_ROLES = [
  {
    name: 'Admin',
    slug: 'admin',
    description: 'Toàn quyền hệ thống',
    isSystem: true,
    permissions: LEGACY_ROLE_PRESETS.admin,
  },
  {
    name: 'Editor',
    slug: 'editor',
    description: 'Quản lý nội dung',
    isSystem: true,
    permissions: LEGACY_ROLE_PRESETS.editor,
  },
  {
    name: 'Viewer',
    slug: 'viewer',
    description: 'Chỉ xem',
    isSystem: true,
    permissions: LEGACY_ROLE_PRESETS.viewer,
  },
] as const

export async function seedDefaultStaffRoles(payload: Payload): Promise<void> {
  try {
    for (const role of DEFAULT_ROLES) {
      const existing = await payload.find({
        collection: STAFF_ROLES_SLUG,
        where: { slug: { equals: role.slug } },
        limit: 1,
        overrideAccess: true,
      })

      if (existing.docs.length > 0) continue

      await payload.create({
        collection: STAFF_ROLES_SLUG,
        data: {
          name: role.name,
          slug: role.slug,
          description: role.description,
          isSystem: role.isSystem,
          permissions: role.permissions.map((p) => ({ ...p, actions: [...p.actions] })),
        },
        overrideAccess: true,
      })
    }
  } catch (err) {
    const msg = String((err as Error)?.message ?? err)
    if (/relation .* does not exist/i.test(msg)) {
      payload.logger.warn('[permissions] Bỏ qua seed roles — bảng staff_roles chưa có. Chạy cms:devsafe trước.')
      return
    }
    throw err
  }
}

export function patchUsersCollection(users: CollectionConfig): CollectionConfig {
  const fields = [...(users.fields ?? [])]

  const hasStaffRole = fields.some((f) => 'name' in f && f.name === 'staffRole')
  if (!hasStaffRole) {
    fields.push({
      name: 'staffRole',
      type: 'relationship',
      relationTo: STAFF_ROLES_SLUG,
      admin: {
        position: 'sidebar',
        description: {
          en: 'Assigned role — overrides legacy role select when set.',
          vi: 'Vai trò được gán — ghi đè trường role cũ khi đã chọn.',
        },
      },
    })
  }

  const roleField = fields.find((f) => 'name' in f && f.name === 'role')
  if (roleField && 'admin' in roleField) {
    roleField.admin = {
      ...roleField.admin,
      readOnly: true,
      description: {
        en: 'Synced from Staff role (legacy field for API compat).',
        vi: 'Đồng bộ từ Vai trò (trường legacy cho API).',
      },
    }
  }

  return {
    ...users,
    admin: {
      ...users.admin,
      defaultColumns: ['name', 'email', 'staffRole', 'role'],
    },
    fields,
    hooks: {
      ...users.hooks,
      beforeChange: [
        ...(users.hooks?.beforeChange ?? []),
        async ({ data, req, operation }) => {
          if (!data?.staffRole) return data

          const roleId =
            typeof data.staffRole === 'object' ? data.staffRole.id : data.staffRole

          if (!roleId) return data

          const role = await req.payload.findByID({
            collection: STAFF_ROLES_SLUG,
            id: roleId,
            depth: 0,
            overrideAccess: true,
          })

          if (role?.slug) {
            data.role = role.slug
          }

          return data
        },
      ],
    },
  }
}

export function applyRbacToCollection(col: CollectionConfig): CollectionConfig {
  if (RBAC_SKIP_COLLECTIONS.has(col.slug)) {
    return col
  }

  const access = col.access ?? {}

  return {
    ...col,
    access: {
      ...access,
      read: withStaffReadPermission(col.slug, access.read),
      create: withStaffPermission(col.slug, 'create', access.create),
      update: withStaffPermission(col.slug, 'update', access.update),
      delete: withStaffPermission(col.slug, 'delete', access.delete),
      admin: withStaffPermission(col.slug, 'admin', access.admin ?? access.read),
    },
  }
}

export function applyRbacToGlobal(global: GlobalConfig): GlobalConfig {
  const access = global.access ?? {}

  return {
    ...global,
    access: {
      ...access,
      read: withGlobalStaffPermission(global.slug, 'read', access.read),
      update: withGlobalStaffPermission(global.slug, 'update', access.update),
    },
  }
}
