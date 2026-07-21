'use client'

import React, { useState } from 'react'

type Group = { name: string; count: number; ids: number[]; slugs: (string | null)[] }
type Result = { ok: boolean; groups?: Group[]; totalGroups?: number; totalDocs?: number; error?: string }

/**
 * Dashboard card: scans for ingredients that share the same Vietnamese name.
 * Read-only report — each hit links to the record so an editor can merge or
 * delete manually.
 */
export const DuplicatePanel: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)

  const scan = async () => {
    if (loading) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/ingredient-duplicates', { credentials: 'include' })
      setResult((await res.json()) as Result)
    } catch (err) {
      setResult({ ok: false, error: (err as Error)?.message ?? 'Không gọi được API.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card dv-dashboard-seed">
      <div className="dv-dashboard-seed__inner">
        <div>
          <h3 className="dv-dashboard-seed__title">Nguyên liệu trùng lặp</h3>
          <p className="dv-dashboard-seed__desc">
            Quét các nguyên liệu bị trùng tên (không phân biệt hoa/thường, khoảng trắng). Chỉ báo
            cáo — không tự xoá; bạn mở từng bản ghi để gộp hoặc xoá.
          </p>
        </div>
        <button
          type="button"
          className="btn btn--style-secondary btn--size-medium"
          onClick={scan}
          disabled={loading}
          style={{ flexShrink: 0, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Đang quét…' : 'Quét trùng lặp'}
        </button>
      </div>

      {result && !result.ok && (
        <p style={{ marginTop: '0.75rem', color: 'var(--theme-error-500)', fontSize: '0.85rem' }}>
          {result.error}
        </p>
      )}

      {result?.ok && (
        <div style={{ marginTop: '0.9rem', fontSize: '0.85rem' }}>
          {result.totalGroups === 0 ? (
            <p style={{ color: 'var(--theme-success-500)' }}>✅ Không tìm thấy nguyên liệu trùng tên.</p>
          ) : (
            <>
              <p style={{ marginBottom: '0.6rem' }}>
                Tìm thấy <strong>{result.totalGroups}</strong> nhóm trùng (
                <strong>{result.totalDocs}</strong> bản ghi).
              </p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: 0, padding: 0, listStyle: 'none' }}>
                {result.groups?.map((g) => (
                  <li
                    key={g.name}
                    style={{
                      border: '1px solid var(--theme-elevation-150)',
                      borderRadius: 6,
                      padding: '0.5rem 0.65rem',
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: '0.3rem' }}>
                      {g.name} <span style={{ opacity: 0.6, fontWeight: 400 }}>× {g.count}</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {g.ids.map((id) => (
                        <a
                          key={id}
                          href={`/admin/collections/ingredients/${id}`}
                          style={{ textDecoration: 'underline' }}
                        >
                          #{id}
                        </a>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default DuplicatePanel
