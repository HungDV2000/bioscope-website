import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageHero } from '@/components/ui/page-hero'
import { BlogArticle } from '@/components/resources/blog-article'
import {
  BLOG_POSTS,
  BLOG_SAMPLE_COMMENTS,
  getBlogPost,
  getRelatedBlogPosts,
} from '@/lib/content'

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) return {}
  return { title: post.title, description: post.excerpt }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) notFound()

  const related = getRelatedBlogPosts(post, 3)

  return (
    <>
      <PageHero
        eyebrow={post.topic}
        title={post.title}
        description={post.excerpt}
        crumbs={[
          { label: 'Tài nguyên', href: '/tai-nguyen' },
          { label: 'Blog chuyên môn', href: '/tai-nguyen/blog-chuyen-mon' },
          { label: post.title },
        ]}
        image={post.image}
      />

      <BlogArticle post={post} related={related} comments={BLOG_SAMPLE_COMMENTS} />
    </>
  )
}
