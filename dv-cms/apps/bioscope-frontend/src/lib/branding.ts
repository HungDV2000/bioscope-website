import {
  cssVarsToBlock,
  frontendThemeToCssVars,
  resolveFrontendTheme,
  type BrandingGlobal,
} from '@dv/cms-core/theme'

import { cmsFetch } from './payload'

/** Branding global from CMS (logo + theme tokens). */
export async function getBranding(): Promise<BrandingGlobal | null> {
  return cmsFetch<BrandingGlobal>('globals/branding?depth=1', { revalidate: 300 })
}

/** CSS block overriding Tailwind `@theme` tokens from CMS. */
export async function getFrontendThemeCss(): Promise<string> {
  const branding = await getBranding()
  return cssVarsToBlock(frontendThemeToCssVars(resolveFrontendTheme(branding)))
}

export async function getFrontendThemeColor(): Promise<string> {
  const branding = await getBranding()
  return resolveFrontendTheme(branding).primaryColor
}

export async function getFrontendFontStylesheetUrl(): Promise<string> {
  const branding = await getBranding()
  return resolveFrontendTheme(branding).fontGoogleUrl
}
