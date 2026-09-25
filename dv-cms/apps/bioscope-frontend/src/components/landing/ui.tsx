'use client'

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { ArrowRight, X, type LucideIcon } from 'lucide-react'
import clsx from 'clsx'

export const IMG = '/landing/gastroheal'

/** Nút cam chính — to, bo tròn, có bóng. */
export function CtaButton({
  children,
  onClick,
  type = 'button',
  disabled,
  className,
  arrow,
}: {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  className?: string
  arrow?: boolean
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'lp-tap flex w-full items-center justify-center gap-3 rounded-full bg-gh-cta px-6 text-lg font-bold text-white shadow-gh-cta transition duration-300 ease-gh-spring active:scale-[.98] disabled:opacity-70',
        className,
      )}
    >
      {children}
      {arrow && <ArrowRight className="h-5 w-5" strokeWidth={2.6} aria-hidden="true" />}
    </button>
  )
}

export function Spinner({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={clsx('lp-spin', className)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".3" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function PingDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gh-cta opacity-70" />
      <span className="relative h-2 w-2 rounded-full bg-gh-cta" />
    </span>
  )
}

/** Chữ chạy vòng quanh ảnh thành phần. */
export function OrbitText({ text, size = 8.2, spacing = 1.2, reverse, radius = 44 }: { text: string; size?: number; spacing?: number; reverse?: boolean; radius?: number }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 100 100" className={clsx('lp-orbit absolute inset-0 h-full w-full', reverse && 'lp-orbit-rev')} aria-hidden="true">
      <defs>
        <path id={`arc${id}`} d={`M50 50 m-${radius} 0 a${radius} ${radius} 0 1 1 ${radius * 2} 0 a${radius} ${radius} 0 1 1 -${radius * 2} 0`} />
      </defs>
      <text fontSize={size} fontWeight="600" letterSpacing={spacing} fill="#EC8A2C">
        <textPath href={`#arc${id}`}>{text}</textPath>
      </text>
    </svg>
  )
}

/** Hình hộp quà minh hoạ mức hoàn thành (phần ruột dâng lên theo %). */
export function GiftSvg({ pct, label }: { pct: number; label: string }) {
  const id = useId().replace(/:/g, '')
  const h = (52 * Math.max(0, Math.min(100, pct))) / 100
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={label}>
      <defs>
        <clipPath id={`clip${id}`}>
          <rect x="18" y="34" width="64" height="52" rx="6" />
        </clipPath>
        <linearGradient id={`grad${id}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#14939A" />
          <stop offset="1" stopColor="#F2BE3C" />
        </linearGradient>
      </defs>
      <rect x="18" y="34" width="64" height="52" rx="6" fill="#EEF6F6" />
      <rect
        x="18"
        y={86 - h}
        width="64"
        height={h}
        fill={`url(#grad${id})`}
        clipPath={`url(#clip${id})`}
        style={{ transition: 'y .8s cubic-bezier(.32,.72,0,1), height .8s cubic-bezier(.32,.72,0,1)' }}
      />
      <rect x="18" y="34" width="64" height="52" rx="6" fill="none" stroke="#14939A" strokeOpacity=".25" strokeWidth="2" />
      <rect x="14" y="24" width="72" height="14" rx="5" fill="#EC8A2C" />
      <rect x="45" y="24" width="10" height="62" fill="#fff" opacity=".55" />
      <path d="M50 24c-6-10-18-10-18-2 0 5 9 6 18 2zm0 0c6-10 18-10 18-2 0 5-9 6-18 2z" fill="#EC8A2C" />
    </svg>
  )
}

export function GiftBar({ pct, className }: { pct: number; className?: string }) {
  return (
    <div className={clsx('h-3 w-full overflow-hidden rounded-full bg-gh-brand-soft ring-1 ring-inset ring-gh-brand/20', className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-gh-brand to-gh-lime transition-[width] duration-700 ease-gh-spring"
        style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
      />
    </div>
  )
}

/** Nơ "Quà tặng" + ngôi sao lấp lánh của thẻ hộp quà. */
export function GiftCardDecor() {
  return (
    <>
      <span className="pointer-events-none absolute -right-11 top-3.5 z-10 rotate-45 bg-gh-cta px-11 py-1 text-center text-[11px] font-extrabold uppercase tracking-[0.12em] text-white shadow-gh-cta">
        Quà tặng
      </span>
      <span className="lp-twinkle pointer-events-none absolute left-[46%] top-3 text-lg text-gh-lime" aria-hidden="true">
        ✦
      </span>
      <span className="lp-twinkle pointer-events-none absolute bottom-5 left-[38%] text-sm text-gh-cta" style={{ animationDelay: '.8s' }} aria-hidden="true">
        ✦
      </span>
    </>
  )
}

export function GiftTag() {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-full bg-gh-cta-soft px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.1em] text-gh-cta-deep">
      <PingDot />
      Điểm của bạn
    </span>
  )
}

export const giftCardClass =
  'lp-shine relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#FFF6DC_0%,#FFFFFF_45%,#E1F1F1_100%)] shadow-gh-float ring-2 ring-dashed ring-gh-cta/40'

/** Khoá cuộn trang khi có lớp phủ. Đếm số lớp để đóng lớp trên không mở khoá lớp dưới. */
let locks = 0
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    locks += 1
    document.documentElement.style.overflow = 'hidden'
    return () => {
      locks -= 1
      if (locks <= 0) document.documentElement.style.overflow = ''
    }
  }, [active])
}

