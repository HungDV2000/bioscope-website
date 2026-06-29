'use client'

import React, { useEffect } from 'react'

import { useBranding } from './useBranding.js'
import { useDvTranslation } from '../i18n/useDvTranslation.js'

/** Sets body class for login page styles. */
export const LoginShell: React.FC = () => {
  useEffect(() => {
    document.body.classList.add('dv-login-page')
    return () => document.body.classList.remove('dv-login-page')
  }, [])
  return null
}

/** Subtitle below logo — Branding global (localized) with i18n fallback. */
export const LoginSubtitle: React.FC = () => {
  const { t, lang } = useDvTranslation()
  const branding = useBranding(lang)
  const text = branding?.loginSubtitle?.trim() || t('dv:login.subtitle')
  return <p className="dv-login-subtitle">{text}</p>
}

export default LoginShell
