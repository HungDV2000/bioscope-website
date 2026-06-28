import type { Metadata } from 'next'
import Link from 'next/link'
import { Lightbulb, FlaskConical, ShieldCheck, Rocket, TrendingUp, ArrowUpRight, X, Check } from 'lucide-react'
import { PageHero } from '@/components/ui/page-hero'
import { Reveal } from '@/components/ui/reveal'
import { CtaBand } from '@/components/home/cta-band'
import { CO_CREATE_COMPARISON, CO_CREATE_STEP_DURATIONS, CASE_STUDIES } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Đồng kiến tạo — Hành trình 5 bước cùng Bioscope',
  description:
    'Nhà phân phối thông thường giao hàng rồi kết thúc. Bioscope bắt đầu từ ý tưởng và đồng hành đến khi thương hiệu của bạn tăng trưởng bền vững.',
}

const JOURNEY = [
  { icon: Lightbulb, title: 'Ý tưởng', desc: 'Thấu hiểu nhu cầu & nắm bắt xu hướng. Cùng bạn phân tích thị trường, đối tượng mục tiêu, phân khúc và cơ hội.' },
  { icon: FlaskConical, title: 'Nghiên cứu & đề xuất', desc: 'Lựa chọn nguyên liệu, công nghệ và đề xuất công thức tối ưu hiệu quả/chi phí.' },
  { icon: ShieldCheck, title: 'Kiểm chứng & thử nghiệm', desc: 'Tạo mẫu, kiểm nghiệm hiệu quả và độ an toàn; test tín hiệu thị trường qua kênh online trước khi sản xuất lớn.' },
  { icon: Rocket, title: 'Phát triển & ra mắt', desc: 'Hoàn thiện sản phẩm, hỗ trợ pháp lý, sản xuất và đưa ra thị trường.' },
  { icon: TrendingUp, title: 'Tăng trưởng & đồng hành', desc: 'Tối ưu liên tục, mở rộng danh mục, đồng hành xây dựng thương hiệu bền vững.' },
]

export default function CoCreatePage() {
  return (
    <>
      <PageHero
        eyebrow="Đồng kiến tạo"
        title="Tại sao đồng kiến tạo khác hẳn việc mua nguyên liệu thông thường?"
        description="Nhà phân phối thông thường giao hàng rồi kết thúc. Bioscope bắt đầu từ ý tưởng và đồng hành đến tận lúc thương hiệu của bạn tăng trưởng bền vững."
        crumbs={[{ label: 'Đồng kiến tạo' }]}
        image="heroTeam"
      />

      <section className="bg-white py-16">
        <div className="container-bs">
          <Reveal>
            <h2 className="text-center text-[1.9rem] font-bold tracking-tight text-ink sm:text-[2.3rem]">
              So sánh mô hình hợp tác
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-[15px] leading-relaxed text-ink/65">
              Chúng tôi không chỉ cung cấp. Chúng tôi đồng kiến tạo — từ ý tưởng đến thành công thị trường.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <Reveal delay={0.08}>
              <div className="rounded-[2rem] border border-primary-border/60 bg-mist/30 p-8">
                <h3 className="text-[17px] font-bold text-ink/55">Nhà phân phối thông thường</h3>
                <ul className="mt-5 space-y-3">
                  {CO_CREATE_COMPARISON.traditional.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[14px] text-ink/60">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-ink/35" strokeWidth={2} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <div className="rounded-[2rem] border border-primary/30 bg-primary-tint/30 p-8">
                <h3 className="text-[17px] font-bold text-primary-dark">Bioscope — Đồng kiến tạo</h3>
                <ul className="mt-5 space-y-3">
                  {CO_CREATE_COMPARISON.bioscope.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[14px] text-ink/75">
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

      <section className="bg-mist py-20">
        <div className="container-bs">
          <div className="relative mx-auto max-w-5xl">
            <span
              aria-hidden
              className="absolute top-2 bottom-2 left-1/2 hidden w-px -translate-x-1/2 bg-primary-border/70 sm:block"
            />

            <div className="space-y-10 sm:space-y-12">
              {JOURNEY.map(({ icon: Icon, title, desc }, i) => {
                const isLeft = i % 2 === 0
                const stepLabel = `Bước ${i + 1}`
                const duration = CO_CREATE_STEP_DURATIONS[i]

                const card = (
                  <div className="rounded-[1.5rem] border border-primary-border/60 bg-white p-6 sm:max-w-md">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[12.5px] font-bold text-primary/50">{stepLabel}</div>
                      {duration && (
                        <span className="rounded-full bg-primary-tint px-2.5 py-0.5 text-[11px] font-semibold text-primary-dark">
                          {duration.duration}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1 text-[19px] font-bold text-ink">{title}</h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-ink/65">{desc}</p>
                  </div>
                )

                const icon = (
                  <div className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-primary-border bg-white text-primary shadow-soft">
                    <Icon className="h-6 w-6" strokeWidth={1.6} />
                  </div>
                )

                return (
                  <Reveal key={title} delay={i * 0.06}>
                    <div className="flex flex-col items-center gap-4 sm:hidden">
                      {icon}
                      <div className="w-full">{card}</div>
                    </div>
                    <div className="hidden sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-6 lg:gap-10">
                      <div className="flex justify-end">{isLeft ? card : null}</div>
                      <div className="flex justify-center">{icon}</div>
                      <div className="flex justify-start">{!isLeft ? card : null}</div>
                    </div>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-bs">
          <Reveal>
            <h2 className="text-[1.9rem] font-bold tracking-tight text-ink sm:text-[2.3rem]">
              Câu chuyện đồng kiến tạo thực tế
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink/65">
              vivomega®, Gastroheal và PEA — minh chứng cho hành trình 5 bước từ ý tưởng đến tăng trưởng đo lường được.
            </p>
          </Reveal>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {CASE_STUDIES.map((c, i) => (
              <Reveal key={c.slug} delay={i * 0.08}>
                <Link
                  href={`/case-study/${c.slug}`}
                  className="group flex h-full flex-col rounded-[1.75rem] border border-primary-border/60 bg-mist/40 p-6 transition-all duration-500 hover:-translate-y-1 hover:bg-white hover:shadow-card"
                >
                  <div className="text-[16px] font-bold text-ink">{c.brand}</div>
                  <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-ink/60">{c.summary ?? c.problem}</p>
                  <div className="mt-4 text-[28px] font-extrabold text-primary">{c.kpi}</div>
                  <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-primary">
                    Đọc case study
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  )
}
