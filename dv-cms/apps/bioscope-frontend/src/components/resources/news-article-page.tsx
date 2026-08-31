import { notFound } from 'next/navigation'
import Link from 'next/link'
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
  // Không có bài, hoặc có nhưng CHƯA dịch sang ngôn ngữ đang xem (tiêu đề rỗng)
  // → 404. Thà báo không tìm thấy còn hơn mở ra một trang trắng.
  if (!post?.title?.trim()) notFound()

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
      {/*
        Header riêng cho bài viết, KHÔNG dùng PageHero chung.

        PageHero xếp tiêu đề bên trái và ảnh bên phải — hợp với trang giới thiệu
        có tiêu đề ngắn. Tiêu đề bài viết thật dài 10–15 chữ nên bị vỡ 5–6 dòng,
        phần tóm tắt thành một khối chữ dày đặc, còn ảnh thì teo lại bên cạnh.

        Ở đây tiêu đề chiếm trọn bề ngang, giới hạn bề rộng dòng để dễ đọc, và
        ảnh bìa để BlogArticle dựng ở khổ rộng ngay bên dưới — không lặp ảnh.
      */}
      <header className="border-b border-primary-border/40 bg-mist/30 pb-10 pt-[104px] lg:pt-28">
        <div className="container-bs">
          {/* Breadcrumb hiển thị. KHÔNG dùng component Breadcrumbs vì nó tự
              sinh thêm BreadcrumbList — trang này đã có sẵn ở jsonLd bên dưới,
              hai bản dữ liệu có cấu trúc trùng nhau là hại cho SEO.
              Tên bài cắt một dòng: tiêu đề dài làm breadcrumb vỡ 2–3 dòng. */}
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-nowrap items-center gap-1.5 overflow-hidden text-[13px] text-ink/55">
              <li className="shrink-0">
                <Link href="/tai-nguyen" className="transition-colors hover:text-primary">
                  {hero.eyebrow}
                </Link>
              </li>
              <li aria-hidden className="shrink-0 text-ink/30">/</li>
              <li className="shrink-0">
                <Link href={base} className="transition-colors hover:text-primary">
                  {listTitle}
                </Link>
              </li>
              <li aria-hidden className="shrink-0 text-ink/30">/</li>
              <li className="min-w-0 truncate font-medium text-ink/75" aria-current="page">
                {post.title}
              </li>
            </ol>
          </nav>
          {post.topic && (
            <span className="mt-4 inline-flex rounded-full border border-primary-border bg-white px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-primary-dark">
              {post.topic}
            </span>
          )}
          <h1 className="mt-4 max-w-4xl text-balance text-[1.75rem] font-bold leading-[1.18] tracking-tight text-ink sm:text-[2.15rem] lg:text-[2.4rem]">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-4 max-w-3xl text-pretty text-[16px] leading-relaxed text-ink/65">
              {post.excerpt}
            </p>
          )}
        </div>
      </header>
      <BlogArticle post={post} related={related} comments={content.BLOG_SAMPLE_COMMENTS} />
    </>
  )
}

/** Tiêu đề trang chi tiết — dùng chung cho cả hai route. */
export async function newsArticleMetadata(slug: string) {
  const locale = await getLocale()
  const content = getContent(locale)
  const post = (await getPosts(locale))?.find((p) => p.slug === slug) ?? content.getBlogPost(slug)
  if (!post?.title?.trim()) return {}
  return { title: post.title, description: post.excerpt }
}
