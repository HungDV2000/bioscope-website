'use client'

/**
 * ImageStats — space-saved overview on the image-settings global. Reads the
 * aggregate optimization stats from /api/image/stats.
 */

import React, { useEffect, useState } from 'react'

type Stats = {
  images: number
  optimized: number
  totalSavedBytes: number
  totalOriginalBytes: number
  savedPct: number
}

function human(bytes: number): string {
  if (!bytes) return '0 B'
  const u = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${u[i]}`
}

export const ImageStats: React.FC = () => {
  const [s, setS] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/image/stats', { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => setS(j))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const Stat = ({ label, value, tone }: { label: string; value: React.ReactNode; tone?: string }) => (
    <div style={{ flex: 1, minWidth: 150, background: 'var(--theme-elevation-50,#f4f6f8)', borderRadius: 10, padding: '14px 16px' }}>
      <div style={{ fontSize: 12, color: 'var(--theme-elevation-500,#7a8794)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: tone ?? 'var(--theme-text,#1a1a1a)' }}>{value}</div>
    </div>
  )

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>🖼️ Thống kê tối ưu ảnh</div>
      {loading ? (
        <div style={{ color: '#98a4b0', fontSize: 13 }}>Đang tải…</div>
      ) : (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Stat label="Tổng ảnh" value={s?.images ?? 0} />
          <Stat label="Đã tối ưu" value={s?.optimized ?? 0} tone="#008e4d" />
          <Stat label="Dung lượng tiết kiệm" value={human(s?.totalSavedBytes ?? 0)} tone="#008e4d" />
          <Stat label="Giảm trung bình" value={`${s?.savedPct ?? 0}%`} tone="#e6a23c" />
        </div>
      )}
    </div>
  )
}

export default ImageStats
