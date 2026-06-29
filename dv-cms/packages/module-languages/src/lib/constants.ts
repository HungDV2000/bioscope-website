export const LANGUAGES_SLUG = 'languages' as const

/** BCP-47 lite: vi, en, en-US */
export const LOCALE_CODE_RE = /^[a-z]{2}(-[A-Z]{2})?$/

export const DEFAULT_MANIFEST = {
  defaultLocale: 'vi',
  fallback: true,
  locales: [
    { code: 'vi', label: 'Tiếng Việt', rtl: false, fallbackLocale: null },
    { code: 'en', label: 'English', rtl: false, fallbackLocale: 'vi' },
  ],
} as const
