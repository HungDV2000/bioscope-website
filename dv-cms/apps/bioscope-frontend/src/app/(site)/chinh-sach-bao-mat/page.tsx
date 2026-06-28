import type { Metadata } from 'next'
import { PageHero } from '@/components/ui/page-hero'
import { LegalContent } from '@/components/legal-content'
import { PRIVACY_POLICY } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Chính sách bảo mật',
  description: 'Cách Bioscope thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn.',
}

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Pháp lý"
        title={PRIVACY_POLICY.title}
        description="Cam kết bảo vệ thông tin cá nhân khi bạn sử dụng website và dịch vụ Bioscope."
        crumbs={[{ label: 'Chính sách bảo mật' }]}
        image="labWork"
      />

      <section className="bg-white pb-16 pt-16">
        <div className="container-bs">
          <LegalContent
            intro={PRIVACY_POLICY.intro}
            sections={PRIVACY_POLICY.sections}
            updated={PRIVACY_POLICY.updated}
          />
        </div>
      </section>
    </>
  )
}
