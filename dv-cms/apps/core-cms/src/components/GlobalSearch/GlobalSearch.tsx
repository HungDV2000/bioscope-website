'use client'

import React, { useEffect, useRef, useState } from 'react'

/**
 * Tìm kiếm toàn admin — gõ một lần, tìm song song nhiều collection rồi gộp kết
 * quả (federated search). Không cần bảng index hay thư viện ngoài: gọi thẳng
 * REST của từng collection với where[...][like].
 *
 * Đặt ở thanh công cụ trên cùng (admin.components.actions). Ctrl/Cmd+K để mở.
 */
type Target = { slug: string; title: string; label: string }
const TARGETS: Target[] = [
  { slug: 'ingredients', title: 'name', label: 'Nguyên liệu' },
  { slug: 'posts', title: 'title', label: 'Bài viết' },
  { slug: 'pages', title: 'title', label: 'Trang' },
  { slug: 'case-studies', title: 'title', label: 'Case study' },
  { slug: 'faqs', title: 'question', label: 'FAQ' },
  { slug: 'categories', title: 'title', label: 'Danh mục' },
]

type Hit = { id: string; label: string; slug: string; collectionLabel: string }

export const GlobalSearch: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [hits, setHits] = useState<Hit[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  useEffect(() => {
    const term = q.trim()
    if (!term) {
      setHits([])
      return
    }
    let cancelled = false
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const results = await Promise.all(
          TARGETS.map(async (tg) => {
            const url = `/api/${tg.slug}?where[${tg.title}][like]=${encodeURIComponent(term)}&limit=5&depth=0&select[${tg.title}]=true`
            const r = await fetch(url, { credentials: 'include' }).then((x) => x.json()).catch(() => null)
            return (r?.docs ?? []).map((d: Record<string, unknown>) => ({
              id: String(d.id),
              label: String(d[tg.title] ?? d.id),
              slug: tg.slug,
              collectionLabel: tg.label,
            }))
          }),
        )
        if (!cancelled) setHits(results.flat())
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [q])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Tìm kiếm toàn admin (Ctrl/Cmd+K)"
        aria-label="Tìm kiếm"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          height: 32,
          padding: '0 12px',
          borderRadius: 'var(--style-radius-m, 8px)',
          border: '1px solid var(--theme-elevation-150)',
          background: 'var(--theme-elevation-0)',
          color: 'var(--theme-elevation-600)',
          fontSize: 13,
          cursor: 'pointer',
        }}
      >
        <span aria-hidden>🔍</span>
        <span>Tìm kiếm</span>
        <kbd style={{ fontSize: 11, opacity: 0.6, border: '1px solid var(--theme-elevation-200)', borderRadius: 4, padding: '0 4px' }}>⌘K</kbd>
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '12vh' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: 'min(640px, 92vw)', maxHeight: '70vh', display: 'flex', flexDirection: 'column', background: 'var(--theme-elevation-0)', border: '1px solid var(--theme-elevation-150)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
          >
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm nguyên liệu, bài viết, trang, FAQ…"
              style={{ padding: '16px 18px', fontSize: 15, border: 'none', borderBottom: '1px solid var(--theme-elevation-100)', outline: 'none', background: 'transparent', color: 'var(--theme-elevation-800)' }}
            />
            <div style={{ overflowY: 'auto', padding: 8 }}>
              {loading && <p style={{ padding: 12, fontSize: 13, color: 'var(--theme-elevation-400)' }}>Đang tìm…</p>}
              {!loading && q.trim() && hits.length === 0 && (
                <p style={{ padding: 12, fontSize: 13, color: 'var(--theme-elevation-400)' }}>Không có kết quả cho “{q}”.</p>
              )}
              {hits.map((h) => (
                <a
                  key={`${h.slug}:${h.id}`}
                  href={`/admin/collections/${h.slug}/${h.id}`}
                  onClick={() => setOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 12px', borderRadius: 8, textDecoration: 'none', color: 'var(--theme-elevation-800)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--theme-elevation-50)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.label}</span>
                  <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: 'var(--theme-elevation-100)', color: 'var(--theme-elevation-500)' }}>{h.collectionLabel}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default GlobalSearch
