import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PageHero } from '@/components/ui/page-hero'
import { Reveal } from '@/components/ui/reveal'
import { BlogList } from '@/components/resources/blog-list'
import { BLOG_POSTS, getResourceCategory } from '@/lib/content'

const cat = getResourceCategory('blog-chuyen-mon')!

export const metadata: Metadata = {
  title: 'Blog chuyên môn — Kiến thức phát triển nhãn hàng & công thức',
  description: cat.description,
}

export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="Tài nguyên"
        title={cat.title}
        description={cat.shortDesc}
        crumbs={[
          { label: 'Tài nguyên', href: '/tai-nguyen' },
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

      <BlogList posts={BLOG_POSTS} />

      <div className="container-bs -mt-12 pb-16">
        <Link
          href="/tai-nguyen"
          className="inline-flex items-center gap-2 text-[14px] font-semibold text-primary transition-colors hover:text-primary-dark"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Quay lại Tài nguyên
        </Link>
      </div>
    </>
  )
}
