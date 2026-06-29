import type { Config, Plugin } from 'payload'

import { StaffRoles } from './collections/StaffRoles.js'
import {
  applyRbacToCollection,
  applyRbacToGlobal,
  patchUsersCollection,
  seedDefaultStaffRoles,
} from './lib/patchConfig.js'

export type PermissionsPluginOptions = {
  /** Seed admin/editor/viewer roles on init (default: true). */
  seedDefaultRoles?: boolean
  /** Wrap collection/global access with RBAC (default: true). */
  applyRbac?: boolean
}

/**
 * Staff RBAC module:
 * - `staff-roles` collection for permission matrix UI
 * - Patches `users` with `staffRole` relationship
 * - Wraps collection/global access based on assigned role
 */
export const permissionsPlugin =
  (options: PermissionsPluginOptions = {}): Plugin =>
  (incoming: Config): Config => {
    const config = { ...incoming }
    const shouldSeed = options.seedDefaultRoles !== false
    const shouldApplyRbac = options.applyRbac !== false

    const existingCollections = config.collections ?? []

    config.collections = [
      StaffRoles,
      ...existingCollections.map((col) => {
        if (col.slug === 'users') {
          return shouldApplyRbac ? applyRbacToCollection(patchUsersCollection(col)) : patchUsersCollection(col)
        }
        return shouldApplyRbac ? applyRbacToCollection(col) : col
      }),
    ]

    if (shouldApplyRbac && config.globals?.length) {
      config.globals = config.globals.map(applyRbacToGlobal)
    }

    if (shouldSeed && process.env.PAYLOAD_MIGRATING !== 'true') {
      const prevOnInit = config.onInit
      config.onInit = async (payload) => {
        await seedDefaultStaffRoles(payload)
        if (prevOnInit) await prevOnInit(payload)
      }
    }

    return config
  }
