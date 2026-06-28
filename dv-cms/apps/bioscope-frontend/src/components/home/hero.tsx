import Image from 'next/image'
import { FlaskConical, ShieldCheck, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/ui/reveal'

const TRUST = [
  { icon: FlaskConical, label: 'Nguyên liệu chuyên biệt' },
  { icon: ShieldCheck, label: 'Đảm bảo chất lượng toàn cầu' },
  { icon: Truck, label: 'Nguồn cung ổn định' },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-mist pt-[72px]">
      {/* Background image + light overlay for readable text */}
      <div className="absolute inset-0" aria-hidden>
        <Image
          src="/images/banners/banner.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, #F4F8F6 0%, rgba(244,248,246,0.96) 28%, rgba(244,248,246,0.7) 40%, rgba(244,248,246,0.18) 50%, rgba(244,248,246,0) 60%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(244,248,246,0.6) 0%, transparent 22%)' }}
        />
        {/* Mobile-only veil so text stays readable over the full-width image */}
        <div className="absolute inset-0 bg-mist/45 backdrop-blur-[2px] sm:hidden" />
      </div>

      <div className="container-bs relative flex min-h-[480px] flex-col justify-center py-16 lg:min-h-[560px] lg:py-20">
        <div className="max-w-xl">
          <Reveal immediate>
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-accent">
              Nguyên liệu chuyên biệt · Thành công đồng kiến tạo
            </p>
          </Reveal>
          <Reveal immediate delay={0.08}>
            <h1 className="mt-4 font-bold leading-[1.12] tracking-tight text-ink text-[1.7rem] sm:text-[2.5rem]">
              Không chỉ là nguyên liệu. Chúng tôi{' '}
              <span className="whitespace-nowrap text-primary">đồng kiến tạo</span>{' '}
              <span className="whitespace-nowrap">
                giải pháp <span className="text-accent">đột phá</span>.
              </span>
            </h1>
          </Reveal>
          <Reveal immediate delay={0.16}>
            <p className="mt-5 max-w-md text-[16px] leading-relaxed text-ink/70">
              Nguyên liệu cao cấp, dựa trên khoa học. Chuyên môn kỹ thuật sâu.
              Khả năng không giới hạn — cùng nhau.
            </p>
          </Reveal>
          <Reveal immediate delay={0.24}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href="/nguyen-lieu" variant="accent">Khám phá nguyên liệu</Button>
              <Button href="/dong-kien-tao" variant="outline">
                Đồng kiến tạo cùng chúng tôi
              </Button>
            </div>
          </Reveal>
        </div>
        <Reveal immediate delay={0.32} className="mt-8">
          <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
            {TRUST.map(({ icon: Icon, label }) => (
              <div key={label} className="flex shrink-0 items-center gap-2 text-[13.5px] font-medium text-ink/75">
                <Icon className="h-4 w-4 text-primary" strokeWidth={1.7} />
                {label}
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      {/* soft curved divider into white */}
      <svg
        className="relative block h-[44px] w-full sm:h-[72px]"
        viewBox="0 0 1440 72"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M0,72 L0,36 C 240,68 520,72 720,52 C 940,30 1180,28 1440,44 L1440,72 Z"
          fill="#ffffff"
        />
      </svg>
    </section>
  )
}
