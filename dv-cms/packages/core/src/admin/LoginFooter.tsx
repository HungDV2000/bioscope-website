'use client'

import React from 'react'

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://web.bioscope.vn'

export const LoginFooter: React.FC = () => (
  <p className="dv-login-footer">
    <a href={FRONTEND_URL} className="dv-login-footer__link">
      ← Về website Bioscope
    </a>
  </p>
)

export default LoginFooter
