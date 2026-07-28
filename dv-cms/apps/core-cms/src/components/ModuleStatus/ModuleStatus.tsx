'use client'

import React, { useEffect, useState } from 'react'

/**
 * Widget "Trạng thái tích hợp" cho tab Quản lý Module (Site Settings).
 * Đọc /api/module-status (chỉ báo có/không key, không lộ secret) và hiển thị
 * "Đã kết nối / Thiếu key" cho từng dịch vụ ngoài.
 */
type Integration = { key: string; label: string; connected: boolean; envVar: string }

export const ModuleStatus: React.FC = () => {
  const [items, setItems] = useState<Integration[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/module-status', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => (d?.ok ? setItems(d.integrations) : setError(d?.error ?? 'Lỗi tải trạng thái')))
      .catch((e) => setError(String(e)))
  }, [])

  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px' }}>Trạng thái tích hợp</h3>
      <p style={{ fontSize: 13, color: 'var(--theme-elevation-500)', margin: '0 0 14px' }}>
        Khoá kết nối được đặt qua biến môi trường (.env) rồi khởi động lại CMS — không lưu trong web vì lý do bảo mật.
      </p>
      {error && <p style={{ color: '#c22', fontSize: 13 }}>❌ {error}</p>}
      {!items && !error && <p style={{ fontSize: 13, color: 'var(--theme-elevation-400)' }}>Đang tải…</p>}
      <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
        {(items ?? []).map((it) => (
          <div
            key={it.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 'var(--style-radius-m, 8px)',
              border: '1px solid var(--theme-elevation-150)',
              background: 'var(--theme-elevation-0)',
            }}
          >
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--theme-elevation-800)' }}>{it.label}</div>
              <code style={{ fontSize: 11, color: 'var(--theme-elevation-400)' }}>{it.envVar}</code>
            </div>
            <span
              style={{
                flexShrink: 0,
                fontSize: 12,
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: 999,
                background: it.connected ? 'rgba(0,142,77,0.12)' : 'rgba(200,40,40,0.1)',
                color: it.connected ? 'var(--dv-primary, #008e4d)' : '#c22',
              }}
            >
              {it.connected ? '● Đã kết nối' : '○ Thiếu key'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ModuleStatus
