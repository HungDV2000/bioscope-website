'use client'

import Image from 'next/image'
import { Lightbulb, FlaskConical, ShieldCheck, Rocket, TrendingUp } from 'lucide-react'
import { Eyebrow, LeafDivider } from '@/components/ui/section'
import { Reveal } from '@/components/ui/reveal'
import { useLocale } from '@/lib/i18n/context'

const STEP_ICONS = [Lightbulb, FlaskConical, ShieldCheck, Rocket, TrendingUp] as const

export function AboutProductProcess() {
  const { t, content } = useLocale()
  const { title, description, image, imageAlt, steps } = content.ABOUT_PRODUCT_PROCESS
  const u = t.about.productProcess

  return (
    <section className="relative overflow-hidden bg-white py-20 lg:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(90%,72rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-primary-border to-transparent"
      />

      <div className="container-bs">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>{u.eyebrow}</Eyebrow>
          <h2 className="mt-5 text-balance text-[1.9rem] font-bold tracking-tight text-ink sm:text-[2.35rem]">
            {title}
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-ink/65">{description}</p>
          <LeafDivider />
        </Reveal>

        <Reveal delay={0.08} className="relative mt-12">
          <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-primary/10 via-transparent to-accent/10 blur-sm" />
          <div className="relative overflow-hidden rounded-[1.75rem] border border-primary-border/50 bg-white shadow-card">
            <Image
              src={image}
              alt={imageAlt}
              width={1920}
              height={1080}
              sizes="(max-width: 1024px) 100vw, 1200px"
              className="h-auto w-full"
              unoptimized
            />
          </div>
        </Reveal>

        <div className="relative mt-14 hidden lg:block">
          <div
            aria-hidden
            className="absolute left-[10%] right-[10%] top-7 h-px bg-gradient-to-r from-primary-border via-primary/40 to-primary-border"
          />
          <div className="grid grid-cols-5 gap-4">
            {steps.map((step, i) => {
              const Icon = STEP_ICONS[i]
              return (
                <Reveal key={step.n} delay={0.12 + i * 0.05}>
                  <div className="group text-center">
                    <div className="relative mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full border-2 border-primary-border bg-white text-primary shadow-soft transition-all group-hover:border-primary group-hover:bg-primary group-hover:text-white">
                      <Icon className="h-5 w-5" strokeWidth={1.6} />
                      <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-[9px] font-bold text-white">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="text-[14px] font-bold leading-snug text-ink">{step.title}</h3>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-ink/55">{step.desc}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:hidden">
          {steps.map((step, i) => {
            const Icon = STEP_ICONS[i]
            return (
              <Reveal key={step.n} delay={0.1 + i * 0.06}>
                <div className="flex h-full gap-4 rounded-[1.5rem] border border-primary-border/50 bg-mist/50 p-5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-white">
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                  </span>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-primary/60">
                      {u.stepLabel} {step.n}
                    </div>
                    <h3 className="mt-0.5 text-[15px] font-bold text-ink">{step.title}</h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-ink/60">{step.desc}</p>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
