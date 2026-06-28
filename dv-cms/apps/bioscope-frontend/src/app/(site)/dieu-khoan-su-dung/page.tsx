import type { Metadata } from 'next'
import { PageHero } from '@/components/ui/page-hero'
import { LegalContent } from '@/components/legal-content'
import { TERMS_OF_USE } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Điều khoản sử dụng',
  description: 'Điều khoản và điều kiện khi truy cập website Bioscope.',
}

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Pháp lý"
        title={TERMS_OF_USE.title}
        description="Vui lòng đọc kỹ trước khi sử dụng website và các dịch vụ của Bioscope."
        crumbs={[{ label: 'Điều khoản sử dụng' }]}
        image="labWork"
      />

      <section className="bg-white pb-16 pt-16">
        <div className="container-bs">
          <LegalContent
            intro={TERMS_OF_USE.intro}
            sections={TERMS_OF_USE.sections}
            updated={TERMS_OF_USE.updated}
          />
        </div>
      </section>
    </>
  )
}
