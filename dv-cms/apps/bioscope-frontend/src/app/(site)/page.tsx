import { Hero } from '@/components/home/hero'
import { Brands } from '@/components/home/brands'
import { Process } from '@/components/home/process'
import { Categories } from '@/components/home/categories'
import { CaseStudies } from '@/components/home/case-studies'
import { Certifications } from '@/components/home/certifications'
import { Experts } from '@/components/home/experts'
import { CtaBand } from '@/components/home/cta-band'
import { AiChatPromo } from '@/components/home/ai-chat-promo'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Brands />
      <Process />
      <Categories />
      <CaseStudies />
      <Certifications />
      <Experts />
      <CtaBand />
      <AiChatPromo />
    </>
  )
}
