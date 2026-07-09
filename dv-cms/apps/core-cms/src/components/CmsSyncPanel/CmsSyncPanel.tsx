'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

// ---------------------------------------------------------------------------
// Types — Drive Sync Job
// ---------------------------------------------------------------------------

type DriveJobStatus =
  | 'queued'
  | 'running'
  | 'crawling'
  | 'upserting'
  | 'done'
  | 'error'
  | 'cancelled'

type JobTotals = {
  categories: { found: number; created: number; updated: number; skipped: number }
  ingredients: { found: number; created: number; updated: number; skipped: number }
  errors: number
}

type JobLog = {
  ts: string
  level: 'info' | 'warn' | 'error'
  message: string
  data?: Record<string, unknown>
}

type DriveJob = {
  id: string
  status: DriveJobStatus
  phase: string
  totalItems: number
  processedItems: number
  totals?: JobTotals
  logs?: JobLog[]
  createdAt: string
  startedAt?: string
  finishedAt?: string
  errorMessage?: string
  rootFolderId?: string
}

interface DriveSyncResult {
  ok: boolean
  message?: string
  jobId?: string
  error?: string
}

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<DriveJobStatus, string> = {
  queued: 'Đã xếp',
  running: 'Đang chạy',
  crawling: 'Crawl Drive',
  upserting: 'Đang ghi DB',
  done: 'Hoàn tất',
  error: 'Lỗi',
  cancelled: 'Hủy',
}

const STATUS_COLORS: Record<DriveJobStatus, string> = {
  queued: '#888',
  running: '#e67e22',
  crawling: '#3498db',
  upserting: '#9b59b6',
  done: '#27ae60',
  error: '#c0392b',
  cancelled: '#95a5a6',
}

const StatusBadge: React.FC<{ status: DriveJobStatus }> = ({ status }) => (
  <span
    style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 12,
      fontSize: 12,
      fontWeight: 600,
      background: STATUS_COLORS[status] + '22',
      color: STATUS_COLORS[status],
    }}
  >
    {STATUS_LABELS[status]}
  </span>
)

// ---------------------------------------------------------------------------
// Progress bar component
// ---------------------------------------------------------------------------

