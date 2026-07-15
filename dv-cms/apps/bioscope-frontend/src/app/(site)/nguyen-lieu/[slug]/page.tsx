import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { DetailTabs } from '@/components/ingredients/detail-tabs'
import { INGREDIENTS } from '@/lib/content'
import { getContent } from '@/lib/get-content'
import { getLocale } from '@/lib/i18n/server'
import { getMessages } from '@/lib/i18n/messages'
import { ingredientImg } from '@/lib/images'
import { getIngredient } from '@/lib/cms/ingredients'
import { JsonLd } from '@/components/seo/json-ld'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { productSchema } from '@/lib/seo/schema'
import { absUrl, DEFAULT_OG_IMAGE } from '@/lib/seo'

export function generateStaticParams() {
  return INGREDIENTS.map((it) => ({ slug: it.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const locale = await getLocale()
  const it = (await getIngredient(slug, locale)) ?? getContent(locale).INGREDIENTS.find((x) => x.slug === slug)
  if (!it) return {}
  return { title: it.name, description: it.shortDesc }
}

export default async function IngredientDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const locale = await getLocale()
  const m = getMessages(locale)
  // Prefer the CMS `ingredients` collection; fall back to static content.
  const it = (await getIngredient(slug, locale)) ?? getContent(locale).INGREDIENTS.find((x) => x.slug === slug)
  if (!it) notFound()

  const askExpert = locale === 'en' ? 'Ask an expert' : 'Hỏi chuyên gia'

  const url = absUrl(`/nguyen-lieu/${it.slug}`)
  const productLd = productSchema({
    name: it.name,
    description: it.shortDesc,
    image: it.imageSrc ?? absUrl(DEFAULT_OG_IMAGE),
    category: it.category,
    brand: it.manufacturer,
    url,
  })
  const crumbs = [
    { name: m.nav.home, path: '/' },
    { name: m.nav.ingredients, path: '/nguyen-lieu' },
    { name: it.name, path: `/nguyen-lieu/${it.slug}` },
  ]

  return (
    <article className="bg-white pt-32 lg:pt-40">
      <JsonLd data={productLd} />
      <div className="container-bs pb-24">
        <Breadcrumbs crumbs={crumbs} />

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
                  <div className="text-[12px] font-medium text-ink/45">{m.ingredientsCatalog.originLabel}</div>
                  <div className="mt-1 text-[15px] font-bold text-ink">{it.origin}</div>
                </div>
                <div>
                  <div className="text-[12px] font-medium text-ink/45">MOQ</div>
                  <div className="mt-1 text-[15px] font-bold text-ink">{it.moq}</div>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-2.5">
                <Button href="/lien-he" className="w-full justify-between">
                  {m.header.requestSamples}
                </Button>
                <Button href="/lien-he" variant="outline" className="w-full justify-between">
                  {askExpert}
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </article>
  )
}
