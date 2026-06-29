'use client'

import { useDvTranslation } from '@dv/cms-core'
import React, { useState } from 'react'

type Result = { ok: boolean; summary?: string[]; error?: string }

/**
 * Dashboard card with a one-click "seed/refresh content" button.
 * Calls `POST /api/seed` (admin-only, idempotent).
 */
export const SeedButton: React.FC = () => {
  const { t } = useDvTranslation()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)

  const run = async () => {
    if (loading) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/seed', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
      setResult((await res.json()) as Result)
    } catch (err) {
      setResult({ ok: false, error: (err as Error)?.message ?? t('dv:seed.apiError') })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card dv-dashboard-seed">
      <div className="dv-dashboard-seed__inner">
        <div>
          <h3 className="dv-dashboard-seed__title">{t('dv:seed.title')}</h3>
          <p className="dv-dashboard-seed__desc">{t('dv:seed.description')}</p>
        </div>
        <button
          type="button"
          className="btn btn--style-primary btn--size-medium"
          onClick={run}
          disabled={loading}
          style={{ flexShrink: 0, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? t('dv:seed.running') : t('dv:seed.run')}
        </button>
      </div>

      {result && (
        <div
          style={{
            marginTop: 14,
            padding: '10px 12px',
            borderRadius: 'var(--style-radius-m, 10px)',
            fontSize: 13,
            background: result.ok ? 'rgba(0,142,77,0.08)' : 'rgba(200,40,40,0.08)',
            border: `1px solid ${result.ok ? 'rgba(0,142,77,0.22)' : 'rgba(200,40,40,0.25)'}`,
          }}
        >
          {result.ok ? (
            <>
              <strong style={{ color: 'var(--dv-primary)' }}>{t('dv:seed.success')}</strong>
              <ul style={{ margin: '6px 0 0', paddingLeft: 18, columns: 2, color: 'var(--theme-elevation-700)' }}>
                {(result.summary ?? []).map((line, i) => (
                  <li key={i} style={{ fontSize: 12 }}>{line}</li>
                ))}
              </ul>
            </>
          ) : (
            <strong style={{ color: '#c22' }}>❌ {result.error ?? t('dv:seed.failed')}</strong>
          )}
        </div>
      )}
    </div>
  )
}

export default SeedButton
