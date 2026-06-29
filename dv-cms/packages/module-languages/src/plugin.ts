import type { Config, Plugin } from 'payload'

import { Languages } from './collections/Languages.js'
import { createLanguagesEndpoints } from './endpoints/index.js'
import { seedDefaultLanguages } from './hooks/languageHooks.js'
import { buildManifestFromPayload, writeManifest } from './hooks/syncManifest.js'
import { getManifestPath, setManifestPath } from './lib/manifestPath.js'

export type LanguagesPluginOptions = {
  /** Absolute or cwd-relative path to locales manifest JSON. */
  manifestPath?: string
  /** Seed vi/en on init (default: true). */
  seedDefaults?: boolean
}

/**
 * Site language management:
 * - `languages` collection in admin
 * - Syncs `locales-manifest.json` for Payload `localization` config
 * - Public API `GET /api/lang/locales` for frontend
 */
export const languagesPlugin =
  (options: LanguagesPluginOptions = {}): Plugin =>
  (incoming: Config): Config => {
    const config = { ...incoming }
    const shouldSeed = options.seedDefaults !== false

    if (options.manifestPath) {
      setManifestPath(options.manifestPath)
    }

    config.collections = [...(config.collections ?? []), Languages]
    config.endpoints = [...(config.endpoints ?? []), ...createLanguagesEndpoints()]

    if (shouldSeed && process.env.PAYLOAD_MIGRATING !== 'true') {
      const prevOnInit = config.onInit
      config.onInit = async (payload) => {
        await seedDefaultLanguages(payload)
        try {
          const manifest = await buildManifestFromPayload(payload)
          await writeManifest(manifest, getManifestPath())
        } catch (err) {
          payload.logger.warn(`[languages] initial manifest sync skipped: ${err}`)
        }
        if (prevOnInit) await prevOnInit(payload)
      }
    }

    return config
  }
