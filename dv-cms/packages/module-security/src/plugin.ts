import type { Config, Plugin, CollectionConfig } from 'payload'
import { SecuritySettings } from './globals/SecuritySettings.js'
import { BlockedIps } from './collections/BlockedIps.js'
import { SecurityEvents } from './collections/SecurityEvents.js'
import { uploadScannerHook } from './hooks/uploadScanner.js'
import { beforeLoginHook, afterLoginHook } from './hooks/loginProtection.js'
import { firewallConfigEndpoint } from './endpoints/firewallConfig.js'

export type SecurityPluginOptions = {
  /** Register the security-settings global (default true). */
  settings?: boolean
  /** Register the blocked-ips + security-events collections (default true). */
  collections?: boolean
  /** Auth collection slug to protect with login hooks (default 'users'). */
  authSlug?: string
  /** Upload collection slug to scan (default 'media'). */
  mediaSlug?: string
  /** Native per-account lockout defaults applied to the auth collection. */
  maxLoginAttempts?: number
  lockTimeMs?: number
}

/**
 * Wordfence-style security module. Registers the settings global + blocked-ips
 * and security-events collections, and injects:
 *  - login brute-force / blocked-IP hooks on the auth collection (+ native
 *    per-account lockout), and
 *  - an upload scanner on the media collection.
 *
 * The firewall engine (`lib/firewall`) is consumed by the Next.js proxy and the
 * CMS. Depends on `@dv/cms-core` and must run after the core plugin (which
 * registers users + media).
 */
export const securityPlugin =
  (options: SecurityPluginOptions = {}): Plugin =>
  (incoming: Config): Config => {
    const config = { ...incoming }
    const authSlug = options.authSlug ?? 'users'
    const mediaSlug = options.mediaSlug ?? 'media'

    if (options.settings !== false) {
      config.globals = [...(config.globals ?? []), SecuritySettings]
    }
    if (options.collections !== false) {
      config.collections = [...(config.collections ?? []), BlockedIps, SecurityEvents]
    }

    // Public firewall-config endpoint for the edge/frontend firewall.
    config.endpoints = [...(config.endpoints ?? []), firewallConfigEndpoint]

    // Inject login + upload hooks into the existing collections.
    config.collections = (config.collections ?? []).map((col: CollectionConfig): CollectionConfig => {
      if (col.slug === authSlug && col.auth) {
        return {
          ...col,
          auth:
            typeof col.auth === 'object'
              ? {
                  maxLoginAttempts: options.maxLoginAttempts ?? 5,
                  lockTime: options.lockTimeMs ?? 30 * 60_000,
                  ...col.auth,
                }
              : col.auth,
          hooks: {
            ...col.hooks,
            beforeLogin: [...(col.hooks?.beforeLogin ?? []), beforeLoginHook],
            afterLogin: [...(col.hooks?.afterLogin ?? []), afterLoginHook],
          },
        }
      }
      if (col.slug === mediaSlug && col.upload) {
        return {
          ...col,
          hooks: {
            ...col.hooks,
            beforeOperation: [...(col.hooks?.beforeOperation ?? []), uploadScannerHook],
          },
        }
      }
      return col
    })

    return config
  }
