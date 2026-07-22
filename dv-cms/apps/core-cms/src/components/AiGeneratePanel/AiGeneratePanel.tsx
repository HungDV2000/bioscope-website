'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AiGenerateStatus =
  | 'queued'
  | 'downloading'
  | 'extracting'
  | 'generating_content'
  | 'generating_image'
  | 'saving'
  | 'done'
  | 'error'
  | 'cancelled'

type AiGenerateJob = {
  id: string
  status: AiGenerateStatus
  phase: string
  ingredientId: string
  ingredientName: string
  locale: string
  result?: AiGenerateResult
  errorMessage?: string
  createdAt: string
  startedAt?: string
  finishedAt?: string
}

type AiGenerateResult = {
  subtitle?: { vi: string; en: string }
  description?: { vi: string; en: string }
  benefits?: string[]
  applications?: string[]
  badges?: string[]
  // Localized since the "hồ sơ nguyên liệu" prompt rewrite. Jobs generated
  // before that stored a plain string, and job records persist — accept both.
  suggestedDosage?: string | { vi?: string; en?: string }
  imagePrompt?: { vi: string; en: string }
  featuredImage?: { id: string | number; url: string }
  metadata?: {
    filesProcessed: number
    filesSkipped?: number
    modelUsed: string
    imageGenerated: boolean
    locale: string
    fileTypes?: Record<string, number>
    errors?: string[]
  }
}

type TriggerResult = { ok: boolean; jobId?: string; error?: string }

type Ingredient = {
  id: string
  name: string
  type?: string
  driveFiles?: unknown[]
  _status?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<AiGenerateStatus, string> = {
  queued: 'Xếp hàng',
  downloading: 'Tải file',
  extracting: 'Trích xuất',
  generating_content: 'Sinh nội dung',
  generating_image: 'Sinh ảnh',
  saving: 'Lưu',
  done: 'Hoàn tất',
  error: 'Lỗi',
  cancelled: 'Hủy',
}

const STATUS_COLORS: Record<AiGenerateStatus, string> = {
  queued: '#888',
  downloading: '#3498db',
  extracting: '#9b59b6',
  generating_content: '#e67e22',
  generating_image: '#f39c12',
  saving: '#16a085',
  done: '#27ae60',
  error: '#c0392b',
  cancelled: '#95a5a6',
}

const CARD_STYLE: React.CSSProperties = {
  marginBottom: 24,
  paddingBottom: 24,
  borderBottom: '1px solid var(--color-input-border)',
}
/**
 * `suggestedDosage` is `{vi,en}` for jobs generated after the dossier prompt
 * rewrite, and a plain string for older job records still in the database.
 * Render whichever shape we get — an object reaching JSX would throw.
 */
function resolveDosage(v?: string | { vi?: string; en?: string }): string {
  if (!v) return ''
  if (typeof v === 'string') return v
  return (v.vi || v.en || '').trim()
}

const SECTION_STYLE: React.CSSProperties = {
  marginBottom: 14,
  padding: '10px 14px',
  borderRadius: 8,
  background: 'var(--theme-elevation-0)',
  border: '1px solid var(--color-input-border)',
}

// ---------------------------------------------------------------------------
// Mini Modal — for selecting ingredient + viewing result
// ---------------------------------------------------------------------------

const MODAL_STYLE: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 9999,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(0,0,0,0.5)',
}
const MODAL_CONTENT: React.CSSProperties = {
  background: 'var(--theme-elevation-100, #fff)',
  borderRadius: 12, padding: 24,
  maxWidth: 700, width: '92vw', maxHeight: '88vh',
  overflowY: 'auto',
  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
}

interface MiniModalProps {
  onClose: () => void
}

