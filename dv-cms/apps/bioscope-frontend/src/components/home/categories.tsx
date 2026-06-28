import Image from 'next/image'
import Link from 'next/link'
import { Leaf, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/ui/reveal'
import { img, type ImgKey } from '@/lib/images'

const ITEMS: { name: string; desc: string; image: ImgKey; imageSrc?: string }[] = [
  {
    name: 'Omega & dầu cá',
    desc: 'Hỗ trợ tim mạch, não bộ, lựa sức khỏe toàn diện.',
    image: 'oil',
    imageSrc: '/images/ingredients/dau-ca-omega-3.webp',
  },
  {
    name: 'Nấm dược liệu',
    desc: 'Tăng cường miễn dịch, bảo vệ và phục hồi cơ thể.',
    image: 'botanical',
    imageSrc: '/images/ingredients/nam-duoc-lieu.jpeg',
  },
  { name: 'Hoạt chất công nghệ cao', desc: 'Hiệu quả vượt trội, ứng dụng đa dạng.', image: 'powder' },
  { name: 'Axit amin & vitamin', desc: 'Nền tảng cho sức khỏe và hiệu suất tối ưu.', image: 'capsules' },
]

export function Categories() {
  return (
    <section className="bg-white py-14">
      <div className="container-bs">
        <Reveal className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-[15px] font-extrabold uppercase tracking-[0.1em] text-ink">
              Danh mục nguyên liệu
            </h2>
            <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-ink/55">
              Hơn 100 nguyên liệu hiệu suất cao — Dược phẩm, TPCN, Mỹ phẩm. Đầy đủ TDS, COA, sẵn mẫu thử.
            </p>
          </div>
          <Link
            href="/nguyen-lieu"
            className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-primary transition-colors hover:text-primary-dark"
          >
            Xem tất cả nguyên liệu
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </Reveal>

        <div className="mt-6 grid items-stretch gap-5 lg:grid-cols-[0.92fr_3fr]">
          <Reveal className="h-full">
            <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[1.75rem] p-6 text-white shadow-card sm:p-7">
              <Image
                src="/images/nl1.png"
                alt="Chiết xuất thực vật"
                fill
                sizes="340px"
                className="object-cover object-[right_center]"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/75 from-[34%] via-primary/20 via-[52%] to-transparent" />
              <div className="relative">
                <h3 className="text-[18px] font-bold leading-snug sm:text-[19px]">Chiết xuất thực vật</h3>
                <p className="mt-3 text-[13.5px] leading-relaxed text-white/85">
                  Nguồn gốc tự nhiên, hiệu quả đã được khoa học chứng minh.
                </p>
              </div>
              <div className="relative mt-6">
                <Button href="/nguyen-lieu" variant="ghost">Khám phá ngay</Button>
              </div>
            </div>
          </Reveal>

          <div className="grid h-full gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ITEMS.map(({ name, desc, image, imageSrc }, i) => (
              <Reveal key={name} delay={i * 0.07} className="h-full">
                <Link
                  href="/nguyen-lieu"
                  className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-primary-border/60 bg-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:shadow-card"
                >
                  <div className="relative aspect-[16/11] overflow-hidden">
                    <Image
                      src={imageSrc ?? img(image, 420)}
                      alt={name}
                      fill
                      unoptimized={Boolean(imageSrc)}
                      sizes="(max-width: 1024px) 50vw, 220px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-[16px] font-bold leading-snug text-ink">{name}</h3>
                    <p className="mt-2 flex-1 text-[12.5px] leading-relaxed text-ink/55">{desc}</p>
                    <Leaf className="mt-4 h-4 w-4 text-primary" strokeWidth={1.7} />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
