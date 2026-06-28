import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AlertCircle, Lightbulb, TrendingUp, Quote } from 'lucide-react'
import { PageHero } from '@/components/ui/page-hero'
import { Reveal } from '@/components/ui/reveal'
import { Button } from '@/components/ui/button'
import { CASE_STUDIES } from '@/lib/content'

export function generateStaticParams() {
  return CASE_STUDIES.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const c = CASE_STUDIES.find((x) => x.slug === slug)
  if (!c) return {}
  return { title: `${c.brand} — Case Study`, description: c.problem }
}

const BLOCKS = [
  { key: 'problem', icon: AlertCircle, label: 'Vấn đề', tone: 'text-accent' },
  { key: 'solution', icon: Lightbulb, label: 'Giải pháp Bioscope', tone: 'text-primary' },
] as const

export default async function CaseStudyDetail({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const c = CASE_STUDIES.find((x) => x.slug === slug)
  if (!c) notFound()

  return (
    <>
      <PageHero
        eyebrow={c.industry}
        title={`${c.brand} — ${c.kpiLabel}`}
        description={c.summary}
        crumbs={[{ label: 'Case Study', href: '/case-study' }, { label: c.brand }]}
        image={c.coverImage ? undefined : c.image}
        coverImage={c.coverImage}
      />

      <section className="bg-white py-16">
        <div className="container-bs grid gap-12 lg:grid-cols-[1fr_320px]">
          <div className="space-y-8">
            {BLOCKS.map(({ key, icon: Icon, label, tone }) => (
              <Reveal key={key}>
                <div className="rounded-[2rem] border border-primary-border/60 bg-mist/40 p-8">
                  <div className={`flex items-center gap-2 ${tone}`}>
                    <Icon className="h-5 w-5" strokeWidth={1.7} />
                    <span className="text-[11px] font-bold uppercase tracking-[0.16em]">{label}</span>
                  </div>
                  <p className="mt-4 text-[16px] leading-relaxed text-ink/75">{c[key]}</p>
                </div>
              </Reveal>
            ))}

            <Reveal>
              <div className="rounded-[2rem] border border-primary-border/60 bg-primary p-8 text-white">
                <div className="flex items-center gap-2 text-white/80">
                  <TrendingUp className="h-5 w-5" strokeWidth={1.7} />
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em]">Kết quả</span>
                </div>
                <ul className="mt-5 grid gap-4 sm:grid-cols-3">
                  {c.result.map((r) => (
                    <li key={r} className="rounded-2xl bg-white/10 p-5 text-[14px] font-medium leading-snug">
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {c.coCreateSteps && c.coCreateSteps.length > 0 && (
              <Reveal>
                <div className="rounded-[2rem] border border-primary-border/60 bg-white p-8">
                  <h3 className="text-[15px] font-bold text-ink">Hành trình đồng kiến tạo</h3>
                  <ol className="mt-5 space-y-3">
                    {c.coCreateSteps.map((step, i) => (
                      <li key={step} className="flex gap-3 text-[14px] text-ink/70">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-tint text-[11px] font-bold text-primary">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </Reveal>
            )}

            {c.testimonial && (
              <Reveal>
                <div className="rounded-[2rem] border border-primary-border/60 bg-mist/40 p-8">
                  <Quote className="h-6 w-6 text-primary/50" strokeWidth={1.5} />
                  <p className="mt-4 text-[16px] italic leading-relaxed text-ink/75">&ldquo;{c.testimonial}&rdquo;</p>
                  <p className="mt-4 text-[13px] font-semibold text-ink/55">— Đối tác {c.brand}</p>
                </div>
              </Reveal>
            )}
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[2rem] border border-primary-border/60 bg-mist/50 p-7 text-center">
              <div className="text-[40px] font-extrabold tracking-tight text-primary">{c.kpi}</div>
              <p className="mt-2 text-[13.5px] text-ink/55">{c.kpiLabel}</p>
              <hr className="my-6 border-primary-border/50" />
              <h3 className="text-[16px] font-bold text-ink">Muốn kết quả tương tự?</h3>
              <div className="mt-5">
                <Button href="/lien-he" className="w-full justify-between">Liên hệ ngay</Button>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
