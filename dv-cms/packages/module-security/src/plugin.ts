import type { Config, Plugin } from 'payload'
import { SecuritySettings } from './globals/SecuritySettings.js'
import { BlockedIps } from './collections/BlockedIps.js'
import { SecurityEvents } from './collections/SecurityEvents.js'

export type SecurityPluginOptions = {
  /** Register the security-settings global (default true). */
  settings?: boolean
  /** Register the blocked-ips + security-events collections (default true). */
  collections?: boolean
}

/**
 * Wordfence-style security module. Registers:
 *  - `security-settings` global (firewall, rate limit, IP, login, scanner)
 *  - `blocked-ips` collection (dynamic blocklist)
 *  - `security-events` collection (live traffic / audit log)
 *
 * The firewall engine (`lib/firewall`) is consumed by the Next.js proxy and the
 * Payload server. Depends on `@dv/cms-core` (access control) being registered
 * first. Login brute-force protection & 2FA are wired via collection hooks in a
 * follow-up (see loginProtection).
 */
export const securityPlugin =
  (options: SecurityPluginOptions = {}): Plugin =>
  (incoming: Config): Config => {
    const config = { ...incoming }

    if (options.settings !== false) {
      config.globals = [...(config.globals ?? []), SecuritySettings]
    }
    if (options.collections !== false) {
      config.collections = [...(config.collections ?? []), BlockedIps, SecurityEvents]
    }

    return config
  }
