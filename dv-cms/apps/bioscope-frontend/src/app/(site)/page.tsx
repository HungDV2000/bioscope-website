import type { ReactNode } from 'react'
import { Hero } from '@/components/home/hero'
import { Brands } from '@/components/home/brands'
import { Process } from '@/components/home/process'
import { Categories } from '@/components/home/categories'
import { CaseStudies } from '@/components/home/case-studies'
import { Certifications } from '@/components/home/certifications'
import { Experts } from '@/components/home/experts'
import { CtaBand } from '@/components/home/cta-band'
import { AiChatPromo } from '@/components/home/ai-chat-promo'
import { LatestPosts } from '@/components/home/latest-posts'
import { LocaleProvider } from '@/lib/i18n/context'
import { getMessages } from '@/lib/i18n/messages'
import { getLocale } from '@/lib/i18n/server'
import { getHomePage, type HomeSection, type SectionMedia } from '@/lib/cms/home'
import { getPosts } from '@/lib/cms/blog'
import { getContent } from '@/lib/get-content'
import type { BlogPost } from '@/lib/content'

/** Render a section, passing the CMS-managed images/links to media-aware ones. */
function renderSection(section: HomeSection, media?: SectionMedia, posts: BlogPost[] = []): ReactNode {
  switch (section) {
    case 'hero':
      return <Hero media={media} />
    case 'brands':
      return <Brands media={media} />
    case 'process':
      return <Process media={media} />
    case 'categories':
      return <Categories media={media} />
    case 'caseStudies':
      return <CaseStudies />
    case 'certifications':
      return <Certifications media={media} />
    case 'experts':
      return <Experts media={media} />
    case 'cta':
      return <CtaBand media={media} />
    case 'latestPosts':
      return <LatestPosts posts={posts} media={media} />
    case 'aiChat':
      return <AiChatPromo media={media} />
    default:
      return null
  }
}

export default async function HomePage() {
  const locale = await getLocale()
  const messages = getMessages(locale)
  // Home = the Page selected in Site Settings → homePage (falls back to static i18n).
  const { order, home, blockIds, media } = await getHomePage(locale)

  // Bài viết chỉ lấy khi trang chủ THẬT SỰ có khối bài viết mới — tránh gọi
  // thừa sang CMS trên mọi lượt tải trang chủ.
  let latestPosts: BlogPost[] = []
  if (order.includes('latestPosts')) {
    const cfg = media.latestPosts
    const all = (await getPosts(locale)) ?? getContent(locale).BLOG_POSTS
    const filtered = cfg?.postCategory
      ? all.filter((p) => p.topicSlug === cfg.postCategory)
      : all
    // Lọc ra rỗng thì quay về danh sách đầy đủ — thà hiện bài chưa đúng chủ đề
    // còn hơn để khối trống trơn trên trang chủ.
    latestPosts = (filtered.length ? filtered : all).slice(0, cfg?.postLimit ?? 3)
  }

  return (
    <LocaleProvider locale={locale} messages={{ ...messages, home }}>
      {order.map((section) => {
        // data-better-editor-id lets the CMS Better Editor map a preview click
        // back to the matching block (home page only — blocks come from the Page).
        const id = blockIds[section]
        const node = renderSection(section, media[section], latestPosts)
        return id ? (
          <div key={section} data-better-editor-id={id}>
            {node}
          </div>
        ) : (
          <div key={section} style={{ display: 'contents' }}>
            {node}
          </div>
        )
      })}
    </LocaleProvider>
  )
}
