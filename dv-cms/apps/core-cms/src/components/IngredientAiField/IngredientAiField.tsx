'use client'

/**
 * IngredientAiField — a Payload 3 `ui` field on the Ingredients edit page.
 * Renders a single compact "⚙ Công cụ" dropdown to keep the form tidy, grouping:
 *   • 🤖 Tạo nội dung tự động (AI)      • 🖼️ Tạo lại ảnh (AI)
 *   • ⬇ Export nội dung (CSV / JSON)   • ⬆ Import nội dung (CSV / JSON)
 * The AI worker + import both write straight into the doc, so we reload to show it.
 */

import React, { useEffect, useRef, useState } from 'react'
import { useDocumentInfo, useFormFields } from '@payloadcms/ui'
import { AiGenerateModal } from '../AiGenerateModal/AiGenerateButton'

type Msg = { t: 'ok' | 'err'; m: string } | null

export const IngredientAiField: React.FC = () => {
  const { id } = useDocumentInfo()
  const nameValue = useFormFields(([fields]) => fields?.name?.value)
  const slugValue = useFormFields(([fields]) => fields?.slug?.value)
  const slug = typeof slugValue === 'string' ? slugValue : ''

  const [open, setOpen] = useState(false)       // AI content modal
  const [menu, setMenu] = useState(false)        // dropdown
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<Msg>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Close the dropdown on outside click.
  useEffect(() => {
    if (!menu) return
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [menu])

  /** Image-only regeneration: enqueue, poll the job, reload when the image lands. */
  const regenerateImage = async () => {
    setMenu(false)
    if (!window.confirm('Tạo lại ảnh đại diện cho nguyên liệu này? Ảnh hiện tại sẽ bị thay.')) return
    setBusy(true)
    setMsg({ t: 'ok', m: 'Đang tạo ảnh…' })
    try {
      const r = await fetch('/api/ai-generate/image', {
        method: 'POST', credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ingredientId: String(id), locale: 'vi' }),
      })
      const data = await r.json()
      if (!r.ok) { setMsg({ t: 'err', m: data.error ?? 'Lỗi tạo job.' }); setBusy(false); return }
      const jobId = data.jobId as string
      for (let i = 0; i < 60; i++) {
        await new Promise((res) => setTimeout(res, 3000))
        const jr = await fetch(`/api/ai-generate/jobs/${jobId}`, { credentials: 'include' })
        const jd = await jr.json()
        const st = jd?.job?.status
        if (st === 'done') { setMsg({ t: 'ok', m: 'Đã tạo ảnh — đang tải lại…' }); window.location.reload(); return }
        if (st === 'error') { setMsg({ t: 'err', m: jd?.job?.errorMessage ?? 'Tạo ảnh thất bại — xem AI Generate Jobs.' }); setBusy(false); return }
        setMsg({ t: 'ok', m: `Đang tạo ảnh… (${jd?.job?.phase ?? st ?? 'chờ'})` })
      }
      setMsg({ t: 'err', m: 'Quá lâu — kiểm tra ở AI Generate Jobs.' })
    } catch (e) {
      setMsg({ t: 'err', m: e instanceof Error ? e.message : 'Lỗi kết nối.' })
    } finally { setBusy(false) }
  }

  /** Export this ingredient's content as CSV or JSON (downloads a file). */
  const exportContent = (format: 'csv' | 'json') => {
    setMenu(false)
    const qs = new URLSearchParams({ format })
    if (slug) qs.set('slug', slug)
    window.open(`/api/ingredients-content-export?${qs.toString()}`, '_blank')
  }

  /** Import content from a picked CSV/JSON file, then reload to show the result. */
  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    setMsg({ t: 'ok', m: `Đang import ${file.name}…` })
    try {
      const text = await file.text()
      const base64 = btoa(unescape(encodeURIComponent(text)))
      const format = file.name.toLowerCase().endsWith('.json') ? 'json' : 'csv'
      const r = await fetch('/api/ingredients-content-import', {
        method: 'POST', credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ format, content: base64 }),
      })
      const data = await r.json()
      if (!r.ok || data.ok === false) {
        const detail = Array.isArray(data.errors) && data.errors.length ? ` (${data.errors[0].error})` : ''
        setMsg({ t: 'err', m: `${data.error ?? 'Import lỗi'}${detail}` }); setBusy(false); return
      }
      setMsg({ t: 'ok', m: `Đã import: +${data.created} mới, ~${data.updated} cập nhật — đang tải lại…` })
      setTimeout(() => window.location.reload(), 900)
    } catch (err) {
      setMsg({ t: 'err', m: err instanceof Error ? err.message : 'Lỗi đọc file.' })
      setBusy(false)
    }
  }

  const item: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 12px',
    background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 13.5,
    color: 'var(--theme-elevation-800, #333)',
  }
  const sep: React.CSSProperties = { height: 1, background: 'var(--theme-elevation-100, #eee)', margin: '4px 0' }

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ position: 'relative', display: 'inline-block' }} ref={menuRef}>
        <button
          type="button"
          className="btn btn--style-secondary btn--size-medium"
          onClick={() => setMenu((v) => !v)}
          disabled={busy}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, margin: 0, opacity: busy ? 0.6 : 1 }}
          aria-haspopup="menu"
          aria-expanded={menu}
        >
          ⚙ Công cụ nguyên liệu <span style={{ fontSize: 10 }}>▾</span>
        </button>

        {menu && (
          <div
            role="menu"
            style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 30, minWidth: 260,
              background: 'var(--theme-elevation-0, #fff)', border: '1px solid var(--theme-elevation-150, #ddd)',
              borderRadius: 10, boxShadow: '0 8px 28px rgba(0,0,0,0.12)', padding: 6,
            }}
          >
            {!id ? (
              <div style={{ ...item, cursor: 'default', color: 'var(--theme-elevation-500,#888)', fontSize: 12.5 }}>
                💾 Lưu nguyên liệu trước để dùng AI / Import-Export.
              </div>
            ) : (
              <>
                <button type="button" role="menuitem" style={item} onClick={() => { setMenu(false); setOpen(true) }}>
                  🤖 Tạo nội dung tự động (AI)
                </button>
                <button type="button" role="menuitem" style={item} onClick={regenerateImage}>
                  🖼️ Tạo lại ảnh đại diện (AI)
                </button>
                <div style={sep} />
                <button type="button" role="menuitem" style={item} onClick={() => exportContent('csv')}>
                  ⬇ Export nội dung — CSV
                </button>
                <button type="button" role="menuitem" style={item} onClick={() => exportContent('json')}>
                  ⬇ Export nội dung — JSON
                </button>
                <div style={sep} />
                <button type="button" role="menuitem" style={item} onClick={() => { setMenu(false); fileRef.current?.click() }}>
                  ⬆ Import nội dung — CSV / JSON…
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {msg && (
        <span style={{ marginLeft: 10, fontSize: 12.5, color: msg.t === 'err' ? '#f56565' : '#38a169' }}>{msg.m}</span>
      )}

      <input ref={fileRef} type="file" accept=".csv,.json" hidden onChange={onPickFile} />

      {open && id && (
        <AiGenerateModal
          ingredientId={String(id)}
          ingredientName={typeof nameValue === 'string' && nameValue ? nameValue : String(id)}
          onClose={() => setOpen(false)}
          onApply={() => window.location.reload()}
        />
      )}
    </div>
  )
}

export default IngredientAiField
