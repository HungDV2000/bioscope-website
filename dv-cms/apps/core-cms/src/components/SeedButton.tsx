'use client'

import React, { useState } from 'react'

type Result = { ok: boolean; summary?: string[]; error?: string }

/**
 * Dashboard card with a one-click "seed/refresh content" button.
 * Calls `POST /api/seed` (admin-only, idempotent).
 */
export const SeedButton: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)

  const run = async () => {
    if (loading) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/seed', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
      setResult((await res.json()) as Result)
    } catch (err) {
      setResult({ ok: false, error: (err as Error)?.message ?? 'Không gọi được API.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        marginBottom: 28,
        padding: '20px 24px',
        borderRadius: 'var(--style-radius-l, 16px)',
        border: '1px solid var(--theme-elevation-150, #e3e8e5)',
        background: 'var(--theme-elevation-50, #f7f9f8)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Dữ liệu mẫu nội dung</h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--theme-elevation-500, #5a6560)' }}>
            Tạo/cập nhật toàn bộ dữ liệu mẫu (nguyên liệu, case study, FAQ, bài viết, trang…). An toàn khi chạy lại — dữ liệu đã có sẽ được cập nhật, không nhân đôi.
          </p>
        </div>
        <button
          type="button"
          onClick={run}
          disabled={loading}
          style={{
            flexShrink: 0,
            padding: '10px 20px',
            borderRadius: 'var(--style-radius-m, 10px)',
            border: 'none',
            cursor: loading ? 'default' : 'pointer',
            fontSize: 14,
            fontWeight: 600,
            color: '#fff',
            opacity: loading ? 0.7 : 1,
            background: 'linear-gradient(100deg, var(--dv-primary, #0E6147) 0%, var(--dv-primary-dark, #00301A) 100%)',
          }}
        >
          {loading ? 'Đang chạy seed…' : 'Chạy seed / cập nhật dữ liệu'}
        </button>
      </div>

      {result && (
        <div
          style={{
            marginTop: 16,
            padding: '12px 14px',
            borderRadius: 'var(--style-radius-m, 10px)',
            fontSize: 13,
            background: result.ok ? 'rgba(14,97,71,0.08)' : 'rgba(200,40,40,0.08)',
            border: `1px solid ${result.ok ? 'rgba(14,97,71,0.25)' : 'rgba(200,40,40,0.25)'}`,
          }}
        >
          {result.ok ? (
            <>
              <strong style={{ color: 'var(--dv-primary, #0E6147)' }}>✅ Seed thành công</strong>
              <ul style={{ margin: '8px 0 0', paddingLeft: 18, columns: 2, color: 'var(--theme-elevation-700, #2a312e)' }}>
                {(result.summary ?? []).map((line, i) => (
                  <li key={i} style={{ fontSize: 12.5 }}>{line}</li>
                ))}
              </ul>
            </>
          ) : (
            <strong style={{ color: '#c22' }}>❌ {result.error ?? 'Seed thất bại.'}</strong>
          )}
        </div>
      )}
    </div>
  )
}

export default SeedButton
