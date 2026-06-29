import { PageHero } from '@/components/ui/page-hero'
import { CtaBand } from '@/components/home/cta-band'
import { AboutMissionStrip } from '@/components/about/mission-strip'
import { AboutDifferentiation } from '@/components/about/differentiation'
import { AboutCoreValues } from '@/components/about/core-values'
import { AboutProductProcess } from '@/components/about/product-process'
import { AboutJourney } from '@/components/about/journey'
import { AboutPartners } from '@/components/about/partners'
import { getLocale } from '@/lib/i18n/server'
import { getPageI18n } from '@/lib/i18n/pages'

export async function generateMetadata() {
  const locale = await getLocale()
  return getPageI18n('about', locale).metadata
}

export default async function AboutPage() {
  const locale = await getLocale()
  const { hero } = getPageI18n('about', locale)

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
