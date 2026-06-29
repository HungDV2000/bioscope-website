'use client'

import { useState } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import type { BlogComment } from '@/lib/content'
import { cn } from '@/lib/utils'
import { useLocale } from '@/lib/i18n/context'

export function BlogComments({
  initialComments,
  postTitle,
}: {
  initialComments: BlogComment[]
  postTitle: string
}) {
  const { t, content } = useLocale()
  const m = t.blogPage
  const [comments, setComments] = useState(initialComments)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [commentContent, setCommentContent] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !commentContent.trim()) return

    const newComment: BlogComment = {
      id: `local-${Date.now()}`,
      author: name.trim(),
      date: new Date().toISOString().slice(0, 10),
      content: commentContent.trim(),
    }
    setComments((prev) => [newComment, ...prev])
    setName('')
    setEmail('')
    setCommentContent('')
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 4000)
  }

  return (
    <section className="rounded-[2rem] border border-primary-border/60 bg-mist/30 p-8 sm:p-10">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" strokeWidth={1.6} />
        <h2 className="text-[1.25rem] font-bold text-ink">
          {m.comments}
          <span className="ml-2 text-[15px] font-semibold text-ink/40">({comments.length})</span>
        </h2>
      </div>
      <p className="mt-2 text-[14px] text-ink/55">
        {m.commentPrompt} &ldquo;{postTitle}&rdquo;.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-[1.5rem] border border-primary-border/60 bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="comment-name" className="text-[12px] font-semibold text-ink/55">
              {m.nameLabel}
            </label>
            <input
              id="comment-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder={m.namePlaceholder}
              className="mt-1.5 w-full rounded-xl border border-primary-border px-4 py-2.5 text-[14px] outline-none transition-colors focus:border-primary/50"
            />
          </div>
          <div>
            <label htmlFor="comment-email" className="text-[12px] font-semibold text-ink/55">
              {m.emailLabel}
            </label>
            <input
              id="comment-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={m.emailPlaceholder}
              className="mt-1.5 w-full rounded-xl border border-primary-border px-4 py-2.5 text-[14px] outline-none transition-colors focus:border-primary/50"
            />
          </div>
        </div>
        <div>
          <label htmlFor="comment-content" className="text-[12px] font-semibold text-ink/55">
            {m.contentLabel}
          </label>
          <textarea
            id="comment-content"
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            required
            rows={4}
            placeholder={m.commentPlaceholder}
            className="mt-1.5 w-full resize-none rounded-xl border border-primary-border px-4 py-3 text-[14px] outline-none transition-colors focus:border-primary/50"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[12px] text-ink/45">{m.commentModeration}</p>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            <Send className="h-4 w-4" strokeWidth={2} />
            {m.submitComment}
          </button>
        </div>
        {submitted && (
          <p className="rounded-xl bg-primary-tint px-4 py-3 text-[13px] font-medium text-primary-dark">
            {m.commentThanks}
          </p>
        )}
      </form>

      <ul className="mt-8 space-y-5">
        {comments.map((c) => (
          <li
            key={c.id}
            className={cn(
              'rounded-[1.25rem] border border-primary-border/50 bg-white p-5',
              c.id.startsWith('local-') && 'ring-1 ring-primary/20',
            )}
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-[15px] font-bold text-ink">{c.author}</span>
              {(c.role || c.company) && (
                <span className="text-[12.5px] text-ink/45">
                  {[c.role, c.company].filter(Boolean).join(' · ')}
                </span>
              )}
              <span className="text-[12px] text-ink/35">{content.formatBlogDate(c.date)}</span>
            </div>
            <p className="mt-3 text-[14.5px] leading-relaxed text-ink/70">{c.content}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
