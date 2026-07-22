import {
  cssVarsToBlock,
  frontendThemeToCssVars,
  resolveFrontendTheme,
  type BrandingGlobal,
} from '@dv/cms-core/theme'

import { cmsFetch, mediaUrl } from './payload'

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

/**
 * Browser-tab icon from the Branding global, or null when none is uploaded
 * (Next then emits no <link rel="icon"> and the browser falls back to its
 * default). Reuses the same cached `getBranding()` call the theme already
 * makes, so this costs no extra request.
 *
 * The media URL carries the uploaded filename, so replacing the file in the CMS
 * changes the URL — which is what gets browsers past their favicon cache.
 */
export async function getFaviconUrl(): Promise<{ url: string; type?: string } | null> {
  const branding = await getBranding()
  const url = mediaUrl(branding?.favicon?.url)
  if (!url) return null
  const type = branding?.favicon?.mimeType ?? undefined
  return { url, type }
}
