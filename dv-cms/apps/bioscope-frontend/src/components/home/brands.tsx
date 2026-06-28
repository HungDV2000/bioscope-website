'use client'

import { useCallback, useEffect, useRef } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Sprout,
  Sparkles,
  Leaf,
  FlaskConical,
  HeartPulse,
  Pill,
} from 'lucide-react'
import { CLIENT_LOGOS } from '@/lib/content'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  { icon: Sprout, label: 'Thực phẩm chức năng' },
  { icon: Sparkles, label: 'Mỹ phẩm' },
  { icon: Leaf, label: 'Dinh dưỡng' },
  { icon: FlaskConical, label: 'Dược phẩm' },
  { icon: HeartPulse, label: 'Tim mạch' },
  { icon: Pill, label: 'Vitamin & Khoáng' },
]

/** Drag-to-scroll + optional auto-loop marquee (pauses on hover/drag). */
function useTrackScroll(autoLoop = false) {
  const ref = useRef<HTMLDivElement>(null)
  const drag = useRef({ down: false, startX: 0, startLeft: 0 })
  const paused = useRef(false)

  const onPointerDown = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el) return
    drag.current = { down: true, startX: e.clientX, startLeft: el.scrollLeft }
    el.setPointerCapture?.(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el || !drag.current.down) return
    el.scrollLeft = drag.current.startLeft - (e.clientX - drag.current.startX)
  }
  const end = (e: React.PointerEvent) => {
    drag.current.down = false
    ref.current?.releasePointerCapture?.(e.pointerId)
  }

  useEffect(() => {
    if (!autoLoop) return
    const el = ref.current
    if (!el) return
    let raf = 0
    let pos = 0
    el.scrollLeft = 0
    const tick = () => {
      // nội dung nhân đôi → một nửa = đúng 1 bộ logo; reset tại nửa để liền mạch
      const half = el.scrollWidth / 2
      if (!paused.current && half > 0 && el.scrollWidth > el.clientWidth) {
        // tăng scrollLeft → nội dung trôi từ phải sang trái
        pos += 0.45
        if (pos >= half) pos -= half
        el.scrollLeft = pos
      } else {
        pos = el.scrollLeft % (half || 1) // resync after hover/drag
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [autoLoop])

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

const track =
  'flex gap-3 overflow-x-auto cursor-grab select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden active:cursor-grabbing'
const navBtn =
  'grid h-9 w-9 shrink-0 place-items-center rounded-full border border-primary-border bg-white text-ink/40 transition-colors duration-300 hover:text-primary'

export function Brands() {
  const { ref: catRef, dragProps: catDrag } = useTrackScroll()
  const { ref: brandRef, dragProps: brandDrag, hoverProps: brandHover } = useTrackScroll(true)

  const page = useCallback((el: HTMLDivElement | null, dir: 1 | -1) => {
    if (!el) return
    const first = el.firstElementChild as HTMLElement | null
    const gap = Number.parseFloat(getComputedStyle(el).gap || '0')
    const step = first ? first.offsetWidth + gap : el.clientWidth
    el.scrollBy({ left: step * dir, behavior: 'smooth' })
  }, [])

  return (
    <section className="bg-white py-8">
      <div className="container-bs">
        <p className="mx-auto max-w-[300px] text-balance text-center text-[13.5px] font-bold uppercase leading-relaxed tracking-[0.18em] text-primary sm:max-w-none sm:text-[13px]">
          Đã đồng hành cùng hơn 50 thương hiệu
        </p>

        <div className="mt-5 grid grid-cols-1 items-center gap-5 lg:grid-cols-2">
          {/* Left — categories: exactly 3 visible (no partial 4th), arrows + drag */}
          <div className="flex items-center gap-3">
            <button aria-label="Trước" onClick={() => page(catRef.current, -1)} className={navBtn}>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0 flex-1 overflow-hidden rounded-2xl border border-primary-border/70">
              <div ref={catRef} {...catDrag} className={cn(track, 'gap-0 snap-x snap-mandatory')}>
                {CATEGORIES.map(({ icon: Icon, label }, i) => (
                  <div
                    key={label}
                    className={cn(
                      'flex h-[104px] w-full shrink-0 snap-start flex-col items-center justify-center gap-2 bg-white px-2 text-center sm:w-1/3',
                      i > 0 && 'border-l border-primary-border/50',
                    )}
                  >
                    <Icon className="h-6 w-6 text-primary" strokeWidth={1.6} />
                    <span className="text-[12.5px] font-medium leading-snug text-ink/75">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <button aria-label="Sau" onClick={() => page(catRef.current, 1)} className={navBtn}>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Right — partners: auto-loop marquee, no arrows, drag enabled */}
          <div className="relative" {...brandHover}>
            <div ref={brandRef} {...brandDrag} className={track}>
              {[...CLIENT_LOGOS, ...CLIENT_LOGOS].map((c, i) => (
                <div
                  key={`${c.name}-${i}`}
                  className="flex h-[104px] w-[170px] shrink-0 items-center justify-center rounded-2xl border border-primary-border/70 bg-white px-4"
                >
                  <img
                    src={c.logo}
                    alt={c.name}
                    width={140}
                    height={56}
                    loading="lazy"
                    decoding="async"
                    className="max-h-11 w-auto max-w-full object-contain"
                  />
                </div>
              ))}
            </div>
            {/* soft edge fades */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent" />
          </div>
        </div>
      </div>
    </section>
  )
}
