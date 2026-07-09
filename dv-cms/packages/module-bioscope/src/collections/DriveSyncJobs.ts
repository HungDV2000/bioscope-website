import type { CollectionConfig } from 'payload'
import { isAdmin } from '@dv/cms-core'

/**
 * Persistent job state cho Drive Sync.
 * Mỗi record = 1 lần chạy sync. Worker cập nhật liên tục.
 * UI đọc record này để hiển thị real-time progress (kể cả sau refresh).
 */
export const DriveSyncJobs: CollectionConfig = {
  slug: 'drive-sync-jobs',
  labels: { singular: 'Drive Sync Job', plural: 'Drive Sync Jobs' },
  admin: {
    useAsTitle: 'createdAt',
    group: 'System',
    defaultColumns: ['createdAt', 'status', 'phase', 'totalItems', 'processedItems'],
    description:
      'Trạng thái sync sản phẩm & danh mục từ Google Drive. Tự động cập nhật khi sync đang chạy.',
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'queued',
      index: true,
      options: [
        { label: 'Queued — Đã xếp hàng', value: 'queued' },
        { label: 'Running — Đang chạy', value: 'running' },
        { label: 'Crawling — Đang crawl Drive', value: 'crawling' },
        { label: 'Upserting — Đang ghi vào DB', value: 'upserting' },
        { label: 'Done — Hoàn tất', value: 'done' },
        { label: 'Error — Lỗi', value: 'error' },
        { label: 'Cancelled — Bị hủy', value: 'cancelled' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'phase',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Bước hiện tại: "Crawl categories...", "Upsert ingredients (3/50)..."',
      },
    },
    {
      // Tổng số items dự kiến (categories + ingredients)
      name: 'totalItems',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true },
    },
    {
      // Số items đã xử lý
      name: 'processedItems',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true },
    },
    {
      name: 'totals',
      type: 'json',
      admin: {
        readOnly: true,
        description:
          '{ categories: {found, created, updated, skipped}, ingredients: {found, created, updated, skipped}, errors: n }',
      },
    },
    {
      // Danh sách logs theo thời gian
      name: 'logs',
      type: 'array',
      admin: {
        description: 'Chi tiết tiến trình. Append-only.',
        readOnly: true,
      },
      fields: [
        { name: 'ts', type: 'date', required: true },
        {
          name: 'level',
          type: 'select',
          defaultValue: 'info',
          options: [
            { label: 'Info', value: 'info' },
            { label: 'Warn', value: 'warn' },
            { label: 'Error', value: 'error' },
          ],
        },
        { name: 'message', type: 'text', required: true },
        {
          name: 'data',
          type: 'json',
          admin: { description: 'Data phụ (vd: {ingredientId, name})' },
        },
      ],
    },
    {
      name: 'triggeredBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar', description: 'Admin đã bấm nút.' },
    },
    {
      name: 'createdAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'startedAt',
      type: 'date',
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'finishedAt',
      type: 'date',
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'errorMessage',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'rootFolderId',
      type: 'text',
      defaultValue: '1YFh__V4da3Q6rU3grYgd5YCBH70HcVbs',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Google Drive root folder ID.',
      },
    },
  ],
}
