'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, ArrowUpRight, ChevronLeft, ChevronRight, Clock, Calendar, X } from 'lucide-react'
import type { BlogPost } from '@/lib/content'
import { img } from '@/lib/images'
import { cn } from '@/lib/utils'
import { useLocale } from '@/lib/i18n/context'
import { newsPostPath } from '@/lib/news-path'
import { postImage } from '@/lib/post-image'

const PAGE_SIZE = 6

function SidebarFilter({
  label,
  active,
  onClick,
  count,
}: {
  label: string
  active: boolean
  onClick: () => void
  count?: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-left text-[13.5px] font-medium transition-colors duration-300',
        active
          ? 'bg-primary text-white'
          : 'text-ink/65 hover:bg-white hover:text-primary-dark',
      )}
    >
      <span className="leading-snug">{label}</span>
      {count !== undefined && (
        <span
          className={cn(
            'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold',
            active ? 'bg-white/20 text-white' : 'bg-primary-tint text-primary-dark',
          )}
        >
          {count}
        </span>
      )}
    </button>
  )
}

function Pagination({
  page,
  totalPages,
  onPage,
  labels,
}: {
  page: number
  totalPages: number
  onPage: (p: number) => void
  labels: { pagination: string; prevPage: string; nextPage: string }
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav aria-label={labels.pagination} className="mt-12 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        aria-label={labels.prevPage}
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="grid h-10 w-10 place-items-center rounded-full border border-primary-border bg-white text-ink/45 transition-colors hover:text-primary disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          aria-current={p === page ? 'page' : undefined}
          onClick={() => onPage(p)}
          className={cn(
            'grid h-10 min-w-10 place-items-center rounded-full px-3 text-[14px] font-semibold transition-colors',
            p === page
              ? 'bg-primary text-white'
              : 'border border-primary-border bg-white text-ink/55 hover:text-primary',
          )}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        aria-label={labels.nextPage}
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        className="grid h-10 w-10 place-items-center rounded-full border border-primary-border bg-white text-ink/45 transition-colors hover:text-primary disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}

export function BlogList({
  posts,
  topics,
  industries,
}: {
  posts: BlogPost[]
  /** Chủ đề lấy từ CMS. Bỏ trống thì lùi về danh sách tĩnh. */
  topics?: string[]
  /** Ngành lấy từ CMS. Bỏ trống thì lùi về danh sách tĩnh. */
  industries?: string[]
}) {
  const { t, content, locale } = useLocale()
  const m = t.blogPage
  const { formatBlogDate } = content
  // Danh sách bộ lọc do CMS quyết định. Trước đây gán cứng trong mã nên biên
  // tập viên đổi danh mục trong admin thì bộ lọc vẫn đếm ra 0.
  const BLOG_TOPICS = topics?.length ? topics : content.BLOG_TOPICS
  const BLOG_INDUSTRIES = industries?.length ? industries : content.BLOG_INDUSTRIES
  const [q, setQ] = useState('')
  const [topic, setTopic] = useState<string | null>(null)
  const [industry, setIndustry] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    BLOG_TOPICS.forEach((t: string) => {
      counts[t] = posts.filter((p) => p.topic === t).length
    })
    return counts
  }, [posts, BLOG_TOPICS])

  const industryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    BLOG_INDUSTRIES.forEach((ind: string) => {
      counts[ind] = posts.filter((p) => p.industry === ind).length
    })
    return counts
  }, [posts, BLOG_INDUSTRIES])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return posts.filter((p) => {
      if (topic && p.topic !== topic) return false
      if (industry && p.industry !== industry) return false
      if (
        term &&
        !`${p.title} ${p.excerpt} ${p.topic} ${p.industry} ${p.author}`.toLowerCase().includes(term)
      ) {
        return false
      }
      return true
    })
  }, [posts, q, topic, industry])

  // Reset to page 1 when the active filters change (render-time, not an effect).
  const filterKey = `${q}|${topic}|${industry}`
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey)
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey)
    setPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  // `safePage` clamps a stale-high page without needing a sync effect.
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  // Bỏ thẻ "nổi bật" khổ lớn: nó chiếm gần trọn màn hình đầu nên khách chỉ
  // thấy đúng MỘT bài trước khi phải cuộn. Mọi bài nay vào cùng một lưới 2 cột,
  // nhìn được nhiều bài hơn và các thẻ đều nhau.
  const gridPosts = paginated
  const hasFilters = Boolean(topic || industry || q)

  const clearFilters = () => {
    setQ('')
    setTopic(null)
    setIndustry(null)
  }

  const sidebar = (
    <aside className="space-y-6">
      <div className="rounded-[1.5rem] border border-primary-border/60 bg-mist/50 p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink/40">{m.search}</p>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={m.searchPlaceholder}
            className="w-full rounded-xl border border-primary-border bg-white py-2.5 pl-10 pr-4 text-[14px] outline-none transition-colors focus:border-primary/50"
          />
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-primary-border/60 bg-mist/50 p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink/40">{m.topics}</p>
        <div className="mt-3 space-y-1">
          <SidebarFilter label={m.allTopics} active={!topic} onClick={() => setTopic(null)} count={posts.length} />
          {BLOG_TOPICS.map((t) => (
            <SidebarFilter
              key={t}
              label={t}
              active={topic === t}
              onClick={() => setTopic(topic === t ? null : t)}
              count={topicCounts[t]}
            />
          ))}
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-primary-border/60 bg-mist/50 p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink/40">{m.industries}</p>
        <div className="mt-3 space-y-1">
          <SidebarFilter label={m.allIndustries} active={!industry} onClick={() => setIndustry(null)} count={posts.length} />
          {BLOG_INDUSTRIES.map((ind) => (
            <SidebarFilter
              key={ind}
              label={ind}
              active={industry === ind}
              onClick={() => setIndustry(industry === ind ? null : ind)}
              count={industryCounts[ind]}
            />
          ))}
        </div>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary-border bg-white py-2.5 text-[13px] font-semibold text-primary transition-colors hover:bg-primary-tint"
        >
          <X className="h-4 w-4" />
          {m.clearFilters}
        </button>
      )}
    </aside>
  )

  return (
    <section className="bg-white pb-24 pt-16">
      <div className="container-bs">
        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)] xl:gap-10">
          <aside className="self-start lg:sticky lg:top-28">{sidebar}</aside>

          {/* Main content */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[13.5px] font-medium text-ink/50">
                {filtered.length} {m.articleCount}
                {filtered.length > PAGE_SIZE && (
                  <span className="text-ink/40">
                    {' '}
                    · {m.pageOf} {safePage}/{totalPages}
                  </span>
                )}
              </p>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {gridPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={newsPostPath(locale, post.slug)}
                  className="group flex flex-col overflow-hidden rounded-[1.75rem] border border-primary-border/60 bg-white transition-all duration-500 hover:-translate-y-1 hover:shadow-card"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={postImage(post, 600)}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 360px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-primary-dark backdrop-blur-sm">
                      {post.topic}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink/45">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatBlogDate(post.date)}
                      </span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readTime} {m.minRead}
                      </span>
                    </div>
                    <h3 className="mt-3 text-[17px] font-bold leading-snug text-ink">{post.title}</h3>
                    <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-ink/60 line-clamp-3">{post.excerpt}</p>
                    <span className="mt-5 inline-flex items-center gap-1 border-t border-primary-border/50 pt-4 text-[13px] font-semibold text-primary">
                      {m.readMore}
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="mt-12 text-center text-[15px] text-ink/50">
                {m.noResults}
              </p>
            )}

            {filtered.length > PAGE_SIZE && (
              <Pagination
                page={safePage}
                totalPages={totalPages}
                onPage={setPage}
                labels={{ pagination: m.pagination, prevPage: m.prevPage, nextPage: m.nextPage }}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
