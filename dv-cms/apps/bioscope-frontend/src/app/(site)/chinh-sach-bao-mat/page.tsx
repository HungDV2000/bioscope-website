import { PageHero } from '@/components/ui/page-hero'
import { LegalContent } from '@/components/legal-content'
import { getContent } from '@/lib/get-content'
import { getLocale } from '@/lib/i18n/server'
import { getPageContent } from '@/lib/cms/page'
import { getPageSections, applyContentOverride } from '@/lib/cms/page-sections'

export async function generateMetadata() {
  const locale = await getLocale()
  return (await getPageContent('chinh-sach-bao-mat', locale)).metadata
}

export default async function PrivacyPage() {
  const locale = await getLocale()
  const { contentOverride, blockIds } = await getPageSections('chinh-sach-bao-mat', locale)
  const policy = applyContentOverride(getContent(locale), contentOverride).PRIVACY_POLICY
  const { hero, heroImage } = await getPageContent('chinh-sach-bao-mat', locale)

  return (
    <>
      <PageHero eyebrow={hero.eyebrow} title={policy.title} description={hero.description} crumbs={hero.crumbs} coverImage={heroImage} image="labWork" />

      <section className="bg-white pb-16 pt-16" data-better-editor-id={blockIds.legalContent}>
        <div className="container-bs">
          <LegalContent intro={policy.intro} sections={policy.sections} updated={policy.updated} />
        </div>
      </section>
    </>
  )
}
