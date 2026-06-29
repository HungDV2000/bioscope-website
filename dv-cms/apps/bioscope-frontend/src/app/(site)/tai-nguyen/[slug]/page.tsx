import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PageHero } from '@/components/ui/page-hero'
import { Reveal } from '@/components/ui/reveal'
import { Button } from '@/components/ui/button'
import { ResourceItemCard } from '@/components/resources/item-card'
import { getContent } from '@/lib/get-content'
import { getLocale } from '@/lib/i18n/server'
import { getMessages } from '@/lib/i18n/messages'
import { getPageI18n } from '@/lib/i18n/pages'

export function generateStaticParams() {
  const content = getContent('vi')
  return content.RESOURCE_CATEGORIES.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const locale = await getLocale()
  const content = getContent(locale)
  const cat = content.getResourceCategory(slug)
  if (!cat) return {}
  const { hero } = getPageI18n('resources', locale)
  return { title: `${cat.title} — ${hero.eyebrow}`, description: cat.shortDesc }
}

export default async function ResourceCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const locale = await getLocale()
  const content = getContent(locale)
  const t = getMessages(locale)
  const { hero } = getPageI18n('resources', locale)
  const m = t.resourcesPage

  const cat = content.getResourceCategory(slug)
  if (!cat) notFound()

  const items = cat.useCaseStudies
    ? content.CASE_STUDIES.map((c) => ({
        slug: c.slug,
        title: c.brand,
        category: 'Case Study',
        desc: c.summary ?? c.problem,
        gated: false,
        href: `/case-study/${c.slug}`,
      }))
    : content.getResourceItemsForCategory(slug).map((i) => ({ ...i, href: undefined }))

  return (
    <>
      <PageHero
        eyebrow={hero.eyebrow}
        title={cat.title}
        description={cat.shortDesc}
        crumbs={[
          { label: hero.eyebrow, href: '/tai-nguyen' },
          { label: cat.title },
        ]}
        image={cat.image}
      />

      <section className="bg-white pb-16 pt-16">
        <div className="container-bs">
          <Reveal>
            <p className="max-w-3xl text-[15px] leading-relaxed text-ink/70">{cat.description}</p>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.length > 0 ? (
              items.map((item, i) => <ResourceItemCard key={item.title} item={item} delay={i * 0.05} />)
            ) : (
              <Reveal>
                <div className="col-span-full rounded-[1.5rem] border border-dashed border-primary-border/60 bg-mist/30 px-8 py-12 text-center">
                  <p className="text-[15px] font-semibold text-ink">{m.emptyTitle}</p>
                  <p className="mt-2 text-[14px] text-ink/55">{m.emptyDesc}</p>
                </div>
              </Reveal>
            )}
          </div>

          <Reveal className="mt-12 flex flex-wrap items-center gap-4">
            <Link
              href="/tai-nguyen"
              className="inline-flex items-center gap-2 text-[14px] font-semibold text-primary transition-colors hover:text-primary-dark"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
              {m.backToResources}
            </Link>
            {cat.useCaseStudies && (
              <Button href="/case-study" variant="outline">
                {m.viewAllCaseStudies}
              </Button>
            )}
          </Reveal>
        </div>
      </section>
    </>
  )
}
