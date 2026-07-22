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
    modelUsed: string
    imageGenerated: boolean
    locale: string
    errors?: string[]
  }
}

type TriggerResult = { ok: boolean; jobId?: string; error?: string }

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<AiGenerateStatus, string> = {
  queued: 'Đã xếp',
  downloading: 'Đang tải file',
  extracting: 'Đang trích xuất',
  generating_content: 'Đang sinh nội dung',
  generating_image: 'Đang sinh hình ảnh',
  saving: 'Đang lưu',
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

// ---------------------------------------------------------------------------
// Progress spinner
// ---------------------------------------------------------------------------

const Spinner: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', fontSize: size }}>
    ⟳
  </span>
)

// ---------------------------------------------------------------------------
// Modal component
// ---------------------------------------------------------------------------

const MODAL_STYLE: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0,0,0,0.5)',
}

const MODAL_CONTENT_STYLE: React.CSSProperties = {
  background: 'var(--theme-elevation-100, #fff)',
  borderRadius: 12,
  padding: 24,
  maxWidth: 700,
  width: '90vw',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
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
  marginBottom: 16,
  padding: '10px 14px',
  borderRadius: 8,
  background: 'var(--theme-elevation-0, #f9f9f9)',
  border: '1px solid var(--color-input-border, #ddd)',
}

interface AiGenerateModalProps {
  ingredientId: string
  ingredientName: string
  onClose: () => void
  onApply: (result: AiGenerateResult) => void
}

