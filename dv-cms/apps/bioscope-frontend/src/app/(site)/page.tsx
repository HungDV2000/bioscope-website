import type { ReactNode } from 'react'
import { Hero } from '@/components/home/hero'
import { Brands } from '@/components/home/brands'
import { Process } from '@/components/home/process'
import { Categories } from '@/components/home/categories'
import { CaseStudies } from '@/components/home/case-studies'
import { Certifications } from '@/components/home/certifications'
import { Experts } from '@/components/home/experts'
import { CtaBand } from '@/components/home/cta-band'
import { AiChatPromo } from '@/components/home/ai-chat-promo'
import { LocaleProvider } from '@/lib/i18n/context'
import { getMessages } from '@/lib/i18n/messages'
import { getLocale } from '@/lib/i18n/server'
import { getHomePage, type HomeSection } from '@/lib/cms/home'

/** Section key → component. The AI promo is the last static section above the footer. */
const SECTIONS: Record<HomeSection, ReactNode> = {
  hero: <Hero key="hero" />,
  brands: <Brands key="brands" />,
  process: <Process key="process" />,
  categories: <Categories key="categories" />,
  caseStudies: <CaseStudies key="caseStudies" />,
  certifications: <Certifications key="certifications" />,
  experts: <Experts key="experts" />,
  cta: <CtaBand key="cta" />,
  aiChat: <AiChatPromo key="aiChat" />,
}

export default async function HomePage() {
  const locale = await getLocale()
  const messages = getMessages(locale)
  // Home = the Page selected in Site Settings → homePage (falls back to static i18n).
  const { order, home, blockIds } = await getHomePage(locale)

  return (
    <LocaleProvider locale={locale} messages={{ ...messages, home }}>
      {order.map((section) => {
        // data-better-editor-id lets the CMS Better Editor map a preview click
        // back to the matching block (home page only — blocks come from the Page).
        const id = blockIds[section]
        return id ? (
          <div key={section} data-better-editor-id={id}>
            {SECTIONS[section]}
          </div>
        ) : (
          SECTIONS[section]
        )
      })}
    </LocaleProvider>
  )
}
