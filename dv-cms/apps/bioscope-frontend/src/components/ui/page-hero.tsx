'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Eyebrow } from '@/components/ui/section'
import { Reveal } from '@/components/ui/reveal'
import { useLocale } from '@/lib/i18n/context'
import { cn } from '@/lib/utils'
import { img, type ImgKey } from '@/lib/images'

type Crumb = { label: string; href?: string }

export function PageHero({
  eyebrow,
  title,
  description,
  crumbs = [],
  image,
  coverImage,
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  crumbs?: Crumb[]
  image?: ImgKey
  coverImage?: string
  className?: string
}) {
  const { t } = useLocale()

  return (
    <section className={cn('relative overflow-hidden bg-mist pt-32 lg:pt-40', className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-20 h-[420px] w-[420px] rounded-full opacity-50 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(0,142,77,0.14), transparent 70%)' }}
      />
      <div className="container-bs relative grid items-center gap-10 pb-16 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal immediate>
          {crumbs.length > 0 && (
            <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-[13px] text-ink/45">
              <Link href="/" className="transition-colors hover:text-primary">
                {t.nav.home}
              </Link>
              {crumbs.map((c) => (
                <span key={c.label} className="flex items-center gap-1.5">
                  <ChevronRight className="h-3.5 w-3.5" />
                  {c.href ? (
                    <Link href={c.href} className="transition-colors hover:text-primary">
                      {c.label}
                    </Link>
                  ) : (
                    <span className="text-ink/70">{c.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h1 className="mt-4 max-w-2xl text-balance text-[1.9rem] font-bold leading-[1.12] tracking-tight text-ink sm:text-[2.3rem] lg:text-[2.45rem]">
            {title}
          </h1>
          {description && (
            <p className="mt-5 max-w-2xl text-pretty text-[16.5px] leading-relaxed text-ink/65">
              {description}
            </p>
          )}
        </Reveal>

        {(coverImage || image) && (
          <Reveal immediate delay={0.15} className="w-full">
            <div className="relative mx-auto aspect-[4/3] w-full max-w-[480px] overflow-hidden rounded-[2.5rem] border-[6px] border-white shadow-card">
              <Image
                key={coverImage ?? image}
                src={coverImage ?? img(image!, 900)}
                alt=""
                fill
                priority
                unoptimized={Boolean(coverImage)}
                sizes="(max-width: 1024px) 90vw, 480px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/25 via-transparent to-transparent" />
            </div>
          </Reveal>
        )}
      </div>
    </section>
  )
}
