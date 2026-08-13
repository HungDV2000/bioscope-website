'use client'

import { useEffect, useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

type Msg = {
  id: number
  sender: 'visitor' | 'agent' | 'system'
  text: string
  agentName?: string | null
  createdAt: string
}

const TONE: Record<Msg['sender'], { bg: string; label: string; align: string }> = {
  visitor: { bg: 'var(--theme-elevation-100)', label: 'Khách', align: 'flex-start' },
  agent: { bg: 'var(--theme-success-100, #d7f0e0)', label: 'Sales', align: 'flex-end' },
  system: { bg: 'var(--theme-elevation-50)', label: 'Hệ thống', align: 'center' },
}

/**
 * Toàn bộ lịch sử tin nhắn của hội thoại, hiện ngay trong trang hội thoại —
 * khỏi phải sang collection Tin nhắn rồi tự lọc theo id.
 */
export function ChatTranscript() {
  const { id } = useDocumentInfo()
  const [msgs, setMsgs] = useState<Msg[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!id) return
    const params = new URLSearchParams({
      'where[conversation][equals]': String(id),
      limit: '300',
      sort: 'createdAt',
      depth: '0',
    })
    fetch(`/api/chat-messages?${params}`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('failed'))))
      .then((d: { docs?: Msg[] }) => setMsgs(d.docs ?? []))
      .catch(() => setError(true))
  }, [id])

  if (!id) return <p style={{ opacity: 0.6 }}>Lưu hội thoại trước để xem lịch sử.</p>
  if (error) return <p style={{ opacity: 0.6 }}>Không tải được lịch sử tin nhắn.</p>
  if (!msgs) return <p style={{ opacity: 0.6 }}>Đang tải lịch sử…</p>
  if (msgs.length === 0) return <p style={{ opacity: 0.6 }}>Hội thoại chưa có tin nhắn nào.</p>

  return (
    <div>
      <h4 style={{ margin: '0 0 10px' }}>Lịch sử tin nhắn ({msgs.length})</h4>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          maxHeight: 460,
          overflowY: 'auto',
          padding: 12,
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: 6,
          background: 'var(--theme-elevation-25)',
        }}
      >
        {msgs.map((m) => {
          const t = TONE[m.sender] ?? TONE.system
          return (
            <div key={m.id} style={{ display: 'flex', justifyContent: t.align }}>
              <div
                style={{
                  maxWidth: '78%',
                  background: t.bg,
                  borderRadius: 8,
                  padding: '7px 11px',
                  fontSize: 13,
                  lineHeight: 1.55,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 2 }}>
                  {m.agentName || t.label} ·{' '}
                  {new Date(m.createdAt).toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                {m.text}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
