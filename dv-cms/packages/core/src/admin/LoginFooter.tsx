'use client'

import React from 'react'

import { useDvTranslation } from '../i18n/useDvTranslation.js'

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://web.bioscope.vn'

export const LoginFooter: React.FC = () => {
  const { t } = useDvTranslation()
  return (
    <p className="dv-login-footer">
      <a href={FRONTEND_URL} className="dv-login-footer__link">
        {t('dv:login.backToSite')}
      </a>
    </p>
  )
}

export default LoginFooter
