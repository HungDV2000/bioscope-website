export type FrontendTheme = {
  primaryColor?: string
  primaryDark?: string
  primaryTint?: string
  primaryBorder?: string
  accentColor?: string
  accentSoft?: string
  ink?: string
  mist?: string
  /** Google Font slug, e.g. `be-vietnam-pro` */
  fontFamily?: string
  radiusLg?: number
  radiusXl?: number
  radius2xl?: number
}

export type AdminTheme = {
  primaryColor?: string
  primaryDark?: string
  accentColor?: string
  sidebarBackground?: string
  radius?: number
  /** Google Font slug, e.g. `be-vietnam-pro` */
  fontFamily?: string
}

export type BrandingGlobal = {
  brandName?: string | null
  logo?: { url?: string | null } | null
  loginSubtitle?: string | null
  /** Admin dashboard — flat fields (match existing DB columns). */
  primaryColor?: string | null
  primaryDark?: string | null
  accentColor?: string | null
  sidebarBackground?: string | null
  radius?: number | null
  fontFamily?: string | null
  frontendTheme?: FrontendTheme | null
}

export type ResolvedFrontendTheme = Required<FrontendTheme> & {
  fontGoogleId: string
  fontGoogleUrl: string
  fontCssFamily: string
}
export type ResolvedAdminTheme = Required<AdminTheme> & {
  fontCssFamily: string
}
