import { PageHero } from '@/components/ui/page-hero'
import { LegalContent } from '@/components/legal-content'
import { getContent } from '@/lib/get-content'
import { getLocale } from '@/lib/i18n/server'
import { getPageI18n } from '@/lib/i18n/pages'

export async function generateMetadata() {
  const locale = await getLocale()
  return getPageI18n('terms', locale).metadata
}

export default async function TermsPage() {
  const locale = await getLocale()
  const terms = getContent(locale).TERMS_OF_USE
  const { hero } = getPageI18n('terms', locale)

  return (
    <>
      <PageHero eyebrow={hero.eyebrow} title={terms.title} description={hero.description} crumbs={hero.crumbs} image="labWork" />

      <section className="bg-white pb-16 pt-16">
        <div className="container-bs">
          <LegalContent intro={terms.intro} sections={terms.sections} updated={terms.updated} />
        </div>
      </section>
    </>
  )
}
