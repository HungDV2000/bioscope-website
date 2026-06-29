import Link from 'next/link'
import { Lightbulb, FlaskConical, ShieldCheck, Rocket, TrendingUp, ArrowUpRight, X, Check } from 'lucide-react'
import { PageHero } from '@/components/ui/page-hero'
import { Reveal } from '@/components/ui/reveal'
import { CtaBand } from '@/components/home/cta-band'
import { getContent } from '@/lib/get-content'
import { getLocale } from '@/lib/i18n/server'
import { getPageI18n } from '@/lib/i18n/pages'
import { getMessages } from '@/lib/i18n/messages'

const JOURNEY_ICONS = [Lightbulb, FlaskConical, ShieldCheck, Rocket, TrendingUp]

export async function generateMetadata() {
  const locale = await getLocale()
  return getPageI18n('coCreate', locale).metadata
}

export default async function CoCreatePage() {
  const locale = await getLocale()
  const content = getContent(locale)
  const { hero } = getPageI18n('coCreate', locale)
  const m = getMessages(locale)
  const p = m.coCreatePage
  const { CO_CREATE_COMPARISON, CO_CREATE_STEP_DURATIONS, CASE_STUDIES } = content

  return (
    <>
      <PageHero {...hero} image="heroTeam" />

      <section className="bg-white py-16">
        <div className="container-bs">
          <Reveal>
            <h2 className="text-center text-[1.9rem] font-bold tracking-tight text-ink sm:text-[2.3rem]">{p.compareTitle}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-[15px] leading-relaxed text-ink/65">{p.compareDesc}</p>
          </Reveal>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <Reveal delay={0.08}>
              <div className="rounded-[2rem] border border-primary-border/60 bg-mist/30 p-8">
                <h3 className="text-[17px] font-bold text-ink/55">{p.traditionalTitle}</h3>
                <ul className="mt-5 space-y-3">
                  {CO_CREATE_COMPARISON.traditional.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[14px] text-ink/60">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-ink/35" strokeWidth={2} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <div className="rounded-[2rem] border border-primary/30 bg-primary-tint/30 p-8">
                <h3 className="text-[17px] font-bold text-primary-dark">{p.bioscopeTitle}</h3>
                <ul className="mt-5 space-y-3">
                  {CO_CREATE_COMPARISON.bioscope.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[14px] text-ink/75">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-mist py-20">
        <div className="container-bs">
          <div className="relative mx-auto max-w-5xl">
            <span
              aria-hidden
              className="absolute top-2 bottom-2 left-1/2 hidden w-px -translate-x-1/2 bg-primary-border/70 sm:block"
            />
            <div className="space-y-10 sm:space-y-12">
              {p.journey.map(({ title, desc }, i) => {
                const Icon = JOURNEY_ICONS[i]
                const isLeft = i % 2 === 0
                const stepLabel = `${p.stepLabel} ${i + 1}`
                const duration = CO_CREATE_STEP_DURATIONS[i]

                const card = (
                  <div className="rounded-[1.5rem] border border-primary-border/60 bg-white p-6 sm:max-w-md">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[12.5px] font-bold text-primary/50">{stepLabel}</div>
                      {duration && (
                        <span className="rounded-full bg-primary-tint px-2.5 py-0.5 text-[11px] font-semibold text-primary-dark">
                          {duration.duration}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1 text-[19px] font-bold text-ink">{title}</h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-ink/65">{desc}</p>
                  </div>
                )

                const icon = (
                  <div className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-primary-border bg-white text-primary shadow-soft">
                    <Icon className="h-6 w-6" strokeWidth={1.6} />
                  </div>
                )

                return (
                  <Reveal key={title} delay={i * 0.06}>
                    <div className="flex flex-col items-center gap-4 sm:hidden">
                      {icon}
                      <div className="w-full">{card}</div>
                    </div>
                    <div className="hidden sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-6 lg:gap-10">
                      <div className="flex justify-end">{isLeft ? card : null}</div>
                      <div className="flex justify-center">{icon}</div>
                      <div className="flex justify-start">{!isLeft ? card : null}</div>
                    </div>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-bs">
          <Reveal>
            <h2 className="text-[1.9rem] font-bold tracking-tight text-ink sm:text-[2.3rem]">{p.casesTitle}</h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink/65">{p.casesDesc}</p>
          </Reveal>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {CASE_STUDIES.map((c, i) => (
              <Reveal key={c.slug} delay={i * 0.08}>
                <Link
                  href={`/case-study/${c.slug}`}
                  className="group flex h-full flex-col rounded-[1.75rem] border border-primary-border/60 bg-mist/40 p-6 transition-all duration-500 hover:-translate-y-1 hover:bg-white hover:shadow-card"
                >
                  <div className="text-[16px] font-bold text-ink">{c.brand}</div>
                  <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-ink/60">{c.summary ?? c.problem}</p>
                  <div className="mt-4 text-[28px] font-extrabold text-primary">{c.kpi}</div>
                  <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-primary">
                    {p.readCase}
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  )
}
