'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import type { BlogSection } from '@/lib/content'

export function BlogTableOfContents({
  sections,
}: {
  sections: BlogSection[]
}) {
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
    <nav aria-label="Mục lục" className="rounded-[1.5rem] border border-primary-border/60 bg-mist/40 p-6">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink/45">Mục lục</h2>
      <ol className="mt-4 space-y-1">
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
                'flex gap-2.5 rounded-xl px-3 py-2.5 text-[13.5px] leading-snug transition-colors',
                activeId === id
                  ? 'bg-primary-tint font-semibold text-primary-dark'
                  : 'text-ink/60 hover:bg-white hover:text-ink',
              )}
            >
              <span className="mt-0.5 shrink-0 text-[11px] font-bold text-ink/30">{i + 1}.</span>
              {title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
