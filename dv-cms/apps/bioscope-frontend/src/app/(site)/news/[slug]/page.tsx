import type { Metadata } from 'next'
import { NewsArticlePage, newsArticleMetadata } from '@/components/resources/news-article-page'
import { BLOG_POSTS } from '@/lib/content'

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  return newsArticleMetadata(slug)
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <NewsArticlePage slug={slug} base="/news" />
}
