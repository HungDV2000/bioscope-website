'use client'

/**
 * AiJobLogViewer — compact console-style renderer for the `logs` array field on
 * AI Generate Jobs (and reusable for Drive Sync Jobs). Replaces Payload's bulky
 * per-row array UI with a single scrollable, colour-coded log stream.
 */

import React from 'react'
import { useFormFields } from '@payloadcms/ui'

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
  const raw = useFormFields(([fields]) => fields?.logs?.value)
  const logs: LogEntry[] = Array.isArray(raw) ? (raw as LogEntry[]) : []

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
