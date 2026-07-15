import type { Config, Plugin, CollectionConfig } from 'payload'
import { SecuritySettings } from './globals/SecuritySettings.js'
import { BlockedIps } from './collections/BlockedIps.js'
import { SecurityEvents } from './collections/SecurityEvents.js'
import { uploadScannerHook } from './hooks/uploadScanner.js'
import { beforeLoginHook, afterLoginHook } from './hooks/loginProtection.js'
import { firewallConfigEndpoint } from './endpoints/firewallConfig.js'
import { twoFactorEndpoints } from './endpoints/twoFactor.js'
import type { Field } from 'payload'

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
  /** Register the 2FA fields/endpoints/gate (default true). */
  twoFactor?: boolean
}

/**
 * Fields added to the auth collection to support TOTP 2FA. Secrets are `hidden`
 * (stripped from API responses) but still available server-side on req.user for
 * the 2FA endpoints. `twoFactorEnabled` is saved to the JWT so the gate can read
 * it without a DB hit.
 */
const TWO_FACTOR_FIELDS: Field[] = [
  {
    name: 'twoFactorEnabled',
    type: 'checkbox',
    defaultValue: false,
    saveToJWT: true,
    admin: {
      readOnly: true,
      description: '2FA (TOTP). Bật/tắt qua nút bên dưới — không sửa trực tiếp.',
      position: 'sidebar',
    },
  },
  {
    name: 'twoFactorSetup',
    type: 'ui',
    admin: {
      components: { Field: '/components/TwoFactorSetup/TwoFactorSetup#TwoFactorSetup' },
    },
  },
  { name: 'twoFactorSecret', type: 'text', hidden: true },
  { name: 'twoFactorPendingSecret', type: 'text', hidden: true },
]

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

    // Public firewall-config endpoint + authenticated 2FA endpoints.
    config.endpoints = [...(config.endpoints ?? []), firewallConfigEndpoint, ...twoFactorEndpoints]

    // Post-login 2FA gate — wraps the admin UI (only blocks users who enabled 2FA).
    if (options.twoFactor !== false) {
      config.admin = {
        ...config.admin,
        components: {
          ...config.admin?.components,
          providers: [
            ...(config.admin?.components?.providers ?? []),
            '/components/TwoFactorGate/TwoFactorGate#TwoFactorGate',
          ],
        },
      }
    }

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
          fields: [...(col.fields ?? []), ...(options.twoFactor !== false ? TWO_FACTOR_FIELDS : [])],
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
