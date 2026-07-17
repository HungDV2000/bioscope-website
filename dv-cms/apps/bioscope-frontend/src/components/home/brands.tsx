'use client'

import Image from 'next/image'
import { useCallback } from 'react'
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
import { useLocale } from '@/lib/i18n/context'
import type { SectionMedia } from '@/lib/cms/home'
import { useTrackScroll } from '@/lib/use-track-scroll'
import { cn } from '@/lib/utils'

const CATEGORY_ICONS = [Sprout, Sparkles, Leaf, FlaskConical, HeartPulse, Pill] as const

const track =
  'flex gap-3 overflow-x-auto cursor-grab select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden active:cursor-grabbing'
const navBtn =
  'grid h-9 w-9 shrink-0 place-items-center rounded-full border border-primary-border bg-white text-ink/40 transition-colors duration-300 hover:text-primary'

export function Brands({ media }: { media?: SectionMedia }) {
  const { t } = useLocale()
  // Prefer CMS-selected ingredient categories; fall back to the static i18n chips.
  const labels = media?.categoryChips?.length
    ? media.categoryChips.map((c) => c.name)
    : t.home.brands.categories
  const categories = labels.map((label, i) => ({
    icon: CATEGORY_ICONS[i % CATEGORY_ICONS.length],
    label,
  }))

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
          {t.home.brands.title}
        </p>

        <div className="mt-5 grid grid-cols-1 items-center gap-5 lg:grid-cols-2">
          {/* Left — categories: exactly 3 visible (no partial 4th), arrows + drag */}
          <div className="flex items-center gap-3">
            <button aria-label="Trước" onClick={() => page(catRef.current, -1)} className={navBtn}>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0 flex-1 overflow-hidden rounded-2xl border border-primary-border/70">
              <div ref={catRef} {...catDrag} className={cn(track, 'gap-0 snap-x snap-mandatory')}>
                {categories.map(({ icon: Icon, label }, i) => (
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
              {(() => { const cms = (media?.logos ?? []).filter(l => l.image).map(l => ({ logo: l.image as string, name: l.name ?? '' })); const base = cms.length ? cms : CLIENT_LOGOS; return [...base, ...base]; })().map((c, i) => (
                <div
                  key={`${c.name}-${i}`}
                  className="flex h-[104px] w-[170px] shrink-0 items-center justify-center rounded-2xl border border-primary-border/70 bg-white px-4"
                >
                  <Image
                    src={c.logo}
                    alt={c.name}
                    width={140}
                    height={56}
                    loading="lazy"
                    unoptimized
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
