import { PageHero } from '@/components/ui/page-hero'
import { LegalContent } from '@/components/legal-content'
import { getContent } from '@/lib/get-content'
import { getLocale } from '@/lib/i18n/server'
import { getPageI18n } from '@/lib/i18n/pages'

export async function generateMetadata() {
  const locale = await getLocale()
  return getPageI18n('privacy', locale).metadata
}

export default async function PrivacyPage() {
  const locale = await getLocale()
  const policy = getContent(locale).PRIVACY_POLICY
  const { hero } = getPageI18n('privacy', locale)

  return (
    <>
      <PageHero eyebrow={hero.eyebrow} title={policy.title} description={hero.description} crumbs={hero.crumbs} image="labWork" />

      <section className="bg-white pb-16 pt-16">
        <div className="container-bs">
          <LegalContent intro={policy.intro} sections={policy.sections} updated={policy.updated} />
        </div>
      </section>
    </>
  )
}
