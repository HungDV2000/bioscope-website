'use client'

import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/ui/reveal'
import { useLocale } from '@/lib/i18n/context'

export function CtaBand() {
  const { t } = useLocale()
  const c = t.home.cta

  return (
    <section className="bg-white pb-16 pt-14">
      <div className="container-bs">
        <Reveal>
          <div className="relative min-h-[148px] overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0b7a4f] via-primary-dark to-[#023d28] px-7 py-7 shadow-card sm:px-10 sm:py-8">
            {/* soft decorative glows — pure CSS, paints instantly (no slow image) */}
            <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#6ee7a0]/15 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
            <div className="relative z-10 flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
              <div className="max-w-xl text-white">
                <h2 className="text-[1.25rem] font-bold leading-snug tracking-tight sm:text-[1.45rem]">{c.title}</h2>
                <p className="mt-2 text-[13.5px] leading-relaxed text-white/85">{c.description}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-3">
                <Button href="/lien-he" variant="accent">
                  {c.primary}
                </Button>
                <Button href="/lien-he" variant="outline" className="border-white/30! bg-white/10! text-white!">
                  {c.secondary}
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
