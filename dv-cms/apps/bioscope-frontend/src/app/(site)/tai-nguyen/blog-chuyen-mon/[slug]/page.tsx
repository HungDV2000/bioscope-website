import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageHero } from '@/components/ui/page-hero'
import { BlogArticle } from '@/components/resources/blog-article'
import { getContent } from '@/lib/get-content'
import { getLocale } from '@/lib/i18n/server'
import { getPageI18n } from '@/lib/i18n/pages'
import * as vi from '@/lib/content'

export function generateStaticParams() {
  return vi.BLOG_POSTS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const locale = await getLocale()
  const content = getContent(locale)
  const post = content.getBlogPost(slug)
  if (!post) return {}
  return { title: post.title, description: post.excerpt }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const locale = await getLocale()
  const content = getContent(locale)
  const { hero } = getPageI18n('resources', locale)

  const post = content.getBlogPost(slug)
  if (!post) notFound()

  const cat = content.getResourceCategory('blog-chuyen-mon')!
  const related = content.getRelatedBlogPosts(post, 3)

  return (
    <>
      <PageHero
        eyebrow={post.topic}
        title={post.title}
        description={post.excerpt}
        crumbs={[
          { label: hero.eyebrow, href: '/tai-nguyen' },
          { label: cat.title, href: '/tai-nguyen/blog-chuyen-mon' },
          { label: post.title },
        ]}
        image={post.image}
      />

      <BlogArticle
        post={post}
        related={related}
        comments={content.BLOG_SAMPLE_COMMENTS}
      />
    </>
  )
}
