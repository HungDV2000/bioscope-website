/** Locale entry written to manifest & passed to Payload `localization`. */
export type LocaleManifestEntry = {
  code: string
  label: string
  rtl?: boolean
  fallbackLocale?: string | null
}

export type LocalesManifest = {
  defaultLocale: string
  fallback: boolean
  locales: LocaleManifestEntry[]
}

export type LanguageDoc = {
  id: string | number
  code: string
  label: string
  nativeLabel?: string | null
  enabled?: boolean | null
  isDefault?: boolean | null
  rtl?: boolean | null
  fallbackLocale?: string | null
  sortOrder?: number | null
  flag?: string | null
}

export type PublicLocale = {
  code: string
  label: string
  nativeLabel?: string | null
  isDefault: boolean
  rtl: boolean
  fallbackLocale?: string | null
  flag?: string | null
}
