'use client'

/**
 * SeoAnalysis — Yoast-style live content analysis rendered inside the `seo`
 * group on any collection. Reads the form state (focus keyphrase, SEO title/
 * description, slug + the main body richText/text fields), runs the shared
 * @dv/module-seo analyzers and shows a Google snippet preview plus SEO &
 * readability traffic-light checks.
 */

import React, { useMemo } from 'react'
import { useAllFormFields } from '@payloadcms/ui'
import {
  analyzeSeo,
  analyzeReadability,
  overallRating,
  type Assessment,
  type Rating,
} from '@dv/module-seo/analyze'

const DOT: Record<Rating, string> = { good: '#38a169', ok: '#e6a23c', bad: '#f56565' }

/** Flatten a Lexical richText value into plain text. */
function lexicalToText(value: unknown): string {
  const root = (value as { root?: { children?: unknown[] } } | undefined)?.root
  if (!root?.children) return ''
  const read = (node: unknown): string => {
    const n = node as { text?: string; children?: unknown[]; type?: string }
    let s = typeof n.text === 'string' ? n.text : ''
    if (Array.isArray(n.children)) s += n.children.map(read).join(' ')
    return s
  }
  return root.children.map(read).join('\n\n')
}

// Field paths that plausibly hold the main body content, in priority order.
const BODY_KEYS = ['description', 'content', 'body', 'excerpt', 'subtitle', 'overview']

function getField(fields: Record<string, { value?: unknown }>, key: string): unknown {
  return fields[key]?.value
}

export const SeoAnalysis: React.FC = () => {
  const [fields] = useAllFormFields()

  const input = useMemo(() => {
    const f = fields as Record<string, { value?: unknown }>
    const keyphrase = String(getField(f, 'seo.focusKeyphrase') ?? '')
    const seoTitle =
      String(getField(f, 'seo.title') ?? '') || String(getField(f, 'title') ?? getField(f, 'name') ?? '')
    const metaDescription = String(getField(f, 'seo.description') ?? '')
    const slug = String(getField(f, 'slug') ?? '')

    // Gather body text from the first richText/text body field that has content.
    let body = ''
    for (const key of BODY_KEYS) {
      const v = getField(f, key)
      if (!v) continue
      const text = typeof v === 'string' ? v : lexicalToText(v)
      if (text && text.trim().length > body.length) body = text
    }

    // Rough link/image counts from any richText body.
    let linkCount = 0
    let imageCount = getField(f, 'featuredImage') || getField(f, 'seo.image') ? 1 : 0
    for (const key of BODY_KEYS) {
      const v = getField(f, key)
      if (v && typeof v === 'object') {
        const json = JSON.stringify(v)
        linkCount += (json.match(/"type":"link"|"type":"autolink"/g) ?? []).length
        imageCount += (json.match(/"type":"upload"|"type":"image"/g) ?? []).length
      }
    }

    return { keyphrase, seoTitle, metaDescription, slug, body, linkCount, imageCount }
  }, [fields])

  const seo = useMemo(() => analyzeSeo(input), [input])
  const read = useMemo(() => analyzeReadability(input.body), [input.body])

  const previewUrl = `${(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://web.bioscope.vn').replace(/\/$/, '')}/${input.slug}`

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Google snippet preview */}
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--theme-elevation-600,#666)', marginBottom: 6 }}>
        Xem trước trên Google
      </div>
      <div
        style={{
          border: '1px solid var(--theme-elevation-150,#e3e8ec)',
          borderRadius: 8,
          padding: '12px 14px',
          marginBottom: 16,
          background: 'var(--theme-elevation-0,#fff)',
        }}
      >
        <div style={{ color: '#1a0dab', fontSize: 18, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {input.seoTitle || 'Tiêu đề trang…'}
        </div>
        <div style={{ color: '#006621', fontSize: 13, margin: '2px 0' }}>{previewUrl}</div>
        <div style={{ color: '#545454', fontSize: 13, lineHeight: 1.45 }}>
          {input.metaDescription || 'Meta description sẽ hiển thị ở đây…'}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        <AnalysisColumn title="Phân tích SEO" score={seo.score} items={seo.assessments} />
        <AnalysisColumn title="Độ dễ đọc" score={read.score} items={read.assessments} />
      </div>
    </div>
  )
}

function AnalysisColumn({ title, score, items }: { title: string; score: number; items: Assessment[] }) {
  const rating = overallRating(score)
  return (
    <div style={{ flex: 1, minWidth: 260 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: DOT[rating], display: 'inline-block' }} />
        <span style={{ fontWeight: 700, fontSize: 13 }}>{title}</span>
        <span style={{ fontSize: 12, color: '#7a8794' }}>{score}/100</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map((it) => (
          <div key={it.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12.5 }}>
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                background: DOT[it.rating],
                display: 'inline-block',
                marginTop: 4,
                flexShrink: 0,
              }}
            />
            <span style={{ color: 'var(--theme-elevation-700,#444)' }}>{it.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SeoAnalysis
