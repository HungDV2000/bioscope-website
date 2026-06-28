import type { Metadata } from 'next'
import { PageHero } from '@/components/ui/page-hero'
import { FaqList } from '@/components/faq-list'
import { CtaBand } from '@/components/home/cta-band'
import { FAQ_PAGE } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Câu hỏi thường gặp',
  description: FAQ_PAGE.description,
}

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="Hỗ trợ"
        title={FAQ_PAGE.title}
        description={FAQ_PAGE.description}
        crumbs={[{ label: 'Câu hỏi thường gặp' }]}
        image="glassware"
      />

      <section className="bg-white pb-8 pt-16">
        <div className="container-bs">
          <FaqList groups={FAQ_PAGE.groups} />
        </div>
      </section>

      <CtaBand />
    </>
  )
}
