'use client'

import React, { useState } from 'react'
import { toast } from '@payloadcms/ui'

/**
 * Nút "Xoá cache" ở thanh công cụ trên cùng của admin (giống admin bar WordPress).
 *
 * Gọi POST /api/clear-cache (staff-only) → CMS ping frontend revalidate. Dùng khi
 * muốn đẩy ngay thay đổi ra web mà không chờ cache tự hết hạn, hoặc sau khi
 * seed/nhập liệu hàng loạt (không đi qua hook tự revalidate).
 *
 * Đăng ký trong payload.config: admin.components.actions.
 */
export const ClearCacheAction: React.FC = () => {
  const [loading, setLoading] = useState(false)

  const run = async () => {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/clear-cache', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = (await res.json()) as { ok?: boolean; message?: string; error?: string }
      if (res.ok && data.ok) {
        toast.success(data.message ?? 'Đã xoá cache website.')
      } else {
        toast.error(data.error ?? `Lỗi ${res.status}`)
      }
    } catch (err) {
      toast.error(`Không gọi được: ${(err as Error)?.message ?? 'lỗi mạng'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={run}
      disabled={loading}
      title="Xoá cache website — đẩy ngay thay đổi ra trang công khai"
      aria-label="Xoá cache website"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 32,
        padding: '0 12px',
        borderRadius: 'var(--style-radius-m, 8px)',
        border: '1px solid var(--theme-elevation-150)',
        background: 'var(--theme-elevation-0)',
        color: 'var(--theme-elevation-800)',
        fontSize: 13,
        fontWeight: 600,
        cursor: loading ? 'default' : 'pointer',
        opacity: loading ? 0.65 : 1,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        aria-hidden
        style={{
          display: 'inline-block',
          width: 14,
          height: 14,
          border: '2px solid currentColor',
          borderRadius: '50%',
          borderTopColor: 'transparent',
          animation: loading ? 'dv-cc-spin 0.7s linear infinite' : 'none',
          opacity: loading ? 1 : 0.75,
        }}
      />
      {loading ? 'Đang xoá…' : 'Xoá cache'}
      <style>{`@keyframes dv-cc-spin { to { transform: rotate(360deg) } }`}</style>
    </button>
  )
}

export default ClearCacheAction
