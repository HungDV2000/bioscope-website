import { PageHero } from '@/components/ui/page-hero'
import { CtaBand } from '@/components/home/cta-band'
import { AboutMissionStrip } from '@/components/about/mission-strip'
import { AboutDifferentiation } from '@/components/about/differentiation'
import { AboutCoreValues } from '@/components/about/core-values'
import { AboutProductProcess } from '@/components/about/product-process'
import { AboutJourney } from '@/components/about/journey'
import { AboutPartners } from '@/components/about/partners'
import { getLocale } from '@/lib/i18n/server'
import { getPageContent } from '@/lib/cms/page'

export async function generateMetadata() {
  const locale = await getLocale()
  return (await getPageContent('ve-chung-toi', locale)).metadata
}

export default async function AboutPage() {
  const locale = await getLocale()
  const { hero } = await getPageContent('ve-chung-toi', locale)

  return (
    <>
      <PageHero {...hero} image="labWork" />
      <AboutMissionStrip />
      <AboutDifferentiation />
      <AboutCoreValues />
      <AboutProductProcess />
      <AboutJourney />
      <AboutPartners />
      <CtaBand />
    </>
  )
}
