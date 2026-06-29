import type { PermissionAction } from '../types.js'

export const ALL_PERMISSION_ACTIONS: PermissionAction[] = [
  'read',
  'create',
  'update',
  'delete',
  'publish',
  'admin',
]

/** Collections that never inherit wildcard `*` grants (admin must be explicit). */
export const SENSITIVE_COLLECTIONS = new Set(['users', 'staff-roles', 'languages'])

export const STAFF_ROLES_SLUG = 'staff-roles' as const
