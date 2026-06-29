'use client'

import Image from 'next/image'
import { Globe2 } from 'lucide-react'
import { Eyebrow, LeafDivider } from '@/components/ui/section'
import { Reveal } from '@/components/ui/reveal'
import { useLocale } from '@/lib/i18n/context'

export function AboutPartners() {
  const { t, content } = useLocale()
  const p = t.about.partners

  return (
    <section className="relative overflow-hidden bg-mist py-20 lg:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full opacity-50 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(245,142,51,0.1), transparent 70%)' }}
      />
      <div className="container-bs relative">
        <Reveal className="text-center">
          <Eyebrow>{p.eyebrow}</Eyebrow>
          <div className="mx-auto mt-5 grid h-14 w-14 place-items-center rounded-2xl bg-primary-tint text-primary">
            <Globe2 className="h-7 w-7" strokeWidth={1.4} />
          </div>
          <h2 className="mt-5 text-[1.9rem] font-bold tracking-tight text-ink sm:text-[2.3rem]">{p.title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-ink/65">{p.description}</p>
          <LeafDivider />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:gap-4">
            {content.CLIENT_LOGOS.map((c, i) => (
              <div
                key={c.name}
                className="group flex h-[88px] items-center justify-center rounded-2xl border border-primary-border/50 bg-white px-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-card"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <Image
                  src={c.logo}
                  alt={c.name}
                  width={130}
                  height={52}
                  unoptimized
                  className="max-h-11 w-auto max-w-full object-contain opacity-80 transition-opacity group-hover:opacity-100"
                />
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
