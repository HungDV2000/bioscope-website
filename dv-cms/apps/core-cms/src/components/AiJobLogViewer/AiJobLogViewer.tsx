'use client'

/**
 * AiJobLogViewer — compact console-style renderer for the `logs` array field on
 * AI Generate Jobs (and reusable for Drive Sync Jobs). Replaces Payload's bulky
 * per-row array UI with a single scrollable, colour-coded log stream.
 */

import React from 'react'
import { useAllFormFields } from '@payloadcms/ui'

type LogEntry = { ts?: string; level?: 'info' | 'warn' | 'error'; message?: string }

const LEVEL_COLOR: Record<string, string> = {
  info: '#8aa0b6',
  warn: '#e6a23c',
  error: '#f56565',
}

function fmtTime(iso?: string): string {
  if (!iso) return '--:--:--'
  try {
    return new Date(iso).toLocaleTimeString('vi-VN', { hour12: false })
  } catch {
    return iso
  }
}

export const AiJobLogViewer: React.FC = () => {
  const [fields] = useAllFormFields()
  // Payload keeps array fields flattened in form state: `logs` holds the ROW
  // COUNT and each row is `logs.<i>.<sub>`. Reading `logs.value` as an array
  // always yielded nothing — rebuild the rows from the indexed paths instead.
  const logs: LogEntry[] = React.useMemo(() => {
    const f = fields as Record<string, { value?: unknown } | undefined>
    const count = Number(f?.logs?.value ?? 0)
    const rows: LogEntry[] = []
    for (let i = 0; i < count; i++) {
      const ts = f[`logs.${i}.ts`]?.value
      const level = f[`logs.${i}.level`]?.value
      const message = f[`logs.${i}.message`]?.value
      if (ts == null && level == null && message == null) continue
      rows.push({
        ts: typeof ts === 'string' ? ts : undefined,
        level: (typeof level === 'string' ? level : 'info') as LogEntry['level'],
        message: typeof message === 'string' ? message : String(message ?? ''),
      })
    }
    return rows
  }, [fields])

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--theme-elevation-600, #666)',
          marginBottom: 6,
        }}
      >
        Logs {logs.length > 0 && `(${logs.length})`}
      </div>
      <div
        style={{
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: 12,
          lineHeight: 1.55,
          background: 'var(--theme-elevation-900, #14181d)',
          color: '#dbe4ee',
          borderRadius: 8,
          padding: '10px 12px',
          maxHeight: 420,
          overflowY: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {logs.length === 0 ? (
          <span style={{ color: '#8aa0b6' }}>Chưa có log.</span>
        ) : (
          logs.map((l, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, padding: '1px 0' }}>
              <span style={{ color: '#5f7085', flexShrink: 0 }}>{fmtTime(l.ts)}</span>
              <span
                style={{
                  color: LEVEL_COLOR[l.level ?? 'info'] ?? '#8aa0b6',
                  flexShrink: 0,
                  fontWeight: 700,
                  width: 46,
                  textTransform: 'uppercase',
                }}
              >
                {l.level ?? 'info'}
              </span>
              <span>{l.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AiJobLogViewer
