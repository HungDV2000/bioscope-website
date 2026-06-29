import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PageHero } from '@/components/ui/page-hero'
import { Reveal } from '@/components/ui/reveal'
import { BlogList } from '@/components/resources/blog-list'
import { getContent } from '@/lib/get-content'
import { getLocale } from '@/lib/i18n/server'
import { getMessages } from '@/lib/i18n/messages'
import { getPageI18n } from '@/lib/i18n/pages'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const content = getContent(locale)
  const cat = content.getResourceCategory('blog-chuyen-mon')
  if (!cat) return {}
  return {
    title: `${cat.title} — ${locale === 'en' ? 'Brand & formulation knowledge' : 'Kiến thức phát triển nhãn hàng & công thức'}`,
    description: cat.description,
  }
}

export default async function BlogPage() {
  const locale = await getLocale()
  const content = getContent(locale)
  const t = getMessages(locale)
  const { hero } = getPageI18n('resources', locale)
  const cat = content.getResourceCategory('blog-chuyen-mon')!

  return (
    <>
      <PageHero
        eyebrow={hero.eyebrow}
        title={cat.title}
        description={cat.shortDesc}
        crumbs={[
          { label: hero.eyebrow, href: '/tai-nguyen' },
          { label: cat.title },
        ]}
        image={cat.image}
      />

      <Reveal>
        <div className="border-b border-primary-border/40 bg-mist/30 py-8">
          <div className="container-bs">
            <p className="max-w-3xl text-[15px] leading-relaxed text-ink/70">{cat.description}</p>
          </div>
        </div>
      </Reveal>

      <BlogList posts={content.BLOG_POSTS} />

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
