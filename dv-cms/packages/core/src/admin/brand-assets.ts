export const DEFAULT_BIOSCOPE_LOGO = '/logo.avif'

export type BrandingData = {
  brandName?: string
  loginSubtitle?: string
  logo?: { url?: string } | null
}

export function resolveLogoUrl(branding?: BrandingData | null): string {
  return branding?.logo?.url || DEFAULT_BIOSCOPE_LOGO
}
