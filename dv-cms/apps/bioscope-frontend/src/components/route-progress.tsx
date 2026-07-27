'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

/**
 * Thanh tiến trình mảnh trên đỉnh trang — chạy mỗi khi CHUYỂN TRANG.
 *
 * VÌ SAO CÓ CÁI NÀY
 *   loading.tsx (skeleton) chỉ hiện khi trang phải chờ dữ liệu; sau khi bật
 *   cache thì phần lớn điều hướng nhanh gần như tức thì nên skeleton chớp qua
 *   không kịp thấy. Thanh này luôn hiện một nhịp ngắn ở mọi lần chuyển trang,
 *   cho người dùng phản hồi "đang tải" rõ ràng — giống NProgress.
 *
 * CƠ CHẾ
 *   App Router không phát sự kiện "bắt đầu điều hướng", nên ta bắt click vào
 *   thẻ <a> nội bộ để KHỞI ĐỘNG thanh, và coi việc `pathname`/`searchParams`
 *   đổi là ĐÍCH để chạy nốt rồi ẩn. Thuần client, không thêm thư viện.
 */
export function RouteProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
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
    // Bò dần tới ~90% để cảm giác đang chạy mà không bao giờ "xong hụt".
    trickle.current = setInterval(() => {
      setWidth((w) => (w >= 90 ? w : w + (90 - w) * 0.18))
    }, 200)
  }

  const done = () => {
    clearTimers()
    setWidth(100)
    timers.current.push(setTimeout(() => setVisible(false), 220))
    timers.current.push(setTimeout(() => setWidth(0), 460))
  }

  // Bắt click link nội bộ → khởi động thanh.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as HTMLElement | null)?.closest('a')
      if (!a) return
      const href = a.getAttribute('href')
      const target = a.getAttribute('target')
      if (!href || target === '_blank' || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return
      }
      // Link ngoài miền: bỏ qua.
      try {
        const url = new URL(href, window.location.href)
        if (url.origin !== window.location.origin) return
        if (url.pathname === window.location.pathname && url.search === window.location.search) return
      } catch {
        return
      }
      start()
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  // pathname / query đổi = điều hướng đã hoàn tất → chạy nốt rồi ẩn.
  useEffect(() => {
    done()
    return clearTimers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams])

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-[3px]"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 200ms ease' }}
    >
      <div
        className="h-full bg-primary"
        style={{
          width: `${width}%`,
          transition: 'width 200ms ease',
          boxShadow: '0 0 8px rgba(0,142,77,0.6), 0 0 4px rgba(0,142,77,0.5)',
        }}
      />
    </div>
  )
}
