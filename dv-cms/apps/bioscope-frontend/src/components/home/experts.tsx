'use client'

import Image from 'next/image'
import { CalendarDays, FlaskConical, Award, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/ui/reveal'
import { Counter } from '@/components/ui/counter'
import { useLocale } from '@/lib/i18n/context'

const STAT_ICONS = [CalendarDays, FlaskConical, Award, Lightbulb]
const STAT_VALUES = [
  { to: 15, suffix: '+' },
  { to: 100, suffix: '+' },
  { to: 14, suffix: '' },
  { to: 23, suffix: '' },
]

export function Experts() {
  const { t } = useLocale()
  const e = t.home.experts

  return (
    <section className="bg-mist py-14 lg:py-16">
      <div className="container-bs grid items-stretch gap-10 lg:grid-cols-2 lg:gap-10">
        <Reveal>
          <div className="relative overflow-hidden rounded-[1.75rem] shadow-card">
            <Image
              src="/images/experts.png"
              alt={e.imageAlt}
              width={2880}
              height={1440}
              sizes="(max-width: 1024px) 100vw, 560px"
              className="h-auto w-full"
              unoptimized
            />
          </div>
        </Reveal>

        <Reveal delay={0.1} className="flex h-full min-h-0">
          <div className="grid h-full w-full gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-8 xl:gap-10">
            <div className="flex flex-col justify-between gap-6 lg:py-1">
              <div className="min-w-0">
                <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-accent">{e.eyebrow}</p>
                <h2 className="mt-2.5 text-[1.65rem] font-bold leading-[1.2] tracking-tight text-ink sm:text-[1.85rem]">
                  {e.title}
                </h2>
                <div className="mt-3 max-w-[26rem] space-y-3 text-[14px] leading-[1.65] text-ink/60">
                  {e.paragraphs.map((p) => (
                    <p key={p.slice(0, 24)}>{p}</p>
                  ))}
                </div>
              </div>
              <div>
                <Button href="/ve-chung-toi" variant="outline">
                  {e.cta}
                </Button>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-y-6 border-primary-border/40 py-1 lg:border-l lg:pl-8 lg:gap-y-0">
              {e.stats.map(({ label }, i) => {
                const Icon = STAT_ICONS[i]
                const { to, suffix } = STAT_VALUES[i]
                return (
                  <div key={label} className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-tint text-primary">
                      <Icon className="h-5 w-5" strokeWidth={1.6} />
                    </span>
                    <div>
                      <div className="text-[24px] font-extrabold leading-none tracking-tight text-primary">
                        <Counter to={to} suffix={suffix} />
                      </div>
                      <div className="mt-1 text-[12.5px] font-medium leading-tight text-ink/55">{label}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
