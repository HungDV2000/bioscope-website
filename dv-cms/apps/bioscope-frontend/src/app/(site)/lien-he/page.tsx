import type { Metadata } from 'next'
import { Clock, MapPin, Phone, Mail } from 'lucide-react'
import { PageHero } from '@/components/ui/page-hero'
import { Reveal } from '@/components/ui/reveal'
import { ContactWizard } from '@/components/contact/wizard'
import { CONTACT_FAQ } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Liên hệ — Bắt đầu dự án của bạn',
  description:
    'Chia sẻ nhu cầu của bạn — đội ngũ chuyên gia Bioscope sẽ liên hệ trong vòng 24 giờ làm việc.',
}

const FAQ = CONTACT_FAQ

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Liên hệ"
        title="Bắt đầu dự án của bạn"
        description="Thời gian phản hồi dự kiến: trong vòng 24 giờ làm việc. Đội ngũ chuyên gia của Bioscope sẽ liên hệ để hiểu rõ nhu cầu và đề xuất bước tiếp theo."
        crumbs={[{ label: 'Liên hệ' }]}
        image="glassware"
      />

      <section className="bg-white py-16">
        <div className="container-bs grid gap-10 lg:grid-cols-[1fr_360px]">
          <Reveal>
            <ContactWizard />
          </Reveal>

          <Reveal delay={0.1} className="space-y-5">
            <div className="rounded-[2rem] border border-primary-border/60 bg-mist/40 p-7">
              <div className="flex items-center gap-2 text-primary">
                <Clock className="h-5 w-5" strokeWidth={1.6} />
                <span className="text-[11px] font-bold uppercase tracking-[0.16em]">Phản hồi nhanh</span>
              </div>
              <p className="mt-3 text-[15px] font-semibold text-ink">Trong vòng 24 giờ làm việc</p>
              <ul className="mt-5 space-y-3 text-[14px] text-ink/65">
                <li className="flex items-center gap-3"><MapPin className="h-4 w-4 text-primary" strokeWidth={1.6} /> Văn phòng: đang cập nhật</li>
                <li className="flex items-center gap-3"><Phone className="h-4 w-4 text-primary" strokeWidth={1.6} /> Hotline: đang cập nhật</li>
                <li className="flex items-center gap-3"><Mail className="h-4 w-4 text-primary" strokeWidth={1.6} /> Email: đang cập nhật</li>
              </ul>
            </div>

            <div className="rounded-[2rem] border border-primary-border/60 bg-white p-7">
              <h3 className="text-[15px] font-bold text-ink">Câu hỏi thường gặp</h3>
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
