'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { Reveal } from '@/components/ui/reveal'
import { RichText } from '@/components/ui/rich-text'
import { useLocale } from '@/lib/i18n/context'
import { img } from '@/lib/images'
import { newsBase, newsPostPath } from '@/lib/news-path'
import type { BlogPost } from '@/lib/content'
import type { SectionMedia } from '@/lib/cms/home'
import { postImage } from '@/lib/post-image'

/**
 * Khối "Bài viết mới" trên trang chủ.
 *
 * Ba bài trở xuống thì xếp lưới. Từ bốn bài trở lên chuyển sang DẢI TRƯỢT:
 * nhồi thêm cột vào lưới sẽ làm thẻ hẹp tới mức tiêu đề vỡ dòng, còn kéo dài
 * trang thì đẩy các khối phía dưới xuống quá sâu.
 *
 * Dùng cuộn ngang gốc của trình duyệt kèm scroll-snap thay vì thư viện trượt:
 * vuốt trên điện thoại chạy sẵn, không tốn thêm mã tải về, và bàn phím vẫn
 * dùng được.
 */
export function LatestPosts({ posts, media }: { posts: BlogPost[]; media?: SectionMedia }) {
  const { t, content, locale } = useLocale()
  const c = t.home.latestPosts
  const trackRef = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const isSlider = posts.length > 3

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    // Cuộn đúng một thẻ, không phải một màn — tránh nhảy cóc qua bài.
    const card = el.querySelector<HTMLElement>('[data-card]')
    const step = card ? card.offsetWidth + 20 : el.clientWidth * 0.8
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  const onScroll = () => {
    const el = trackRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 4)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4)
  }

  if (!posts.length) {
    return (
      <section className="bg-white py-14">
        <div className="container-bs">
          <h2 className="text-[1.6rem] font-bold tracking-tight text-ink sm:text-[2rem]">{c.title}</h2>
          <p className="mt-3 text-[15px] text-ink/50">{c.empty}</p>
        </div>
      </section>
    )
  }

  const Card = ({ p, i }: { p: BlogPost; i: number }) => (
    <article
      data-card
      className={
        isSlider
          ? 'w-[84vw] shrink-0 snap-start sm:w-[46%] lg:w-[31.5%]'
          : 'h-full'
      }
    >
      <Link
        href={newsPostPath(locale, p.slug)}
        className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-primary-border/60 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-mist">
          <Image
            src={postImage(p, 720)}
            alt=""
            fill
            sizes="(max-width: 640px) 84vw, (max-width: 1024px) 46vw, 32vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
          {p.topic && (
            <span className="absolute left-3 top-3 rounded-full bg-white/92 px-3 py-1 text-[11px] font-semibold text-primary-dark backdrop-blur-sm">
              {p.topic}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-center gap-3 text-[12px] text-ink/45">
            {p.date && <span>{content.formatBlogDate(p.date)}</span>}
            {p.readTime > 0 && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" strokeWidth={2} />
                {p.readTime}′
              </span>
            )}
          </div>
          <h3 className="mt-2 line-clamp-2 text-[16.5px] font-bold leading-snug text-ink transition-colors group-hover:text-primary-dark">
            {p.title}
          </h3>
          {p.excerpt && (
            <p className="mt-2 line-clamp-2 flex-1 text-[13.5px] leading-relaxed text-ink/60">{p.excerpt}</p>
          )}
          <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-primary">
            {c.readMore}
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
          </span>
        </div>
      </Link>
    </article>
  )

  return (
    <section className="bg-white py-14">
      <div className="container-bs">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="text-[1.6rem] font-bold tracking-tight text-ink sm:text-[2rem]">{c.title}</h2>
            {media?.descRich ? (
              <div className="mt-3 text-[15px] leading-relaxed text-ink/65">
                <RichText value={media.descRich} />
              </div>
            ) : (
              c.description && <p className="mt-3 text-[15px] leading-relaxed text-ink/65">{c.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isSlider && (
              // Nút chỉ hỗ trợ thêm cho chuột — vuốt và cuộn vẫn là cách chính.
              <div className="hidden items-center gap-1.5 sm:flex">
                <button
                  type="button"
                  onClick={() => scrollBy(-1)}
                  disabled={atStart}
                  aria-label={locale === 'en' ? 'Previous posts' : 'Bài trước'}
                  className="grid h-9 w-9 place-items-center rounded-full border border-primary-border bg-white text-ink/50 transition-colors hover:text-primary disabled:opacity-35"
                >
                  <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollBy(1)}
                  disabled={atEnd}
                  aria-label={locale === 'en' ? 'Next posts' : 'Bài sau'}
                  className="grid h-9 w-9 place-items-center rounded-full border border-primary-border bg-white text-ink/50 transition-colors hover:text-primary disabled:opacity-35"
                >
                  <ChevronRight className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            )}
            <Link
              href={newsBase(locale)}
              className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-primary transition-colors hover:text-primary-dark"
            >
              {c.viewAll}
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>
        </Reveal>

        {isSlider ? (
          <div
            ref={trackRef}
            onScroll={onScroll}
            className="scroll-slim -mx-6 mt-7 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-3 sm:mx-0 sm:px-0"
          >
            {posts.map((p, i) => (
              <Card key={p.slug} p={p} i={i} />
            ))}
          </div>
        ) : (
          <div className="mt-7 grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.08} className="h-full">
                <Card p={p} i={i} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