export const AiGenerateModal: React.FC<AiGenerateModalProps> = ({
  ingredientId,
  ingredientName,
  onClose,
  onApply,
}) => {
  const [step, setStep] = useState<'idle' | 'generating' | 'preview'>('idle')
  const [locale, setLocale] = useState<'vi' | 'en'>('vi')
  const [job, setJob] = useState<AiGenerateJob | null>(null)
  const [triggerError, setTriggerError] = useState<string | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }, [])

  useEffect(() => () => stopPolling(), [stopPolling])

  const pollJob = useCallback(async (jobId: string) => {
    try {
      const res = await fetch(`/api/ai-generate/jobs/${jobId}`, { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json()
      if (data.ok && data.job) {
        setJob(data.job)

        // Stop polling when done/error/cancelled
        const s = data.job.status
        if (s === 'done' || s === 'error' || s === 'cancelled') {
          stopPolling()
          if (s === 'done') setStep('preview')
        }
      }
    } catch {
      // non-fatal
    }
  }, [stopPolling])

  const startGeneration = async () => {
    setTriggerError(null)
    setStep('generating')
    setJob(null)

    try {
      const res = await fetch('/api/ai-generate', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredientId, locale }),
      })
      const data = (await res.json()) as TriggerResult

      if (!data.ok || !data.jobId) {
        setTriggerError(data.error ?? 'Lỗi không xác định')
        setStep('idle')
        return
      }

      // Start polling
      pollingRef.current = setInterval(() => { void pollJob(data.jobId!) }, 3000)
      void pollJob(data.jobId!)
    } catch (err) {
      setTriggerError((err as Error)?.message ?? 'Lỗi kết nối')
      setStep('idle')
    }
  }

  const handleApply = () => {
    if (job?.result) {
      onApply(job.result)
    }
    onClose()
  }

  const isGenerating = step === 'generating'
  const isDone = job?.status === 'done'
  const isError = job?.status === 'error'
  const statusColor = job?.status ? STATUS_COLORS[job.status] : '#888'

  return (
    <>
      {/* Keyframes */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .ai-gen-modal pre { white-space: pre-wrap; word-break: break-word; font-size: 12px; background: #f5f5f5; padding: 8px; border-radius: 6px; max-height: 200px; overflow-y: auto; }
        .ai-gen-modal .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; background: #e0e0e0; margin: 2px; }
      `}</style>

      <div className="ai-gen-modal" style={MODAL_STYLE} onClick={(e) => { if (e.target === e.currentTarget && !isGenerating) onClose() }}>
        <div style={MODAL_CONTENT_STYLE}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ fontSize: 24 }}>🤖</div>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Tạo nội dung tự động</h2>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: '#666' }}>
                Nguyên liệu: <strong>{ingredientName}</strong>
              </p>
            </div>
            {!isGenerating && (
              <button
                type="button"
                onClick={onClose}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888', padding: 4 }}
              >
                ×
              </button>
            )}
          </div>

          {/* Language selector */}
          {step === 'idle' && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#444' }}>
                Ngôn ngữ ưu tiên cho nội dung:
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['vi', 'en'] as const).map((l) => (
                  <label
                    key={l}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '6px 12px', borderRadius: 8,
                      border: `2px solid ${locale === l ? 'var(--color-primary, #3498db)' : 'var(--color-input-border, #ddd)'}`,
                      cursor: 'pointer', fontSize: 13,
                    }}
                  >
                    <input
                      type="radio"
                      name="locale"
                      value={l}
                      checked={locale === l}
                      onChange={() => setLocale(l)}
                      style={{ accentColor: 'var(--color-primary, #3498db)' }}
                    />
                    {l === 'vi' ? '🇻🇳 Tiếng Việt' : '🇺🇸 English'}
                  </label>
                ))}
              </div>
              <p style={{ fontSize: 12, color: '#888', marginTop: 6 }}>
                AI sẽ ưu tiên viết nội dung bằng ngôn ngữ đã chọn. Ngôn ngữ còn lại sẽ được dịch tự động.
              </p>
            </div>
          )}

          {/* Start button */}
          {step === 'idle' && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button
                type="button"
                className="btn btn--style-primary btn--size-medium"
                onClick={() => { void startGeneration() }}
                style={{ flex: 1, padding: '10px 0', fontSize: 14 }}
              >
                🚀 Bắt đầu tạo nội dung
              </button>
            </div>
          )}

          {/* Trigger error */}
          {triggerError && (
            <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(200,40,40,0.08)', border: '1px solid rgba(200,40,40,0.25)', color: '#c22', fontSize: 13, marginBottom: 12 }}>
              ❌ {triggerError}
            </div>
          )}

          {/* Progress */}
          {isGenerating && job && (
            <div style={SECTION_STYLE}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Spinner size={18} />
                <span style={{ fontWeight: 600, fontSize: 14, color: statusColor }}>
                  {STATUS_LABELS[job.status] ?? job.status}
                </span>
              </div>
              <p style={{ fontSize: 13, color: '#666', margin: '0 0 4px' }}>{job.phase}</p>
              {job.metadata && (
                <p style={{ fontSize: 12, color: '#888', margin: 0 }}>
                  📁 {job.metadata.filesProcessed} file(s) đã xử lý · {job.metadata.modelUsed}
                </p>
              )}
            </div>
          )}

          {/* Preview */}
          {step === 'preview' && job?.result && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 20 }}>✅</span>
                <span style={{ fontWeight: 700, fontSize: 15, color: '#27ae60' }}>
                  Nội dung đã được tạo!
                </span>
              </div>

              {/* Image */}
              {job.result.featuredImage && (
                <div style={{ ...SECTION_STYLE, textAlign: 'center' as const }}>
                  <p style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Featured Image</p>
                  <img
                    src={String(job.result.featuredImage.url)}
                    alt="Featured"
                    style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8, objectFit: 'contain' as const }}
                  />
                </div>
              )}

              {/* Subtitle */}
              <div style={SECTION_STYLE}>
                <p style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Subtitle</p>
                <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>🇻🇳 {job.result.subtitle?.vi}</p>
                <p style={{ fontSize: 13, fontWeight: 600, margin: '4px 0 0', color: '#555' }}>🇺🇸 {job.result.subtitle?.en}</p>
              </div>

              {/* Description */}
              {job.result.description && (
                <div style={SECTION_STYLE}>
                  <p style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Description</p>
                  <p style={{ fontSize: 13, margin: 0, lineHeight: 1.6 }}>{job.result.description.vi}</p>
                </div>
              )}

              {/* Benefits */}
              {job.result.benefits && job.result.benefits.length > 0 && (
                <div style={SECTION_STYLE}>
                  <p style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Benefits</p>
                  {job.result.benefits.map((b, i) => (
                    <div key={i} style={{ fontSize: 13, marginBottom: 4, display: 'flex', gap: 6 }}>
                      <span style={{ color: '#27ae60' }}>✓</span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Applications */}
              {job.result.applications && job.result.applications.length > 0 && (
                <div style={SECTION_STYLE}>
                  <p style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Applications</p>
                  {job.result.applications.map((a, i) => (
                    <div key={i} style={{ fontSize: 13, marginBottom: 4, display: 'flex', gap: 6 }}>
                      <span style={{ color: '#3498db' }}>▸</span>
                      <span>{a}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Badges */}
              {job.result.badges && job.result.badges.length > 0 && (
                <div style={SECTION_STYLE}>
                  <p style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Badges / Certifications</p>
                  <div>
                    {job.result.badges.map((badge, i) => (
                      <span key={i} className="badge">{badge}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Dosage */}
              {resolveDosage(job.result.suggestedDosage) && (
                <div style={SECTION_STYLE}>
                  <p style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Suggested Dosage</p>
                  <p style={{ fontSize: 13, margin: 0 }}>{resolveDosage(job.result.suggestedDosage)}</p>
                </div>
              )}

              {/* Metadata */}
              {job.result.metadata && (
                <p style={{ fontSize: 12, color: '#aaa', marginTop: 8 }}>
                  🤖 {job.result.metadata.modelUsed} · {job.result.metadata.filesProcessed} file(s) · Image: {job.result.metadata.imageGenerated ? '✓' : '⊘'}
                </p>
              )}
            </div>
          )}

          {/* Error */}
          {isError && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(200,40,40,0.08)', border: '1px solid rgba(200,40,40,0.25)', color: '#c22', fontSize: 13 }}>
              ❌ {job?.errorMessage ?? 'Đã xảy ra lỗi không xác định'}
            </div>
          )}

          {/* Draft notice — the worker writes with draft: true, so nothing the AI
              produced is live yet. Without this, an editor checks the website,
              sees no change, and assumes the run failed. */}
          {step === 'preview' && job?.result && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(230,150,20,0.10)', border: '1px solid rgba(230,150,20,0.35)', fontSize: 13, marginTop: 12 }}>
              ⚠️ <strong>Đã lưu dạng bản nháp.</strong> Nội dung chưa hiển thị trên web.
              Hãy đối chiếu lại số liệu kỹ thuật và pháp lý (CAS, mã HS, số công bố) với tài liệu gốc,
              sau đó bấm <strong>Publish</strong> trong trang nguyên liệu.
            </div>
          )}

          {/* Footer buttons */}
          <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
            {step === 'preview' && job?.result && (
              <button
                type="button"
                className="btn btn--style-primary btn--size-medium"
                onClick={() => { void handleApply() }}
                style={{ padding: '8px 20px' }}
              >
                ✅ Xem bản nháp
              </button>
            )}
            {step === 'idle' && (
              <button
                type="button"
                className="btn btn--style-secondary btn--size-medium"
                onClick={onClose}
                style={{ padding: '8px 20px' }}
              >
                Đóng
              </button>
            )}
            {(step === 'preview' || isError) && (
              <button
                type="button"
                className="btn btn--style-secondary btn--size-medium"
                onClick={() => { setStep('idle'); setJob(null) }}
                style={{ padding: '8px 20px' }}
              >
                Tạo lại
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Ai Generate Button — Payload SaveButton slot
// ---------------------------------------------------------------------------

export const AiGenerateButton: React.FC = () => {
  const [showModal, setShowModal] = useState(false)
  const [ingredientId, setIngredientId] = useState<string>('')
  const [ingredientName, setIngredientName] = useState<string>('')

  // Listen to custom event dispatched by the edit view
  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ id: string; name: string }>
      setIngredientId(custom.detail.id)
      setIngredientName(custom.detail.name)
      setShowModal(true)
    }
    window.addEventListener('openAiGenerateModal', handler)
    return () => window.removeEventListener('openAiGenerateModal', handler)
  }, [])

  const handleApply = useCallback((result: AiGenerateResult) => {
    // Dispatch custom event that the edit view listens to
    window.dispatchEvent(new CustomEvent('applyAiGeneratedContent', { detail: result }))
  }, [])

  if (!showModal) return null

  return (
    <AiGenerateModal
      ingredientId={ingredientId}
      ingredientName={ingredientName}
      onClose={() => setShowModal(false)}
      onApply={handleApply}
    />
  )
}

export default AiGenerateButton
