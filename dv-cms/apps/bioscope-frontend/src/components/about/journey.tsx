'use client'

import { Counter } from '@/components/ui/counter'
import { Eyebrow } from '@/components/ui/section'
import { Reveal } from '@/components/ui/reveal'
import { cn } from '@/lib/utils'
import { useLocale } from '@/lib/i18n/context'

const STAT_VALUES = [
  { to: 15, suffix: '+' },
  { to: 100, suffix: '+' },
  { to: 23, suffix: '' },
  { to: 14, suffix: '' },
]

export function AboutJourney() {
  const { t, content } = useLocale()
  const j = t.about.journey
  const timeline = content.ABOUT_TIMELINE

  return (
    <section className="bg-white py-20 lg:py-24">
      <div className="container-bs">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-20">
          <Reveal>
            <Eyebrow>{j.eyebrow}</Eyebrow>
            <h2 className="mt-5 text-[1.9rem] font-bold tracking-tight text-ink sm:text-[2.3rem]">{j.title}</h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink/65">{j.description}</p>

            <div className="relative mt-10">
              <span
                aria-hidden
                className="absolute bottom-2 left-[7px] top-2 w-px bg-gradient-to-b from-primary via-primary-border to-transparent"
              />
              <div className="space-y-8">
                {timeline.map((item, i) => (
                  <div key={item.year} className="relative flex gap-6 pl-0">
                    <div className="relative z-10 mt-1.5 flex flex-col items-center">
                      <span
                        className={cn(
                          'h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm',
                          i === timeline.length - 1 ? 'bg-primary' : 'bg-primary/40',
                        )}
                      />
                    </div>
                    <div className="min-w-0 flex-1 pb-1">
                      <div className="text-[13px] font-bold uppercase tracking-wider text-primary">{item.year}</div>
                      <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink/70">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="w-full lg:self-center">
            <div className="flex w-full flex-col justify-center">
              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[2rem] border border-primary-border/60 bg-primary-border/40 shadow-card">
                {j.stats.map((s, i) => (
                  <div
                    key={s.label}
                    className={cn(
                      'bg-white px-6 py-10 text-center transition-colors hover:bg-primary-tint/30',
                      i === 0 && 'rounded-tl-[2rem]',
                      i === 1 && 'rounded-tr-[2rem]',
                      i === 2 && 'rounded-bl-[2rem]',
                      i === 3 && 'rounded-br-[2rem]',
                    )}
                  >
                    <div className="text-[2.5rem] font-extrabold leading-none tracking-tight text-primary sm:text-[2.75rem]">
                      <Counter to={STAT_VALUES[i].to} suffix={STAT_VALUES[i].suffix} />
                    </div>
                    <div className="mt-2 text-[12.5px] font-semibold uppercase tracking-wide text-ink/50">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-primary-border/50 bg-gradient-to-r from-primary-tint to-white p-6">
                <p className="text-[14px] leading-relaxed text-ink/70">
                  <span className="font-bold text-primary-dark">{j.highlightBold}</span> {j.highlight}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
