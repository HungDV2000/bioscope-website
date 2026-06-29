'use client'

import Link from 'next/link'
import { ArrowRight, Clock, FileText, FlaskConical, Lightbulb, Sparkles } from 'lucide-react'
import { Reveal } from '@/components/ui/reveal'
import { useLocale } from '@/lib/i18n/context'
import { AiChatDemo } from '@/components/home/ai-chat-demo'

const FEATURE_ICONS = [FlaskConical, Lightbulb, FileText, Clock]

export function AiChatPromo() {
  const { t } = useLocale()
  const c = t.home.aiChat

  return (
    <section className="bg-white pb-16 pt-6">
      <div className="container-bs">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#064e3b] via-primary-dark to-[#023d28] px-6 py-10 sm:px-10 sm:py-12 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12 lg:py-14">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#6ee7a0]/10 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/5 blur-2xl"
            />

            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#b8f5d0] backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                {c.badge}
              </span>

              <h2 className="mt-5 text-[1.85rem] font-bold leading-[1.15] tracking-tight text-white sm:text-[2.15rem]">
                {c.titleBefore}{' '}
                <span className="text-[#7ee8a8]">{c.titleHighlight}</span>
              </h2>

              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/75">{c.description}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                {c.features.map((label, i) => {
                  const Icon = FEATURE_ICONS[i]
                  return (
                    <span
                      key={label}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-[12.5px] font-medium text-white/85 backdrop-blur-sm"
                    >
                      <Icon className="h-3.5 w-3.5 text-[#7ee8a8]" strokeWidth={1.8} />
                      {label}
                    </span>
                  )
                })}
              </div>

              <Link
                href={c.ctaHref}
                className="group mt-8 inline-flex items-center gap-2 text-[15px] font-semibold text-[#7ee8a8] transition-colors hover:text-[#a8f5c4]"
              >
                {c.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="relative z-10 mt-10 lg:mt-0 lg:flex lg:items-center">
              <AiChatDemo copy={c} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
