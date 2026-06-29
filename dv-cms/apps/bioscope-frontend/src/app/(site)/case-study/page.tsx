import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { PageHero } from '@/components/ui/page-hero'
import { Reveal } from '@/components/ui/reveal'
import { CtaBand } from '@/components/home/cta-band'
import { getContent } from '@/lib/get-content'
import { getLocale } from '@/lib/i18n/server'
import { getPageI18n } from '@/lib/i18n/pages'
import { getMessages } from '@/lib/i18n/messages'

export async function generateMetadata() {
  const locale = await getLocale()
  return getPageI18n('caseStudies', locale).metadata
}

export default async function CaseStudyList() {
  const locale = await getLocale()
  const content = getContent(locale)
  const { hero } = getPageI18n('caseStudies', locale)
  const m = getMessages(locale)

  return (
    <>
      <PageHero {...hero} image="oil" />

      <section className="border-b border-primary-border/40 bg-mist/30 py-10">
        <div className="container-bs">
          <p className="max-w-3xl text-[15px] leading-relaxed text-ink/70">
            {locale === 'en'
              ? 'Each case study follows a storytelling structure: Problem → Co-created solution → Measurable results → Partner testimonial.'
              : 'Mỗi case study theo cấu trúc storytelling: Vấn đề → Giải pháp đồng kiến tạo → Kết quả bằng số liệu → Lời chứng thực từ đối tác.'}
          </p>
        </div>
      </section>

      <section className="bg-white pb-24 pt-16">
        <div className="container-bs grid gap-5 md:grid-cols-3">
          {content.CASE_STUDIES.map((c, i) => (
            <Reveal key={c.slug} delay={i * 0.08}>
              <Link
                href={`/case-study/${c.slug}`}
                className="group flex h-full flex-col rounded-[2rem] border border-primary-border/60 bg-mist/40 p-7 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:bg-white hover:shadow-card"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[18px] font-bold text-ink">{c.brand}</span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-ink/50">{c.industry}</span>
                </div>
                {c.summary && <p className="mt-3 text-[13.5px] leading-relaxed text-ink/60">{c.summary}</p>}
                <div className="mt-6">
                  <div className="text-[38px] font-extrabold leading-none tracking-tight text-primary">{c.kpi}</div>
                  <div className="mt-2 text-[13px] font-medium text-ink/55">{c.kpiLabel}</div>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {c.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-primary-tint px-3 py-1 text-[11px] font-semibold text-primary-dark"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="mt-7 inline-flex items-center gap-1 text-[13.5px] font-semibold text-primary">
                  {m.coCreatePage.readCase}
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <CtaBand />
    </>
  )
}
