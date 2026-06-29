'use client'

import { FlaskConical, Scale, Handshake, Sparkles } from 'lucide-react'
import { Eyebrow, LeafDivider } from '@/components/ui/section'
import { Reveal } from '@/components/ui/reveal'
import { useLocale } from '@/lib/i18n/context'

const ICONS = [FlaskConical, Scale, Handshake, Sparkles] as const

export function AboutCoreValues() {
  const { t, content } = useLocale()
  const u = t.about.coreValues

  return (
    <section className="bg-mist py-20 lg:py-24">
      <div className="container-bs">
        <Reveal className="text-center">
          <Eyebrow>{u.eyebrow}</Eyebrow>
          <h2 className="mt-5 text-[1.9rem] font-bold tracking-tight text-ink sm:text-[2.3rem]">{u.title}</h2>
          <LeafDivider />
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {content.ABOUT_CORE_VALUES.map((v, i) => {
            const Icon = ICONS[i]
            const num = String(i + 1).padStart(2, '0')
            return (
              <Reveal key={v.title} delay={i * 0.07}>
                <div className="group relative flex h-full gap-5 overflow-hidden rounded-[1.75rem] border border-primary-border/50 bg-white p-7 shadow-soft transition-all duration-300 hover:border-primary/30 hover:shadow-card">
                  <span className="pointer-events-none absolute -right-2 -top-4 select-none text-[5.5rem] font-extrabold leading-none text-primary/[0.06]">
                    {num}
                  </span>
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-tint text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                  </span>
                  <div className="relative min-w-0">
                    <h3 className="text-[17px] font-bold text-ink">{v.title}</h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-ink/65">{v.desc}</p>
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
