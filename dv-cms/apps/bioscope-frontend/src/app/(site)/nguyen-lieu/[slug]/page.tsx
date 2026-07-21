import Image from 'next/image'
import { notFound } from 'next/navigation'
import { MapPin, Package, Factory, FlaskConical, ImageOff, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DetailTabs } from '@/components/ingredients/detail-tabs'
import { CtaBand } from '@/components/home/cta-band'
import { INGREDIENTS } from '@/lib/content'
import { getContent } from '@/lib/get-content'
import { getLocale } from '@/lib/i18n/server'
import { getMessages } from '@/lib/i18n/messages'
import { ingredientImg, INGREDIENT_PLACEHOLDER } from '@/lib/images'
import { getIngredient } from '@/lib/cms/ingredients'
import { JsonLd } from '@/components/seo/json-ld'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { productSchema } from '@/lib/seo/schema'
import { absUrl, DEFAULT_OG_IMAGE } from '@/lib/seo'
import { cn } from '@/lib/utils'

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
  const en = locale === 'en'
  // Prefer the CMS `ingredients` collection; fall back to static content.
  const it = (await getIngredient(slug, locale)) ?? getContent(locale).INGREDIENTS.find((x) => x.slug === slug)
  if (!it) notFound()

  const askExpert = en ? 'Ask an expert' : 'Hỏi chuyên gia'
  const hasImage = Boolean(it.imageSrc)

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

  // At-a-glance facts row — gives the header visual density. Facts without a
  // value are dropped rather than rendered as an empty "—" cell.
  const facts = [
    { icon: MapPin, label: en ? 'Origin' : 'Xuất xứ', value: it.origin },
    { icon: Package, label: 'MOQ', value: it.moq },
    { icon: Factory, label: en ? 'Manufacturer' : 'Nhà sản xuất', value: it.manufacturer },
    { icon: FlaskConical, label: en ? 'Industry' : 'Ngành', value: it.industry },
  ].filter((f): f is { icon: typeof MapPin; label: string; value: string } => Boolean(f.value?.trim()))

  return (
    <article className="bg-white">
      <JsonLd data={productLd} />

      {/* Header band */}
      <section className="relative overflow-hidden border-b border-primary-border/40 bg-gradient-to-b from-mist to-white pt-32 lg:pt-40">
        <div
          className="pointer-events-none absolute -right-24 -top-16 h-80 w-80 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />
        <div className="container-bs relative pb-10">
          <Breadcrumbs crumbs={crumbs} />
          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary-tint px-3 py-1 text-[12px] font-semibold text-primary-dark">
                  {it.category}
                </span>
                <span className="rounded-full border border-primary-border bg-white/60 px-3 py-1 text-[12px] font-medium text-ink/60">
                  {it.industry}
                </span>
              </div>
              <h1 className="mt-4 text-[1.9rem] font-bold leading-tight tracking-tight text-ink sm:text-[2.3rem] lg:text-[2.45rem]">
                {it.name}
              </h1>
              {it.inci && (
                <p className="mt-1.5 text-[14px] text-ink/50">
                  <span className="font-semibold text-ink/40">INCI:</span>{' '}
                  <span className="italic">{it.inci}</span>
                </p>
              )}
              {it.shortDesc && <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-ink/70">{it.shortDesc}</p>}
              {it.badges.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {it.badges.map((b) => (
                    <span
                      key={b}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[12px] font-medium text-ink/70 shadow-sm ring-1 ring-primary-border/60"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                      {b}
                    </span>
                  ))}
                </div>
              )}

              {/* Quick facts */}
              {facts.length > 0 && (
              <dl
                className={cn(
                  'mt-8 grid grid-cols-2 gap-3',
                  facts.length >= 4 ? 'sm:grid-cols-4' : 'sm:grid-cols-3',
                )}
              >
                {facts.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-2xl border border-primary-border/50 bg-white/70 px-4 py-3.5">
                    <dt className="flex items-center gap-1.5 text-[11.5px] font-medium uppercase tracking-wide text-ink/45">
                      <Icon className="h-3.5 w-3.5 text-primary" strokeWidth={1.8} />
                      {label}
                    </dt>
                    <dd className="mt-1 truncate text-[15px] font-bold text-ink" title={value}>
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
              )}
            </div>

            {/* Sticky media + CTA */}
            <aside className="lg:sticky lg:top-28 lg:self-start">
              {/* A real photo gets the full square; the placeholder stays short so
                  it doesn't dominate the column with empty space. */}
              <div
                className={cn(
                  'relative mb-5 overflow-hidden rounded-[2rem] border border-primary-border/60 bg-mist',
                  hasImage ? 'aspect-square' : 'aspect-[16/9]',
                )}
              >
                {hasImage ? (
                  <Image
                    src={ingredientImg(it, 700)}
                    alt={it.name}
                    fill
                    unoptimized
                    sizes="(max-width: 1024px) 100vw, 360px"
                    className="object-contain p-4"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-primary/50">
                    <Image
                      src={INGREDIENT_PLACEHOLDER}
                      alt=""
                      fill
                      sizes="360px"
                      className="object-contain p-6 opacity-40"
                    />
                    <div className="relative flex flex-col items-center gap-2">
                      <ImageOff className="h-8 w-8" strokeWidth={1.4} />
                      <span className="text-[12.5px] font-medium text-ink/45">
                        {en ? 'Image coming soon' : 'Ảnh đang cập nhật'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="rounded-[2rem] border border-primary-border/60 bg-white p-7 shadow-sm">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-[12px] font-medium text-ink/45">{m.ingredientsCatalog.originLabel}</div>
                    <div className="mt-1 text-[15px] font-bold text-ink">{it.origin || '—'}</div>
                  </div>
                  <div>
                    <div className="text-[12px] font-medium text-ink/45">MOQ</div>
                    <div className="mt-1 text-[15px] font-bold text-ink">{it.moq || '—'}</div>
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
                <p className="mt-4 flex items-center justify-center gap-1.5 text-[12px] text-ink/45">
                  <Clock className="h-3.5 w-3.5 text-primary" strokeWidth={1.8} />
                  {en ? 'Response within 24 hours' : 'Phản hồi trong vòng 24 giờ'}
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Detail content */}
      <div className="container-bs pb-4 pt-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <DetailTabs ingredient={it} />
          </div>
          <div aria-hidden className="hidden lg:block" />
        </div>
      </div>

      <CtaBand />
    </article>
  )
}
