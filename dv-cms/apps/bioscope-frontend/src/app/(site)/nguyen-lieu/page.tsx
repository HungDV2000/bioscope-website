import { PageHero } from '@/components/ui/page-hero'
import { Catalog } from '@/components/ingredients/catalog'
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
  const { hero } = await getPageContent('nguyen-lieu', locale)
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
      {/*
        Trang này khách vào để TÌM NGUYÊN LIỆU, không phải để đọc giới thiệu.
        Banner rút gọn (bỏ ảnh + mô tả) và bỏ hẳn khối giới thiệu ở giữa, để bộ
        lọc và danh sách nằm ngay màn hình đầu.
      */}
      <PageHero {...hero} compact />
      <Catalog summary={summary ?? EMPTY_SUMMARY} initial={initial ?? EMPTY_PAGE} imageSeed={imageSeed} />
    </>
  )
}
