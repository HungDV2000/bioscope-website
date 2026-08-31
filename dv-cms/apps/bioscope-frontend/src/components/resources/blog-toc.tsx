'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useLocale } from '@/lib/i18n/context'

export function BlogTableOfContents({
  sections,
}: {
  /** Chỉ cần id + tiêu đề — dùng được cho cả mục lục sinh từ richText. */
  sections: { id: string; title: string }[]
}) {
  const { t } = useLocale()
  const m = t.blogPage
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '')

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    sections.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveId(id)
        },
        { rootMargin: '-20% 0px -60% 0px', threshold: 0 },
      )
      observer.observe(el)
      observers.push(observer)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [sections])

  if (sections.length <= 1) return null

  return (
    <nav aria-label={m.toc} className="rounded-[1.5rem] border border-primary-border/60 bg-mist/40 p-5">
      <h2 className="px-1 text-[11px] font-bold uppercase tracking-[0.14em] text-ink/45">{m.toc}</h2>
      {/* Mục lục dài thì tự cuộn trong khung thay vì đẩy cả cột xuống quá màn hình. */}
      <ol className="scroll-slim mt-3.5 max-h-[min(60vh,520px)] space-y-0.5 overflow-y-auto pr-1">
        {sections.map(({ id, title }, i) => (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                setActiveId(id)
              }}
              className={cn(
                'flex gap-2 rounded-xl px-3 py-2 text-[13px] leading-[1.45] transition-colors',
                activeId === id
                  ? 'bg-primary-tint font-semibold text-primary-dark'
                  : 'text-ink/60 hover:bg-white hover:text-ink',
              )}
            >
              {/* Chỉ tự đánh số khi tiêu đề CHƯA có số. Bài viết thường tự đánh
                  "1." "2." trong tiêu đề, thêm số nữa thành "1.1." rất khó đọc. */}
              {!/^\d+[.)]/.test(title.trim()) && (
                <span className="mt-0.5 shrink-0 text-[11px] font-bold text-ink/30">{i + 1}.</span>
              )}
              {/* Tối đa 2 dòng cho mọi mục — mục lục cao thấp lệch nhau nhìn rối,
                  và tiêu đề dài chiếm hết chiều cao cột. */}
              <span className="line-clamp-2" title={title}>
                {title}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
