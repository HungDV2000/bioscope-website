'use client'

import { Lightbulb, FlaskConical, ShieldCheck, Rocket, TrendingUp } from 'lucide-react'
import { LeafDivider } from '@/components/ui/section'
import { Reveal } from '@/components/ui/reveal'
import { useLocale } from '@/lib/i18n/context'

const STEP_ICONS = [Lightbulb, FlaskConical, ShieldCheck, Rocket, TrendingUp] as const

export function Process() {
  const { t } = useLocale()
  const p = t.home.process

  return (
    <section className="bg-mist py-14">
      <div className="container-bs">
        <Reveal className="text-center">
          <h2 className="font-bold tracking-tight text-ink text-[1.8rem] sm:text-[2.2rem]">{p.title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-ink/65">{p.description}</p>
          <LeafDivider />
        </Reveal>

        <div className="relative mt-16">
          {[20, 40, 60, 80].map((left) => (
            <svg
              key={left}
              className="absolute -top-9 z-20 hidden h-12 w-[120px] -translate-x-1/2 lg:block"
              style={{ left: `${left}%` }}
              viewBox="0 0 120 48"
              fill="none"
              aria-hidden
            >
              <defs>
                <marker
                  id={`process-arrow-${left}`}
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto"
                >
                  <path d="M0,0 L10,5 L0,10 z" fill="#5E9C80" />
                </marker>
              </defs>
              <path
                d="M6,28 Q56,4 104,42"
                stroke="#9DC2B0"
                strokeWidth="2"
                strokeDasharray="2 6"
                strokeLinecap="round"
                markerEnd={`url(#process-arrow-${left})`}
              />
            </svg>
          ))}

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {p.steps.map((step, i) => {
              const Icon = STEP_ICONS[i]
              const n = String(i + 1).padStart(2, '0')
              return (
                <Reveal key={n} delay={i * 0.08}>
                  <div className="relative z-10 h-full rounded-[1.5rem] border border-primary-border/60 bg-white px-5 pb-6 pt-12 text-center shadow-soft">
                    <span className="absolute -top-7 left-1/2 grid h-14 w-14 -translate-x-1/2 place-items-center rounded-full border-2 border-primary-border bg-white text-primary">
                      <Icon className="h-6 w-6" strokeWidth={1.6} />
                    </span>
                    <div className="text-left">
                      <div className="text-[13px] font-bold text-primary/50">{n}</div>
                      <h3 className="mt-1 text-[16px] font-bold text-ink">{step.title}</h3>
                      <p className="mt-2 text-[12.5px] leading-relaxed text-ink/55">{step.desc}</p>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
