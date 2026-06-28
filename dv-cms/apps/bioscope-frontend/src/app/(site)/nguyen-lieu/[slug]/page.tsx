import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DetailTabs } from '@/components/ingredients/detail-tabs'
import { INGREDIENTS } from '@/lib/content'
import { ingredientImg } from '@/lib/images'

export function generateStaticParams() {
  return INGREDIENTS.map((it) => ({ slug: it.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const it = INGREDIENTS.find((x) => x.slug === slug)
  if (!it) return {}
  return { title: it.name, description: it.shortDesc }
}

export default async function IngredientDetail({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const it = INGREDIENTS.find((x) => x.slug === slug)
  if (!it) notFound()

  return (
    <article className="bg-white pt-32 lg:pt-40">
      <div className="container-bs pb-24">
        <nav className="flex items-center gap-1.5 text-[13px] text-ink/45">
          <Link href="/" className="hover:text-primary">Trang chủ</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/nguyen-lieu" className="hover:text-primary">Nguyên liệu</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-ink/70">{it.name}</span>
        </nav>

        <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary-tint px-3 py-1 text-[12px] font-semibold text-primary-dark">
                {it.category}
              </span>
              <span className="rounded-full border border-primary-border px-3 py-1 text-[12px] font-medium text-ink/60">
                {it.industry}
              </span>
            </div>
            <h1 className="mt-4 text-[1.9rem] font-bold leading-tight tracking-tight text-ink sm:text-[2.3rem] lg:text-[2.45rem]">
              {it.name}
            </h1>
            {it.inci && <p className="mt-1 text-[14px] italic text-ink/50">{it.inci}</p>}
            <div className="mt-5 flex flex-wrap gap-2">
              {it.badges.map((b) => (
                <span key={b} className="rounded-full bg-mist px-3 py-1 text-[12px] font-medium text-ink/65">
                  {b}
                </span>
              ))}
            </div>

            <div className="mt-10">
              <DetailTabs ingredient={it} />
            </div>
          </div>

          {/* Sticky CTA */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="relative mb-5 aspect-square overflow-hidden rounded-[2rem] border border-primary-border/60">
              <Image
                src={ingredientImg(it, 700)}
                alt={it.name}
                fill
                unoptimized={Boolean(it.imageSrc)}
                sizes="(max-width: 1024px) 100vw, 360px"
                className="object-cover"
              />
            </div>
            <div className="rounded-[2rem] border border-primary-border/60 bg-mist/50 p-7">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-[12px] font-medium text-ink/45">Xuất xứ</div>
                  <div className="mt-1 text-[15px] font-bold text-ink">{it.origin}</div>
                </div>
                <div>
                  <div className="text-[12px] font-medium text-ink/45">MOQ</div>
                  <div className="mt-1 text-[15px] font-bold text-ink">{it.moq}</div>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-2.5">
                <Button href="/lien-he" className="w-full justify-between">Yêu cầu mẫu thử</Button>
                <Button href="/lien-he" variant="outline" className="w-full justify-between">Hỏi chuyên gia</Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </article>
  )
}
