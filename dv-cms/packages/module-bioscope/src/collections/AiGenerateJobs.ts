/**
 * AI Generate Jobs — theo dõi tiến trình + lưu kết quả AI generation.
 *
 * Mỗi lần user bấm "Tạo nội dung tự động" → 1 job record được tạo.
 * Worker background update job progress + ghi result JSON khi xong.
 */

import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '@dv/cms-core'

export type AiGenerateJobStatus =
  | 'queued'
  | 'downloading'
  | 'extracting'
  | 'generating_content'
  | 'generating_image'
  | 'saving'
  | 'done'
  | 'error'
  | 'cancelled'

export const AiGenerateJobs: CollectionConfig = {
  slug: 'ai-generate-jobs',
  admin: {
    useAsTitle: 'ingredientName',
    defaultColumns: ['ingredientName', 'mode', 'status', 'phase', 'locale', 'createdAt'],
    group: 'Bioscope',
    description: 'Job history — Tạo nội dung tự động bằng AI',
  },
  access: {
    read: isAdminOrEditor,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    // ── Relationship ───────────────────────────────────────────────────────
    {
      name: 'ingredientId',
      type: 'text',
      required: true,
      label: 'Ingredient ID',
      admin: { readOnly: true },
    },
    {
      name: 'ingredientName',
      type: 'text',
      required: true,
      label: 'Ingredient Name',
      admin: { readOnly: true },
    },

    // ── Mode ──────────────────────────────────────────────────────────────
    {
      name: 'mode',
      type: 'select',
      defaultValue: 'full',
      options: [
        { label: 'Toàn bộ nội dung + ảnh', value: 'full' },
        { label: 'Chỉ tạo lại ảnh', value: 'image' },
      ],
      admin: { readOnly: true, description: 'Loại job: sinh toàn bộ nội dung hay chỉ tạo lại ảnh.' },
      index: true,
    },

    // ── Status ────────────────────────────────────────────────────────────
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'queued',
      options: [
        { label: 'Đã xếp hàng', value: 'queued' },
        { label: 'Đang tải file', value: 'downloading' },
        { label: 'Đang trích xuất', value: 'extracting' },
        { label: 'Đang sinh nội dung', value: 'generating_content' },
        { label: 'Đang sinh hình ảnh', value: 'generating_image' },
        { label: 'Đang lưu', value: 'saving' },
        { label: 'Hoàn tất', value: 'done' },
        { label: 'Lỗi', value: 'error' },
        { label: 'Hủy', value: 'cancelled' },
      ],
      admin: { readOnly: true },
    },
    {
      name: 'phase',
      type: 'text',
      label: 'Phase',
      admin: { readOnly: true, description: 'Mô tả bước hiện tại' },
    },

    // ── Locale ───────────────────────────────────────────────────────────
    {
      name: 'locale',
      type: 'select',
      defaultValue: 'vi',
      options: [
        { label: 'Tiếng Việt', value: 'vi' },
        { label: 'English', value: 'en' },
      ],
      admin: { readOnly: true },
    },

    // ── Progress ─────────────────────────────────────────────────────────
    {
      name: 'totals',
      type: 'json',
      admin: { readOnly: true },
    },

    // ── Logs ─────────────────────────────────────────────────────────────
    {
      name: 'logs',
      type: 'array',
      admin: {
        readOnly: true,
        // Compact console-style renderer instead of the bulky per-row array UI.
        components: { Field: '/components/AiJobLogViewer/AiJobLogViewer#AiJobLogViewer' },
      },
      fields: [
        { name: 'ts', type: 'text' },
        {
          name: 'level',
          type: 'select',
          options: [
            { label: 'Info', value: 'info' },
            { label: 'Warning', value: 'warn' },
            { label: 'Error', value: 'error' },
          ],
        },
        { name: 'message', type: 'text' },
      ],
    },

    // ── Result ───────────────────────────────────────────────────────────
    {
      name: 'result',
      type: 'json',
      label: 'AI Result',
      admin: { readOnly: true },
    },

    // ── Token / cost accounting ──────────────────────────────────────────
    {
      name: 'usage',
      type: 'json',
      label: { en: 'Token usage & cost', vi: 'Token & chi phí' },
      admin: {
        readOnly: true,
        description:
          'Token theo từng loại call (content / vision / imagePrompt), số ảnh, và ước tính USD khi đã đặt OPENAI_PRICE_*.',
      },
    },

    // ── Error ────────────────────────────────────────────────────────────
    {
      name: 'errorMessage',
      type: 'textarea',
      label: 'Error Message',
      admin: { readOnly: true },
    },

    // ── Timestamps ───────────────────────────────────────────────────────
    { name: 'startedAt', type: 'date', admin: { readOnly: true } },
    { name: 'finishedAt', type: 'date', admin: { readOnly: true } },
  ],
}
