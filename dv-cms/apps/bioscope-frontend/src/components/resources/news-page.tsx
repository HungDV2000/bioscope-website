import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PageHero } from '@/components/ui/page-hero'
import { Reveal } from '@/components/ui/reveal'
import { BlogList } from '@/components/resources/blog-list'
import { getContent } from '@/lib/get-content'
import { getLocale } from '@/lib/i18n/server'
import { getMessages } from '@/lib/i18n/messages'
import { getPageI18n } from '@/lib/i18n/pages'
import { getPosts, getPostCategories, getIndustries } from '@/lib/cms/blog'

/**
 * Trang Bản tin — thân chung cho hai địa chỉ theo ngôn ngữ:
 *   /ban-tin  (tiếng Việt)   ·   /news  (tiếng Anh)
 *
 * Next.js không đặt được tên thư mục route theo ngôn ngữ, nên hai route mỏng
 * cùng gọi component này. Trước đây trang nằm ở /tai-nguyen/blog-chuyen-mon.
 */
export async function NewsPage() {
  const locale = await getLocale()
  const content = getContent(locale)
  const t = getMessages(locale)
  const { hero } = getPageI18n('resources', locale)

  // Bài viết và bộ lọc lấy song song từ CMS; hỏng thì lùi về nội dung tĩnh.
  const [cmsPosts, topics, industries] = await Promise.all([
    getPosts(locale),
    getPostCategories(locale),
    getIndustries(locale),
  ])
  const posts = cmsPosts ?? content.BLOG_POSTS

  const ui =
    locale === 'en'
      ? {
          title: 'News',
          desc: 'Expert knowledge on brand development, formulation, ingredients and market trends — from the Bioscope R&D team.',
        }
      : {
          title: 'Bản tin',
          desc: 'Kiến thức chuyên môn về phát triển nhãn hàng, công thức, nguyên liệu và xu hướng thị trường — từ đội ngũ R&D Bioscope.',
        }

  return (
    <>
      <PageHero
        eyebrow={hero.eyebrow}
        title={ui.title}
        crumbs={[{ label: hero.eyebrow, href: '/tai-nguyen' }, { label: ui.title }]}
        compact
      />

      <Reveal>
        <div className="border-b border-primary-border/40 bg-mist/30 py-7">
          <div className="container-bs">
            <p className="max-w-3xl text-[15px] leading-relaxed text-ink/70">{ui.desc}</p>
          </div>
        </div>
      </Reveal>

      <BlogList
        posts={posts}
        topics={topics.map((x) => x.name)}
        industries={industries.map((x) => x.name)}
      />

      <div className="container-bs -mt-12 pb-16">
        <Link
          href="/tai-nguyen"
          className="inline-flex items-center gap-2 text-[14px] font-semibold text-primary transition-colors hover:text-primary-dark"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          {t.resourcesPage.backToResources}
        </Link>
      </div>
    </>
  )
}

/** Tiêu đề trang theo ngôn ngữ — dùng cho cả hai route. */
export async function newsMetadata() {
  const locale = await getLocale()
  return locale === 'en'
    ? {
        title: 'News — Brand & formulation knowledge | Bioscope',
        description:
          'Expert knowledge on brand development, formulation, ingredients and market trends from the Bioscope R&D team.',
        alternates: { canonical: '/news' },
      }
    : {
        title: 'Bản tin — Kiến thức phát triển nhãn hàng & công thức | Bioscope',
        description:
          'Kiến thức chuyên môn về phát triển nhãn hàng, công thức, nguyên liệu và xu hướng thị trường từ đội ngũ R&D Bioscope.',
        alternates: { canonical: '/ban-tin' },
      }
}
