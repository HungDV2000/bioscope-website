'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

// ---------------------------------------------------------------------------
// Types (khớp với endpoints/duplicateScan.ts)
// ---------------------------------------------------------------------------

type Label = { en: string; vi: string }
type Field = { path: string; label: Label; localized: boolean }
type Coll = { slug: string; label: Label; nameField: Field; extraFields: Field[] }

type NormalizeOpts = {
  stripNumericPrefix: boolean
  stripOriginSuffix: boolean
  stripTrademark: boolean
  removeDiacritics: boolean
  stripPunctuation: boolean
}

type Status = 'queued' | 'running' | 'done' | 'error' | 'cancelled'

type DupGroup = {
  kind: 'exact' | 'fuzzy' | 'field'
  field: string
  key: string
  score?: number
  items: { id: string | number; name: string; slug?: string | null }[]
}

type Run = {
  id: string | number
  targetCollection: string
  targetLabel?: string
  status: Status
  phase?: string
  groupsFound?: number
  docsScanned?: number
  docsInGroups?: number
  results?: DupGroup[]
  logs?: { ts: string; level: string; message: string }[]
  errorMessage?: string
  createdAt?: string
  startedAt?: string
  finishedAt?: string
}

// ---------------------------------------------------------------------------
// Style
// ---------------------------------------------------------------------------

const CARD: React.CSSProperties = {
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 10,
  padding: 18,
  marginBottom: 18,
  background: 'var(--theme-elevation-0)',
}
const H: React.CSSProperties = { fontSize: 14, fontWeight: 700, margin: '0 0 12px' }
const HINT: React.CSSProperties = { fontSize: 12, color: 'var(--theme-elevation-600)', margin: '4px 0 0' }
const ROW: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }

const STATUS_COLOR: Record<Status, string> = {
  queued: '#888',
  running: '#e67e22',
  done: '#27ae60',
  error: '#c0392b',
  cancelled: '#95a5a6',
}
const STATUS_LABEL: Record<Status, string> = {
  queued: 'Đang xếp hàng',
  running: 'Đang chạy',
  done: 'Hoàn tất',
  error: 'Lỗi',
  cancelled: 'Đã huỷ',
}

const KIND_LABEL: Record<DupGroup['kind'], string> = {
  exact: 'Trùng khít',
  field: 'Trùng mã',
  fuzzy: 'Gần giống',
}
const KIND_COLOR: Record<DupGroup['kind'], string> = {
  exact: '#c0392b',
  field: '#8e44ad',
  fuzzy: '#e67e22',
}

const Check: React.FC<{
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  hint?: string
}> = ({ checked, onChange, label, hint }) => (
  <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, cursor: 'pointer', maxWidth: 330 }}>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      style={{ marginTop: 2 }}
    />
    <span>
      {label}
      {hint && <span style={{ display: 'block', ...HINT }}>{hint}</span>}
    </span>
  </label>
)

// ---------------------------------------------------------------------------
// View
// ---------------------------------------------------------------------------

