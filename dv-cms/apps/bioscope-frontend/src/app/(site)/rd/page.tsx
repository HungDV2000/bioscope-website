import type { Metadata } from 'next'
import Image from 'next/image'
import { Atom, Check } from 'lucide-react'
import { PageHero } from '@/components/ui/page-hero'
import { Reveal } from '@/components/ui/reveal'
import { Counter } from '@/components/ui/counter'
import { CtaBand } from '@/components/home/cta-band'
import { TECHNOLOGIES, RD_RESEARCH_AREAS, RD_WHITEPAPERS, CLIENT_LOGOS } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Nghiên cứu & Phát triển — R&D là trái tim của Bioscope',
  description:
    '23+ dự án nghiên cứu, 14 đơn sáng chế, hàng trăm nguyên liệu công nghệ cao — tối ưu hiệu quả/chi phí để nhãn hàng dễ thành công.',
}

const STATS = [
  { to: 23, suffix: '+', label: 'Dự án nghiên cứu' },
  { to: 14, suffix: '', label: 'Đơn sáng chế' },
  { to: 100, suffix: '+', label: 'Nguyên liệu công nghệ cao' },
  { to: 50, suffix: '+', label: 'Đối tác R&D toàn cầu' },
]

export default function RDPage() {
  return (
    <>
      <PageHero
        eyebrow="Nghiên cứu & Phát triển"
        title="R&D là trái tim của Bioscope"
        description="23+ dự án nghiên cứu · 14 đơn sáng chế · hàng trăm nguyên liệu công nghệ cao đã đưa ra thị trường — với cùng một mục tiêu: tối ưu hiệu quả/chi phí để nhãn hàng dễ thành công."
        crumbs={[{ label: 'Nghiên cứu & Phát triển' }]}
        image="microscope"
      />

      <section className="bg-white py-12">
        <div className="container-bs grid grid-cols-2 gap-px overflow-hidden rounded-[2rem] border border-primary-border/60 bg-primary-border/50 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-white px-6 py-8 text-center">
              <div className="text-[34px] font-extrabold tracking-tight text-primary">
                <Counter to={s.to} suffix={s.suffix} />
              </div>
              <div className="mt-1 text-[12.5px] font-medium text-ink/55">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white pb-20">
        <div className="container-bs">
          <Reveal>
            <h2 className="text-[1.9rem] font-bold tracking-tight text-ink sm:text-[2.3rem]">
              Công nghệ độc quyền của Bioscope
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {TECHNOLOGIES.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.1}>
                <div className="flex h-full flex-col rounded-[2rem] border border-primary-border/60 bg-mist/40 p-8">
                  <div className="flex items-center gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-white">
                      <Atom className="h-6 w-6" strokeWidth={1.5} />
                    </span>
                    <div>
                      <h3 className="text-[19px] font-bold text-ink">{t.name}</h3>
                      <p className="text-[13px] text-ink/50">{t.product}</p>
                    </div>
                  </div>
                  <p className="mt-5 text-[14px] leading-relaxed text-ink/65">{t.mechanism}</p>
                  <ul className="mt-5 space-y-2.5">
                    {t.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2.5 text-[13.5px] text-ink/70">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2} />
                        {h}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex flex-wrap gap-2 border-t border-primary-border/50 pt-5">
                    {t.applications.map((a) => (
                      <span key={a} className="rounded-full bg-primary-tint px-3 py-1 text-[12px] font-semibold text-primary-dark">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-mist py-16">
        <div className="container-bs">
          <Reveal>
            <h2 className="text-[1.9rem] font-bold tracking-tight text-ink sm:text-[2.3rem]">Lĩnh vực nghiên cứu</h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink/65">
              23+ dự án R&D tập trung vào sinh khả dụng, dẫn truyền qua da, nano hoạt chất và các phân khúc sức khỏe trọng điểm.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="mt-8 flex flex-wrap gap-2.5">
              {RD_RESEARCH_AREAS.map((area) => (
                <span
                  key={area}
                  className="rounded-full border border-primary-border bg-white px-4 py-2 text-[13.5px] font-medium text-ink/70"
                >
                  {area}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-bs grid gap-12 lg:grid-cols-2">
          <Reveal>
            <h2 className="text-[1.9rem] font-bold tracking-tight text-ink sm:text-[2.3rem]">Đối tác R&D quốc tế</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink/65">
              Hợp tác trực tiếp với các nhà sản xuất và viện nghiên cứu hàng đầu tại hơn 50 quốc gia — đảm bảo nguồn công nghệ và nguyên liệu luôn cập nhật.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {CLIENT_LOGOS.map((c) => (
                <div
                  key={c.name}
                  className="flex h-14 w-[132px] items-center justify-center rounded-2xl border border-primary-border/60 bg-white px-3"
                >
                  <Image
                    src={c.logo}
                    alt={c.name}
                    width={110}
                    height={44}
                    unoptimized
                    className="max-h-9 w-auto max-w-full object-contain"
                  />
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h3 className="text-[17px] font-bold text-ink">Tài liệu chuyên môn & công bố</h3>
            <p className="mt-2 text-[14px] text-ink/60">Tài liệu chuyên sâu từ đội ngũ R&D — một số yêu cầu email để tải.</p>
            <ul className="mt-5 space-y-3">
              {RD_WHITEPAPERS.map((w) => (
                <li
                  key={w.title}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-primary-border/60 bg-mist/40 p-4"
                >
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wide text-primary/60">{w.type}</div>
                    <div className="mt-1 text-[14px] font-semibold text-ink">{w.title}</div>
                  </div>
                  {w.gated && (
                    <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-bold text-accent">
                      Cần đăng ký
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <CtaBand />
    </>
  )
}
