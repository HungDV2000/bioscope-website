import type { CollectionConfig } from 'payload'
import { isAdmin } from '@dv/cms-core'

/**
 * Audit log cho các lần chạy đồng bộ CMS.
 *
 * Một bản ghi = một lần chạy. Admin bấm nút → tạo record với status='queued',
 * trả response 202 ngay. Worker chạy nền liên tục cập nhật record này.
 *
 * Trường `totals` đếm tổng số đã xử lý (success, skipped, failed) để hiển thị
 * nhanh trong admin, không phải load thêm row.
 */
export const CmsSyncRuns: CollectionConfig = {
  slug: 'cms-sync-runs',
  labels: { singular: 'CMS Sync Run', plural: 'CMS Sync Runs' },
  admin: {
    useAsTitle: 'startedAt',
    group: 'System',
    defaultColumns: ['startedAt', 'status', 'totals', 'finishedAt'],
    description: 'Lịch sử đồng bộ sản phẩm/danh mục từ RAG DB sang CMS.',
  },
  access: {
    // Chỉ admin đọc/sửa/xóa được. System job dùng overrideAccess để ghi.
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'source',
      label: 'Sync Source',
      type: 'select',
      defaultValue: 'qdrant',
      options: [
        { label: 'RAG (rag_sync_state)', value: 'rag' },
        { label: 'Qdrant (biobot_products)', value: 'qdrant' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'queued',
      index: true,
      options: [
        { label: 'Queued (Đã xếp)', value: 'queued' },
        { label: 'Running (Đang chạy)', value: 'running' },
        { label: 'Done (Hoàn tất)', value: 'done' },
        { label: 'Partial (Một phần)', value: 'partial' },
        { label: 'Error (Lỗi)', value: 'error' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'triggeredBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar', description: 'Admin đã bấm nút.' },
    },
    {
      name: 'startedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'finishedAt',
      type: 'date',
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      // Cache kết quả cho UI list — tránh join nặng.
      name: 'totals',
      type: 'json',
      admin: {
        description: 'Snapshot số liệu cuối: { categories: {created, updated, skipped}, products: {...}, errors: n }.',
      },
    },
    {
      name: 'errorMessage',
      type: 'text',
      admin: { description: 'Tóm tắt lỗi (nếu status=error).' },
    },
    {
      // Log đầy đủ — chỉ staff đọc được. Có thể truncate nếu quá dài.
      name: 'log',
      type: 'array',
      admin: { description: 'Từng dòng log ghi theo thời gian.' },
      fields: [
        { name: 'ts', type: 'date', required: true },
        { name: 'level', type: 'select', options: ['info', 'warn', 'error'], defaultValue: 'info' },
        { name: 'message', type: 'text', required: true },
      ],
    },
  ],
}
