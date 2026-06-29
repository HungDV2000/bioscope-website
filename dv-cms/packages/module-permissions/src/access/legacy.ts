import type { PermissionRule } from '../types.js'
import { ALL_PERMISSION_ACTIONS } from '../lib/constants.js'

const allActions = [...ALL_PERMISSION_ACTIONS]

const contentGlobals = ['site-settings', 'navigation', 'branding']

const rulesFor = (
  resourceType: PermissionRule['resourceType'],
  slugs: string[],
  actions: PermissionRule['actions'],
): PermissionRule[] => slugs.map((resource) => ({ resourceType, resource, actions }))

/**
 * Built-in presets when user has legacy `role` but no `staffRole` assigned.
 * Wildcard `*` skips sensitive collections (`users`, `staff-roles`) — see checkPermissionRules.
 */
export const LEGACY_ROLE_PRESETS: Record<string, PermissionRule[]> = {
  admin: [{ resourceType: 'collection', resource: '*', actions: allActions }],
  editor: [
    {
      resourceType: 'collection',
      resource: '*',
      actions: ['read', 'create', 'update', 'delete', 'publish', 'admin'],
    },
    ...rulesFor('global', contentGlobals, ['read', 'update', 'admin']),
  ],
  viewer: [
    { resourceType: 'collection', resource: '*', actions: ['read', 'admin'] },
    ...rulesFor('global', contentGlobals, ['read', 'admin']),
  ],
}

export function getLegacyPreset(role?: string): PermissionRule[] {
  return LEGACY_ROLE_PRESETS[role ?? 'viewer'] ?? LEGACY_ROLE_PRESETS.viewer!
}
