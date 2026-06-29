import type { Metadata } from 'next'
import Image from 'next/image'
import { Target, Compass, Globe2, Sparkles } from 'lucide-react'
import { PageHero } from '@/components/ui/page-hero'
import { Reveal } from '@/components/ui/reveal'
import { Counter } from '@/components/ui/counter'
import { CtaBand } from '@/components/home/cta-band'
import { AboutProductProcess } from '@/components/about/product-process'
import {
  ABOUT_TIMELINE,
  ABOUT_DIFFERENTIATION,
  ABOUT_CORE_VALUES,
  CLIENT_LOGOS,
} from '@/lib/content'

export const metadata: Metadata = {
  title: 'Về chúng tôi — Nhà phân phối công nghệ, không chỉ nguyên liệu',
  description:
    'Bioscope hợp tác với các đối tác sản xuất có tiềm lực R&D để đưa ra thị trường những sản phẩm công nghệ cao, đột phá về hiệu quả và chi phí.',
}

const STATS = [
  { to: 15, suffix: '+', label: 'Năm kinh nghiệm' },
  { to: 100, suffix: '+', label: 'Dự án' },
  { to: 23, suffix: '', label: 'Dự án R&D' },
  { to: 14, suffix: '', label: 'Đơn sáng chế' },
]

const MISSION_CARDS = [
  { icon: Target, title: 'Sứ mệnh', desc: 'Nâng cao cân bằng hiệu quả/chi phí cho người tiêu dùng và đưa nhãn hàng Việt vươn xa.' },
  { icon: Compass, title: 'Định vị', desc: 'Đối tác chiến lược đồng hành từ ý tưởng đến thương mại hóa, không chỉ bán nguyên liệu.' },
  { icon: Globe2, title: 'Mạng lưới', desc: 'Hợp tác với đối tác R&D và nhà sản xuất tại hơn 50 quốc gia.' },
]

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Về chúng tôi"
        title="Nhà phân phối công nghệ — không chỉ là nhà cung ứng nguyên liệu"
        description="Bioscope tồn tại để nâng cao cân bằng hiệu quả/chi phí cho người tiêu dùng — và đưa các nhà phát triển nhãn hàng Việt Nam vươn xa."
        crumbs={[{ label: 'Về chúng tôi' }]}
        image="labWork"
      />

      <section className="bg-white py-16">
        <div className="container-bs grid gap-5 lg:grid-cols-3">
          {MISSION_CARDS.map(({ icon: Icon, title, desc }, i) => (
            <Reveal key={title} delay={i * 0.08}>
              <div className="h-full rounded-[2rem] border border-primary-border/60 bg-mist/40 p-8">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-tint text-primary">
                  <Icon className="h-6 w-6" strokeWidth={1.5} />
                </span>
                <h3 className="mt-5 text-[19px] font-bold text-ink">{title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink/65">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-mist py-16">
        <div className="container-bs">
          <Reveal>
            <h2 className="text-[1.9rem] font-bold tracking-tight text-ink sm:text-[2.3rem]">
              {ABOUT_DIFFERENTIATION.title}
            </h2>
            <p className="mt-6 max-w-3xl text-[15px] leading-relaxed text-ink/70">
              {ABOUT_DIFFERENTIATION.description}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-bs">
          <Reveal>
            <h2 className="text-[1.9rem] font-bold tracking-tight text-ink sm:text-[2.3rem]">Giá trị cốt lõi</h2>
          </Reveal>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ABOUT_CORE_VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.06}>
                <div className="h-full rounded-[1.5rem] border border-primary-border/60 bg-mist/40 p-6">
                  <h3 className="text-[16px] font-bold text-ink">{v.title}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-ink/65">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <AboutProductProcess />

      <section className="bg-white py-20">
        <div className="container-bs grid gap-12 lg:grid-cols-2">
          <Reveal>
            <h2 className="text-[1.9rem] font-bold tracking-tight text-ink sm:text-[2.3rem]">Hành trình của chúng tôi</h2>
            <div className="mt-8 space-y-6">
              {ABOUT_TIMELINE.map((t) => (
                <div key={t.year} className="flex gap-5">
                  <div className="w-24 shrink-0 text-[15px] font-extrabold text-primary">{t.year}</div>
                  <p className="text-[14.5px] leading-relaxed text-ink/70">{t.text}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="grid grid-cols-2 gap-4">
              {STATS.map((s) => (
                <div key={s.label} className="rounded-[1.5rem] border border-primary-border/60 bg-white px-7 py-8">
                  <div className="text-[34px] font-extrabold tracking-tight text-primary">
                    <Counter to={s.to} suffix={s.suffix} />
                  </div>
                  <div className="mt-1 text-[13px] font-medium text-ink/55">{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-mist py-16">
        <div className="container-bs">
          <Reveal className="text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary-tint text-primary">
              <Sparkles className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <h2 className="mt-4 text-[1.9rem] font-bold tracking-tight text-ink sm:text-[2.3rem]">
              Đối tác quốc tế
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-relaxed text-ink/65">
              Mạng lưới đối tác R&D và nhà sản xuất tại hơn 50 quốc gia — GC Rieber Oils, Indena, PolymerSolution, Naturex, Sabinsa, PLT Health Solutions và nhiều đối tác khác.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              {CLIENT_LOGOS.map((c) => (
                <div
                  key={c.name}
                  className="flex h-[72px] w-[148px] items-center justify-center rounded-2xl border border-primary-border/60 bg-white px-4 shadow-soft"
                >
                  <Image
                    src={c.logo}
                    alt={c.name}
                    width={120}
                    height={48}
                    unoptimized
                    className="max-h-10 w-auto max-w-full object-contain"
                  />
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBand />
    </>
  )
}
