'use client'

import React, { useEffect } from 'react'

import {
  adminThemeToCssVars,
  googleFontStylesheetUrl,
  resolveAdminTheme,
  type BrandingGlobal,
} from '../theme/index.js'

const FONT_LINK_ID = 'dv-google-font'

const applyGoogleFont = (branding: BrandingGlobal) => {
  const url = googleFontStylesheetUrl(branding.fontFamily)
  let link = document.getElementById(FONT_LINK_ID) as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.id = FONT_LINK_ID
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }
  if (link.href !== url) link.href = url
}

const applyVars = (vars: Record<string, string>) => {
  const root = document.documentElement
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value)
  }
}

/**
 * Admin provider: reads the Branding global and applies dashboard CSS variables.
 * Registered in `admin.components.providers`.
 */
export const ThemeInjector: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    fetch('/api/globals/branding?depth=1')
      .then((r) => r.json())
      .then((b: BrandingGlobal) => {
        applyVars(adminThemeToCssVars(resolveAdminTheme(b)))
        applyGoogleFont(b)
      })
      .catch(() => {})
  }, [])

  return <>{children}</>
}

export default ThemeInjector
