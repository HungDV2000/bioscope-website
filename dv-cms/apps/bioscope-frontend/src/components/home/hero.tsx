'use client'

import Image from 'next/image'
import { FlaskConical, ShieldCheck, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/ui/reveal'
import { useLocale } from '@/lib/i18n/context'

const TRUST_ICONS = [FlaskConical, ShieldCheck, Truck] as const

export function Hero() {
  const { t } = useLocale()
  const h = t.home.hero

  return (
    <section className="relative overflow-hidden bg-mist pt-[72px]">
      <div className="absolute inset-0" aria-hidden>
        <Image
          src="/images/banners/banner.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, #F4F8F6 0%, rgba(244,248,246,0.96) 28%, rgba(244,248,246,0.7) 40%, rgba(244,248,246,0.18) 50%, rgba(244,248,246,0) 60%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(244,248,246,0.6) 0%, transparent 22%)' }}
        />
        <div className="absolute inset-0 bg-mist/45 backdrop-blur-[2px] sm:hidden" />
      </div>

      <div className="container-bs relative flex min-h-[480px] flex-col justify-center py-16 lg:min-h-[560px] lg:py-20">
        <div className="max-w-xl">
          <Reveal immediate>
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-accent">{h.eyebrow}</p>
          </Reveal>
          <Reveal immediate delay={0.08}>
            <h1 className="mt-4 font-bold leading-[1.12] tracking-tight text-ink text-[1.7rem] sm:text-[2.5rem]">
              {h.titleBefore}{' '}
              <span className="whitespace-nowrap text-primary">{h.titleHighlight}</span>{' '}
              <span className="whitespace-nowrap">
                {h.titleMid} <span className="text-accent">{h.titleAccent}</span>.
              </span>
            </h1>
          </Reveal>
          <Reveal immediate delay={0.16}>
            <p className="mt-5 max-w-md text-[16px] leading-relaxed text-ink/70">{h.description}</p>
          </Reveal>
          <Reveal immediate delay={0.24}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href="/nguyen-lieu" variant="accent">
                {h.ctaPrimary}
              </Button>
              <Button href="/dong-kien-tao" variant="outline">
                {h.ctaSecondary}
              </Button>
            </div>
          </Reveal>
        </div>
        <Reveal immediate delay={0.32} className="mt-8">
          <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
            {h.trust.map((label, i) => {
              const Icon = TRUST_ICONS[i]
              return (
                <div key={label} className="flex shrink-0 items-center gap-2 text-[13.5px] font-medium text-ink/75">
                  <Icon className="h-4 w-4 text-primary" strokeWidth={1.7} />
                  {label}
                </div>
              )
            })}
          </div>
        </Reveal>
      </div>

      <svg
        className="relative block h-[44px] w-full sm:h-[72px]"
        viewBox="0 0 1440 72"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path d="M0,72 L0,36 C 240,68 520,72 720,52 C 940,30 1180,28 1440,44 L1440,72 Z" fill="#ffffff" />
      </svg>
    </section>
  )
}