const ProgressBar: React.FC<{ value: number; total: number; color?: string }> = ({
  value,
  total,
  color = '#3498db',
}) => {
  const pct = total > 0 ? Math.min(100, (value / total) * 100) : 0
  return (
    <div
      style={{
        height: 6,
        borderRadius: 3,
        background: '#eee',
        overflow: 'hidden',
        marginTop: 4,
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: 3,
          transition: 'width 0.4s ease',
        }}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Job detail card
// ---------------------------------------------------------------------------

const JobCard: React.FC<{ job: DriveJob; onRefresh: () => void }> = ({ job, onRefresh }) => {
  const [expanded, setExpanded] = useState(false)
  const cats = job.totals?.categories
  const ings = job.totals?.ingredients
  const isActive = ['queued', 'running', 'crawling', 'upserting'].includes(job.status)

  return (
    <div
      style={{
        border: '1px solid var(--color-input-border)',
        borderRadius: 10,
        padding: '10px 14px',
        marginBottom: 8,
        background: 'var(--theme-elevation-0)',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <StatusBadge status={job.status} />
        <span style={{ flex: 1, fontSize: 13, color: 'var(--theme-elevation-700)' }}>
          {job.phase || '—'}
        </span>
        <span style={{ fontSize: 12, color: '#888' }}>
          {new Date(job.createdAt).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 12,
            color: '#888',
          }}
        >
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Progress bar */}
      {(cats || ings) && (
        <div style={{ marginTop: 8 }}>
          {ings && (
            <div style={{ fontSize: 12, color: '#666' }}>
              Nguyên liệu: {ings.created > 0 && `+${ings.created} `}
              {ings.updated > 0 && `~${ings.updated} `}
              {ings.skipped > 0 && `⊘${ings.skipped} `}
              {job.totals!.errors > 0 && (
                <span style={{ color: '#c22' }}>⚠ {job.totals!.errors} lỗi</span>
              )}
              <ProgressBar value={ings.created + ings.updated + ings.skipped} total={ings.found || 1} />
            </div>
          )}
          {cats && (
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              Danh mục: +{cats.created} ~{cats.updated} ⊘{cats.skipped}
            </div>
          )}
        </div>
      )}

      {/* Expanded: logs */}
      {expanded && job.logs && job.logs.length > 0 && (
        <div
          style={{
            marginTop: 10,
            padding: '8px 10px',
            background: '#f8f8f8',
            borderRadius: 6,
            maxHeight: 200,
            overflowY: 'auto',
            fontSize: 12,
            fontFamily: 'monospace',
          }}
        >
          {job.logs.slice(-20).map((log, i) => (
            <div
              key={i}
              style={{
                color:
                  log.level === 'error' ? '#c22' : log.level === 'warn' ? '#e67e22' : '#555',
                marginBottom: 2,
              }}
            >
              <span style={{ color: '#aaa' }}>
                {new Date(log.ts).toLocaleTimeString('vi-VN')}
              </span>{' '}
              {log.message}
            </div>
          ))}
        </div>
      )}

      {/* Error message */}
      {job.status === 'error' && job.errorMessage && (
        <div style={{ marginTop: 8, fontSize: 12, color: '#c22' }}>
          ❌ {job.errorMessage}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Drive Sync section
// ---------------------------------------------------------------------------

const DriveSyncSection: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [triggerResult, setTriggerResult] = useState<DriveSyncResult | null>(null)
  const [activeJobId, setActiveJobId] = useState<string | null>(null)
  const [jobs, setJobs] = useState<DriveJob[]>([])
  const [polling, setPolling] = useState(false)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stopRef = useRef(false)

  const loadJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/drive-sync/jobs?limit=10', { credentials: 'include' })
      if (res.ok) {
        const data = (await res.json()) as { ok: boolean; jobs: DriveJob[] }
        if (data.ok) {
          setJobs(data.jobs)
          // Nếu có job đang chạy, track nó
          const running = data.jobs.find((j) =>
            ['queued', 'running', 'crawling', 'upserting'].includes(j.status),
          )
          if (running) {
            setActiveJobId(running.id)
            setPolling(true)
          } else {
            setPolling(false)
            setActiveJobId(null)
          }
        }
      }
    } catch {
      // non-fatal
    }
  }, [])

  // Load jobs on mount
  useEffect(() => {
    void loadJobs()
  }, [loadJobs])

  // Poll khi có job đang chạy
  useEffect(() => {
    if (!polling) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
      return
    }
    pollingRef.current = setInterval(() => {
      if (stopRef.current) return
      void loadJobs()
    }, 3000)
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [polling, loadJobs])

  // Stop polling on unmount
  useEffect(() => {
    return () => {
      stopRef.current = true
    }
  }, [])

  const handleTrigger = async () => {
    if (loading) return
    setLoading(true)
    setTriggerResult(null)
    try {
      const res = await fetch('/api/drive-sync', {
        method: 'POST',
        credentials: 'include',
      })
      const data = (await res.json()) as DriveSyncResult
      setTriggerResult(data)
      if (data.ok && data.jobId) {
        setActiveJobId(data.jobId)
        setPolling(true)
        void loadJobs()
      }
    } catch (err) {
      setTriggerResult({ ok: false, error: (err as Error)?.message ?? 'Lỗi kết nối.' })
    } finally {
      setLoading(false)
    }
  }

  const activeJob = jobs.find((j) => j.id === activeJobId)

  return (
    <div>
      {/* Header + Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <h3
            style={{ fontSize: 15, fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            📁 Google Drive Sync
            {polling && <span style={{ fontSize: 11, color: '#888', fontWeight: 400 }}>● Đang đồng bộ</span>}
          </h3>
          <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>
            Đọc folder structure từ Drive → Tự động tạo categories &amp; ingredients. Theo dõi tiến trình real-time.
          </p>
        </div>
        <button
          type="button"
          className="btn btn--style-primary btn--size-medium"
          onClick={handleTrigger}
          disabled={loading}
          style={{ opacity: loading ? 0.7 : 1, whiteSpace: 'nowrap' }}
        >
          {loading ? '⏳ Đang khởi tạo…' : '🚀 Bắt đầu Sync'}
        </button>
      </div>

      {/* Trigger result */}
      {triggerResult && (
        <div
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            fontSize: 13,
            marginBottom: 12,
            background: triggerResult.ok ? 'rgba(0,142,77,0.08)' : 'rgba(200,40,40,0.08)',
            border: `1px solid ${triggerResult.ok ? 'rgba(0,142,77,0.22)' : 'rgba(200,40,40,0.25)'}`,
            color: triggerResult.ok ? 'var(--dv-primary)' : '#c22',
          }}
        >
          {triggerResult.ok ? `✅ ${triggerResult.message}` : `❌ ${triggerResult.error}`}
        </div>
      )}

      {/* Active job card */}
      {activeJob && (
        <div style={{ marginBottom: 16 }}>
          <JobCard job={activeJob} onRefresh={() => void loadJobs()} />
        </div>
      )}

      {/* Jobs history */}
      {jobs.length > 0 && (
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 600, margin: '0 0 8px' }}>Lịch sử gần đây</h4>
          {jobs
            .filter((j) => j.id !== activeJobId)
            .slice(0, 5)
            .map((job) => (
              <JobCard key={job.id} job={job} onRefresh={() => void loadJobs()} />
            ))}
        </div>
      )}

      {jobs.length === 0 && !loading && (
        <p style={{ color: '#888', fontSize: 13 }}>Chưa có lần sync nào. Bấm "Bắt đầu Sync" để chạy.</p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// CSV Import section
// ---------------------------------------------------------------------------

const CsvImportSection: React.FC = () => {
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [result, setResult] = useState<DriveSyncResult | null>(null)
  const [activeJobId, setActiveJobId] = useState<string | null>(null)
  const [jobs, setJobs] = useState<DriveJob[]>([])
  const [polling, setPolling] = useState(false)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/drive-sync/jobs?limit=10', { credentials: 'include' })
      if (res.ok) {
        const data = (await res.json()) as { ok: boolean; jobs: DriveJob[] }
        if (data.ok) {
          setJobs(data.jobs)
          const csvJobs = data.jobs.filter((j) => (j.rootFolderId ?? '').includes('csv') || !j.rootFolderId)
          const running = csvJobs.find((j) =>
            ['queued', 'running', 'crawling', 'upserting'].includes(j.status),
          )
          if (running) {
            setActiveJobId(running.id)
            setPolling(true)
          } else {
            setPolling(false)
          }
        }
      }
    } catch { /* non-fatal */ }
  }, [])

  useEffect(() => {
    void loadJobs()
  }, [loadJobs])

  useEffect(() => {
    if (!polling) {
      if (pollingRef.current) clearInterval(pollingRef.current)
      return
    }
    pollingRef.current = setInterval(() => { void loadJobs() }, 3000)
    return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
  }, [polling, loadJobs])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setUploading(true)
    setResult(null)

    try {
      const csvText = await file.text()
      const csvBase64 = btoa(unescape(encodeURIComponent(csvText)))

      const res = await fetch('/api/csv-import', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent: csvBase64 }),
      })
      const data = (await res.json()) as DriveSyncResult
      setResult(data)
      if (data.ok && data.jobId) {
        setActiveJobId(data.jobId)
        setPolling(true)
        void loadJobs()
      }
    } catch (err) {
      setResult({ ok: false, error: (err as Error)?.message ?? 'Lỗi kết nối.' })
    } finally {
      setUploading(false)
    }

    // Reset file input
    e.target.value = ''
  }

  const activeJob = jobs.find((j) => j.id === activeJobId)
  const csvJobs = jobs.filter(
    (j) =>
      j.rootFolderId === 'csv-import' ||
      j.rootFolderId === 'csv-import-tracked',
  )

  return (
    <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--color-input-border)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            📄 Import từ CSV
            {polling && <span style={{ fontSize: 11, color: '#888', fontWeight: 400 }}>● Đang xử lý</span>}
          </h3>
          <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>
            Upload file CSV (danh_sach_san_pham.csv) để import ingredients &amp; categories. Tự động detect trùng lặp theo driveId.
          </p>
        </div>
      </div>

      {/* File input */}
      <label
        htmlFor="csv-upload-input"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 14px',
          borderRadius: 8,
          border: '1px solid var(--color-input-border)',
          cursor: 'pointer',
          fontSize: 13,
          background: 'var(--theme-elevation-0)',
          color: uploading ? '#888' : 'var(--dv-primary)',
          opacity: uploading ? 0.7 : 1,
        }}
      >
        {uploading ? '⏳ Đang upload...' : '📁 Chọn file CSV...'}
        <input
          id="csv-upload-input"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={uploading}
          style={{ display: 'none' }}
        />
      </label>

      {fileName && (
        <span style={{ fontSize: 12, color: '#888', marginLeft: 8 }}>
          {fileName}
        </span>
      )}

      {/* Result */}
      {result && (
        <div
          style={{
            marginTop: 10,
            padding: '8px 12px',
            borderRadius: 8,
            fontSize: 13,
            background: result.ok ? 'rgba(0,142,77,0.08)' : 'rgba(200,40,40,0.08)',
            border: `1px solid ${result.ok ? 'rgba(0,142,77,0.22)' : 'rgba(200,40,40,0.25)'}`,
            color: result.ok ? 'var(--dv-primary)' : '#c22',
          }}
        >
          {result.ok ? `✅ ${result.message}` : `❌ ${result.error}`}
        </div>
      )}

      {/* Active job */}
      {activeJob && (
        <div style={{ marginTop: 12 }}>
          <JobCard job={activeJob} onRefresh={() => void loadJobs()} />
        </div>
      )}

      {/* CSV history */}
      {csvJobs.length > 0 && !activeJob && (
        <div style={{ marginTop: 8 }}>
          <h4 style={{ fontSize: 12, fontWeight: 600, margin: '0 0 6px', color: '#666' }}>
            Lịch sử import CSV gần đây
          </h4>
          {csvJobs.slice(0, 3).map((job) => (
            <JobCard key={job.id} job={job} onRefresh={() => void loadJobs()} />
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main CmsSyncPanel
// ---------------------------------------------------------------------------

export const CmsSyncPanel: React.FC = () => {
  return (
    <div className="card dv-dashboard-seed">
      <CsvImportSection />
      <DriveSyncSection />
    </div>
  )
}

export default CmsSyncPanel
