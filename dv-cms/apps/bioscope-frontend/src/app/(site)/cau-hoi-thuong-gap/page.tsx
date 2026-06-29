import { PageHero } from '@/components/ui/page-hero'
import { FaqList } from '@/components/faq-list'
import { CtaBand } from '@/components/home/cta-band'
import { getContent } from '@/lib/get-content'
import { getLocale } from '@/lib/i18n/server'
import { getPageI18n } from '@/lib/i18n/pages'

export async function generateMetadata() {
  const locale = await getLocale()
  const content = getContent(locale)
  return {
    title: content.FAQ_PAGE.title,
    description: content.FAQ_PAGE.description,
  }
}

export default async function FaqPage() {
  const locale = await getLocale()
  const content = getContent(locale)
  const faq = content.FAQ_PAGE
  const { hero } = getPageI18n('faq', locale)

  return (
    <>
      <PageHero eyebrow={hero.eyebrow} title={faq.title} description={faq.description} crumbs={hero.crumbs} image="glassware" />

      <section className="bg-white pb-8 pt-16">
        <div className="container-bs">
          <FaqList groups={faq.groups} />
        </div>
      </section>

      <CtaBand />
    </>
  )
}
