/**
 * Duplicate Scans — lịch sử các lần kiểm tra trùng lặp.
 *
 * Mỗi lần admin bấm "Bắt đầu" tạo một record. Record giữ cấu hình đã dùng,
 * tiến trình, log và kết quả — nên lần sau mở lại vẫn xem được đã quét bằng
 * cấu hình nào và ra kết quả gì, không cần chạy lại.
 *
 * List view bị thay bằng màn hình kiểm tra tuỳ chỉnh (xem `admin.components`).
 */

import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '@dv/cms-core'

export type DuplicateScanStatus = 'queued' | 'running' | 'done' | 'error' | 'cancelled'

export const DuplicateScans: CollectionConfig = {
  slug: 'duplicate-scans',
  labels: {
    singular: { en: 'Duplicate scan', vi: 'Lần kiểm tra trùng lặp' },
    plural: { en: 'Duplicate check', vi: 'Kiểm tra trùng lặp' },
  },
  admin: {
    useAsTitle: 'targetLabel',
    defaultColumns: ['targetLabel', 'status', 'groupsFound', 'createdAt'],
    group: 'Bioscope',
    description: 'Tìm bản ghi trùng lặp theo tên và các trường định danh.',
    components: {
      // Thay list view mặc định bằng màn hình cấu hình + chạy + xem kết quả.
      // (Media KHÔNG được làm vậy vì drawer chọn ảnh dùng lại list view của nó —
      // collection này không có upload nên không vướng.)
      views: {
        list: {
          Component: '/components/DuplicateScanView/DuplicateScanView#DuplicateScanView',
        },
      },
    },
  },
  access: {
    read: isAdminOrEditor,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: 'targetCollection',
      type: 'text',
      required: true,
      label: { en: 'Content type', vi: 'Loại nội dung' },
      admin: { readOnly: true },
      index: true,
    },
    {
      name: 'targetLabel',
      type: 'text',
      label: { en: 'Content type', vi: 'Loại nội dung' },
      admin: { readOnly: true },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'queued',
      options: [
        { label: { en: 'Queued', vi: 'Đang xếp hàng' }, value: 'queued' },
        { label: { en: 'Running', vi: 'Đang chạy' }, value: 'running' },
        { label: { en: 'Done', vi: 'Hoàn tất' }, value: 'done' },
        { label: { en: 'Error', vi: 'Lỗi' }, value: 'error' },
        { label: { en: 'Cancelled', vi: 'Đã huỷ' }, value: 'cancelled' },
      ],
      admin: { readOnly: true },
      index: true,
    },
    { name: 'phase', type: 'text', label: { en: 'Phase', vi: 'Bước' }, admin: { readOnly: true } },

    {
      name: 'config',
      type: 'json',
      label: { en: 'Configuration used', vi: 'Cấu hình đã dùng' },
      admin: { readOnly: true, description: 'Giữ lại để đối chiếu vì sao lần quét này ra kết quả như vậy.' },
    },
    {
      name: 'groupsFound',
      type: 'number',
      label: { en: 'Groups found', vi: 'Số nhóm trùng' },
      admin: { readOnly: true },
    },
    {
      name: 'docsScanned',
      type: 'number',
      label: { en: 'Records scanned', vi: 'Số bản ghi đã quét' },
      admin: { readOnly: true },
    },
    {
      name: 'docsInGroups',
      type: 'number',
      label: { en: 'Records in groups', vi: 'Số bản ghi nằm trong nhóm trùng' },
      admin: { readOnly: true },
    },
    {
      name: 'results',
      type: 'json',
      label: { en: 'Duplicate groups', vi: 'Các nhóm trùng lặp' },
      admin: { readOnly: true },
    },
    {
      name: 'logs',
      type: 'array',
      label: { en: 'Log', vi: 'Nhật ký' },
      admin: {
        readOnly: true,
        // Dùng lại trình xem log gọn của AI job thay vì UI mảng cồng kềnh.
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
    {
      name: 'errorMessage',
      type: 'textarea',
      label: { en: 'Error', vi: 'Lỗi' },
      admin: { readOnly: true },
    },
    { name: 'startedAt', type: 'date', admin: { readOnly: true } },
    { name: 'finishedAt', type: 'date', admin: { readOnly: true } },
  ],
}
