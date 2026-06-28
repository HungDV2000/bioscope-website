import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Check } from 'lucide-react'
import { PageHero } from '@/components/ui/page-hero'
import { Reveal } from '@/components/ui/reveal'
import { CtaBand } from '@/components/home/cta-band'
import { SOLUTIONS, SOLUTIONS_ICP } from '@/lib/content'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Giải pháp — Ba cách Bioscope giúp thương hiệu chiến thắng',
  description:
    'Từ cung cấp nguyên liệu đến đồng kiến tạo trọn hành trình — chọn mức độ đồng hành phù hợp với năng lực và mục tiêu của bạn.',
}

export default function SolutionsPage() {
  return (
    <>
      <PageHero
        eyebrow="Giải pháp"
        title="Ba cách Bioscope giúp thương hiệu của bạn chiến thắng"
        description="Tùy vào năng lực và mục tiêu, bạn có thể chọn mức độ đồng hành phù hợp — từ cung cấp nguyên liệu đến đồng kiến tạo trọn hành trình."
        crumbs={[{ label: 'Giải pháp' }]}
        image="labWork"
      />

      <section className="bg-white py-16">
        <div className="container-bs">
          <Reveal>
            <h2 className="text-[1.9rem] font-bold tracking-tight text-ink sm:text-[2.3rem]">
              Ai phù hợp với giải pháp nào?
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink/65">
              Tùy năng lực nội bộ và mục tiêu kinh doanh, bạn có thể chọn mức độ đồng hành phù hợp — từ cung cấp nguyên liệu đến đồng kiến tạo trọn hành trình.
            </p>
          </Reveal>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {SOLUTIONS_ICP.map((icp, i) => {
              const solution = SOLUTIONS.find((s) => s.slug === icp.solution)
              const isPriority2 = icp.priority === 'Ưu tiên 2'
              return (
                <Reveal key={icp.title} delay={i * 0.08}>
                  <Link
                    href={`/giai-phap/${icp.solution}`}
                    className={cn(
                      'group flex h-full flex-col rounded-[1.75rem] border bg-mist/40 p-6 transition-all hover:-translate-y-1 hover:bg-white hover:shadow-card',
                      isPriority2 ? 'border-accent/55 hover:border-accent/75' : 'border-primary-border/60',
                    )}
                  >
                    <span
                      className={cn(
                        'text-[11px] font-bold uppercase tracking-wide',
                        isPriority2 ? 'text-accent' : 'text-primary',
                      )}
                    >
                      {icp.priority}
                    </span>
                    <h3 className="mt-2 text-[17px] font-bold text-ink">{icp.title}</h3>
                    <p className="mt-2 flex-1 text-[14px] leading-relaxed text-ink/65">{icp.desc}</p>
                    {solution && (
                      <span
                        className={cn(
                          'mt-4 inline-flex items-center gap-1 text-[13px] font-semibold',
                          isPriority2 ? 'text-accent' : 'text-primary',
                        )}
                      >
                        {solution.title}
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    )}
                  </Link>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-mist py-16">
        <div className="container-bs grid gap-5 lg:grid-cols-3">
          {SOLUTIONS.map((s, i) => (
            <Reveal key={s.slug} delay={i * 0.08}>
              <Link
                href={`/giai-phap/${s.slug}`}
                className="group flex h-full flex-col rounded-[2rem] border border-primary-border/60 bg-white p-8 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:shadow-card"
              >
                <div className="text-[13px] font-bold text-primary/50">0{i + 1}</div>
                <h3 className="mt-2 text-[22px] font-bold leading-snug text-ink">{s.title}</h3>
                <p className="mt-3 text-[14px] leading-relaxed text-ink/60">{s.forWho}</p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {s.receive.map((r) => (
                    <li key={r} className="flex items-start gap-2.5 text-[13.5px] text-ink/70">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2} />
                      {r}
                    </li>
                  ))}
                </ul>
                <span className="mt-7 inline-flex items-center gap-1 text-[14px] font-semibold text-primary">
                  {s.cta}
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
