import { readFileSync } from 'node:fs'

import { DEFAULT_MANIFEST } from '../lib/constants.js'
import { readManifest } from '../hooks/syncManifest.js'
import type { LocalesManifest } from '../types.js'

type LocalizationConfig = {
  defaultLocale: string
  fallback: boolean
  locales: Array<{
    code: string
    label: string
    rtl?: boolean
    fallbackLocale?: string
  }>
}

function toPayloadLocalization(manifest: LocalesManifest): LocalizationConfig {
  return {
    defaultLocale: manifest.defaultLocale,
    fallback: manifest.fallback,
    locales: manifest.locales.map((l) => ({
      code: l.code,
      label: l.label,
      rtl: l.rtl,
      ...(l.fallbackLocale ? { fallbackLocale: l.fallbackLocale } : {}),
    })),
  }
}

function defaultLocalization(): LocalizationConfig {
  return toPayloadLocalization({
    defaultLocale: DEFAULT_MANIFEST.defaultLocale,
    fallback: DEFAULT_MANIFEST.fallback,
    locales: DEFAULT_MANIFEST.locales.map((l) => ({ ...l })),
  })
}

/**
 * Read locales manifest (synced from admin) for Payload `localization` config.
 * Falls back to vi/en when manifest is missing.
 */
export function resolveLocalizationConfig(manifestPath?: string): LocalizationConfig {
  if (!manifestPath) return defaultLocalization()

  try {
    const raw = readFileSync(manifestPath, 'utf-8')
    const manifest = JSON.parse(raw) as LocalesManifest
    if (manifest?.locales?.length) {
      return toPayloadLocalization(manifest)
    }
  } catch {
    // use default
  }

  return defaultLocalization()
}

/** Async variant for scripts. */
export async function resolveLocalizationConfigAsync(manifestPath: string): Promise<LocalizationConfig> {
  const manifest = await readManifest(manifestPath)
  if (manifest?.locales?.length) {
    return toPayloadLocalization(manifest)
  }
  return defaultLocalization()
}
