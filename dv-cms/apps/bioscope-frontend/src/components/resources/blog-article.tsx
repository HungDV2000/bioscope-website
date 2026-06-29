'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Copy, Check, Share2, User } from 'lucide-react'
import { Reveal } from '@/components/ui/reveal'
import { BlogTableOfContents } from '@/components/resources/blog-toc'
import { BlogComments } from '@/components/resources/blog-comments'
import { BlogRelatedPosts } from '@/components/resources/blog-related'
import type { BlogComment, BlogPost } from '@/lib/content'
import { img } from '@/lib/images'
import { useLocale } from '@/lib/i18n/context'

export function BlogArticle({
  post,
  related,
  comments,
}: {
  post: BlogPost
  related: BlogPost[]
  comments?: BlogComment[]
}) {
  const { t, content } = useLocale()
  const m = t.blogPage
  const sections = content.getBlogSections(post)
  const sampleComments = comments ?? content.BLOG_SAMPLE_COMMENTS
  const tags = post.tags ?? [post.topic, post.industry]
  const [copied, setCopied] = useState(false)
  const [pageUrl, setPageUrl] = useState('')

  useEffect(() => {
    setPageUrl(window.location.href)
  }, [])

  const copyLink = useCallback(() => {
    if (typeof window === 'undefined') return
    void navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [])

  return (
    <article className="bg-white pb-20 pt-16">
      <div className="container-bs">
        <Reveal>
          <div className="flex flex-wrap items-center gap-4 text-[13px] text-ink/55">
            <span className="inline-flex items-center gap-1.5">
              <User className="h-4 w-4 text-primary" strokeWidth={1.6} />
              {post.author}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-primary" strokeWidth={1.6} />
              {content.formatBlogDate(post.date)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary" strokeWidth={1.6} />
              {post.readTime} {m.minRead}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-primary-border bg-mist/50 px-3 py-1 text-[12px] font-medium text-ink/60"
              >
                {tag}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="relative mt-8 aspect-[21/9] overflow-hidden rounded-[2rem]">
            <Image
              src={img(post.image, 1200)}
              alt={post.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          </div>
        </Reveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-6">
              <BlogTableOfContents sections={sections} />
              <div className="rounded-[1.5rem] border border-primary-border/60 bg-white p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink/40">{m.share}</p>
                <div className="mt-3 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={copyLink}
                    className="inline-flex items-center gap-2 rounded-xl border border-primary-border px-3 py-2.5 text-[13px] font-medium text-ink/65 transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                    {copied ? m.copied : m.copyLink}
                  </button>
                  {pageUrl && (
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-primary-border px-3 py-2.5 text-[13px] font-medium text-ink/65 transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      <Share2 className="h-4 w-4" />
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="mb-8 lg:hidden">
              <BlogTableOfContents sections={sections} />
            </div>

            <div className="space-y-12">
              {sections.map((section, si) => (
                <Reveal key={section.id} delay={si * 0.04}>
                  <section id={section.id} className="scroll-mt-28">
                    <h2 className="text-[1.35rem] font-bold tracking-tight text-ink sm:text-[1.5rem]">
                      {section.title}
                    </h2>
                    <div className="mt-5 space-y-4">
                      {section.paragraphs.map((p) => (
                        <p key={p} className="text-[16px] leading-[1.8] text-ink/75">
                          {p}
                        </p>
                      ))}
                    </div>
                  </section>
                </Reveal>
              ))}
            </div>

            <Reveal className="mt-12">
              <div className="flex gap-5 rounded-[1.5rem] border border-primary-border/60 bg-mist/40 p-6 sm:items-center">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary-tint text-[18px] font-bold text-primary">
                  BS
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink/40">{m.author}</p>
                  <p className="mt-1 text-[16px] font-bold text-ink">{post.author}</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-ink/60">{m.authorBio}</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="mt-16 space-y-16 border-t border-primary-border/50 pt-16">
          <BlogRelatedPosts posts={related} />
          <BlogComments initialComments={sampleComments} postTitle={post.title} />
        </div>

        <Reveal className="mt-12">
          <Link
            href="/tai-nguyen/blog-chuyen-mon"
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-primary transition-colors hover:text-primary-dark"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            {m.backToBlog}
          </Link>
        </Reveal>
      </div>
    </article>
  )
}
