/** Actions that can be granted per resource. */
export type PermissionAction = 'read' | 'create' | 'update' | 'delete' | 'publish' | 'admin'

export type PermissionResourceType = 'collection' | 'global'

/** One row in the permissions matrix on a staff role. */
export type PermissionRule = {
  resourceType: PermissionResourceType
  /** Collection/global slug, or `*` for all of that type. */
  resource: string
  actions: PermissionAction[]
}

export type StaffRoleDoc = {
  id: string | number
  slug: string
  name: string
  isSystem?: boolean
  permissions?: PermissionRule[]
}

export type StaffUserLike = {
  id?: string | number
  collection?: string
  role?: string
  staffRole?: StaffRoleDoc | string | number | null
}
