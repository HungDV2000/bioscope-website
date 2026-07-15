import type { Config, Plugin } from 'payload'
import { ConsentSettings } from './globals/ConsentSettings.js'
import { ConsentLog } from './collections/ConsentLog.js'
import { consentEndpoints } from './endpoints/consent.js'

export type ConsentPluginOptions = {
  /** Register the consent-settings global (default true). */
  settings?: boolean
  /** Register the consent-log collection (default true). */
  log?: boolean
}

/**
 * Complianz-style GDPR consent module. Registers the consent-settings global,
 * the consent-log collection (proof-of-consent) and public config/record
 * endpoints. The frontend CookieBanner + script blocker consume these.
 */
export const consentPlugin =
  (options: ConsentPluginOptions = {}): Plugin =>
  (incoming: Config): Config => {
    const config = { ...incoming }
    if (options.settings !== false) {
      config.globals = [...(config.globals ?? []), ConsentSettings]
    }
    if (options.log !== false) {
      config.collections = [...(config.collections ?? []), ConsentLog]
    }
    config.endpoints = [...(config.endpoints ?? []), ...consentEndpoints]
    return config
  }
