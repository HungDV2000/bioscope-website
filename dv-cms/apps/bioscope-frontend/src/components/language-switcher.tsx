'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { Globe, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { setLocale } from '@/lib/i18n/actions'
import type { Locale } from '@/lib/i18n/config'
import { useLocale } from '@/lib/i18n/context'

const LANGS: { code: Locale; label: string; native: string }[] = [
  { code: 'vi', label: 'VI', native: 'Tiếng Việt' },
  { code: 'en', label: 'EN', native: 'English' },
]

/**
 * Chọn ngôn ngữ dạng icon quả cầu + danh sách thả xuống.
 *
 * Mã ngôn ngữ đang dùng in nhỏ ở góc trên icon để nhìn là biết ngay đang xem
 * bản nào — không phải mở danh sách ra mới rõ.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale } = useLocale()
  const [pending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  const current = LANGS.find((l) => l.code === locale) ?? LANGS[0]

  const switchTo = (next: Locale) => {
    setOpen(false)
    if (next === locale || pending) return
    startTransition(async () => {
      await setLocale(next)
    })
  }

  // Đóng khi bấm ra ngoài hoặc nhấn Esc.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={boxRef} className={cn('relative', pending && 'opacity-60', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Ngôn ngữ: ${current.native}`}
        aria-expanded={open}
        title={current.native}
        className="relative grid h-10 w-10 place-items-center rounded-full border border-primary-border bg-white/80 text-primary-dark transition-colors hover:bg-primary-tint"
      >
        <Globe className="h-[18px] w-[18px]" strokeWidth={1.8} />
        {/* Mã ngôn ngữ đang chọn, đắp lên góc trên icon */}
        <span className="absolute -right-0.5 -top-0.5 rounded-full bg-primary px-1 py-px text-[9px] font-bold leading-[1.35] text-white ring-2 ring-white">
          {current.label}
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Chọn ngôn ngữ"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-44 overflow-hidden rounded-2xl border border-primary-border/60 bg-white py-1.5 shadow-card"
        >
          {LANGS.map((l) => {
            const active = l.code === locale
            return (
              <button
                key={l.code}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => switchTo(l.code)}
                className={cn(
                  'flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13.5px] font-medium transition-colors',
                  active ? 'text-primary-dark' : 'text-ink/70 hover:bg-mist/70 hover:text-primary-dark',
                )}
              >
                <span
                  className={cn(
                    'grid h-6 w-8 shrink-0 place-items-center rounded-md text-[10.5px] font-bold',
                    active ? 'bg-primary text-white' : 'bg-mist text-ink/50',
                  )}
                >
                  {l.label}
                </span>
                <span className="flex-1">{l.native}</span>
                {active && <Check className="h-4 w-4 shrink-0 text-primary" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
