import { PageHero } from '@/components/ui/page-hero'
import { Catalog } from '@/components/ingredients/catalog'
import { Reveal } from '@/components/ui/reveal'
import { getContent } from '@/lib/get-content'
import { getLocale } from '@/lib/i18n/server'
import { getPageContent } from '@/lib/cms/page'
import { getIngredients } from '@/lib/cms/ingredients'

export async function generateMetadata() {
  const locale = await getLocale()
  return (await getPageContent('nguyen-lieu', locale)).metadata
}

export default async function IngredientsPage() {
  const locale = await getLocale()
  const content = getContent(locale)
  const { hero, heroImage } = await getPageContent('nguyen-lieu', locale)
  const intro = content.INGREDIENT_PAGE_INTRO
  // Catalog from the CMS `ingredients` collection; falls back to static content.
  const items = (await getIngredients(locale)) ?? content.INGREDIENTS
  // Reshuffles the default ingredient imagery on every request. Safe to do on
  // the server because this route is dynamic (getLocale reads cookies), so it
  // is never cached into static HTML — and seeding here rather than after mount
  // keeps the hydrated markup identical, avoiding an image swap on load.
  const imageSeed = Math.floor(Math.random() * 0xffffffff)

  return (
    <>
      <PageHero {...hero} coverImage={heroImage} image="powder" />
      <section className="border-b border-primary-border/40 bg-mist/30 py-10">
        <div className="container-bs">
          <Reveal>
            <h2 className="text-[1.5rem] font-bold text-ink sm:text-[1.75rem]">{intro.title}</h2>
            <p className="mt-4 max-w-3xl text-[14.5px] leading-relaxed text-ink/65">{intro.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {intro.quickFilters.map((f) => (
                <span
                  key={f}
                  className="rounded-full border border-primary-border bg-white px-3.5 py-1.5 text-[12.5px] font-medium text-ink/60"
                >
                  {f}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
      <Catalog items={items} imageSeed={imageSeed} />
    </>
  )
}
