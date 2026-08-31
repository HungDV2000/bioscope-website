'use client'

import { useState } from 'react'
import { MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react'
import { Reveal } from '@/components/ui/reveal'
import { useLocale } from '@/lib/i18n/context'
import type { CommentsData, PostComment } from '@/lib/cms/comments'

/**
 * Khu bình luận bài viết.
 *
 * Trước đây form này CHỈ thêm bình luận vào bộ nhớ trình duyệt — khách gõ xong
 * bấm gửi, thấy bình luận hiện ra, rồi tải lại trang là mất sạch. Không có gì
 * được lưu. Hai bình luận hiển thị cũng là dữ liệu mẫu cứng trong mã.
 *
 * Nay gửi thật về CMS, và hiển thị bình luận thật đã được duyệt.
 */
export function BlogComments({
  data,
  postId,
  postTitle,
}: {
  data: CommentsData
  postId?: number
  postTitle: string
}) {
  const { t, content, locale } = useLocale()
  const m = t.blogPage

  const [comments, setComments] = useState<PostComment[]>(data.comments)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<'approved' | 'pending' | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Tắt trong Cài đặt website → khu bình luận biến mất hoàn toàn.
  if (!data.enabled) return null

  const ui =
    locale === 'en'
      ? {
          sending: 'Sending…',
          thanksPending: 'Thank you. Your comment is awaiting review.',
          thanksLive: 'Thank you. Your comment has been posted.',
          failed: 'Could not send. Please try again.',
          noticePending: 'Comments are reviewed before appearing publicly.',
          noticeLive: 'Your comment appears immediately.',
          empty: 'No comments yet. Be the first.',
          remaining: 'characters left',
        }
      : {
          sending: 'Đang gửi…',
          thanksPending: 'Cảm ơn bạn. Bình luận đang chờ duyệt.',
          thanksLive: 'Cảm ơn bạn. Bình luận đã được đăng.',
          failed: 'Không gửi được. Vui lòng thử lại.',
          noticePending: 'Bình luận sẽ được kiểm duyệt trước khi hiển thị công khai.',
          noticeLive: 'Bình luận của bạn hiển thị ngay.',
          empty: 'Chưa có bình luận nào. Hãy là người đầu tiên.',
          remaining: 'ký tự còn lại',
        }

  const notice = data.notice ?? (data.requireApproval ? ui.noticePending : ui.noticeLive)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name.trim() || !body.trim() || !postId) return
    setBusy(true)
    try {
      const r = await fetch('/api/blog-comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post: postId, name, email, content: body, locale }),
      }).then((x) => x.json())

      if (!r?.ok) {
        setError(r?.error || ui.failed)
        return
      }
      if (r.pending) {
        setDone('pending')
      } else {
        // Hiện ngay khi admin tắt kiểm duyệt.
        setDone('approved')
        setComments((prev) => [
          { id: `new-${Date.now()}`, author: name.trim(), content: body.trim(), date: new Date().toISOString().slice(0, 10) },
          ...prev,
        ])
      }
      setName('')
      setEmail('')
      setBody('')
    } catch {
      setError(ui.failed)
    } finally {
      setBusy(false)
    }
  }

  const left = data.maxLength - body.length

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

      <form onSubmit={submit} className="mt-8 space-y-4 rounded-[1.5rem] border border-primary-border/60 bg-white p-6">
        {done && (
          <div className="flex items-start gap-2 rounded-xl border border-primary-border bg-primary-tint px-4 py-3 text-[13.5px] text-primary-dark">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{done === 'pending' ? ui.thanksPending : ui.thanksLive}</span>
          </div>
        )}
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13.5px] text-red-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="cmt-name" className="text-[13px] font-semibold text-ink/60">
              {m.nameLabel}
            </label>
            <input
              id="cmt-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={120}
              placeholder={m.namePlaceholder}
              className="mt-1.5 w-full rounded-full border border-primary-border bg-white px-4 py-3 text-[15px] outline-none transition-colors focus:border-primary/50"
            />
          </div>
          <div>
            <label htmlFor="cmt-email" className="text-[13px] font-semibold text-ink/60">
              {m.emailLabel}
              {data.requireEmail && <span className="text-accent"> *</span>}
            </label>
            <input
              id="cmt-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required={data.requireEmail}
              placeholder={m.emailPlaceholder}
              className="mt-1.5 w-full rounded-full border border-primary-border bg-white px-4 py-3 text-[15px] outline-none transition-colors focus:border-primary/50"
            />
          </div>
        </div>

        <div>
          <label htmlFor="cmt-body" className="text-[13px] font-semibold text-ink/60">
            {m.contentLabel} <span className="text-accent">*</span>
          </label>
          <textarea
            id="cmt-body"
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, data.maxLength))}
            required
            rows={4}
            placeholder={m.commentPlaceholder}
            className="mt-1.5 w-full rounded-[1.25rem] border border-primary-border bg-white px-4 py-3 text-[15px] outline-none transition-colors focus:border-primary/50"
          />
          {body.length > 0 && (
            <p className={`mt-1 text-right text-[11.5px] ${left < 50 ? 'text-accent' : 'text-ink/35'}`}>
              {left} {ui.remaining}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[12.5px] text-ink/45">{notice}</p>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            <Send className="h-4 w-4" strokeWidth={2} />
            {busy ? ui.sending : m.submitComment}
          </button>
        </div>
      </form>

      {comments.length === 0 ? (
        <p className="mt-8 text-[14px] text-ink/45">{ui.empty}</p>
      ) : (
        <div className="mt-8 space-y-4">
          {comments.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.05}>
              <div className="rounded-[1.25rem] border border-primary-border/50 bg-white p-5">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-[15px] font-bold text-ink">{c.author}</span>
                  {c.date && (
                    <span className="text-[12.5px] text-ink/40">{content.formatBlogDate(c.date)}</span>
                  )}
                </div>
                <p className="mt-2 whitespace-pre-line text-[14.5px] leading-relaxed text-ink/70">{c.content}</p>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  )
}
