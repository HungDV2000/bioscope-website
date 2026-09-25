'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { toast, useDocumentInfo } from '@payloadcms/ui'

type Round = {
  key: string
  label: string
  status: 'open' | 'closed' | 'announced'
  endAt: string
  announceAt: string
  participants: number
}

type Stats = {
  status: string
  round?: Round
  participants: number
  pendingRecordings: number
  newOrders: number
  winners: number
  slots: number
  winnersFrozenAt: string | null
  piiPurgedAt: string | null
  domains: string[]
}

type DnsResult = { host: string; ips: string[]; ok: boolean | null; message: string }

const ROUND_STATUS: Record<string, string> = {
  open: 'đang chạy',
  closed: 'đã chốt, chờ công bố',
  announced: 'đã công bố',
}

/** Giờ Việt Nam cho mọi mốc hiển thị trong admin. */
const fmt = (d?: string | null) =>
  d ? new Date(d).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'

const box: React.CSSProperties = {
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 8,
  padding: 12,
  marginBottom: 16,
  background: 'var(--theme-elevation-0)',
}
const btn: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '8px 10px',
  marginTop: 8,
  borderRadius: 6,
  border: '1px solid var(--theme-elevation-200)',
  background: 'var(--theme-elevation-50)',
  color: 'var(--theme-elevation-800)',
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer',
  textAlign: 'left',
}
const danger: React.CSSProperties = { ...btn, borderColor: 'var(--theme-error-300, #f3b4b4)', color: 'var(--theme-error-600, #b42318)' }

async function call(path: string, init?: RequestInit) {
  const res = await fetch(path, { credentials: 'include', headers: { 'Content-Type': 'application/json' }, ...init })
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (!res.ok) throw new Error(String(data.error ?? `Lỗi ${res.status}`))
  return data
}

/**
 * Cột phải của trang chiến dịch: số liệu nhanh + các thao tác không phải
 * "sửa trường" (chốt danh sách, xuất CSV, kiểm tra DNS, xoá dữ liệu cá nhân).
 */
