'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/ui/reveal'
import { useLocale } from '@/lib/i18n/context'

export function CtaBand() {
  const { t } = useLocale()
  const c = t.home.cta

  return (
    <section className="bg-white pb-16 pt-14">
      <div className="container-bs">
        <Reveal>
          <div className="relative min-h-[148px] overflow-hidden rounded-[2rem] px-7 py-6 shadow-card sm:px-10 sm:py-7">
            <Image
              src="/images/cta.png"
              alt=""
              fill
              unoptimized
              sizes="(max-width: 1280px) 100vw, 1200px"
              className="object-cover object-center"
              priority={false}
            />
            <div className="relative z-10 flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
              <div className="max-w-xl text-white">
                <h2 className="text-[1.25rem] font-bold leading-snug tracking-tight sm:text-[1.45rem]">{c.title}</h2>
                <p className="mt-2 text-[13.5px] leading-relaxed text-white/85">{c.description}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-3">
                <Button href="/lien-he" variant="accent">
                  {c.primary}
                </Button>
                <Button href="/lien-he" variant="outline" className="border-white/30! bg-white/10! text-white!">
                  {c.secondary}
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
