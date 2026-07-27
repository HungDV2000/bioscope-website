'use client'

import React, { useEffect, useRef, useState } from 'react'

/**
 * Thanh tiến trình trên đỉnh khu admin — chạy mỗi lần chuyển trang.
 *
 * Payload admin điều hướng client-side; giữa các trang nặng (danh sách nghìn
 * bản ghi, mở document...) người dùng dễ tưởng bị treo. loading.tsx của Next
 * ít khi kịp hiện trong admin nên thêm thanh này cho phản hồi tức thì.
 *
 * Đăng ký trong payload.config: admin.components.providers (luôn được mount).
 * KHÔNG dùng next/navigation vì package @dv/cms-core không khai `next` làm dep;
 * thay vào đó vá history.pushState/popstate để biết điều hướng đã "chốt".
 */
export const AdminRouteProgress: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false)
  const [width, setWidth] = useState(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const trickle = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    if (trickle.current) {
      clearInterval(trickle.current)
      trickle.current = null
    }
  }

  const start = () => {
    clearTimers()
    setVisible(true)
    setWidth(8)
    trickle.current = setInterval(() => setWidth((w) => (w >= 90 ? w : w + (90 - w) * 0.18)), 200)
  }

  const done = () => {
    clearTimers()
    setWidth(100)
    timers.current.push(setTimeout(() => setVisible(false), 220))
    timers.current.push(setTimeout(() => setWidth(0), 460))
  }

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as HTMLElement | null)?.closest('a')
      if (!a) return
      const href = a.getAttribute('href')
      const target = a.getAttribute('target')
      if (!href || target === '_blank' || href.startsWith('#') || href.startsWith('mailto:')) return
      try {
        const url = new URL(href, window.location.href)
        if (url.origin !== window.location.origin) return
        if (url.pathname === window.location.pathname) return
      } catch {
        return
      }
      start()
    }
    document.addEventListener('click', onClick, true)

    // App Router "chốt" điều hướng bằng history.pushState → coi đó là hoàn tất.
    const origPush = window.history.pushState
    const origReplace = window.history.replaceState
    const finish = () => done()
    window.history.pushState = function (...args) {
      const r = origPush.apply(this, args as never)
      finish()
      return r
    }
    window.history.replaceState = function (...args) {
      const r = origReplace.apply(this, args as never)
      finish()
      return r
    }
    window.addEventListener('popstate', finish)

    return () => {
      document.removeEventListener('click', onClick, true)
      window.history.pushState = origPush
      window.history.replaceState = origReplace
      window.removeEventListener('popstate', finish)
      clearTimers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <div
        aria-hidden
        style={{
          position: 'fixed',
          insetInline: 0,
          top: 0,
          height: 3,
          zIndex: 1000,
          pointerEvents: 'none',
          opacity: visible ? 1 : 0,
          transition: 'opacity 200ms ease',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${width}%`,
            background: 'var(--theme-success-500, #008e4d)',
            boxShadow: '0 0 8px rgba(0,142,77,0.6)',
            transition: 'width 200ms ease',
          }}
        />
      </div>
      {children}
    </>
  )
}

export default AdminRouteProgress
