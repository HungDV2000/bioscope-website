import { DEFAULT_ADMIN_THEME, DEFAULT_FRONTEND_THEME } from './defaults'
import {
  googleFontCssFamily,
  googleFontStylesheetUrl,
  resolveGoogleFontId,
} from './googleFonts'
import type {
  BrandingGlobal,
  ResolvedAdminTheme,
  ResolvedFrontendTheme,
} from './types'

const pick = <T extends Record<string, string | number>>(
  defaults: T,
  patch?: Partial<T> | null,
): T => {
  const out = { ...defaults }
  if (!patch) return out
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    const value = patch[key]
    if (value !== undefined && value !== null && value !== '') {
      out[key] = value as T[keyof T]
    }
  }
  return out
}

export const resolveFrontendTheme = (branding?: BrandingGlobal | null): ResolvedFrontendTheme => {
  const picked = pick(DEFAULT_FRONTEND_THEME, branding?.frontendTheme ?? null)
  const fontGoogleId = resolveGoogleFontId(picked.fontFamily)
  return {
    ...picked,
    fontFamily: fontGoogleId,
    fontGoogleId,
    fontGoogleUrl: googleFontStylesheetUrl(fontGoogleId),
    fontCssFamily: googleFontCssFamily(fontGoogleId),
  }
}

export const resolveAdminTheme = (branding?: BrandingGlobal | null): ResolvedAdminTheme => {
  const picked = pick(DEFAULT_ADMIN_THEME, {
    primaryColor: branding?.primaryColor ?? undefined,
    primaryDark: branding?.primaryDark ?? undefined,
    accentColor: branding?.accentColor ?? undefined,
    sidebarBackground: branding?.sidebarBackground ?? undefined,
    radius: branding?.radius ?? undefined,
    fontFamily: branding?.fontFamily ?? undefined,
  })
  const fontGoogleId = resolveGoogleFontId(picked.fontFamily)
  return {
    ...picked,
    fontFamily: fontGoogleId,
    fontCssFamily: googleFontCssFamily(fontGoogleId),
  }
}

export const frontendThemeToCssVars = (theme: ResolvedFrontendTheme): Record<string, string> => ({
  '--color-primary': theme.primaryColor,
  '--color-primary-dark': theme.primaryDark,
  '--color-primary-tint': theme.primaryTint,
  '--color-primary-border': theme.primaryBorder,
  '--color-accent': theme.accentColor,
  '--color-accent-soft': theme.accentSoft,
  '--color-ink': theme.ink,
  '--color-mist': theme.mist,
  '--font-cms': theme.fontCssFamily,
  '--radius-lg': `${theme.radiusLg}px`,
  '--radius-xl': `${theme.radiusXl}px`,
  '--radius-2xl': `${theme.radius2xl}px`,
})

export const adminThemeToCssVars = (theme: ResolvedAdminTheme): Record<string, string> => {
  const radius = theme.radius
  return {
    '--dv-primary': theme.primaryColor,
    '--dv-primary-dark': theme.primaryDark,
    '--dv-accent': theme.accentColor,
    '--dv-sidebar-bg': theme.sidebarBackground,
    '--dv-font': theme.fontCssFamily,
    '--style-radius-s': `${Math.max(4, radius - 4)}px`,
    '--style-radius-m': `${radius}px`,
    '--style-radius-l': `${radius + 6}px`,
    '--color-success-500': theme.primaryColor,
    '--color-success-550': theme.primaryColor,
    '--color-success-600': theme.primaryDark,
    '--theme-success-500': theme.primaryColor,
  }
}

export const cssVarsToBlock = (vars: Record<string, string>, selector = ':root'): string => {
  const body = Object.entries(vars)
    .map(([key, value]) => `${key}: ${value};`)
    .join(' ')
  return `${selector} { ${body} }`
}
