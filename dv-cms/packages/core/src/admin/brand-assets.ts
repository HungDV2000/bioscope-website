import type { BrandingGlobal } from '../theme/types.js'

export const DEFAULT_BIOSCOPE_LOGO = '/logo.avif'

export type BrandingData = BrandingGlobal

export function resolveLogoUrl(branding?: BrandingData | null): string {
  return branding?.logo?.url || DEFAULT_BIOSCOPE_LOGO
}