const MiniModal: React.FC<MiniModalProps> = ({ onClose }) => {
  const [step, setStep] = useState<'select' | 'generating' | 'preview'>('select')
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [selectedName, setSelectedName] = useState<string>('')
  const [locale, setLocale] = useState<'vi' | 'en'>('vi')
  const [job, setJob] = useState<AiGenerateJob | null>(null)
  const [triggerError, setTriggerError] = useState<string | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load ingredients
  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/graphql', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `query { Docs: ingredients(limit: 200, where: { driveFiles: { exists: true } }) { docs { id name type _status driveFiles { ... on JSON { } } } } }`,
          }),
        })
        const data = await res.json()
        if (data?.data?.Docs?.docs) {
          setIngredients(data.data.Docs.docs)
        }
      } catch { /* ignore */ }
    })()
  }, [])

  const stopPolling = useCallback(() => {
    if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null }
  }, [])

  useEffect(() => () => stopPolling(), [stopPolling])

  const pollJob = useCallback(async (jobId: string) => {
    try {
      const res = await fetch(`/api/ai-generate/jobs/${jobId}`, { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json()
      if (data.ok && data.job) {
        setJob(data.job)
        const s = data.job.status
        if (s === 'done' || s === 'error' || s === 'cancelled') {
          stopPolling()
          if (s === 'done') setStep('preview')
        }
      }
    } catch { /* non-fatal */ }
  }, [stopPolling])

  const startGeneration = async () => {
    if (!selectedId) return
    setTriggerError(null)
    setStep('generating')
    setJob(null)

    try {
      const res = await fetch('/api/ai-generate', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredientId: selectedId, locale }),
      })
      const data = (await res.json()) as TriggerResult
      if (!data.ok || !data.jobId) {
        setTriggerError(data.error ?? 'Lỗi không xác định')
        setStep('select')
        return
      }
      pollingRef.current = setInterval(() => { void pollJob(data.jobId!) }, 3000)
      void pollJob(data.jobId!)
    } catch (err) {
      setTriggerError((err as Error)?.message ?? 'Lỗi kết nối')
      setStep('select')
    }
  }

  const statusColor = job?.status ? STATUS_COLORS[job.status] : '#888'

  const ingredientsWithFiles = ingredients.filter(
    (ing) => Array.isArray(ing.driveFiles) && ing.driveFiles.length > 0,
  )

  return (
    <>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .ai-gen-modal pre { white-space: pre-wrap; word-break: break-word; font-size: 12px; background: #f5f5f5; padding: 8px; border-radius: 6px; max-height: 180px; overflow-y: auto; }
        .ai-gen-modal .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; background: #e0e0e0; margin: 2px; }
      `}</style>

      <div
        className="ai-gen-modal"
        style={MODAL_STYLE}
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <div style={MODAL_CONTENT}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <span style={{ fontSize: 22 }}>🤖</span>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Tạo nội dung tự động bằng AI</h2>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#888' }}>
                Dùng GPT-4o sinh nội dung + DALL·E 3 vẽ featured image từ TDS/PDF Drive
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#aaa', padding: 4 }}
            >
              ×
            </button>
          </div>

          {/* Step: Select Ingredient */}
          {step === 'select' && (
            <>
              {/* Locale */}
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#444' }}>
                  Ngôn ngữ ưu tiên:
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['vi', 'en'] as const).map((l) => (
                    <label
                      key={l}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '5px 10px', borderRadius: 8,
                        border: `2px solid ${locale === l ? 'var(--color-primary, #3498db)' : 'var(--color-input-border, #ddd)'}`,
                        cursor: 'pointer', fontSize: 12,
                      }}
                    >
                      <input
                        type="radio" name="locale" value={l}
                        checked={locale === l}
                        onChange={() => setLocale(l)}
                        style={{ accentColor: 'var(--color-primary, #3498db)' }}
                      />
                      {l === 'vi' ? '🇻🇳 Tiếng Việt' : '🇺🇸 English'}
                    </label>
                  ))}
                </div>
              </div>

              {/* Ingredient list */}
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#444' }}>
                  Chọn nguyên liệu cần tạo nội dung:
                </p>
                <select
                  value={selectedId}
                  onChange={(e) => {
                    setSelectedId(e.target.value)
                    const ing = ingredientsWithFiles.find((i) => i.id === e.target.value)
                    setSelectedName(ing?.name ?? e.target.value)
                  }}
                  style={{
                    width: '100%', padding: '8px 10px', borderRadius: 8,
                    border: '1px solid var(--color-input-border, #ccc)',
                    fontSize: 13, background: 'var(--theme-elevation-0)',
                  }}
                >
                  <option value="">— Chọn nguyên liệu —</option>
                  {ingredientsWithFiles.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name ?? ing.id} {ing.type ? `(${ing.type})` : ''}
                      {ing._status === 'draft' ? ' · bản nháp' : ''}
                    </option>
                  ))}
                </select>
                {ingredientsWithFiles.length === 0 && (
                  <p style={{ fontSize: 12, color: '#888', marginTop: 6 }}>
                    Không tìm thấy nguyên liệu nào có Drive files. Chạy Drive Sync trước.
                  </p>
                )}
              </div>

              {/* Selected info */}
              {selectedId && (
                <div style={{ ...SECTION_STYLE, marginBottom: 12 }}>
                  <p style={{ fontSize: 12, color: '#666', margin: '0 0 4px' }}>
                    📁 Drive files sẽ được tải về làm căn cứ cho AI
                  </p>
                  <p style={{ fontSize: 12, color: '#888', margin: 0 }}>
                    🤖 GPT-4o sinh description, benefits, applications, badges, subtitle
                  </p>
                  <p style={{ fontSize: 12, color: '#888', margin: '4px 0 0' }}>
                    🎨 DALL·E 3 vẽ featured image dựa trên nội dung
                  </p>
                </div>
              )}

              {triggerError && (
                <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(200,40,40,0.08)', border: '1px solid rgba(200,40,40,0.25)', color: '#c22', fontSize: 13, marginBottom: 10 }}>
                  ❌ {triggerError}
                </div>
              )}

              <button
                type="button"
                className="btn btn--style-primary btn--size-medium"
                onClick={() => { void startGeneration() }}
                disabled={!selectedId}
                style={{ width: '100%', padding: '9px 0', fontSize: 14, opacity: selectedId ? 1 : 0.5 }}
              >
                🚀 Bắt đầu tạo nội dung
              </button>
            </>
          )}

          {/* Step: Generating */}
          {step === 'generating' && job && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', fontSize: 18 }}>⟳</span>
                <span style={{ fontWeight: 700, fontSize: 15, color: statusColor }}>
                  {STATUS_LABELS[job.status] ?? job.status}
                </span>
              </div>
              <p style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>{job.phase}</p>
              <p style={{ fontSize: 12, color: '#aaa', margin: 0 }}>
                Nguyên liệu: <strong>{selectedName}</strong>
                {job.metadata && ` · ${job.metadata.filesProcessed} file(s)${job.metadata.filesSkipped ? `, ${job.metadata.filesSkipped} bỏ qua` : ''}`}
              </p>
              <div style={{ marginTop: 16, textAlign: 'center' as const }}>
                <button
                  type="button"
                  className="btn btn--style-secondary btn--size-small"
                  onClick={onClose}
                  style={{ fontSize: 12 }}
                >
                  Đóng — tiếp tục chạy nền
                </button>
              </div>
            </div>
          )}

          {/* Step: Preview */}
          {step === 'preview' && job?.result && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 20 }}>✅</span>
                <span style={{ fontWeight: 700, fontSize: 15, color: '#27ae60' }}>
                  Nội dung đã được tạo cho "{selectedName}"!
                </span>
              </div>

              {/* Image */}
              {job.result.featuredImage && (
                <div style={{ ...SECTION_STYLE, textAlign: 'center' as const, marginBottom: 10 }}>
                  <p style={{ fontSize: 11, color: '#aaa', marginBottom: 6 }}>Featured Image — AI Generated</p>
                  <img
                    src={String(job.result.featuredImage.url)}
                    alt="Featured"
                    style={{ maxWidth: 180, maxHeight: 180, borderRadius: 8, objectFit: 'contain' as const }}
                  />
                </div>
              )}

              {/* Fields */}
              {job.result.subtitle && (
                <div style={SECTION_STYLE}>
                  <p style={{ fontSize: 11, color: '#aaa', marginBottom: 2 }}>Subtitle</p>
                  <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>
                    🇻🇳 {job.result.subtitle.vi}
                  </p>
                  <p style={{ fontSize: 12, color: '#555', marginTop: 2 }}>
                    🇺🇸 {job.result.subtitle.en}
                  </p>
                </div>
              )}

              {job.result.description && (
                <div style={SECTION_STYLE}>
                  <p style={{ fontSize: 11, color: '#aaa', marginBottom: 2 }}>Description</p>
                  <p style={{ fontSize: 13, margin: 0, lineHeight: 1.6 }}>{job.result.description.vi}</p>
                </div>
              )}

              {job.result.benefits && job.result.benefits.length > 0 && (
                <div style={SECTION_STYLE}>
                  <p style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>Benefits ({job.result.benefits.length})</p>
                  {job.result.benefits.map((b, i) => (
                    <div key={i} style={{ fontSize: 12, marginBottom: 3, display: 'flex', gap: 5 }}>
                      <span style={{ color: '#27ae60' }}>✓</span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              )}

              {job.result.applications && job.result.applications.length > 0 && (
                <div style={SECTION_STYLE}>
                  <p style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>Applications ({job.result.applications.length})</p>
                  {job.result.applications.map((a, i) => (
                    <div key={i} style={{ fontSize: 12, marginBottom: 3, display: 'flex', gap: 5 }}>
                      <span style={{ color: '#3498db' }}>▸</span>
                      <span>{a}</span>
                    </div>
                  ))}
                </div>
              )}

              {job.result.badges && job.result.badges.length > 0 && (
                <div style={SECTION_STYLE}>
                  <p style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>Badges / Certifications</p>
                  <div>
                    {job.result.badges.map((badge, i) => (
                      <span key={i} className="badge">{badge}</span>
                    ))}
                  </div>
                </div>
              )}

              {resolveDosage(job.result.suggestedDosage) && (
                <div style={SECTION_STYLE}>
                  <p style={{ fontSize: 11, color: '#aaa', marginBottom: 2 }}>Suggested Dosage</p>
                  <p style={{ fontSize: 13, margin: 0 }}>{resolveDosage(job.result.suggestedDosage)}</p>
                </div>
              )}

              <p style={{ fontSize: 11, color: '#bbb', marginTop: 10 }}>
                🤖 {job.result.metadata?.modelUsed} · {job.result.metadata?.filesProcessed} file(s){job.result.metadata?.filesSkipped ? `, ${job.result.metadata.filesSkipped} bỏ qua` : ''}
              </p>

              <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn--style-secondary btn--size-medium"
                  onClick={() => { setStep('select'); setJob(null); setSelectedId('') }}
                  style={{ padding: '7px 16px', fontSize: 13 }}
                >
                  Tạo khác
                </button>
                <button
                  type="button"
                  className="btn btn--style-primary btn--size-medium"
                  onClick={onClose}
                  style={{ padding: '7px 16px', fontSize: 13 }}
                >
                  Đóng
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {step === 'generating' && job?.status === 'error' && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(200,40,40,0.08)', border: '1px solid rgba(200,40,40,0.25)', color: '#c22', fontSize: 13 }}>
              ❌ {job.errorMessage ?? 'Lỗi không xác định'}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

export const AiGeneratePanel: React.FC = () => {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="card dv-dashboard-seed">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            🤖 AI Tạo Nội Dung Nguyên Liệu
          </h3>
          <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>
            Dùng GPT-4o + DALL·E 3 sinh nội dung tự động từ file TDS/PDF trên Google Drive.
          </p>
        </div>
      </div>

      {/* Info box */}
      <div style={{ ...SECTION_STYLE, marginBottom: 14, background: 'rgba(52,152,219,0.05)', border: '1px solid rgba(52,152,219,0.2)' }}>
        <p style={{ fontSize: 12, color: '#666', margin: '0 0 6px', fontWeight: 600 }}>
          📋 Quy trình
        </p>
        <ol style={{ fontSize: 12, color: '#888', margin: 0, paddingLeft: 16, lineHeight: 1.9 }}>
          <li>Chạy <strong>Drive Sync</strong> để đồng bộ file TDS/PDF vào nguyên liệu</li>
          <li>Chọn nguyên liệu cần tạo nội dung</li>
          <li>AI đọc file Drive → GPT-4o sinh nội dung (description, benefits, applications...)</li>
          <li>DALL·E 3 vẽ featured image phù hợp với nội dung</li>
          <li>Kết quả hiển thị để xem trước — tự động lưu vào job history</li>
        </ol>
        <p style={{ fontSize: 11, color: '#aaa', margin: '6px 0 0' }}>
          ⚠️ Cần có file TDS/PDF trên Google Drive gắn với nguyên liệu.
        </p>
      </div>

      {/* CTA */}
      <button
        type="button"
        className="btn btn--style-primary btn--size-medium"
        onClick={() => setShowModal(true)}
        style={{ width: '100%', padding: '9px 0', fontSize: 14 }}
      >
        🤖 Tạo nội dung tự động
      </button>

      {/* Modal */}
      {showModal && <MiniModal onClose={() => setShowModal(false)} />}
    </div>
  )
}

export default AiGeneratePanel
