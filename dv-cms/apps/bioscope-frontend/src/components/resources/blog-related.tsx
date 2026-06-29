'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Calendar, Clock } from 'lucide-react'
import { Reveal } from '@/components/ui/reveal'
import type { BlogPost } from '@/lib/content'
import { img } from '@/lib/images'
import { useLocale } from '@/lib/i18n/context'

export function BlogRelatedPosts({ posts }: { posts: BlogPost[] }) {
  const { t, content } = useLocale()
  const m = t.blogPage

  if (posts.length === 0) return null

  return (
    <section>
      <Reveal>
        <h2 className="text-[1.5rem] font-bold tracking-tight text-ink sm:text-[1.75rem]">{m.relatedTitle}</h2>
        <p className="mt-2 text-[14.5px] text-ink/55">{m.relatedDesc}</p>
      </Reveal>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, i) => (
          <Reveal key={post.slug} delay={i * 0.06}>
            <Link
              href={`/tai-nguyen/blog-chuyen-mon/${post.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-primary-border/60 bg-white transition-all duration-500 hover:-translate-y-1 hover:shadow-card"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={img(post.image, 480)}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 320px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-primary-dark backdrop-blur-sm">
                  {post.topic}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex flex-wrap items-center gap-2 text-[11.5px] text-ink/45">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {content.formatBlogDate(post.date)}
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readTime} {m.minRead}
                  </span>
                </div>
                <h3 className="mt-2.5 text-[16px] font-bold leading-snug text-ink">{post.title}</h3>
                <p className="mt-2 flex-1 text-[13px] leading-relaxed text-ink/60 line-clamp-2">{post.excerpt}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-primary">
                  {m.readArticle}
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
