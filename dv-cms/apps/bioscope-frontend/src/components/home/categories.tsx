'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Leaf, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/ui/reveal'
import { img, type ImgKey } from '@/lib/images'
import { useLocale } from '@/lib/i18n/context'

const IMAGE_KEYS: ImgKey[] = ['oil', 'botanical', 'powder', 'capsules']
const IMAGE_SRCS = [
  '/images/ingredients/dau-ca-omega-3.webp',
  '/images/ingredients/nam-duoc-lieu.jpeg',
  undefined,
  undefined,
]

export function Categories() {
  const { t } = useLocale()
  const c = t.home.categories

  return (
    <section className="bg-white py-14">
      <div className="container-bs">
        <Reveal className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-[15px] font-extrabold uppercase tracking-[0.1em] text-ink">{c.title}</h2>
            <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-ink/55">{c.description}</p>
          </div>
          <Link
            href="/nguyen-lieu"
            className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-primary transition-colors hover:text-primary-dark"
          >
            {c.viewAll}
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </Reveal>

        <div className="mt-6 grid items-stretch gap-5 lg:grid-cols-[0.92fr_3fr]">
          <Reveal className="h-full">
            <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[1.75rem] p-6 text-white shadow-card sm:p-7">
              <Image
                src="/images/nl1.png"
                alt={c.featured.name}
                fill
                sizes="340px"
                className="object-cover object-[right_center]"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/75 from-[34%] via-primary/20 via-[52%] to-transparent" />
              <div className="relative">
                <h3 className="text-[18px] font-bold leading-snug sm:text-[19px]">{c.featured.name}</h3>
                <p className="mt-3 text-[13.5px] leading-relaxed text-white/85">{c.featured.desc}</p>
              </div>
              <div className="relative mt-6">
                <Button href="/nguyen-lieu" variant="ghost">
                  {c.featured.cta}
                </Button>
              </div>
            </div>
          </Reveal>

          <div className="grid h-full gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {c.items.map(({ name, desc }, i) => (
              <Reveal key={name} delay={i * 0.07} className="h-full">
                <Link
                  href="/nguyen-lieu"
                  className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-primary-border/60 bg-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:shadow-card"
                >
                  <div className="relative aspect-[16/11] overflow-hidden">
                    <Image
                      src={IMAGE_SRCS[i] ?? img(IMAGE_KEYS[i], 420)}
                      alt={name}
                      fill
                      unoptimized={Boolean(IMAGE_SRCS[i])}
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
