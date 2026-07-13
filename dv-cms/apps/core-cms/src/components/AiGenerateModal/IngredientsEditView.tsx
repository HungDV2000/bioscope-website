'use client'

/**
 * IngredientsEditView — Payload Edit View override cho Ingredients.
 *
 * Thêm button "Tạo nội dung tự động" bên cạnh nút Save Draft.
 *
 * Payload 3 cho phép override Edit view bằng cách truyền
 * `admin.components.Edit` vào collection config. Component này
 * dùng Payload UI primitives (EditFallback) để giữ nguyên UX gốc,
 * chỉ thêm button của chúng ta.
 */

import React, { useCallback, useState } from 'react'
import type { EditViewProps } from 'payload/components/views/Edit'
import { EditFallback } from 'payload/components/views/Edit'
import { useConfig } from 'payload/components/utilities'
import { AiGenerateModal } from './AiGenerateButton'
import type { AiGenerateResult } from './AiGenerateButton'

// ---------------------------------------------------------------------------
// Inline trigger button
// ---------------------------------------------------------------------------

interface TriggerButtonProps {
  id: string
  name: string
}

const TriggerButton: React.FC<TriggerButtonProps> = ({ id, name }) => {
  const [showModal, setShowModal] = useState(false)

  const handleApply = useCallback((result: AiGenerateResult) => {
    // Dispatch event để edit form xử lý
    window.dispatchEvent(new CustomEvent('applyAiGeneratedContent', { detail: result }))
  }, [])

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 14px',
          borderRadius: 6,
          border: '1px solid rgba(52, 152, 219, 0.4)',
          background: 'rgba(52, 152, 219, 0.08)',
          color: '#3498db',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          marginLeft: 8,
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(52, 152, 219, 0.15)'
          e.currentTarget.style.borderColor = '#3498db'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(52, 152, 219, 0.08)'
          e.currentTarget.style.borderColor = 'rgba(52, 152, 219, 0.4)'
        }}
        title="Dùng AI tạo nội dung tự động từ file Drive"
      >
        🤖 Tạo nội dung tự động
      </button>

      {showModal && (
        <AiGenerateModal
          ingredientId={id}
          ingredientName={name}
          onClose={() => setShowModal(false)}
          onApply={handleApply}
        />
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Hook: lấy document ID + name từ edit view
// ---------------------------------------------------------------------------

function useEditDocument(): { id: string; name: string } | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { id, admin, collection } = (React as any).__payloadStore?.getState?.()?.tables?.[collection?.slug] ?? {}
  // Fallback: get from window state set by Payload
  if (id) return { id: String(id), name: admin?.useAsTitle ?? String(id) }
  return null
}

// ---------------------------------------------------------------------------
// Custom Edit View cho Ingredients
// ---------------------------------------------------------------------------

const IngredientsEditView: React.FC<EditViewProps> = (props) => {
  const { id, collection, isEditing } = props
  const config = useConfig()

  // Get localized title from collection config
  const useAsTitle = collection?.admin?.useAsTitle ?? 'name'

  // Get document title/name from the props or state
  // In Payload 3 EditView, the document data is passed via `data` prop
  const docName = (props as { data?: Record<string, unknown> }).data?.[useAsTitle] as string | undefined

  // If we have the id but not the name, use a placeholder
  const displayName = docName ?? (id ? `Ingredient ${id}` : 'New Ingredient')
  const docId = id ? String(id) : null

  if (!isEditing || !docId) {
    // New document — show fallback without button
    return <EditFallback {...props} />
  }

  return (
    <>
      {/* Render button above the default edit form */}
      <div
        style={{
          padding: '12px 24px',
          borderBottom: '1px solid var(--color-input-border)',
          background: 'var(--theme-elevation-0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: '#888' }}>
            ✨ AI hỗ trợ viết nội dung
          </span>
        </div>
        <TriggerButton id={docId} name={displayName} />
      </div>

      {/* Default edit form */}
      <EditFallback {...props} />
    </>
  )
}

export default IngredientsEditView
