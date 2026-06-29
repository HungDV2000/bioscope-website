'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/ui/reveal'
import { img } from '@/lib/images'
import { useLocale } from '@/lib/i18n/context'

export function CaseStudies() {
  const { t, content } = useLocale()
  const c = t.home.caseStudies

  return (
    <section className="bg-mist py-14">
      <div className="container-bs">
        <Reveal className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="max-w-xl text-[15px] font-extrabold uppercase tracking-[0.1em] text-ink">{c.title}</h2>
          <Link
            href="/case-study"
            className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-primary transition-colors hover:text-primary-dark"
          >
            {c.viewAll}
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </Reveal>

        <div className="mt-6 grid items-stretch gap-5 lg:grid-cols-3">
          {content.CASE_STUDIES.map((cs, i) => (
            <Reveal key={cs.slug} delay={i * 0.08} className="h-full">
              <Link
                href={`/case-study/${cs.slug}`}
                className="group relative block h-full min-h-[240px] overflow-hidden rounded-[1.75rem] border border-primary-border/60 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:shadow-card"
              >
                <div className="absolute inset-0 overflow-hidden">
                  <Image
                    key={cs.coverImage ?? cs.slug}
                    src={cs.coverImage ?? img(cs.image, 800)}
                    alt={cs.brand}
                    fill
                    unoptimized={Boolean(cs.coverImage)}
                    sizes="(max-width: 1024px) 100vw, 400px"
                    className={
                      cs.coverImage
                        ? 'h-full w-full scale-[1.35] object-cover object-[72%_center] transition-transform duration-700 group-hover:scale-[1.42]'
                        : 'h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105'
                    }
                  />
                </div>

                {!cs.coverImage && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/95 from-[40%] via-white/70 via-[58%] to-transparent" />
                )}

                <div className="relative z-10 flex h-full min-h-[240px] max-w-[62%] flex-col justify-center p-5 sm:p-6">
                  <div className="text-[15px] font-bold leading-tight text-primary-dark">{cs.brand}</div>
                  <div className="mt-0.5 text-[12.5px] font-medium text-primary">{cs.partner}</div>
                  <div className="mt-4 text-[12px] font-medium leading-snug text-ink/55">{cs.kpiLabel}</div>
                  <div className="mt-1 text-[28px] font-extrabold leading-none tracking-tight text-primary sm:text-[32px]">
                    {cs.kpi}
                  </div>
                  <p className="mt-3 line-clamp-3 text-[11.5px] leading-relaxed text-ink/55">
                    {cs.summary ?? cs.problem}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
