'use client'

/**
 * TwoFactorGate — an admin provider that blocks the UI with an OTP prompt when
 * the logged-in user has 2FA enabled but this session hasn't passed it yet
 * (checked via /api/security/2fa/status). Users without 2FA are never affected,
 * so this can't lock out un-enrolled admins.
 */

import React, { useCallback, useEffect, useState } from 'react'

export const TwoFactorGate: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [required, setRequired] = useState(false)
  const [checked, setChecked] = useState(false)
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const check = useCallback(async () => {
    try {
      const r = await fetch('/api/security/2fa/status', { credentials: 'include' })
      const j = await r.json()
      setRequired(Boolean(j?.required))
    } catch {
      setRequired(false)
    } finally {
      setChecked(true)
    }
  }, [])

  useEffect(() => {
    check()
  }, [check])

  const submit = async () => {
    setBusy(true)
    setErr('')
    try {
      const r = await fetch('/api/security/2fa/verify', {
        method: 'post',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token: code }),
      })
      const j = await r.json()
      if (r.ok) {
        setRequired(false)
      } else {
        setErr(j?.error ?? 'Mã không đúng.')
      }
    } catch {
      setErr('Lỗi kết nối.')
    } finally {
      setBusy(false)
    }
  }

  // Render children always; overlay only when a check has completed and 2FA is due.
  return (
    <>
      {children}
      {checked && required && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(12,16,20,0.72)',
            display: 'grid',
            placeItems: 'center',
            backdropFilter: 'blur(3px)',
          }}
        >
          <div
            style={{
              width: 360,
              maxWidth: '90vw',
              background: 'var(--theme-elevation-0,#fff)',
              borderRadius: 14,
              padding: 24,
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 4 }}>🔐 Xác thực 2 lớp</div>
            <p style={{ fontSize: 13, color: '#7a8794', marginBottom: 16 }}>
              Nhập mã 6 số từ ứng dụng Authenticator để tiếp tục.
            </p>
            <input
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={(e) => e.key === 'Enter' && code.length === 6 && submit()}
              placeholder="000000"
              inputMode="numeric"
              style={{
                fontFamily: 'ui-monospace, monospace',
                fontSize: 24,
                letterSpacing: 8,
                textAlign: 'center',
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid var(--theme-elevation-200,#cbd5dc)',
                boxSizing: 'border-box',
              }}
            />
            {err && <div style={{ color: '#f56565', fontSize: 13, marginTop: 8 }}>{err}</div>}
            <button
              type="button"
              onClick={submit}
              disabled={busy || code.length !== 6}
              style={{
                marginTop: 14,
                width: '100%',
                background: '#008e4d',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '11px 0',
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                opacity: busy || code.length !== 6 ? 0.6 : 1,
              }}
            >
              {busy ? 'Đang kiểm tra…' : 'Xác nhận'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default TwoFactorGate
