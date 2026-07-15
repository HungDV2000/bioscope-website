'use client'

/**
 * TwoFactorSetup — self-service TOTP enrollment, rendered on the user edit page.
 * Operates on the CURRENTLY LOGGED-IN user (the 2FA endpoints use req.user), so
 * it only makes sense on your own account; we detect and note otherwise.
 */

import React, { useEffect, useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

type Me = { id: string | number; twoFactorEnabled?: boolean } | null

export const TwoFactorSetup: React.FC = () => {
  const { id: docId } = useDocumentInfo()
  const [me, setMe] = useState<Me>(null)
  const [phase, setPhase] = useState<'idle' | 'enrolling' | 'done'>('idle')
  const [secret, setSecret] = useState('')
  const [uri, setUri] = useState('')
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState<{ t: 'err' | 'ok'; m: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const loadMe = async () => {
    try {
      const r = await fetch('/api/users/me', { credentials: 'include' })
      const j = await r.json()
      setMe(j?.user ?? null)
    } catch {
      /* ignore */
    }
  }
  useEffect(() => {
    loadMe()
  }, [])

  const isSelf = me && String(me.id) === String(docId)

  const post = async (path: string, body?: object) => {
    const r = await fetch(path, {
      method: 'post',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })
    return { ok: r.ok, data: await r.json().catch(() => ({})) }
  }

  const startEnroll = async () => {
    setBusy(true)
    setMsg(null)
    const { ok, data } = await post('/api/security/2fa/setup')
    setBusy(false)
    if (ok) {
      setSecret(data.secret)
      setUri(data.otpauthUri)
      setPhase('enrolling')
    } else setMsg({ t: 'err', m: data.error ?? 'Lỗi khởi tạo.' })
  }

  const confirmEnable = async () => {
    setBusy(true)
    setMsg(null)
    const { ok, data } = await post('/api/security/2fa/enable', { token: code })
    setBusy(false)
    if (ok) {
      setPhase('done')
      setMsg({ t: 'ok', m: 'Đã bật 2FA. Lần đăng nhập tới sẽ cần mã.' })
      loadMe()
    } else setMsg({ t: 'err', m: data.error ?? 'Mã không đúng.' })
  }

  const disable = async () => {
    const token = window.prompt('Nhập mã 2FA hiện tại để tắt:')
    if (!token) return
    setBusy(true)
    const { ok, data } = await post('/api/security/2fa/disable', { token })
    setBusy(false)
    if (ok) {
      setMsg({ t: 'ok', m: 'Đã tắt 2FA.' })
      loadMe()
    } else setMsg({ t: 'err', m: data.error ?? 'Không tắt được.' })
  }

  const box: React.CSSProperties = {
    border: '1px solid var(--theme-elevation-150,#e3e8ec)',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  }

  if (!isSelf) {
    return (
      <div style={box}>
        <strong>🔐 Xác thực 2 lớp (2FA)</strong>
        <p style={{ fontSize: 13, color: '#7a8794', marginTop: 6 }}>
          Chỉ có thể thiết lập 2FA cho <strong>tài khoản đang đăng nhập của bạn</strong>. Hãy mở trang tài
          khoản của chính bạn để bật/tắt.
        </p>
      </div>
    )
  }

  return (
    <div style={box}>
      <strong>🔐 Xác thực 2 lớp (2FA · TOTP)</strong>
      {msg && (
        <div style={{ marginTop: 8, color: msg.t === 'err' ? '#f56565' : '#38a169', fontSize: 13 }}>{msg.m}</div>
      )}

      {me?.twoFactorEnabled ? (
        <div style={{ marginTop: 10 }}>
          <span style={{ color: '#38a169', fontWeight: 600 }}>● Đang bật</span>
          <button type="button" onClick={disable} disabled={busy} style={btn('#f56565')}>
            Tắt 2FA
          </button>
        </div>
      ) : phase === 'idle' ? (
        <div style={{ marginTop: 10 }}>
          <p style={{ fontSize: 13, color: '#7a8794' }}>
            Dùng Google Authenticator / Authy / 1Password để bảo vệ đăng nhập.
          </p>
          <button type="button" onClick={startEnroll} disabled={busy} style={btn('#008e4d')}>
            {busy ? 'Đang tạo…' : 'Bật 2FA'}
          </button>
        </div>
      ) : phase === 'enrolling' ? (
        <div style={{ marginTop: 10, fontSize: 13 }}>
          <p style={{ marginBottom: 6 }}>
            1) Mở app Authenticator → thêm tài khoản → <strong>nhập khóa thủ công</strong> mã dưới đây (hoặc dán
            liên kết otpauth):
          </p>
          <div
            style={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: 16,
              letterSpacing: 2,
              background: 'var(--theme-elevation-50,#f4f6f8)',
              padding: '8px 12px',
              borderRadius: 6,
              userSelect: 'all',
              wordBreak: 'break-all',
            }}
          >
            {secret}
          </div>
          <a href={uri} style={{ fontSize: 11, color: '#008e4d', display: 'inline-block', margin: '6px 0', wordBreak: 'break-all' }}>
            {uri}
          </a>
          <p style={{ margin: '8px 0 4px' }}>2) Nhập mã 6 số app hiển thị:</p>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            inputMode="numeric"
            style={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: 18,
              letterSpacing: 4,
              width: 140,
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid var(--theme-elevation-200,#cbd5dc)',
            }}
          />
          <button type="button" onClick={confirmEnable} disabled={busy || code.length !== 6} style={btn('#008e4d')}>
            Xác nhận bật
          </button>
        </div>
      ) : null}
    </div>
  )
}

function btn(color: string): React.CSSProperties {
  return {
    marginLeft: 10,
    background: color,
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    padding: '7px 14px',
    fontWeight: 600,
    cursor: 'pointer',
  }
}

export default TwoFactorSetup
