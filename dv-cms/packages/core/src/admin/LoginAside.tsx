'use client'

import React, { useEffect } from 'react'

/** Sets body class for login page styles. */
export const LoginShell: React.FC = () => {
  useEffect(() => {
    document.body.classList.add('dv-login-page')
    return () => document.body.classList.remove('dv-login-page')
  }, [])
  return null
}

/** Subtitle below logo. */
export const LoginSubtitle: React.FC = () => (
  <p className="dv-login-subtitle">Đăng nhập bằng tài khoản quản trị được cấp quyền</p>
)

export default LoginShell
