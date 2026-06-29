'use client'

import { Award, Globe2 } from 'lucide-react'
import { Reveal } from '@/components/ui/reveal'
import { useLocale } from '@/lib/i18n/context'

const CERT_ICON = Award

export function Certifications() {
  const { t } = useLocale()
  const c = t.home.certifications

  const certs = [
    ...c.items.map((item) => ({ ...item, icon: undefined as typeof Globe2 | undefined })),
    { name: '50+', sub: c.countries, icon: Globe2 },
  ]

  return (
    <section className="bg-white py-10">
      <div className="container-bs">
        <Reveal>
          <h2 className="text-[15px] font-extrabold uppercase tracking-[0.1em] text-ink">{c.title}</h2>
          <p className="mt-2 text-[14px] text-ink/55">{c.description}</p>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="mt-5 grid grid-cols-2 gap-y-6 rounded-[1.75rem] border border-primary-border/60 bg-mist/40 px-6 py-7 sm:grid-cols-3 lg:grid-cols-6">
            {certs.map(({ name, sub, icon: ItemIcon }) => {
              const Icon = ItemIcon ?? CERT_ICON
              return (
                <div key={name} className="flex items-center gap-3 px-2">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-primary-border bg-white text-primary">
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                  </span>
                  <div>
                    <div className="text-[15px] font-extrabold leading-none text-ink">{name}</div>
                    <div className="mt-1 text-[11.5px] font-medium leading-tight text-ink/50">{sub}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
