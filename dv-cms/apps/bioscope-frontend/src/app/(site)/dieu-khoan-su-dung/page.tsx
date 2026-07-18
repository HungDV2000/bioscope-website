import { PageHero } from '@/components/ui/page-hero'
import { LegalContent } from '@/components/legal-content'
import { getContent } from '@/lib/get-content'
import { getLocale } from '@/lib/i18n/server'
import { getPageContent } from '@/lib/cms/page'
import { getPageSections, applyContentOverride } from '@/lib/cms/page-sections'

export async function generateMetadata() {
  const locale = await getLocale()
  return (await getPageContent('dieu-khoan-su-dung', locale)).metadata
}

export default async function TermsPage() {
  const locale = await getLocale()
  const { contentOverride, blockIds } = await getPageSections('dieu-khoan-su-dung', locale)
  const terms = applyContentOverride(getContent(locale), contentOverride).TERMS_OF_USE
  const { hero, heroImage } = await getPageContent('dieu-khoan-su-dung', locale)

  return (
    <>
      <PageHero eyebrow={hero.eyebrow} title={terms.title} description={hero.description} crumbs={hero.crumbs} coverImage={heroImage} image="labWork" />

      <section className="bg-white pb-16 pt-16" data-better-editor-id={blockIds.legalContent}>
        <div className="container-bs">
          <LegalContent intro={terms.intro} sections={terms.sections} updated={terms.updated} />
        </div>
      </section>
    </>
  )
}
