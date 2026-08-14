'use client'

import { useState } from 'react'
import { Paperclip, Download } from 'lucide-react'

/**
 * Ảnh / tệp / tin thoại sales gửi từ Telegram. Nội dung tải qua endpoint có
 * kiểm phiên (tệp không nằm ở thư viện công khai), nên chỉ đúng khách của hội
 * thoại đó mới xem được.
 */
export function Attachment({
  kind,
  name,
  href,
  t,
}: {
  kind: 'photo' | 'document' | 'voice' | 'video'
  name?: string | null
  href: string
  t: { download: string; imageAlt: string }
}) {
  const [failed, setFailed] = useState(false)

  if (kind === 'photo' && !failed) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="mt-1.5 block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={href}
          alt={t.imageAlt}
          loading="lazy"
          onError={() => setFailed(true)}
          className="max-h-56 w-auto max-w-full rounded-xl border border-primary-border/50 object-contain"
        />
      </a>
    )
  }

  if (kind === 'voice' && !failed) {
    // eslint-disable-next-line jsx-a11y/media-has-caption
    return <audio src={href} controls onError={() => setFailed(true)} className="mt-1.5 w-full max-w-[240px]" />
  }

  if (kind === 'video' && !failed) {
    // eslint-disable-next-line jsx-a11y/media-has-caption
    return (
      <video
        src={href}
        controls
        onError={() => setFailed(true)}
        className="mt-1.5 max-h-56 w-full rounded-xl border border-primary-border/50"
      />
    )
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1.5 inline-flex max-w-full items-center gap-1.5 rounded-lg border border-primary-border/60 bg-white/70 px-2.5 py-1.5 text-[12.5px] font-medium text-primary-dark hover:bg-white"
    >
      <Paperclip className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{name || t.download}</span>
      <Download className="h-3.5 w-3.5 shrink-0 opacity-60" />
    </a>
  )
}
