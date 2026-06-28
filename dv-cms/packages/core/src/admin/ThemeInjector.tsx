'use client'

import React, { useEffect } from 'react'

type Branding = {
  primaryColor?: string
  primaryDark?: string
  accentColor?: string
  radius?: number
  fontFamily?: string
}

/**
 * Admin provider: reads the Branding global and applies brand CSS variables to
 * the document root. Degrades gracefully — the static defaults in custom.scss
 * remain if the fetch fails. Registered in `admin.components.providers`.
 */
export const ThemeInjector: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    fetch('/api/globals/branding')
      .then((r) => r.json())
      .then((b: Branding) => {
        const root = document.documentElement
        const set = (k: string, v?: string | number) => {
          if (v !== undefined && v !== null && v !== '') root.style.setProperty(k, String(v))
        }
        // Brand tokens (used by our components + scss).
        set('--dv-primary', b.primaryColor)
        set('--dv-primary-dark', b.primaryDark)
        set('--dv-accent', b.accentColor)
        if (b.fontFamily) set('--dv-font', b.fontFamily)
        // Best-effort mapping onto Payload's own accent scale.
        set('--color-success-500', b.primaryColor)
        set('--color-success-550', b.primaryColor)
        set('--color-success-600', b.primaryDark)
        if (b.radius != null) {
          set('--style-radius-s', `${Math.max(4, b.radius - 4)}px`)
          set('--style-radius-m', `${b.radius}px`)
          set('--style-radius-l', `${b.radius + 6}px`)
        }
      })
      .catch(() => {})
  }, [])

  return <>{children}</>
}

export default ThemeInjector
