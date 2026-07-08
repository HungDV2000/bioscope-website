'use client'

import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react'

/**
 * Drag-to-scroll + optional auto-loop for a horizontal track (a native
 * `overflow-x-auto` element with its content duplicated once). Auto-scroll
 * pauses on hover and while dragging; resyncs afterwards. Honors reduced-motion.
 */
export function useTrackScroll(autoLoop = false, speed = 0.45) {
  const ref = useRef<HTMLDivElement>(null)
  const drag = useRef({ down: false, startX: 0, startLeft: 0 })
  const paused = useRef(false)

  const onPointerDown = (e: ReactPointerEvent) => {
    const el = ref.current
    if (!el) return
    drag.current = { down: true, startX: e.clientX, startLeft: el.scrollLeft }
    el.setPointerCapture?.(e.pointerId)
  }
  const onPointerMove = (e: ReactPointerEvent) => {
    const el = ref.current
    if (!el || !drag.current.down) return
    el.scrollLeft = drag.current.startLeft - (e.clientX - drag.current.startX)
  }
  const end = (e: ReactPointerEvent) => {
    drag.current.down = false
    ref.current?.releasePointerCapture?.(e.pointerId)
  }

  useEffect(() => {
    if (!autoLoop) return
    const el = ref.current
    if (!el) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    let pos = 0
    el.scrollLeft = 0
    const tick = () => {
      // content is duplicated → half of scrollWidth = exactly one set; wrap there.
      const half = el.scrollWidth / 2
      if (!paused.current && !drag.current.down && half > 0 && el.scrollWidth > el.clientWidth) {
        pos += speed
        if (pos >= half) pos -= half
        el.scrollLeft = pos
      } else {
        pos = el.scrollLeft % (half || 1) // resync after hover/drag
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [autoLoop, speed])

  const dragProps = { onPointerDown, onPointerMove, onPointerUp: end }
  const hoverProps = {
    onMouseEnter: () => {
      paused.current = true
    },
    onMouseLeave: () => {
      paused.current = false
    },
  }
  return { ref, dragProps, hoverProps }
}
