'use client'

import React, { useEffect, useState } from 'react'

const greeting = () => {
  const h = new Date().getHours()
  if (h < 11) return 'Chào buổi sáng'
  if (h < 14) return 'Chào buổi trưa'
  if (h < 18) return 'Chào buổi chiều'
  return 'Chào buổi tối'
}

/**
 * Slim welcome banner shown above the default Payload dashboard.
 * Intentionally does NOT duplicate the collection cards — Payload's grouped
 * dashboard below already lists them.
 */
export const DashboardWelcome: React.FC = () => {
  const [name, setName] = useState<string>('')

  useEffect(() => {
    fetch('/api/users/me')
      .then((r) => r.json())
      .then((d) => setName(d?.user?.name ?? ''))
      .catch(() => {})
  }, [])

  return (
    <div
      style={{
        marginBottom: 28,
        padding: '22px 26px',
        borderRadius: 'var(--style-radius-l, 16px)',
        border: '1px solid var(--theme-elevation-150, #e3e8e5)',
        background:
          'linear-gradient(100deg, var(--dv-primary, #0E6147) 0%, var(--dv-primary-dark, #00301A) 100%)',
        color: '#fff',
      }}
    >
      <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#fff' }}>
        👋 {greeting()}{name ? `, ${name}` : ''}
      </h2>
      <p style={{ margin: '6px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.85)' }}>
        Bảng điều khiển quản trị Bioscope — chọn một mục bên dưới để bắt đầu.
      </p>
    </div>
  )
}

export default DashboardWelcome
