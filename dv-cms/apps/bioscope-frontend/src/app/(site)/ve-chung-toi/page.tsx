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
import { getPageSections } from '@/lib/cms/page-sections'
import { LocaleProvider } from '@/lib/i18n/context'

export async function generateMetadata() {
  const locale = await getLocale()
  return (await getPageContent('ve-chung-toi', locale)).metadata
}

export default async function AboutPage() {
  const locale = await getLocale()
  const { hero } = await getPageContent('ve-chung-toi', locale)
  // Overlay CMS section blocks onto the i18n so the bespoke components render
  // edited content; blockIds mark sections for the Better Editor.
  const { messages, contentOverride, blockIds } = await getPageSections('ve-chung-toi', locale)

  return (
    <LocaleProvider locale={locale} messages={messages} contentOverride={contentOverride}>
      <PageHero {...hero} image="labWork" />
      <div data-better-editor-id={blockIds.aboutMission}>
        <AboutMissionStrip />
      </div>
      <div data-better-editor-id={blockIds.aboutDifferentiation}>
        <AboutDifferentiation />
      </div>
      <div data-better-editor-id={blockIds.aboutValues}>
        <AboutCoreValues />
      </div>
      <div data-better-editor-id={blockIds.aboutProcess}>
        <AboutProductProcess />
      </div>
      <div data-better-editor-id={blockIds.aboutJourney}>
        <AboutJourney />
      </div>
      <div data-better-editor-id={blockIds.aboutPartners}>
        <AboutPartners />
      </div>
      <CtaBand />
    </LocaleProvider>
  )
}
