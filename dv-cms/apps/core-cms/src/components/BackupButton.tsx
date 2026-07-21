'use client'

import { useDvTranslation } from '@dv/cms-core'
import React, { useState } from 'react'

/**
 * Dashboard card: downloads a full database backup via `GET /api/backup`
 * (admin-only). Uses fetch + blob so an error response can be shown inline
 * instead of navigating the admin to a broken download.
 */
export const BackupButton: React.FC = () => {
  const { t } = useDvTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = async () => {
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/backup', { method: 'GET', credentials: 'include' })

      if (!res.ok) {
        let message = t('dv:backup.failed')
        try {
          const body = (await res.json()) as { error?: string }
          if (body?.error) message = body.error
        } catch {
          /* non-JSON error body */
        }
        setError(message)
        return
      }

      // Filename comes from Content-Disposition; fall back to a timestamp.
      const disposition = res.headers.get('Content-Disposition') ?? ''
      const match = /filename="?([^"]+)"?/.exec(disposition)
      const filename = match?.[1] ?? `bioscope-${Date.now()}.dump`

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError((err as Error)?.message ?? t('dv:backup.apiError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card dv-dashboard-seed">
      <div className="dv-dashboard-seed__inner">
        <div>
          <h3 className="dv-dashboard-seed__title">{t('dv:backup.title')}</h3>
          <p className="dv-dashboard-seed__desc">{t('dv:backup.description')}</p>
        </div>
        <button
          type="button"
          className="btn btn--style-secondary btn--size-medium"
          onClick={run}
          disabled={loading}
          style={{ flexShrink: 0, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? t('dv:backup.running') : t('dv:backup.run')}
        </button>
      </div>
      {error && (
        <p style={{ marginTop: '0.75rem', color: 'var(--theme-error-500)', fontSize: '0.85rem' }}>
          {error}
        </p>
      )}
    </div>
  )
}

export default BackupButton
