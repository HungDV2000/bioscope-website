'use client'

import React, { useState } from 'react'

/**
 * Nút "Đăng ký webhook + Test kết nối" cho tab Telegram (Cài đặt Chat).
 * Gọi POST /api/chat/telegram-setup: kiểm tra token/nhóm/Topics rồi setWebhook,
 * hiển thị kết quả từng bước. LƯU CẤU HÌNH TRƯỚC khi bấm.
 */
type Result = { ok?: boolean; message?: string; error?: string; steps?: Record<string, string> }

export const TelegramSetup: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [res, setRes] = useState<Result | null>(null)

  const run = async () => {
    if (loading) return
    setLoading(true)
    setRes(null)
    try {
      const r = await fetch('/api/chat/telegram-setup', { method: 'POST', credentials: 'include' })
      setRes((await r.json()) as Result)
    } catch (e) {
      setRes({ ok: false, error: (e as Error)?.message ?? 'Lỗi mạng' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ margin: '10px 0 20px' }}>
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="btn btn--style-primary btn--size-medium"
        style={{ opacity: loading ? 0.7 : 1 }}
      >
        {loading ? 'Đang kiểm tra…' : '🔗 Đăng ký webhook + Test kết nối'}
      </button>
      <p style={{ fontSize: 12.5, color: 'var(--theme-elevation-500)', margin: '8px 0 0' }}>
        Bấm <b>Lưu</b> cấu hình trước, rồi bấm nút này để kiểm tra token + nhóm (đã bật Topics chưa) và đăng ký nhận tin.
      </p>
      {res && (
        <div
          style={{
            marginTop: 12,
            padding: '10px 12px',
            borderRadius: 8,
            fontSize: 13,
            background: res.ok ? 'rgba(0,142,77,0.08)' : 'rgba(200,40,40,0.08)',
            border: `1px solid ${res.ok ? 'rgba(0,142,77,0.25)' : 'rgba(200,40,40,0.25)'}`,
          }}
        >
          {res.steps &&
            Object.values(res.steps).map((s, i) => (
              <div key={i} style={{ color: 'var(--theme-elevation-700)' }}>
                {s}
              </div>
            ))}
          <div style={{ marginTop: 6, fontWeight: 700, color: res.ok ? 'var(--dv-primary,#008e4d)' : '#c22' }}>
            {res.ok ? `✅ ${res.message}` : `❌ ${res.error}`}
          </div>
        </div>
      )}
    </div>
  )
}

export default TelegramSetup
