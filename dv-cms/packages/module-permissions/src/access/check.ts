import type { PayloadRequest } from 'payload'

import { SENSITIVE_COLLECTIONS } from '../lib/constants.js'
import { getLegacyPreset } from './legacy.js'
import type { PermissionAction, PermissionResourceType, PermissionRule, StaffRoleDoc, StaffUserLike } from '../types.js'

const CONTEXT_KEY = 'dvStaffRole'

type ReqWithContext = PayloadRequest & {
  context?: Record<string, unknown>
}

function isStaff(user: StaffUserLike | null | undefined): user is StaffUserLike {
  return Boolean(user && user.collection === 'users')
}

function ruleMatches(
  rule: PermissionRule,
  resourceType: PermissionResourceType,
  resourceSlug: string,
): boolean {
  if (rule.resourceType !== resourceType) return false
  return rule.resource === '*' || rule.resource === resourceSlug
}

function ruleGrants(rule: PermissionRule, action: PermissionAction): boolean {
  return rule.actions.includes(action)
}

function isFullAdminRules(rules: PermissionRule[]): boolean {
  return rules.some(
    (r) =>
      r.resourceType === 'collection' &&
      r.resource === '*' &&
      r.actions.length >= 5 &&
      r.actions.includes('read') &&
      r.actions.includes('delete'),
  )
}

export function checkPermissionRules(
  rules: PermissionRule[],
  resourceType: PermissionResourceType,
  resourceSlug: string,
  action: PermissionAction,
): boolean {
  if (!rules.length) return false

  const fullAdmin = isFullAdminRules(rules)
  const isSensitive =
    resourceType === 'collection' && SENSITIVE_COLLECTIONS.has(resourceSlug)

  if (isSensitive && !fullAdmin) {
    return rules.some(
      (rule) =>
        ruleMatches(rule, resourceType, resourceSlug) && ruleGrants(rule, action),
    )
  }

  return rules.some(
    (rule) => ruleMatches(rule, resourceType, resourceSlug) && ruleGrants(rule, action),
  )
}

async function loadStaffRoleDoc(
  req: PayloadRequest,
  user: StaffUserLike,
): Promise<StaffRoleDoc | null> {
  const staffRole = user.staffRole

  if (staffRole && typeof staffRole === 'object' && 'permissions' in staffRole) {
    return staffRole as StaffRoleDoc
  }

  if (!staffRole || !user.id) return null

  try {
    const roleId = typeof staffRole === 'object' ? staffRole.id : staffRole
    const doc = await req.payload.findByID({
      collection: 'staff-roles',
      id: roleId,
      depth: 0,
      req,
      overrideAccess: true,
    })
    return doc as StaffRoleDoc
  } catch {
    return null
  }
}

/** Resolve effective permission rules for the signed-in staff user (cached on req.context). */
export async function resolveStaffPermissionRules(
  req: ReqWithContext,
  user: StaffUserLike,
): Promise<PermissionRule[]> {
  req.context ??= {}

  if (req.context[CONTEXT_KEY]) {
    return req.context[CONTEXT_KEY] as PermissionRule[]
  }

  const roleDoc = await loadStaffRoleDoc(req, user)
  const rules =
    roleDoc?.permissions?.length
      ? roleDoc.permissions
      : getLegacyPreset(user.role)

  req.context[CONTEXT_KEY] = rules
  return rules
}

export async function staffHasPermission(
  req: PayloadRequest,
  resourceType: PermissionResourceType,
  resourceSlug: string,
  action: PermissionAction,
): Promise<boolean> {
  const user = req.user as StaffUserLike | undefined
  if (!isStaff(user)) return false

  const rules = await resolveStaffPermissionRules(req as ReqWithContext, user!)
  return checkPermissionRules(rules, resourceType, resourceSlug, action)
}

export function isStaffUser(user: StaffUserLike | null | undefined): boolean {
  return isStaff(user)
}
