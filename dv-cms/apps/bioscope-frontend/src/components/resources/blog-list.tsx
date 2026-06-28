'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, ArrowUpRight, ChevronLeft, ChevronRight, Clock, Calendar, X } from 'lucide-react'
import {
  BLOG_TOPICS,
  BLOG_INDUSTRIES,
  formatBlogDate,
  type BlogPost,
} from '@/lib/content'
import { img } from '@/lib/images'
import { cn } from '@/lib/utils'

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
}: {
  page: number
  totalPages: number
  onPage: (p: number) => void
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav aria-label="Phân trang blog" className="mt-12 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        aria-label="Trang trước"
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
        aria-label="Trang sau"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        className="grid h-10 w-10 place-items-center rounded-full border border-primary-border bg-white text-ink/45 transition-colors hover:text-primary disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}

export function BlogList({ posts }: { posts: BlogPost[] }) {
  const [q, setQ] = useState('')
  const [topic, setTopic] = useState<string | null>(null)
  const [industry, setIndustry] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    BLOG_TOPICS.forEach((t) => {
      counts[t] = posts.filter((p) => p.topic === t).length
    })
    return counts
  }, [posts])

  const industryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    BLOG_INDUSTRIES.forEach((ind) => {
      counts[ind] = posts.filter((p) => p.industry === ind).length
    })
    return counts
  }, [posts])

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const featured = !q && !topic && !industry && safePage === 1 ? paginated[0] : null
  const gridPosts = featured ? paginated.slice(1) : paginated
  const hasFilters = Boolean(topic || industry || q)

  useEffect(() => {
    setPage(1)
  }, [q, topic, industry])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const clearFilters = () => {
    setQ('')
    setTopic(null)
    setIndustry(null)
  }

  const sidebar = (
    <aside className="space-y-6">
      <div className="rounded-[1.5rem] border border-primary-border/60 bg-mist/50 p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink/40">Tìm kiếm</p>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tiêu đề, từ khóa…"
            className="w-full rounded-xl border border-primary-border bg-white py-2.5 pl-10 pr-4 text-[14px] outline-none transition-colors focus:border-primary/50"
          />
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-primary-border/60 bg-mist/50 p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink/40">Chủ đề</p>
        <div className="mt-3 space-y-1">
          <SidebarFilter label="Tất cả chủ đề" active={!topic} onClick={() => setTopic(null)} count={posts.length} />
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
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink/40">Ngành</p>
        <div className="mt-3 space-y-1">
          <SidebarFilter label="Tất cả ngành" active={!industry} onClick={() => setIndustry(null)} count={posts.length} />
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
          Xóa bộ lọc
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
                {filtered.length} bài viết
                {filtered.length > PAGE_SIZE && (
                  <span className="text-ink/40">
                    {' '}
                    · Trang {safePage}/{totalPages}
                  </span>
                )}
              </p>
            </div>

            {featured && (
              <Link
                href={`/tai-nguyen/blog-chuyen-mon/${featured.slug}`}
                className="group mt-6 grid overflow-hidden rounded-[2rem] border border-primary-border/60 bg-white transition-all duration-500 hover:-translate-y-0.5 hover:shadow-card lg:grid-cols-[1.1fr_1fr]"
              >
                <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[280px]">
                  <Image
                    src={img(featured.image, 900)}
                    alt={featured.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1 text-[11px] font-bold text-white">
                    Nổi bật
                  </span>
                </div>
                <div className="flex flex-col justify-center p-6 lg:p-8">
                  <div className="flex flex-wrap items-center gap-3 text-[12.5px] text-ink/50">
                    <span className="rounded-full bg-primary-tint px-3 py-1 font-semibold text-primary-dark">
                      {featured.topic}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatBlogDate(featured.date)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {featured.readTime} phút đọc
                    </span>
                  </div>
                  <h2 className="mt-4 text-[1.35rem] font-bold leading-snug tracking-tight text-ink sm:text-[1.5rem]">
                    {featured.title}
                  </h2>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-ink/65">{featured.excerpt}</p>
                  <span className="mt-5 inline-flex items-center gap-1 text-[14px] font-semibold text-primary">
                    Đọc bài viết
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </Link>
            )}

            <div className={cn('grid gap-6 sm:grid-cols-2', featured ? 'mt-6' : 'mt-6', 'xl:grid-cols-2')}>
              {gridPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/tai-nguyen/blog-chuyen-mon/${post.slug}`}
                  className="group flex flex-col overflow-hidden rounded-[1.75rem] border border-primary-border/60 bg-white transition-all duration-500 hover:-translate-y-1 hover:shadow-card"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={img(post.image, 600)}
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
                        {post.readTime} phút
                      </span>
                    </div>
                    <h3 className="mt-3 text-[17px] font-bold leading-snug text-ink">{post.title}</h3>
                    <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-ink/60 line-clamp-3">{post.excerpt}</p>
                    <span className="mt-5 inline-flex items-center gap-1 border-t border-primary-border/50 pt-4 text-[13px] font-semibold text-primary">
                      Đọc thêm
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="mt-12 text-center text-[15px] text-ink/50">
                Không tìm thấy bài viết phù hợp. Thử từ khóa hoặc bộ lọc khác.
              </p>
            )}

            {filtered.length > PAGE_SIZE && (
              <Pagination page={safePage} totalPages={totalPages} onPage={setPage} />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
