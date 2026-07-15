'use client'

/**
 * SecurityDashboard — a UI field rendered at the top of the security-settings
 * global. Client-side summary of firewall status, recent security events and
 * blocked IPs (Wordfence-style overview). Reads the collections via the REST API.
 */

import React, { useEffect, useState } from 'react'

type EventDoc = {
  id: string
  type?: string
  action?: string
  ip?: string
  reason?: string
  path?: string
  username?: string
  createdAt?: string
}

const ACTION_COLOR: Record<string, string> = {
  blocked: '#f56565',
  lockout: '#f56565',
  monitored: '#e6a23c',
  allowed: '#38a169',
}

function timeAgo(iso?: string): string {
  if (!iso) return ''
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return `${s}s trước`
  if (s < 3600) return `${Math.floor(s / 60)}m trước`
  if (s < 86400) return `${Math.floor(s / 3600)}h trước`
  return `${Math.floor(s / 86400)}d trước`
}

export const SecurityDashboard: React.FC = () => {
  const [events, setEvents] = useState<EventDoc[]>([])
  const [blockedCount, setBlockedCount] = useState<number | null>(null)
  const [blocked24h, setBlocked24h] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const since = new Date(Date.now() - 86_400_000).toISOString()
        const [evRes, ipRes, ev24Res] = await Promise.all([
          fetch('/api/security-events?limit=12&sort=-createdAt&depth=0', { credentials: 'include' }),
          fetch('/api/blocked-ips?limit=0&depth=0', { credentials: 'include' }),
          fetch(
            `/api/security-events?limit=0&depth=0&where[action][equals]=blocked&where[createdAt][greater_than]=${since}`,
            { credentials: 'include' },
          ),
        ])
        const ev = await evRes.json()
        const ip = await ipRes.json()
        const ev24 = await ev24Res.json()
        setEvents(ev?.docs ?? [])
        setBlockedCount(ip?.totalDocs ?? 0)
        setBlocked24h(ev24?.totalDocs ?? 0)
      } catch {
        /* ignore */
      } finally {
        setLoading(false)
      }
    }
    load()
    const t = setInterval(load, 20_000)
    return () => clearInterval(t)
  }, [])

  const Stat = ({ label, value, tone }: { label: string; value: React.ReactNode; tone?: string }) => (
    <div
      style={{
        flex: 1,
        minWidth: 140,
        background: 'var(--theme-elevation-50, #f4f6f8)',
        borderRadius: 10,
        padding: '14px 16px',
      }}
    >
      <div style={{ fontSize: 12, color: 'var(--theme-elevation-500,#7a8794)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: tone ?? 'var(--theme-text,#1a1a1a)' }}>{value}</div>
    </div>
  )

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>🛡️ Tổng quan bảo mật</div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <Stat label="IP đang bị chặn" value={blockedCount ?? '—'} tone="#f56565" />
        <Stat label="Request bị chặn (24h)" value={blocked24h ?? '—'} tone="#e6a23c" />
        <Stat label="Sự kiện gần đây" value={events.length} />
      </div>

      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--theme-elevation-600,#666)', marginBottom: 6 }}>
        Sự kiện mới nhất
      </div>
      <div
        style={{
          border: '1px solid var(--theme-elevation-150,#e3e8ec)',
          borderRadius: 8,
          overflow: 'hidden',
          fontSize: 12.5,
        }}
      >
        {loading ? (
          <div style={{ padding: 12, color: '#7a8794' }}>Đang tải…</div>
        ) : events.length === 0 ? (
          <div style={{ padding: 12, color: '#7a8794' }}>Chưa có sự kiện.</div>
        ) : (
          events.map((e, i) => (
            <div
              key={e.id}
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                padding: '8px 12px',
                borderTop: i === 0 ? 'none' : '1px solid var(--theme-elevation-100,#eef1f4)',
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  color: ACTION_COLOR[e.action ?? ''] ?? '#7a8794',
                  width: 78,
                  flexShrink: 0,
                  textTransform: 'uppercase',
                  fontSize: 11,
                }}
              >
                {e.action}
              </span>
              <span style={{ width: 70, flexShrink: 0, color: '#7a8794' }}>{e.type}</span>
              <span style={{ width: 120, flexShrink: 0, fontFamily: 'ui-monospace, monospace' }}>{e.ip ?? '—'}</span>
              <span style={{ flex: 1, color: 'var(--theme-elevation-700,#444)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {e.reason ?? ''} {e.path ? `· ${e.path}` : ''} {e.username ? `· ${e.username}` : ''}
              </span>
              <span style={{ color: '#98a4b0', flexShrink: 0 }}>{timeAgo(e.createdAt)}</span>
            </div>
          ))
        )}
      </div>
      <div style={{ fontSize: 11, color: '#98a4b0', marginTop: 8 }}>
        Tự làm mới mỗi 20s. Xem đầy đủ ở <strong>Security → Security Events</strong> và <strong>Blocked IPs</strong>.
      </div>
    </div>
  )
}

export default SecurityDashboard
