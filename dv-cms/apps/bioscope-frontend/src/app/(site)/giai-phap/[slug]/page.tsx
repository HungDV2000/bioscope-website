import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Check, Sparkles, ArrowUpRight } from 'lucide-react'
import { PageHero } from '@/components/ui/page-hero'
import { Reveal } from '@/components/ui/reveal'
import { Button } from '@/components/ui/button'
import { SOLUTIONS, CASE_STUDIES } from '@/lib/content'

export function generateStaticParams() {
  return SOLUTIONS.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const s = SOLUTIONS.find((x) => x.slug === slug)
  if (!s) return {}
  return { title: s.title, description: s.forWho }
}

export default async function SolutionLanding({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const s = SOLUTIONS.find((x) => x.slug === slug)
  if (!s) notFound()

  const relatedCases = (s.relatedCaseSlugs ?? [])
    .map((id) => CASE_STUDIES.find((c) => c.slug === id))
    .filter(Boolean)

  return (
    <>
      <PageHero
        eyebrow="Giải pháp"
        title={s.title}
        description={s.forWho}
        crumbs={[{ label: 'Giải pháp', href: '/giai-phap' }, { label: s.title }]}
      />

      {s.summary && (
        <section className="border-b border-primary-border/40 bg-mist/30 py-10">
          <div className="container-bs">
            <p className="max-w-3xl text-[16px] leading-relaxed text-ink/70">{s.summary}</p>
          </div>
        </section>
      )}

      <section className="bg-white py-20">
        <div className="container-bs grid gap-12 lg:grid-cols-[1fr_380px]">
          <Reveal>
            <h2 className="text-[1.8rem] font-bold tracking-tight text-ink">Bạn nhận được gì</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {s.receive.map((r) => (
                <div key={r} className="flex items-start gap-3 rounded-2xl border border-primary-border/60 bg-mist/40 p-5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-tint text-primary">
                    <Check className="h-4 w-4" strokeWidth={2.4} />
                  </span>
                  <span className="text-[14.5px] font-medium leading-snug text-ink/80">{r}</span>
                </div>
              ))}
            </div>

            {s.idealFor && s.idealFor.length > 0 && (
              <div className="mt-12">
                <h3 className="text-[17px] font-bold text-ink">Ai phù hợp với giải pháp này</h3>
                <ul className="mt-4 space-y-2.5">
                  {s.idealFor.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[14px] text-ink/70">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {s.process && s.process.length > 0 && (
              <div className="mt-12">
                <h3 className="text-[17px] font-bold text-ink">Quy trình thực hiện</h3>
                <div className="mt-5 space-y-4">
                  {s.process.map((step, i) => (
                    <div key={step.step} className="flex gap-4 rounded-2xl border border-primary-border/60 bg-mist/30 p-5">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-[13px] font-bold text-white">
                        {i + 1}
                      </span>
                      <div>
                        <div className="font-semibold text-ink">{step.step}</div>
                        <p className="mt-1 text-[14px] leading-relaxed text-ink/65">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {s.expectedOutcomes && s.expectedOutcomes.length > 0 && (
              <div className="mt-12">
                <h3 className="text-[17px] font-bold text-ink">Kết quả kỳ vọng</h3>
                <ul className="mt-4 space-y-2">
                  {s.expectedOutcomes.map((o) => (
                    <li key={o} className="text-[14px] text-ink/70">• {o}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-12 rounded-[2rem] border border-primary-border/60 bg-primary-tint/40 p-8">
              <Sparkles className="h-7 w-7 text-primary" strokeWidth={1.5} />
              <p className="mt-4 text-[17px] font-semibold leading-relaxed text-ink">
                {s.heroQuote ??
                  'Bioscope đảo ngược quy trình: nghiên cứu thị trường và nhu cầu trước, chỉ làm hàng khi có tín hiệu rõ ràng — giảm rủi ro, tăng tỷ lệ thành công.'}
              </p>
            </div>

            {s.faq && s.faq.length > 0 && (
              <div className="mt-12">
                <h3 className="text-[17px] font-bold text-ink">Câu hỏi thường gặp</h3>
                <div className="mt-5 space-y-4">
                  {s.faq.map((f) => (
                    <div key={f.q} className="rounded-2xl border border-primary-border/60 bg-white p-5">
                      <p className="font-semibold text-ink">{f.q}</p>
                      <p className="mt-2 text-[14px] leading-relaxed text-ink/65">{f.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {relatedCases.length > 0 && (
              <div className="mt-12">
                <h3 className="text-[17px] font-bold text-ink">Ví dụ thực tế</h3>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {relatedCases.map((c) =>
                    c ? (
                      <Link
                        key={c.slug}
                        href={`/case-study/${c.slug}`}
                        className="group rounded-2xl border border-primary-border/60 bg-mist/40 p-5 transition-all hover:bg-white hover:shadow-soft"
                      >
                        <div className="font-bold text-ink">{c.brand}</div>
                        <p className="mt-1 text-[13px] text-ink/60">{c.summary ?? c.kpiLabel}</p>
                        <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-primary">
                          Xem case study
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </span>
                      </Link>
                    ) : null,
                  )}
                </div>
              </div>
            )}
          </Reveal>

          <Reveal delay={0.12} className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[2rem] border border-primary-border/60 bg-mist/50 p-7 text-center">
              <h3 className="text-[19px] font-bold text-ink">Sẵn sàng bắt đầu?</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink/60">
                Chia sẻ dự án của bạn, đội ngũ chuyên gia sẽ phản hồi trong 24 giờ làm việc.
              </p>
              <div className="mt-6 flex flex-col gap-2.5">
                <Button href="/lien-he" className="w-full justify-between">Bắt đầu dự án ngay</Button>
                <Button href="/nguyen-lieu" variant="outline" className="w-full justify-between">Khám phá nguyên liệu</Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
