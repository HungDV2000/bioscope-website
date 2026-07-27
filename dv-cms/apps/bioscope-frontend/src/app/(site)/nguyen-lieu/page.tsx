import { PageHero } from '@/components/ui/page-hero'
import { Catalog } from '@/components/ingredients/catalog'
import { Reveal } from '@/components/ui/reveal'
import { getContent } from '@/lib/get-content'
import { getLocale } from '@/lib/i18n/server'
import { getPageContent } from '@/lib/cms/page'
import { getCatalogSummary, getCatalogPage, type CatalogSummary, type CatalogPage } from '@/lib/cms/catalog'

const EMPTY_SUMMARY: CatalogSummary = {
  total: 0, primaries: [], functions: [], natures: [], forms: [], properties: [], origins: [], industries: [],
}
const EMPTY_PAGE: CatalogPage = { cards: [], total: 0, totalPages: 1, page: 1 }

export async function generateMetadata() {
  const locale = await getLocale()
  return (await getPageContent('nguyen-lieu', locale)).metadata
}

export default async function IngredientsPage() {
  const locale = await getLocale()
  const content = getContent(locale)
  const { hero, heroImage } = await getPageContent('nguyen-lieu', locale)
  const intro = content.INGREDIENT_PAGE_INTRO
  // Phân trang server-side: đếm/tuỳ chọn bộ lọc (summary, cache dài) + trang đầu
  // (12 mục). Không còn nhồi cả 1.591 mục vào HTML.
  const [summary, initial] = await Promise.all([getCatalogSummary(locale), getCatalogPage(locale, {}, 1)])
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

          </Reveal>
        </div>
      </section>
      <Catalog summary={summary ?? EMPTY_SUMMARY} initial={initial ?? EMPTY_PAGE} imageSeed={imageSeed} />
    </>
  )
}