/**
 * Tấm trượt từ đáy (điện thoại) / hộp giữa màn hình (máy tính), có tiêu đề
 * dính trên, nút Đóng dính dưới, Esc để đóng, focus vào tiêu đề khi mở.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  tall,
  footer = true,
  z = 'z-50',
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  tall?: boolean
  footer?: boolean
  z?: string
}) {
  const titleId = useId()
  const head = useRef<HTMLHeadingElement>(null)
  useScrollLock(open)
  useEffect(() => {
    if (!open) return
    head.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className={clsx('fixed inset-0', z)} role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="absolute inset-0 bg-gh-ink/50" onClick={onClose} />
      <div
        className={clsx(
          'lp-pop absolute inset-x-0 bottom-0 mx-auto flex max-w-md flex-col overflow-hidden rounded-t-[28px] bg-white sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:rounded-[28px]',
          tall ? 'max-h-[94dvh]' : 'max-h-[85dvh]',
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-black/5 px-5 pb-3 pt-5">
          <h2 id={titleId} ref={head} tabIndex={-1} className="text-2xl font-extrabold outline-none">
            {title}
          </h2>
          <button type="button" onClick={onClose} className="lp-tap flex w-14 shrink-0 items-center justify-center rounded-full bg-gh-canvas" aria-label="Đóng">
            <X className="h-5 w-5" strokeWidth={2.6} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-5">{children}</div>
        {footer && (
          <div className="shrink-0 border-t border-black/5 bg-white px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
            <button type="button" onClick={onClose} className="lp-tap w-full rounded-full bg-gh-canvas text-[17px] font-bold text-gh-brand-deep">
              Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/** Dòng "việc → điểm" trong bảng điểm. */
export function PointRow({ label, pts, note, last, boxed }: { label: string; pts: number; note?: string; last?: boolean; boxed?: boolean }) {
  return (
    <li
      className={clsx(
        'flex items-center justify-between gap-3',
        boxed ? 'rounded-2xl bg-gh-canvas p-3' : !last && 'border-b border-black/5 pb-2',
      )}
    >
      <span>
        {label}
        {note && <span className="text-sm text-gh-ink-soft"> ({note})</span>}
      </span>
      <b className="shrink-0 text-gh-ink">+{pts}</b>
    </li>
  )
}

