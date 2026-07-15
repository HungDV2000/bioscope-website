'use client'

/**
 * InternalLinkSuggestions — Yoast Premium-style internal-linking helper in the
 * SEO group. Searches related published content by the focus keyphrase / title
 * and lists suggestions with a copyable path to drop into the content.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { useAllFormFields, useDocumentInfo } from '@payloadcms/ui'

type Suggestion = { title: string; url: string; collection: string }

export const InternalLinkSuggestions: React.FC = () => {
  const [fields] = useAllFormFields()
  const { id } = useDocumentInfo()
  const [results, setResults] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState('')

  const query = useMemo(() => {
    const f = fields as Record<string, { value?: unknown }>
    const kp = String(f['seo.focusKeyphrase']?.value ?? '')
    const title = String(f['title']?.value ?? f['name']?.value ?? '')
    return (kp || title).trim()
  }, [fields])

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }
    let cancelled = false
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ q: query, exclude: id ? String(id) : '' })
        const r = await fetch(`/api/seo/internal-links?${params}`, { credentials: 'include' })
        const j = await r.json()
        if (!cancelled) setResults(j?.results ?? [])
      } catch {
        if (!cancelled) setResults([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 600)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [query, id])

  const copy = (url: string) => {
    navigator.clipboard?.writeText(url)
    setCopied(url)
    setTimeout(() => setCopied(''), 1500)
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--theme-elevation-600,#666)', marginBottom: 6 }}>
        🔗 Gợi ý liên kết nội bộ
      </div>
      {query.length < 2 ? (
        <div style={{ fontSize: 12.5, color: '#98a4b0' }}>Đặt từ khóa trọng tâm để nhận gợi ý.</div>
      ) : loading ? (
        <div style={{ fontSize: 12.5, color: '#98a4b0' }}>Đang tìm…</div>
      ) : results.length === 0 ? (
        <div style={{ fontSize: 12.5, color: '#98a4b0' }}>Chưa tìm thấy nội dung liên quan.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {results.map((r) => (
            <div
              key={`${r.collection}-${r.url}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12.5,
                padding: '5px 8px',
                borderRadius: 6,
                background: 'var(--theme-elevation-50,#f4f6f8)',
              }}
            >
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {r.title} <span style={{ color: '#98a4b0' }}>· {r.collection}</span>
              </span>
              <code style={{ color: '#008e4d', fontSize: 11 }}>{r.url}</code>
              <button
                type="button"
                onClick={() => copy(r.url)}
                style={{
                  border: '1px solid var(--theme-elevation-200,#cbd5dc)',
                  background: 'transparent',
                  borderRadius: 5,
                  padding: '2px 8px',
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                {copied === r.url ? 'Đã chép' : 'Chép'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default InternalLinkSuggestions
