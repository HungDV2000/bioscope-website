import type { Access, FieldAccess } from 'payload'

/**
 * Access helpers shared across the whole CMS.
 *
 * NOTE: with multiple auth collections (staff `users` + B2B `members`) we always
 * check `user.collection` so that a logged-in B2B member can never be mistaken
 * for an admin.
 */

type AnyUser = { collection?: string; role?: string } | null | undefined

/** Boolean-only access fn — assignable to both `access.*` and `access.admin`. */
type BoolAccess = (args: Parameters<Access>[0]) => boolean

const isStaff = (user: AnyUser): boolean => Boolean(user && user.collection === 'users')

/** Anyone (public). */
export const anyone: BoolAccess = () => true

/** Only signed-in staff with role `admin`. */
export const isAdmin: BoolAccess = ({ req: { user } }) =>
  isStaff(user as AnyUser) && (user as AnyUser)?.role === 'admin'

/** Signed-in staff with role `admin` or `editor`. */
export const isAdminOrEditor: BoolAccess = ({ req: { user } }) =>
  isStaff(user as AnyUser) && ['admin', 'editor'].includes((user as AnyUser)?.role ?? '')

/** Any signed-in staff member (admin/editor/viewer). */
export const isStaffUser: BoolAccess = ({ req: { user } }) => isStaff(user as AnyUser)

/**
 * Public read of published docs; staff can read everything (incl. drafts).
 * Use on collections that have draft/published versions.
 */
export const readPublishedOrStaff: Access = ({ req: { user } }) => {
  if (isStaff(user as AnyUser)) return true
  return { _status: { equals: 'published' } }
}

/** Field-level: only admins may edit. */
export const isAdminFieldLevel: FieldAccess = ({ req: { user } }) =>
  isStaff(user as AnyUser) && (user as AnyUser)?.role === 'admin'