/* ────────────── Khung chuẩn của các phần (giữ nhịp đều nhau) ─────────────── */

/**
 * Hiện dần khi cuộn tới — đúng hiệu ứng `.reveal` của bản v2.
 *
 * Không có nó trang trông "phẳng": mọi thứ đứng im, các khối nặng như nhau.
 */
export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    // threshold 0: khối cao hơn màn hình (ảnh sản phẩm) chỉ ló một phần cũng
    // hiện. Kèm hẹn giờ an toàn: trình duyệt nào không chạy observer thì sau
    // 1,2 giây vẫn hiện, không để nội dung kẹt ở trạng thái mờ.
    const show = () => {
      setShown(true)
      io.disconnect()
      clearTimeout(t)
    }
    const io = new IntersectionObserver((es) => es.some((e) => e.isIntersecting) && show(), {
      threshold: 0,
      rootMargin: '0px 0px -5% 0px',
    })
    io.observe(el)
    const t = setTimeout(show, 1200)
    return () => {
      io.disconnect()
      clearTimeout(t)
    }
  }, [])
  return (
    <div ref={ref} className={clsx('lp-reveal', shown && 'lp-in', className)} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  )
}

/** Một phần nội dung: luôn cùng khoảng cách trên dưới. */
export function Section({ id, step, children, className }: { id?: string; step?: number; children: ReactNode; className?: string }) {
  return (
    <section id={id} data-step={step} className={clsx('scroll-mt-28 py-10', className)}>
      {children}
    </section>
  )
}

/** Tiêu đề phần: nhãn nhỏ + tiêu đề lớn + câu dẫn — cùng một cỡ ở mọi phần. */
export function SectionHead({ eyebrow, title, sub }: { eyebrow?: string; title: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-5">
      {eyebrow && <p className="text-sm font-bold uppercase tracking-widest text-gh-brand-deep">{eyebrow}</p>}
      <h2 className="mt-2 text-[1.8rem] font-extrabold leading-tight sm:text-4xl">{title}</h2>
      {sub && <p className="mt-2 text-lg leading-relaxed text-gh-ink-soft">{sub}</p>}
    </div>
  )
}

/** Thẻ trắng bo lớn — thẻ cơ bản của cả trang. */
export const cardClass = 'rounded-3xl bg-white p-4 shadow-gh-soft'

/** Ô số 56px của các bước (bản v2 dùng đúng cỡ này). */
export function NumberTile({ n, tone = 'brand' }: { n: number | string; tone?: 'brand' | 'cta' }) {
  return (
    <span
      className={clsx(
        'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl font-extrabold text-white',
        tone === 'cta' ? 'bg-gh-cta' : 'bg-gh-brand',
      )}
    >
      {n}
    </span>
  )
}

/** Ô icon vuông bo tròn, dùng cho mọi dòng hoạt động / mục tìm hiểu thêm. */
export function IconTile({ Icon, tone = 'bg-gh-brand-soft text-gh-brand', size = 'md' }: { Icon: LucideIcon; tone?: string; size?: 'md' | 'lg' }) {
  return (
    <span className={clsx('flex shrink-0 items-center justify-center rounded-2xl', size === 'lg' ? 'h-14 w-14' : 'h-12 w-12', tone)} aria-hidden="true">
      <Icon className={size === 'lg' ? 'h-7 w-7' : 'h-6 w-6'} strokeWidth={1.5} />
    </span>
  )
}

/** Vòng tròn số nhỏ của danh sách đánh số (1,2,3…). */
export function StepDot({ n, tone = 'brand' }: { n: number; tone?: 'brand' | 'lime' }) {
  return (
    <span
      className={clsx(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold',
        tone === 'lime' ? 'bg-gh-lime-soft text-gh-cta-deep' : 'bg-gh-brand-soft text-gh-brand-deep',
      )}
    >
      {n}
    </span>
  )
}
