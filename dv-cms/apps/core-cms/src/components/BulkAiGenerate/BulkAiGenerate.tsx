'use client'

/**
 * BulkAiGenerate — a bar on the Ingredients list view that lets an admin run
 * "Tạo nội dung tự động" for the selected ingredients (or all of them). It POSTs
 * to /api/ai-generate/bulk, which enqueues one job per ingredient and drains
 * them ONE AT A TIME in the background (no crash / rate-limit / timeout).
 */

import React, { useState } from 'react'
import { useSelection } from '@payloadcms/ui'

export const BulkAiGenerate: React.FC = () => {
  const { count, selectedIDs, selectAll, totalDocs } = useSelection()
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ t: 'ok' | 'err'; m: string } | null>(null)

  if (!count) return null

  const isAll = selectAll === 'allAvailable'
  const targetCount = isAll ? totalDocs : count

  const run = async () => {
    const ok = window.confirm(
      `Tạo nội dung tự động cho ${targetCount} nguyên liệu?\n\n` +
        `Các job sẽ chạy LẦN LƯỢT trong nền (mỗi lúc 1 nguyên liệu) để tránh quá tải. ` +
        `Việc này có thể mất nhiều giờ với số lượng lớn. Theo dõi ở "AI Generate Jobs".`,
    )
    if (!ok) return
    setBusy(true)
    setMsg(null)
    try {
      const body = isAll ? { all: true, locale: 'vi' } : { ids: selectedIDs, locale: 'vi' }
      const r = await fetch('/api/ai-generate/bulk', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await r.json()
      if (r.ok) setMsg({ t: 'ok', m: data.message ?? `Đã nhận yêu cầu cho ${targetCount} nguyên liệu.` })
      else setMsg({ t: 'err', m: data.error ?? 'Lỗi khi tạo yêu cầu.' })
    } catch (e) {
      setMsg({ t: 'err', m: e instanceof Error ? e.message : 'Lỗi kết nối.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 12,
        margin: '10px 0',
        padding: '10px 14px',
        borderRadius: 10,
        background: 'var(--theme-elevation-50, #f4f6f8)',
        border: '1px solid var(--theme-elevation-150, #e3e8ec)',
      }}
    >
      <span style={{ fontSize: 13 }}>
        🤖 Đã chọn <strong>{isAll ? `tất cả (${totalDocs})` : count}</strong> nguyên liệu
      </span>
      <button
        type="button"
        onClick={run}
        disabled={busy}
        style={{
          background: '#008e4d',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 600,
          fontSize: 13,
          cursor: busy ? 'default' : 'pointer',
          opacity: busy ? 0.6 : 1,
        }}
      >
        {busy ? 'Đang gửi…' : `Tạo nội dung tự động cho ${targetCount} mục`}
      </button>
      {msg && (
        <span style={{ fontSize: 12.5, color: msg.t === 'err' ? '#f56565' : '#38a169' }}>{msg.m}</span>
      )}
      <span style={{ fontSize: 11.5, color: '#98a4b0' }}>
        Chạy lần lượt trong nền · theo dõi ở <strong>Bioscope → AI Generate Jobs</strong>
      </span>
    </div>
  )
}

export default BulkAiGenerate
