import Link from 'next/link'
import {
  ArrowRight,
  Bot,
  Brain,
  Check,
  Clock,
  FileText,
  FlaskConical,
  Layers,
  Lightbulb,
  MessageSquareQuote,
  Sparkles,
  User,
  X,
  Zap,
} from 'lucide-react'
import { PageHero } from '@/components/ui/page-hero'
import { Eyebrow } from '@/components/ui/section'
import { Reveal } from '@/components/ui/reveal'
import { AiNotifyForm } from '@/components/ai-assistant/notify-form'
import { AiChatPreview } from '@/components/ai-assistant/chat-preview'
import { getLocale } from '@/lib/i18n/server'
import { getPageI18n } from '@/lib/i18n/pages'
import { getMessages } from '@/lib/i18n/messages'

const CAPABILITY_ICONS = [FlaskConical, Lightbulb, FileText, Clock]
const STRENGTH_ICONS = [Brain, Zap, Layers, Sparkles]
const USE_CASE_ACCENTS = [
  'from-primary/15 to-primary-tint/40',
  'from-[#064e3b]/10 to-primary-tint/30',
  'from-mist to-primary-tint/25',
]

export async function generateMetadata() {
  const locale = await getLocale()
  return getPageI18n('bioscopeAi', locale).metadata
}

