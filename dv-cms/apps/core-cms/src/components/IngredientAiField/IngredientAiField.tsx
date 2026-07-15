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
      <button
        type="button"
        className="btn btn--style-primary btn--size-medium"
        onClick={() => setOpen(true)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
      >
        🤖 Tạo nội dung tự động
      </button>
      <p style={{ fontSize: 12, color: 'var(--theme-elevation-500, #888)', marginTop: 6, maxWidth: 640 }}>
        Lấy nội dung các file Drive của nguyên liệu → OpenAI viết subtitle / mô tả / lợi ích / ứng dụng
        và tạo ảnh đại diện, ghi thẳng vào nguyên liệu (cả tiếng Việt + English).
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
