import type { Access } from 'payload'

import { staffHasPermission } from './check.js'
import type { PermissionAction } from '../types.js'

type AnyUser = { collection?: string } | null | undefined

const isStaff = (user: AnyUser): boolean => Boolean(user && user.collection === 'users')

/** Globals mọi staff đều cần đọc (theme, nav) — không chặn bởi RBAC read. */
const GLOBAL_READ_ALL_STAFF = new Set(['branding', 'site-settings', 'navigation'])

/** Wrap an existing access fn with RBAC for staff users; public/guest paths use the original. */
export function withStaffPermission(
  resourceSlug: string,
  action: PermissionAction,
  original?: Access,
): Access {
  return async (args) => {
    const { req } = args
    const user = req.user as AnyUser

    if (isStaff(user)) {
      return staffHasPermission(req, 'collection', resourceSlug, action)
    }

    if (typeof original === 'function') {
      return original(args)
    }

    if (original === undefined) {
      return action === 'read'
    }

    return Boolean(original)
  }
}

/** Read access: staff needs `read`; guests use original (e.g. published-only query). */
export function withStaffReadPermission(resourceSlug: string, original?: Access): Access {
  return async (args) => {
    const { req } = args
    const user = req.user as AnyUser

    if (isStaff(user)) {
      return staffHasPermission(req, 'collection', resourceSlug, 'read')
    }

    if (typeof original === 'function') {
      return original(args)
    }

    return original ?? false
  }
}

export function withGlobalStaffPermission(
  globalSlug: string,
  action: Extract<PermissionAction, 'read' | 'update'>,
  original?: Access,
): Access {
  return async (args) => {
    const { req } = args
    const user = req.user as AnyUser

    if (isStaff(user)) {
      if (action === 'read' && GLOBAL_READ_ALL_STAFF.has(globalSlug)) {
        return true
      }
      return staffHasPermission(req, 'global', globalSlug, action)
    }

    if (typeof original === 'function') {
      return original(args)
    }

    return original ?? false
  }
}