export const CampaignActions: React.FC = () => {
  const { id } = useDocumentInfo()
  const [stats, setStats] = useState<Stats | null>(null)
  const [dns, setDns] = useState<DnsResult[] | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const base = id ? `/api/lp/admin/${id}` : ''

  const load = useCallback(async () => {
    if (!base) return
    try {
      setStats((await call(`${base}/stats`)) as unknown as Stats)
    } catch {
      /* chưa có quyền hoặc chưa lưu — bỏ qua */
    }
  }, [base])

  useEffect(() => {
    void load()
  }, [load])

  if (!id) {
    return (
      <div style={box}>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--theme-elevation-600)' }}>
          Lưu chiến dịch lần đầu để hiện các thao tác: chốt danh sách, xuất CSV, kiểm tra DNS.
        </p>
      </div>
    )
  }

  const run = async (key: string, fn: () => Promise<void>) => {
    if (busy) return
    setBusy(key)
    try {
      await fn()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setBusy(null)
    }
  }

  const freeze = (force: boolean) =>
    run('freeze', async () => {
      const msg = force
        ? 'Chốt LẠI sẽ tính lại toàn bộ danh sách nhận quà theo điểm hiện tại. Danh sách cũ bị thay. Tiếp tục?'
        : `Chốt danh sách: ${stats?.slots ?? ''} người điểm cao nhất nhận quà, chiến dịch chuyển sang "Đã kết thúc". Tiếp tục?`
      if (!window.confirm(msg)) return
      const r = await call(`${base}/freeze`, { method: 'POST', body: JSON.stringify({ force }) })
      toast.success(`Đã chốt ${r.winners} người nhận quà.`)
      await load()
      window.location.reload()
    })

  const checkDns = () =>
    run('dns', async () => {
      const r = (await call(`${base}/dns`)) as { results: DnsResult[] }
      setDns(r.results)
      if (!r.results.length) toast.info('Chưa khai tên miền nào ở tab "Tên miền".')
    })

  const purge = () =>
    run('purge', async () => {
      const typed = window.prompt(
        'Xoá vĩnh viễn tên, số điện thoại, triệu chứng và toàn bộ file ghi âm của chiến dịch này. Số liệu tổng hợp vẫn giữ. KHÔNG hoàn tác được.\n\nGõ mã chiến dịch (slug) để xác nhận:',
      )
      if (!typed) return
      const r = await call(`${base}/purge`, { method: 'POST', body: JSON.stringify({ confirm: typed.trim() }) })
      toast.success(`Đã ẩn danh ${r.anonymized} người tham gia.`)
      window.location.reload()
    })

  const revalidate = () =>
    run('revalidate', async () => {
      await call(`${base}/revalidate`, { method: 'POST' })
      toast.success('Đã yêu cầu làm mới landing.')
    })

  return (
    <div>
      <div style={box}>
        <strong style={{ fontSize: 13 }}>Tổng quan</strong>
        {stats ? (
          <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 13, lineHeight: 1.7 }}>
            {stats.round && (
              <>
                <li>
                  <b>Đợt {stats.round.label}</b> — {ROUND_STATUS[stats.round.status]}
                </li>
                <li>
                  Chốt {fmt(stats.round.endAt)} · công bố {fmt(stats.round.announceAt)}
                </li>
                <li>{stats.round.participants} người dự đợt này</li>
              </>
            )}
            <li>{stats.participants} người tham gia (mọi đợt)</li>
            <li>
              {stats.pendingRecordings} bản ghi âm chờ nghe{' '}
              {stats.pendingRecordings > 0 && <a href="/admin/collections/lp-recordings?where[status][equals]=pending">→ duyệt</a>}
            </li>
            <li>
              {stats.newOrders} đơn chưa gọi xác nhận{' '}
              {stats.newOrders > 0 && <a href="/admin/collections/lp-orders?where[status][equals]=new">→ xem</a>}
            </li>
            <li>
              {stats.round?.status === 'open'
                ? `Chưa chốt đợt này (${stats.slots} suất)`
                : `${stats.winners}/${stats.slots} người nhận quà (đã chốt)`}
            </li>
          </ul>
        ) : (
          <p style={{ margin: '8px 0 0', fontSize: 13 }}>Đang tải…</p>
        )}
      </div>

      <div style={box}>
        <strong style={{ fontSize: 13 }}>Thao tác</strong>
        <button type="button" style={btn} onClick={checkDns} disabled={!!busy}>
          {busy === 'dns' ? 'Đang kiểm tra…' : 'Kiểm tra DNS tên miền'}
        </button>
        {dns && (
          <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 12, lineHeight: 1.6 }}>
            {dns.map((d) => (
              <li key={d.host} style={{ color: d.ok === false ? 'var(--theme-error-600, #b42318)' : undefined }}>
                <b>{d.host}</b>: {d.message}
              </li>
            ))}
          </ul>
        )}
        <a style={{ ...btn, textDecoration: 'none' }} href={`${base}/export?type=participants`}>
          Xuất CSV người tham gia
        </a>
        <a style={{ ...btn, textDecoration: 'none' }} href={`${base}/export?type=orders`}>
          Xuất CSV đơn hàng
        </a>
        <button type="button" style={btn} onClick={revalidate} disabled={!!busy}>
          Làm mới trang landing ngay
        </button>
        <button type="button" style={btn} onClick={() => freeze(Boolean(stats?.round && stats.round.status !== 'open'))} disabled={!!busy}>
          {busy === 'freeze'
            ? 'Đang chốt…'
            : stats?.round && stats.round.status !== 'open'
              ? 'Chốt lại danh sách nhận quà'
              : 'Chốt danh sách nhận quà ngay'}
        </button>
        <button type="button" style={danger} onClick={purge} disabled={!!busy || Boolean(stats?.piiPurgedAt)}>
          {stats?.piiPurgedAt ? 'Đã xoá dữ liệu cá nhân' : 'Xoá dữ liệu cá nhân của chiến dịch'}
        </button>
      </div>
    </div>
  )
}
