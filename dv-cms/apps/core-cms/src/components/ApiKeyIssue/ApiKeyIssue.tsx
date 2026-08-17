'use client'

import { useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

/**
 * Nút phát khoá API. Khoá gốc hiện ĐÚNG MỘT LẦN ngay tại đây rồi biến mất —
 * hệ thống chỉ giữ bản băm nên không có cách nào xem lại.
 */
export function ApiKeyIssue() {
  const { id } = useDocumentInfo()
  const [key, setKey] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!id) {
    return (
      <p style={{ opacity: 0.7, fontSize: 13 }}>
        Đặt tên rồi bấm <strong>Lưu</strong>, sau đó nút phát khoá sẽ hiện ở đây.
      </p>
    )
  }

  const issue = async () => {
    if (!window.confirm('Phát khoá mới? Khoá cũ (nếu có) sẽ NGỪNG hoạt động ngay lập tức.')) return
    setBusy(true)
    setErr('')
    setKey('')
    try {
      const r = await fetch('/api/catalog/keys/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id }),
      }).then((x) => x.json())
      if (r?.ok && r.key) setKey(r.key as string)
      else setErr((r?.error as string) || 'Không phát được khoá.')
    } catch {
      setErr('Không kết nối được máy chủ.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      style={{
        border: '1px solid var(--theme-elevation-150)',
        background: 'var(--theme-elevation-50)',
        borderRadius: 6,
        padding: '12px 14px',
        fontSize: 13,
        lineHeight: 1.6,
      }}
    >
      <button
        type="button"
        onClick={() => void issue()}
        disabled={busy}
        className="btn btn--style-secondary"
        style={{ margin: 0 }}
      >
        {busy ? 'Đang phát…' : '🔑 Phát khoá mới'}
      </button>

      {err && <p style={{ color: 'var(--theme-error-500)', marginTop: 10 }}>{err}</p>}

      {key && (
        <div style={{ marginTop: 12 }}>
          <p style={{ margin: '0 0 6px', fontWeight: 600, color: 'var(--theme-success-600, #157347)' }}>
            Khoá mới — chỉ hiện MỘT LẦN, lưu lại ngay:
          </p>
          <code
            style={{
              display: 'block',
              padding: '10px 12px',
              background: 'var(--theme-elevation-100)',
              borderRadius: 4,
              wordBreak: 'break-all',
              userSelect: 'all',
            }}
          >
            {key}
          </code>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard?.writeText(key)
              setCopied(true)
            }}
            className="btn btn--style-secondary"
            style={{ marginTop: 8 }}
          >
            {copied ? '✓ Đã chép' : 'Chép khoá'}
          </button>
          <p style={{ margin: '10px 0 0', opacity: 0.75 }}>
            Gửi khoá cho đối tác qua kênh an toàn. Bên nhận đặt vào Script Properties, gọi API bằng
            header <code>x-api-key</code>. <strong>Không</strong> dán khoá vào tài liệu dùng chung.
          </p>
        </div>
      )}
    </div>
  )
}
