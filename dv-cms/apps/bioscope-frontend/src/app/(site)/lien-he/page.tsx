import { Clock, MapPin, Phone, Mail } from 'lucide-react'
import { PageHero } from '@/components/ui/page-hero'
import { Reveal } from '@/components/ui/reveal'
import { ContactWizard } from '@/components/contact/wizard'
import { getContent } from '@/lib/get-content'
import { getLocale } from '@/lib/i18n/server'
import { getPageContent } from '@/lib/cms/page'
import { getPageSections, applyContentOverride } from '@/lib/cms/page-sections'

export async function generateMetadata() {
  const locale = await getLocale()
  return (await getPageContent('lien-he', locale)).metadata
}

export default async function ContactPage() {
  const locale = await getLocale()
  const { hero, heroImage } = await getPageContent('lien-he', locale)
  const { contentOverride, sections, blockIds } = await getPageSections('lien-he', locale)
  const content = applyContentOverride(getContent(locale), contentOverride)
  const FAQ = content.CONTACT_FAQ
  const info = (sections.contactInfo ?? {}) as Record<string, string | undefined>
  const s = (v: string | undefined) => (typeof v === 'string' && v ? v : undefined)
  const fb =
    locale === 'en'
      ? { quick: 'Fast response', within: 'Within 24 business hours', faq: 'Frequently asked questions', office: 'Office: updating', hotline: 'Hotline: updating', email: 'Email: updating' }
      : { quick: 'Phản hồi nhanh', within: 'Trong vòng 24 giờ làm việc', faq: 'Câu hỏi thường gặp', office: 'Văn phòng: đang cập nhật', hotline: 'Hotline: đang cập nhật', email: 'Email: đang cập nhật' }
  const labels = {
    quick: s(info.quick) ?? fb.quick,
    within: s(info.within) ?? fb.within,
    faq: s(info.faqTitle) ?? fb.faq,
    office: s(info.office) ?? fb.office,
    hotline: s(info.hotline) ?? fb.hotline,
    email: s(info.email) ?? fb.email,
  }

  return (
    <>
      <PageHero {...hero} coverImage={heroImage} image="glassware" />

      <section className="bg-white py-16" data-better-editor-id={blockIds.contactInfo}>
        <div className="container-bs grid gap-10 lg:grid-cols-[1fr_360px]">
          <Reveal>
            <ContactWizard />
          </Reveal>

          <Reveal delay={0.1} className="space-y-5">
            <div className="rounded-[2rem] border border-primary-border/60 bg-mist/40 p-7">
              <div className="flex items-center gap-2 text-primary">
                <Clock className="h-5 w-5" strokeWidth={1.6} />
                <span className="text-[11px] font-bold uppercase tracking-[0.16em]">{labels.quick}</span>
              </div>
              <p className="mt-3 text-[15px] font-semibold text-ink">{labels.within}</p>
              <ul className="mt-5 space-y-3 text-[14px] text-ink/65">
                <li className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-primary" strokeWidth={1.6} /> {labels.office}
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-primary" strokeWidth={1.6} /> {labels.hotline}
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-primary" strokeWidth={1.6} /> {labels.email}
                </li>
              </ul>
            </div>

            <div className="rounded-[2rem] border border-primary-border/60 bg-white p-7">
              <h3 className="text-[15px] font-bold text-ink">{labels.faq}</h3>
              <div className="mt-4 space-y-4">
                {FAQ.map((f) => (
                  <div key={f.q}>
                    <p className="text-[13.5px] font-semibold text-ink">{f.q}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink/60">{f.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
