'use client'

/**
 * IngredientAiField — a Payload 3 `ui` field placed on the Ingredients edit page.
 * Renders the "Tạo nội dung tự động" button + the generation modal. The worker
 * writes the result straight into the ingredient (correct structure), so applying
 * the result just reloads the page to show the updated fields.
 */

import React, { useState } from 'react'
import { useDocumentInfo, useFormFields } from '@payloadcms/ui'
import { AiGenerateModal } from '../AiGenerateModal/AiGenerateButton'

export const IngredientAiField: React.FC = () => {
  const { id } = useDocumentInfo()
  const nameValue = useFormFields(([fields]) => fields?.name?.value)
  const [open, setOpen] = useState(false)
  const [imgBusy, setImgBusy] = useState(false)
  const [imgMsg, setImgMsg] = useState<{ t: 'ok' | 'err'; m: string } | null>(null)

  /** Image-only regeneration: enqueue, poll the job, reload when the image lands. */
  const regenerateImage = async () => {
    if (!window.confirm('Tạo lại ảnh đại diện cho nguyên liệu này? Ảnh hiện tại sẽ bị thay.')) return
    setImgBusy(true)
    setImgMsg({ t: 'ok', m: 'Đang tạo ảnh…' })
    try {
      const r = await fetch('/api/ai-generate/image', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ingredientId: String(id), locale: 'vi' }),
      })
      const data = await r.json()
      if (!r.ok) {
        setImgMsg({ t: 'err', m: data.error ?? 'Lỗi tạo job.' })
        setImgBusy(false)
        return
      }
      // Poll until the job finishes (image gen takes ~10-30s).
      const jobId = data.jobId as string
      for (let i = 0; i < 60; i++) {
        await new Promise((res) => setTimeout(res, 3000))
        const jr = await fetch(`/api/ai-generate/jobs/${jobId}`, { credentials: 'include' })
        const jd = await jr.json()
        const st = jd?.job?.status
        if (st === 'done') {
          setImgMsg({ t: 'ok', m: 'Đã tạo ảnh — đang tải lại…' })
          window.location.reload()
          return
        }
        if (st === 'error') {
          setImgMsg({ t: 'err', m: jd?.job?.errorMessage ?? 'Tạo ảnh thất bại — xem log ở AI Generate Jobs.' })
          setImgBusy(false)
          return
        }
        setImgMsg({ t: 'ok', m: `Đang tạo ảnh… (${jd?.job?.phase ?? st ?? 'chờ'})` })
      }
      setImgMsg({ t: 'err', m: 'Quá lâu — kiểm tra ở AI Generate Jobs.' })
    } catch (e) {
      setImgMsg({ t: 'err', m: e instanceof Error ? e.message : 'Lỗi kết nối.' })
    } finally {
      setImgBusy(false)
    }
  }

  // Needs a saved doc: the id + synced Drive files only exist after the first save.
  if (!id) {
    return (
      <div
        style={{
          marginBottom: 16,
          padding: '10px 14px',
          borderRadius: 8,
          background: 'var(--theme-elevation-50, #f5f5f5)',
          border: '1px dashed var(--theme-elevation-150, #ddd)',
          fontSize: 13,
          color: 'var(--theme-elevation-600, #666)',
        }}
      >
        💾 Lưu nguyên liệu trước (để có Drive Files + ID), rồi mới dùng “Tạo nội dung tự động”.
      </div>
    )
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
        <button
          type="button"
          className="btn btn--style-primary btn--size-medium"
          onClick={() => setOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, margin: 0 }}
        >
          🤖 Tạo nội dung tự động
        </button>
        <button
          type="button"
          className="btn btn--style-secondary btn--size-medium"
          onClick={regenerateImage}
          disabled={imgBusy}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, margin: 0, opacity: imgBusy ? 0.6 : 1 }}
        >
          🖼️ {imgBusy ? 'Đang tạo ảnh…' : 'Tạo lại ảnh'}
        </button>
        {imgMsg && (
          <span style={{ fontSize: 12.5, color: imgMsg.t === 'err' ? '#f56565' : '#38a169' }}>{imgMsg.m}</span>
        )}
      </div>
      <p style={{ fontSize: 12, color: 'var(--theme-elevation-500, #888)', marginTop: 6, maxWidth: 640 }}>
        <strong>Tạo nội dung tự động</strong>: đọc file Drive → OpenAI viết subtitle / mô tả / lợi ích / ứng dụng
        và tạo ảnh đại diện, ghi thẳng vào nguyên liệu (Việt + English).<br />
        <strong>Tạo lại ảnh</strong>: chỉ sinh ảnh đại diện mới từ tên + subtitle sẵn có (giữ nguyên nội dung).
      </p>

      {open && (
        <AiGenerateModal
          ingredientId={String(id)}
          ingredientName={typeof nameValue === 'string' && nameValue ? nameValue : String(id)}
          onClose={() => setOpen(false)}
          // Worker already wrote the content to the doc — reload to show it.
          onApply={() => {
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}

export default IngredientAiField