export const DuplicateScanView: React.FC = () => {
  const [colls, setColls] = useState<Coll[]>([])
  const [target, setTarget] = useState('ingredients')
  const [locale, setLocale] = useState<'vi' | 'en'>('vi')
  const [includeDrafts, setIncludeDrafts] = useState(true)
  const [extraFields, setExtraFields] = useState<string[]>([])
  const [norm, setNorm] = useState<NormalizeOpts>({
    stripNumericPrefix: true,
    stripOriginSuffix: true,
    stripTrademark: true,
    removeDiacritics: true,
    stripPunctuation: true,
  })
  const [fuzzy, setFuzzy] = useState(false)
  const [threshold, setThreshold] = useState(0.9)
  const [digitGuard, setDigitGuard] = useState(true)
  const [maxGroups, setMaxGroups] = useState(300)
  const [advanced, setAdvanced] = useState(false)

  const [run, setRun] = useState<Run | null>(null)
  const [history, setHistory] = useState<Run[]>([])
  const [error, setError] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const current = colls.find((c) => c.slug === target)

  // ── tải cấu hình + lịch sử ────────────────────────────────────────────
  useEffect(() => {
    void (async () => {
      try {
        const r = await fetch('/api/duplicate-scan/options', { credentials: 'include' })
        const d = await r.json()
        if (d.ok) setColls(d.collections)
      } catch {
        /* bỏ qua */
      }
    })()
  }, [])

  const loadHistory = useCallback(async () => {
    try {
      const r = await fetch('/api/duplicate-scan/runs?limit=15', { credentials: 'include' })
      const d = await r.json()
      if (d.ok) setHistory(d.runs)
    } catch {
      /* bỏ qua */
    }
  }, [])

  useEffect(() => {
    void loadHistory()
  }, [loadHistory])

  const stopPoll = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])
  useEffect(() => () => stopPoll(), [stopPoll])

  const poll = useCallback(
    async (id: string) => {
      try {
        const r = await fetch(`/api/duplicate-scan/runs/${id}`, { credentials: 'include' })
        const d = await r.json()
        if (!d.ok) return
        setRun(d.run)
        if (['done', 'error', 'cancelled'].includes(d.run.status)) {
          stopPoll()
          void loadHistory()
        }
      } catch {
        /* bỏ qua */
      }
    },
    [stopPoll, loadHistory],
  )

  const openRun = useCallback(
    async (id: string | number) => {
      stopPoll()
      setError(null)
      await poll(String(id))
    },
    [poll, stopPoll],
  )

  const start = async () => {
    setError(null)
    setStarting(true)
    setRun(null)
    try {
      const res = await fetch('/api/duplicate-scan', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetCollection: target,
          locale,
          includeDrafts,
          extraFields,
          normalize: norm,
          fuzzy,
          threshold,
          digitGuard,
          maxGroups,
        }),
      })
      const d = await res.json()
      if (!d.ok) {
        setError(d.error ?? 'Không bắt đầu được.')
        if (d.jobId) void poll(String(d.jobId))
        return
      }
      pollRef.current = setInterval(() => void poll(String(d.jobId)), 1500)
      void poll(String(d.jobId))
    } catch (e) {
      setError((e as Error)?.message ?? 'Lỗi kết nối.')
    } finally {
      setStarting(false)
    }
  }

  const busy = run?.status === 'running' || run?.status === 'queued'
  const groups = run?.results ?? []

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1100 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>Kiểm tra trùng lặp</h1>
      <p style={{ ...HINT, marginBottom: 20 }}>
        Tìm các bản ghi có thể là trùng lặp. Kết quả chỉ để rà soát — công cụ không xoá hay gộp gì cả.
      </p>

      {/* ── Cấu hình ─────────────────────────────────────────────────── */}
      <div style={CARD}>
        <h2 style={H}>1 · Chọn loại nội dung</h2>
        <div style={ROW}>
          <select
            value={target}
            onChange={(e) => {
              setTarget(e.target.value)
              setExtraFields([])
            }}
            disabled={busy}
            style={{ padding: '7px 10px', minWidth: 220, fontSize: 13 }}
          >
            {colls.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label.vi}
              </option>
            ))}
          </select>

          <label style={{ fontSize: 13 }}>
            Ngôn ngữ{' '}
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as 'vi' | 'en')}
              disabled={busy}
              style={{ padding: '6px 8px', fontSize: 13 }}
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </label>

          <Check checked={includeDrafts} onChange={setIncludeDrafts} label="Gồm cả bản nháp" />
        </div>
      </div>

      <div style={CARD}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ ...H, marginBottom: 0 }}>2 · Cấu hình nâng cao</h2>
          <button
            type="button"
            onClick={() => setAdvanced((v) => !v)}
            className="btn btn--style-secondary btn--size-small"
            style={{ margin: 0 }}
          >
            {advanced ? 'Thu gọn' : 'Mở rộng'}
          </button>
        </div>

        {!advanced && (
          <p style={{ ...HINT, marginTop: 10 }}>
            Đang dùng cấu hình mặc định: bóc hết tiền tố/hậu tố/dấu, so khớp chính xác. Đây là cấu hình
            khuyến nghị cho lần quét đầu.
          </p>
        )}

        {advanced && (
          <div style={{ marginTop: 14 }}>
            <p style={{ fontSize: 12.5, fontWeight: 600, margin: '0 0 8px' }}>
              Chuẩn hoá tên trước khi so sánh
            </p>
            <p style={{ ...HINT, margin: '0 0 10px' }}>
              Tên trong CMS mang nhiều phần không thuộc về sản phẩm. Bóc chúng ra thì
              &ldquo;1. Đường Erythritol - TQ(TM)&rdquo; và &ldquo;Đường Erythritol - Trung Quốc&rdquo; mới nhận ra
              là một.
            </p>
            <div style={{ ...ROW, gap: 18, marginBottom: 18 }}>
              <Check
                checked={norm.stripNumericPrefix}
                onChange={(v) => setNorm({ ...norm, stripNumericPrefix: v })}
                label="Bỏ tiền tố số / ngày"
                hint='"019.001 ", "1. ", "24.04.19 "'
              />
              <Check
                checked={norm.stripOriginSuffix}
                onChange={(v) => setNorm({ ...norm, stripOriginSuffix: v })}
                label="Bỏ hậu tố xuất xứ"
                hint='"- TQ", "- Nhật Bản", "- Đức"'
              />
              <Check
                checked={norm.stripTrademark}
                onChange={(v) => setNorm({ ...norm, stripTrademark: v })}
                label="Bỏ nhãn thương hiệu"
                hint='"(TM)", "™", "®"'
              />
              <Check
                checked={norm.removeDiacritics}
                onChange={(v) => setNorm({ ...norm, removeDiacritics: v })}
                label="Bỏ dấu tiếng Việt"
                hint="bắt được trường hợp gõ thiếu dấu"
              />
              <Check
                checked={norm.stripPunctuation}
                onChange={(v) => setNorm({ ...norm, stripPunctuation: v })}
                label="Bỏ dấu câu"
                hint='"Sắt(III)" = "Sắt (III)"'
              />
            </div>

            {current && current.extraFields.length > 0 && (
              <>
                <p style={{ fontSize: 12.5, fontWeight: 600, margin: '0 0 8px' }}>
                  Đối chiếu thêm theo trường định danh
                </p>
                <div style={{ ...ROW, gap: 18, marginBottom: 18 }}>
                  {current.extraFields.map((f) => (
                    <Check
                      key={f.path}
                      checked={extraFields.includes(f.path)}
                      onChange={(v) =>
                        setExtraFields((prev) => (v ? [...prev, f.path] : prev.filter((p) => p !== f.path)))
                      }
                      label={f.label.vi}
                      hint={f.path === 'technical.casNumber' ? 'cùng mã CAS = cùng hoạt chất' : undefined}
                    />
                  ))}
                </div>
              </>
            )}

            <p style={{ fontSize: 12.5, fontWeight: 600, margin: '0 0 8px' }}>So khớp gần đúng</p>
            <div style={{ ...ROW, gap: 18 }}>
              <Check
                checked={fuzzy}
                onChange={setFuzzy}
                label="Bật so khớp gần đúng"
                hint="bắt lỗi gõ, thiếu/thừa từ — chậm hơn và có thể báo nhầm"
              />
              {fuzzy && (
                <>
                  <label style={{ fontSize: 13 }}>
                    Ngưỡng giống nhau: <strong>{Math.round(threshold * 100)}%</strong>
                    <input
                      type="range"
                      min={60}
                      max={99}
                      value={Math.round(threshold * 100)}
                      onChange={(e) => setThreshold(Number(e.target.value) / 100)}
                      style={{ display: 'block', width: 220, marginTop: 4 }}
                    />
                  </label>
                  <Check
                    checked={digitGuard}
                    onChange={setDigitGuard}
                    label="Không ghép khi khác số"
                    hint="B1 ≠ B12, 30% ≠ 34% — nên bật, cắt được hơn nửa số báo nhầm"
                  />
                </>
              )}
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={{ fontSize: 13 }}>
                Giới hạn số nhóm hiển thị{' '}
                <input
                  type="number"
                  min={10}
                  max={2000}
                  value={maxGroups}
                  onChange={(e) => setMaxGroups(Number(e.target.value))}
                  style={{ width: 90, padding: '5px 8px', fontSize: 13 }}
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* ── Chạy ─────────────────────────────────────────────────────── */}
      <div style={CARD}>
        <h2 style={H}>3 · Thực hiện</h2>
        <div style={ROW}>
          <button
            type="button"
            className="btn btn--style-primary btn--size-medium"
            onClick={() => void start()}
            disabled={busy || starting || !colls.length}
            style={{ margin: 0 }}
          >
            {busy ? 'Đang chạy…' : starting ? 'Đang gửi…' : '▶ Bắt đầu kiểm tra'}
          </button>
          {run && (
            <span style={{ fontSize: 13 }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '2px 10px',
                  borderRadius: 12,
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: '#fff',
                  background: STATUS_COLOR[run.status],
                  marginRight: 8,
                }}
              >
                {STATUS_LABEL[run.status]}
              </span>
              {run.phase}
            </span>
          )}
        </div>

        {error && (
          <p style={{ marginTop: 12, fontSize: 13, color: '#c0392b' }}>⚠ {error}</p>
        )}
        {run?.errorMessage && (
          <p style={{ marginTop: 12, fontSize: 13, color: '#c0392b' }}>❌ {run.errorMessage}</p>
        )}

        {run?.status === 'done' && (
          <p style={{ ...HINT, marginTop: 12 }}>
            Đã quét <strong>{run.docsScanned ?? 0}</strong> bản ghi · tìm thấy{' '}
            <strong>{run.groupsFound ?? 0}</strong> nhóm trùng ·{' '}
            <strong>{run.docsInGroups ?? 0}</strong> bản ghi liên quan
          </p>
        )}
      </div>

      {/* ── Kết quả ──────────────────────────────────────────────────── */}
      {run?.status === 'done' && (
        <div style={CARD}>
          <h2 style={H}>Kết quả</h2>
          {!groups.length && <p style={HINT}>Không tìm thấy nhóm trùng lặp nào với cấu hình này.</p>}
          {groups.map((g, i) => (
            <div
              key={i}
              style={{
                border: '1px solid var(--theme-elevation-150)',
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 10,
              }}
            >
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                <span
                  style={{
                    padding: '1px 8px',
                    borderRadius: 10,
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#fff',
                    background: KIND_COLOR[g.kind],
                  }}
                >
                  {KIND_LABEL[g.kind]}
                </span>
                <span style={{ fontSize: 12, color: 'var(--theme-elevation-600)' }}>
                  {g.items.length} bản ghi
                  {g.score != null && ` · giống ${Math.round(g.score * 100)}%`}
                  {g.kind === 'field' && ` · ${g.field}`}
                </span>
                <code style={{ fontSize: 11.5, color: 'var(--theme-elevation-500)' }}>{g.key}</code>
              </div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {g.items.map((it) => (
                  <li key={String(it.id)} style={{ fontSize: 13, marginBottom: 3 }}>
                    <a
                      href={`/admin/collections/${run.targetCollection}/${it.id}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ textDecoration: 'underline' }}
                    >
                      {it.name}
                    </a>
                    {it.slug && (
                      <span style={{ fontSize: 11.5, color: 'var(--theme-elevation-500)' }}> · {it.slug}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* ── Nhật ký ──────────────────────────────────────────────────── */}
      {run?.logs && run.logs.length > 0 && (
        <div style={CARD}>
          <h2 style={H}>Nhật ký</h2>
          <pre
            style={{
              fontSize: 11.5,
              lineHeight: 1.6,
              margin: 0,
              maxHeight: 220,
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              background: 'var(--theme-elevation-50)',
              padding: 10,
              borderRadius: 6,
            }}
          >
            {run.logs
              .map((l) => `${new Date(l.ts).toLocaleTimeString('vi-VN')}  ${l.level.toUpperCase().padEnd(5)} ${l.message}`)
              .join('\n')}
          </pre>
        </div>
      )}

      {/* ── Lịch sử ──────────────────────────────────────────────────── */}
      <div style={CARD}>
        <h2 style={H}>Lịch sử</h2>
        {!history.length && <p style={HINT}>Chưa có lần quét nào.</p>}
        {history.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--theme-elevation-600)', fontSize: 12 }}>
                <th style={{ padding: '6px 4px' }}>Thời điểm</th>
                <th style={{ padding: '6px 4px' }}>Loại nội dung</th>
                <th style={{ padding: '6px 4px' }}>Trạng thái</th>
                <th style={{ padding: '6px 4px' }}>Nhóm trùng</th>
                <th style={{ padding: '6px 4px' }} />
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={String(h.id)} style={{ borderTop: '1px solid var(--theme-elevation-100)' }}>
                  <td style={{ padding: '6px 4px' }}>
                    {h.createdAt ? new Date(h.createdAt).toLocaleString('vi-VN') : '—'}
                  </td>
                  <td style={{ padding: '6px 4px' }}>{h.targetLabel ?? h.targetCollection}</td>
                  <td style={{ padding: '6px 4px', color: STATUS_COLOR[h.status] }}>
                    {STATUS_LABEL[h.status]}
                  </td>
                  <td style={{ padding: '6px 4px' }}>{h.groupsFound ?? '—'}</td>
                  <td style={{ padding: '6px 4px' }}>
                    <button
                      type="button"
                      className="btn btn--style-secondary btn--size-small"
                      style={{ margin: 0 }}
                      onClick={() => void openRun(h.id)}
                    >
                      Xem
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default DuplicateScanView
