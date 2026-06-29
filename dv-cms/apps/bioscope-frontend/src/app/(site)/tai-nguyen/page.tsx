import Link from 'next/link'
import {
  FileText,
  Newspaper,
  Video,
  TrendingUp,
  ClipboardList,
  LayoutGrid,
  Leaf,
  Mail,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { PageHero } from '@/components/ui/page-hero'
import { Reveal } from '@/components/ui/reveal'
import { ResourceItemCard } from '@/components/resources/item-card'
import { getContent } from '@/lib/get-content'
import { getLocale } from '@/lib/i18n/server'
import { getPageI18n } from '@/lib/i18n/pages'
import { getMessages } from '@/lib/i18n/messages'

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'whitepaper-ebook': FileText,
  'blog-chuyen-mon': Newspaper,
  'video-webinar': Video,
  'case-study': TrendingUp,
  'huong-dan-formulator': ClipboardList,
  'infographic-checklist': LayoutGrid,
}

export async function generateMetadata() {
  const locale = await getLocale()
  return getPageI18n('resources', locale).metadata
}

export default async function ResourcesPage() {
  const locale = await getLocale()
  const content = getContent(locale)
  const { hero } = getPageI18n('resources', locale)
  const m = getMessages(locale)
  const { RESOURCE_CATEGORIES, RESOURCE_ITEMS } = content

  const ui =
    locale === 'en'
      ? {
          featured: 'Featured content',
          featuredDesc: 'Starter picks — gated whitepapers for leads, public blog for SEO.',
          newsletter: 'R&D newsletter',
          newsletterTitle: 'Stay updated on ingredients & new technologies',
          newsletterDesc: 'Expert newsletter from Bioscope R&D — new research, case studies, and market trends.',
          emailPlaceholder: 'Your work email',
          subscribe: 'Subscribe',
          privacy: 'No spam · Expert content only · Unsubscribe anytime',
        }
      : {
          featured: 'Nội dung nổi bật',
          featuredDesc: 'Gợi ý nội dung khởi đầu — whitepaper gated thu lead, blog public nuôi SEO.',
          newsletter: 'Bản tin R&D',
          newsletterTitle: 'Cập nhật xu hướng nguyên liệu & công nghệ mới',
          newsletterDesc: 'Nhận bản tin chuyên môn từ đội ngũ R&D Bioscope — nghiên cứu mới, case study và xu hướng thị trường.',
          emailPlaceholder: 'Email công việc của bạn',
          subscribe: 'Đăng ký nhận tin',
          privacy: 'Không spam · Chỉ gửi nội dung chuyên môn · Hủy đăng ký bất cứ lúc nào',
        }

  return (
    <>
      <PageHero {...hero} image="botanical" />

      <section className="bg-white pb-16 pt-16">
        <div className="container-bs grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {RESOURCE_CATEGORIES.map((cat, i) => {
            const Icon = CATEGORY_ICONS[cat.slug] ?? FileText
            return (
              <Reveal key={cat.slug} delay={i * 0.08}>
                <Link
                  href={`/tai-nguyen/${cat.slug}`}
                  className="group flex h-full flex-col rounded-[2rem] border border-primary-border/60 bg-mist/40 p-8 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-card"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-tint text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Icon className="h-6 w-6" strokeWidth={1.5} />
                  </span>
                  <h3 className="mt-5 text-[19px] font-bold text-ink">{cat.title}</h3>
                  <p className="mt-2 flex-1 text-[14px] leading-relaxed text-ink/65">{cat.shortDesc}</p>
                  <span className="mt-5 inline-flex w-fit rounded-full bg-accent-soft px-3 py-1 text-[11px] font-bold text-accent">
                    {m.common.explore}
                  </span>
                </Link>
              </Reveal>
            )
          })}
        </div>

        <div className="container-bs mt-14">
          <Reveal>
            <h2 className="text-[1.9rem] font-bold tracking-tight text-ink sm:text-[2.3rem]">{ui.featured}</h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink/65">{ui.featuredDesc}</p>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {RESOURCE_ITEMS.slice(0, 6).map((item, i) => (
              <ResourceItemCard key={item.slug} item={item} delay={i * 0.05} />
            ))}
          </div>
        </div>

        <div className="container-bs mt-14">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary-dark via-primary to-[#1a5c42] px-6 py-10 shadow-card sm:px-12 sm:py-14">
              <Leaf
                aria-hidden
                className="pointer-events-none absolute -right-8 top-1/2 hidden h-52 w-52 -translate-y-1/2 rotate-[-18deg] text-white/[0.07] lg:block"
                strokeWidth={0.8}
              />
              <Leaf
                aria-hidden
                className="pointer-events-none absolute -left-6 bottom-0 h-32 w-32 rotate-12 text-white/[0.05] sm:block"
                strokeWidth={0.8}
              />

              <div className="relative mx-auto max-w-xl text-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/90 backdrop-blur-sm">
                  <Mail className="h-3.5 w-3.5" strokeWidth={2} />
                  {ui.newsletter}
                </span>
                <h3 className="mt-5 text-[1.65rem] font-bold leading-tight tracking-tight text-white sm:text-[2rem]">
                  {ui.newsletterTitle}
                </h3>
                <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-white/75">{ui.newsletterDesc}</p>

                <form className="mx-auto mt-8 max-w-lg">
                  <div className="flex flex-col gap-2 rounded-[2rem] bg-white p-2 shadow-[0_8px_32px_rgba(0,0,0,0.12)] sm:flex-row sm:items-center">
                    <input
                      type="email"
                      placeholder={ui.emailPlaceholder}
                      className="min-w-0 flex-1 rounded-full bg-transparent px-5 py-3.5 text-[14px] text-ink outline-none placeholder:text-ink/40"
                    />
                    <button
                      type="submit"
                      className="shrink-0 rounded-full bg-accent px-7 py-3.5 text-[14px] font-semibold text-white transition-all duration-300 hover:brightness-105 active:scale-[0.98]"
                    >
                      {ui.subscribe}
                    </button>
                  </div>
                  <p className="mt-4 text-[12px] text-white/45">{ui.privacy}</p>
                </form>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
