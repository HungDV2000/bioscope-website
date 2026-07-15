export { securityPlugin, type SecurityPluginOptions } from './plugin.js'
export { SecuritySettings } from './globals/SecuritySettings.js'
export { BlockedIps } from './collections/BlockedIps.js'
export { SecurityEvents } from './collections/SecurityEvents.js'
export {
  inspect,
  WP_PROBE_PATTERNS,
  ATTACK_PATTERNS,
  SCANNER_UA_PATTERNS,
  type FirewallSettings,
  type FirewallRequest,
  type FirewallDecision,
} from './lib/firewall.js'
