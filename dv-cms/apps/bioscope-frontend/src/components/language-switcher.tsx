'use client'

import { useTransition } from 'react'
import { cn } from '@/lib/utils'
import { setLocale } from '@/lib/i18n/actions'
import type { Locale } from '@/lib/i18n/config'
import { useLocale } from '@/lib/i18n/context'

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale } = useLocale()
  const [pending, startTransition] = useTransition()

  const switchTo = (next: Locale) => {
    if (next === locale || pending) return
    startTransition(async () => {
      await setLocale(next)
    })
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border border-primary-border/60 bg-white/80 p-0.5 text-[12px] font-semibold',
        pending && 'opacity-60',
        className,
      )}
      role="group"
      aria-label="Chọn ngôn ngữ"
    >
      <button
        type="button"
        onClick={() => switchTo('vi')}
        className={cn(
          'rounded-full px-2.5 py-1 transition-colors',
          locale === 'vi' ? 'bg-primary text-white' : 'text-ink/50 hover:text-primary',
        )}
        aria-pressed={locale === 'vi'}
      >
        VI
      </button>
      <button
        type="button"
        onClick={() => switchTo('en')}
        className={cn(
          'rounded-full px-2.5 py-1 transition-colors',
          locale === 'en' ? 'bg-primary text-white' : 'text-ink/50 hover:text-primary',
        )}
        aria-pressed={locale === 'en'}
      >
        EN
      </button>
    </div>
  )
}
