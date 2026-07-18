import { PageHero } from '@/components/ui/page-hero'
import { FaqList } from '@/components/faq-list'
import { CtaBand } from '@/components/home/cta-band'
import { getContent } from '@/lib/get-content'
import { getLocale } from '@/lib/i18n/server'
import { getPageContent } from '@/lib/cms/page'
import { getFaqGroups } from '@/lib/cms/collections'
import { JsonLd } from '@/components/seo/json-ld'

export async function generateMetadata() {
  const locale = await getLocale()
  return (await getPageContent('cau-hoi-thuong-gap', locale)).metadata
}

export default async function FaqPage() {
  const locale = await getLocale()
  const content = getContent(locale)
  const { hero, heroImage } = await getPageContent('cau-hoi-thuong-gap', locale)
  // FAQ items from the CMS `faqs` collection (fallback to static groups).
  const groups = (await getFaqGroups(locale)) ?? content.FAQ_PAGE.groups

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: groups.flatMap((g) =>
      g.items.map((it) => ({
        '@type': 'Question',
        name: it.q,
        acceptedAnswer: { '@type': 'Answer', text: it.a },
      })),
    ),
  }

  return (
    <>
      <JsonLd data={faqSchema} />
      <PageHero {...hero} coverImage={heroImage} image="glassware" />

      <section className="bg-white pb-8 pt-16">
        <div className="container-bs">
          <FaqList groups={groups} />
        </div>
      </section>

      <CtaBand />
    </>
  )
}
