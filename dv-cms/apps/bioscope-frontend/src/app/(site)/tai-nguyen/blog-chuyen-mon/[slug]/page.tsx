import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageHero } from '@/components/ui/page-hero'
import { BlogArticle } from '@/components/resources/blog-article'
import { getContent } from '@/lib/get-content'
import { getLocale } from '@/lib/i18n/server'
import { getPageI18n } from '@/lib/i18n/pages'
import { getPosts } from '@/lib/cms/blog'
import { JsonLd } from '@/components/seo/json-ld'
import { absUrl, DEFAULT_OG_IMAGE } from '@/lib/seo'
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
  const post = (await getPosts(locale))?.find((p) => p.slug === slug) ?? content.getBlogPost(slug)
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

  // Prefer the CMS `posts` collection; fall back to static content.
  const cmsPosts = await getPosts(locale)
  const post = cmsPosts?.find((p) => p.slug === slug) ?? content.getBlogPost(slug)
  if (!post) notFound()

  const cat = content.getResourceCategory('blog-chuyen-mon')!
  const related = cmsPosts
    ? cmsPosts.filter((p) => p.slug !== slug).slice(0, 3)
    : content.getRelatedBlogPosts(post, 3)

  const url = absUrl(`/tai-nguyen/blog-chuyen-mon/${post.slug}`)
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.excerpt,
      image: absUrl(DEFAULT_OG_IMAGE),
      datePublished: post.date || undefined,
      author: { '@type': 'Organization', name: post.author || 'Bioscope' },
      publisher: { '@type': 'Organization', name: 'Bioscope', logo: { '@type': 'ImageObject', url: absUrl('/logo.avif') } },
      mainEntityOfPage: url,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: hero.eyebrow, item: absUrl('/tai-nguyen') },
        { '@type': 'ListItem', position: 2, name: cat.title, item: absUrl('/tai-nguyen/blog-chuyen-mon') },
        { '@type': 'ListItem', position: 3, name: post.title, item: url },
      ],
    },
  ]

  return (
    <>
      <JsonLd data={jsonLd} />
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
