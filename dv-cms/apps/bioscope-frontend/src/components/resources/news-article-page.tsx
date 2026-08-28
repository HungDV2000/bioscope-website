import { notFound } from 'next/navigation'
import { PageHero } from '@/components/ui/page-hero'
import { BlogArticle } from '@/components/resources/blog-article'
import { getContent } from '@/lib/get-content'
import { getLocale } from '@/lib/i18n/server'
import { getPageI18n } from '@/lib/i18n/pages'
import { getPosts } from '@/lib/cms/blog'
import { JsonLd } from '@/components/seo/json-ld'
import { absUrl, DEFAULT_OG_IMAGE } from '@/lib/seo'

/**
 * Chi tiết bài viết — thân chung cho /ban-tin/[slug] và /news/[slug].
 * Đường dẫn gốc truyền vào để breadcrumb và dữ liệu có cấu trúc trỏ đúng
 * địa chỉ theo ngôn ngữ đang xem.
 */
export async function NewsArticlePage({ slug, base }: { slug: string; base: '/ban-tin' | '/news' }) {
  const locale = await getLocale()
  const content = getContent(locale)
  const { hero } = getPageI18n('resources', locale)

  const cmsPosts = await getPosts(locale)
  const post = cmsPosts?.find((p) => p.slug === slug) ?? content.getBlogPost(slug)
  if (!post) notFound()

  const listTitle = locale === 'en' ? 'News' : 'Bản tin'
  const related = cmsPosts
    ? cmsPosts.filter((p) => p.slug !== slug).slice(0, 3)
    : content.getRelatedBlogPosts(post, 3)

  const url = absUrl(`${base}/${post.slug}`)
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.excerpt,
      image: absUrl(DEFAULT_OG_IMAGE),
      datePublished: post.date || undefined,
      author: { '@type': 'Organization', name: post.author || 'Bioscope' },
      publisher: {
        '@type': 'Organization',
        name: 'Bioscope',
        logo: { '@type': 'ImageObject', url: absUrl('/logo.avif') },
      },
      mainEntityOfPage: url,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: hero.eyebrow, item: absUrl('/tai-nguyen') },
        { '@type': 'ListItem', position: 2, name: listTitle, item: absUrl(base) },
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
          { label: listTitle, href: base },
          { label: post.title },
        ]}
        image={post.image}
      />
      <BlogArticle post={post} related={related} comments={content.BLOG_SAMPLE_COMMENTS} />
    </>
  )
}

/** Tiêu đề trang chi tiết — dùng chung cho cả hai route. */
export async function newsArticleMetadata(slug: string) {
  const locale = await getLocale()
  const content = getContent(locale)
  const post = (await getPosts(locale))?.find((p) => p.slug === slug) ?? content.getBlogPost(slug)
  if (!post) return {}
  return { title: post.title, description: post.excerpt }
}