export default async function BioscopeAiPage() {
  const locale = await getLocale()
  const { hero } = getPageI18n('bioscopeAi', locale)
  const m = getMessages(locale)
  const p = m.aiAssistantPage
  const chatCopy = m.home.aiChat

  return (
    <>
      <PageHero {...hero} className="pt-36 lg:pt-44" />

      {/* Intro band */}
      <section className="relative bg-white pb-4 pt-8">
        <div className="container-bs">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#064e3b] via-primary-dark to-[#023d28] px-8 py-10 sm:px-12 sm:py-12">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#6ee7a0]/10 blur-3xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-white/5 blur-2xl"
              />

              <div className="relative z-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#b8f5d0]">
                    <Sparkles className="h-3.5 w-3.5" />
                    {p.status}
                  </span>
                  <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/75">{p.statusDesc}</p>
                  <blockquote className="mt-6 border-l-2 border-[#7ee8a8]/60 pl-5 text-[1.15rem] font-medium leading-snug text-white sm:text-[1.25rem]">
                    {p.introQuote}
                  </blockquote>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  {p.stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-white/10 bg-white/10 px-3 py-4 text-center backdrop-blur-sm sm:px-4"
                    >
                      <div className="text-[1.5rem] font-extrabold tracking-tight text-[#7ee8a8] sm:text-[1.75rem]">
                        {stat.value}
                      </div>
                      <div className="mt-1 text-[11px] font-medium leading-tight text-white/65 sm:text-[12px]">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Chat preview */}
      <section className="bg-white py-16 lg:py-20">
        <div className="container-bs">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <Eyebrow>{p.previewEyebrow}</Eyebrow>
              <h2 className="mt-4 text-[1.75rem] font-bold tracking-tight text-ink sm:text-[2.1rem]">
                {p.previewTitle}
              </h2>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink/65">{p.previewDesc}</p>
              <div className="mt-8 flex items-start gap-3 rounded-2xl border border-primary-border/50 bg-primary-tint/25 p-5">
                <MessageSquareQuote className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={1.8} />
                <p className="text-[13.5px] italic leading-relaxed text-ink/70">{chatCopy.demoAi2}</p>
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <AiChatPreview copy={chatCopy} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="bg-mist/60 py-16 lg:py-20">
        <div className="container-bs">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-[1.75rem] font-bold tracking-tight text-ink sm:text-[2rem]">
                {p.useCasesTitle}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-ink/60">{p.useCasesDesc}</p>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {p.useCases.map((uc, i) => (
              <Reveal key={uc.persona} delay={i * 0.1}>
                <div
                  className={`flex h-full flex-col rounded-[1.75rem] border border-primary-border/50 bg-gradient-to-br ${USE_CASE_ACCENTS[i]} p-7`}
                >
                  <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-[12px] font-bold text-primary-dark">
                    <User className="h-3.5 w-3.5" />
                    {uc.persona}
                  </span>
                  <p className="mt-5 text-[15px] font-semibold text-ink">{uc.scenario}</p>
                  <p className="mt-4 flex-1 rounded-xl border border-primary-border/40 bg-white/70 px-4 py-3.5 text-[13px] leading-relaxed text-ink/65">
                    {uc.example}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features — alternating bento */}
      <section className="bg-white py-16 lg:py-20">
        <div className="container-bs">
          <Reveal>
            <h2 className="max-w-2xl text-[1.75rem] font-bold tracking-tight text-ink sm:text-[2rem]">
              {p.capabilitiesTitle}
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink/60">{p.capabilitiesDesc}</p>
          </Reveal>

          <div className="mt-12 space-y-6">
            {p.capabilities.map((cap, i) => {
              const Icon = CAPABILITY_ICONS[i] ?? Bot
              const isReversed = i % 2 === 1
              return (
                <Reveal key={cap.title} delay={i * 0.06}>
                  <div
                    className={`grid items-center gap-8 rounded-[2rem] border border-primary-border/50 p-8 sm:p-10 lg:grid-cols-2 ${
                      isReversed ? 'bg-mist/40' : 'bg-white'
                    }`}
                  >
                    <div className={isReversed ? 'lg:order-2' : ''}>
                      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-white">
                        <Icon className="h-6 w-6" strokeWidth={1.8} />
                      </span>
                      <h3 className="mt-5 text-[1.25rem] font-bold text-ink">{cap.title}</h3>
                      <p className="mt-2 text-[14.5px] leading-relaxed text-ink/65">{cap.desc}</p>
                    </div>
                    <ul className={`space-y-3 ${isReversed ? 'lg:order-1' : ''}`}>
                      {cap.bullets.map((b) => (
                        <li
                          key={b}
                          className="flex items-start gap-3 rounded-xl border border-primary-border/40 bg-white px-4 py-3.5 text-[13.5px] text-ink/75"
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Compare */}
      <section className="bg-mist py-16 lg:py-20">
        <div className="container-bs">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-[1.75rem] font-bold tracking-tight text-ink sm:text-[2rem]">{p.compareTitle}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-ink/60">{p.compareDesc}</p>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <Reveal delay={0.08}>
              <div className="h-full rounded-[2rem] border border-primary-border/60 bg-white p-8">
                <h3 className="text-[17px] font-bold text-ink/50">{p.compareGeneric}</h3>
                <ul className="mt-5 space-y-3.5">
                  {p.genericItems.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[14px] text-ink/60">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-ink/30" strokeWidth={2} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <div className="h-full rounded-[2rem] border border-primary/30 bg-gradient-to-br from-primary-tint/40 to-white p-8 shadow-[0_8px_40px_-12px_rgba(0,142,77,0.15)]">
                <h3 className="flex items-center gap-2 text-[17px] font-bold text-primary-dark">
                  <Bot className="h-5 w-5" />
                  {p.compareBioscope}
                </h3>
                <ul className="mt-5 space-y-3.5">
                  {p.bioscopeItems.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[14px] text-ink/80">
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

      {/* Strengths strip */}
      <section className="bg-white py-16">
        <div className="container-bs">
          <Reveal>
            <h2 className="text-[1.75rem] font-bold tracking-tight text-ink sm:text-[2rem]">{p.strengthsTitle}</h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink/60">{p.strengthsDesc}</p>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {p.strengths.map((item, i) => {
              const Icon = STRENGTH_ICONS[i] ?? Sparkles
              return (
                <Reveal key={item.title} delay={i * 0.08}>
                  <div className="group relative h-full overflow-hidden rounded-2xl border border-primary-border/50 bg-mist/30 p-6 transition-colors hover:border-primary/30 hover:bg-primary-tint/20">
                    <span className="text-[2.5rem] font-extrabold leading-none text-primary/15">0{i + 1}</span>
                    <span className="mt-4 grid h-10 w-10 place-items-center rounded-xl bg-primary text-white">
                      <Icon className="h-5 w-5" strokeWidth={1.8} />
                    </span>
                    <h3 className="mt-4 text-[15px] font-bold text-ink">{item.title}</h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-ink/60">{item.desc}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-mist/50 pb-20 pt-4">
        <div className="container-bs">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#064e3b] via-primary-dark to-[#023d28] px-8 py-10 sm:px-12 sm:py-14">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full bg-[#6ee7a0]/10 blur-3xl"
              />
              <div className="relative z-10 grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
                <div>
                  <h2 className="text-[1.6rem] font-bold text-white sm:text-[1.9rem]">{p.notifyTitle}</h2>
                  <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-white/75">{p.notifyDesc}</p>
                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <Link
                      href="/lien-he"
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-[14px] font-semibold text-primary-dark transition-colors hover:bg-white/90"
                    >
                      {p.contactCta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/"
                      className="text-[14px] font-medium text-[#7ee8a8] transition-colors hover:text-[#a8f5c4]"
                    >
                      {p.backHome}
                    </Link>
                  </div>
                </div>
                <AiNotifyForm placeholder={p.notifyPlaceholder} buttonLabel={p.notifyButton} />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
