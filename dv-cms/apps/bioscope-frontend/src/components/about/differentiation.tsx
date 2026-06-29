'use client'

import { Quote } from 'lucide-react'
import { Eyebrow } from '@/components/ui/section'
import { Reveal } from '@/components/ui/reveal'
import { useLocale } from '@/lib/i18n/context'

export function AboutDifferentiation() {
  const { t, content } = useLocale()
  const d = content.ABOUT_DIFFERENTIATION
  const u = t.about.differentiation

  return (
    <section className="relative overflow-hidden bg-white py-20 lg:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(0,142,77,0.12), transparent 70%)' }}
      />
      <div className="container-bs relative grid items-center gap-12 lg:grid-cols-[1fr_0.85fr] lg:gap-16">
        <Reveal>
          <Eyebrow>{u.eyebrow}</Eyebrow>
          <h2 className="mt-5 text-balance text-[1.9rem] font-bold leading-[1.15] tracking-tight text-ink sm:text-[2.35rem]">
            {d.title}
          </h2>
          <p className="mt-6 max-w-xl text-[15.5px] leading-[1.75] text-ink/70">{d.description}</p>
          <ul className="mt-8 space-y-3">
            {u.bullets.map((item) => (
              <li key={item} className="flex items-center gap-3 text-[14px] font-medium text-ink/75">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="relative rounded-[2rem] border border-primary-border/50 bg-gradient-to-br from-primary-tint via-white to-accent-soft p-8 shadow-soft lg:p-10">
            <Quote className="h-10 w-10 text-primary/25" strokeWidth={1.2} />
            <blockquote className="mt-4 text-[1.15rem] font-semibold leading-[1.55] tracking-tight text-ink sm:text-[1.25rem]">
              &ldquo;{u.quote}{' '}
              <span className="text-primary">{u.quoteHighlight}</span> {u.quoteAfter}&rdquo;
            </blockquote>
            <div className="mt-6 flex items-center gap-3 border-t border-primary-border/40 pt-6">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-[11px] font-bold text-white">
                BS
              </div>
              <div>
                <div className="text-[13px] font-bold text-ink">{u.company}</div>
                <div className="text-[12px] text-ink/50">{u.companyRole}</div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
