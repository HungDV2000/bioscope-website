'use client'

import { Target, Compass, Globe2 } from 'lucide-react'
import { Reveal } from '@/components/ui/reveal'
import { cn } from '@/lib/utils'
import { useLocale } from '@/lib/i18n/context'

const ICONS = [Target, Compass, Globe2]

export function AboutMissionStrip() {
  const { t } = useLocale()
  const cards = t.about.mission.map((card, i) => ({ ...card, icon: ICONS[i], featured: i === 1 }))

  return (
    <section className="bg-white pt-12 pb-10 lg:pt-16 lg:pb-14">
      <div className="container-bs">
        <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
          {cards.map(({ icon: Icon, title, desc, featured }, i) => (
            <Reveal key={title} delay={i * 0.08}>
              <div
                className={cn(
                  'group relative h-full overflow-hidden rounded-[1.75rem] p-8 transition-shadow duration-300',
                  featured
                    ? 'bg-primary text-white shadow-[0_24px_60px_-20px_rgba(0,142,77,0.45)]'
                    : 'border border-primary-border/60 bg-white shadow-card hover:shadow-[0_20px_50px_-24px_rgba(16,24,20,0.18)]',
                )}
              >
                {featured && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"
                  />
                )}
                <span
                  className={cn(
                    'grid h-12 w-12 place-items-center rounded-2xl',
                    featured ? 'bg-white/15 text-white' : 'bg-primary-tint text-primary',
                  )}
                >
                  <Icon className="h-6 w-6" strokeWidth={1.5} />
                </span>
                <h3 className={cn('mt-6 text-[20px] font-bold tracking-tight', featured ? 'text-white' : 'text-ink')}>
                  {title}
                </h3>
                <p className={cn('mt-3 text-[14px] leading-relaxed', featured ? 'text-white/85' : 'text-ink/65')}>
                  {desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
