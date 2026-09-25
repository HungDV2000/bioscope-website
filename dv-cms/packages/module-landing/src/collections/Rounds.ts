import type { CollectionConfig } from 'payload'
import { SLUGS } from '../constants.js'

const staffOnly = ({ req: { user } }: { req: { user: unknown } }) =>
  (user as { collection?: string } | null)?.collection === 'users'

/**
 * Đợt chơi — mặc định mỗi tháng một đợt.
 *
 * Mỗi dòng là một tháng: mở lúc nào, chốt lúc nào, công bố lúc nào, và danh
 * sách người nhận quà đã đóng băng. Nhờ vậy tra lại tháng nào cũng được, và
 * trang công khai chỉ đọc danh sách khi đợt đã chuyển sang "Đã công bố".
 *
 * Hệ thống tự tạo và tự chốt; nhân viên hiếm khi phải sửa tay ở đây.
 */
export const Rounds: CollectionConfig = {
  slug: SLUGS.rounds,
  labels: {
    singular: { vi: 'Đợt', en: 'Round' },
    plural: { vi: 'Đợt theo tháng', en: 'Rounds' },
  },
  admin: {
    useAsTitle: 'key',
    group: 'Landing page',
    defaultColumns: ['key', 'campaign', 'status', 'endAt', 'announceAt', 'participants'],
    description: 'Hệ thống tự chốt khi hết hạn và tự công bố đúng mốc. Danh sách người nhận quà chỉ hiện trên trang sau mốc công bố.',
  },
  access: {
    read: staffOnly,
    create: staffOnly,
    update: staffOnly,
    delete: staffOnly,
    admin: staffOnly,
  },
  indexes: [{ fields: ['campaign', 'key'], unique: true }],
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'campaign',
          type: 'relationship',
          relationTo: SLUGS.campaigns,
          required: true,
          index: true,
          label: 'Chiến dịch',
          admin: { width: '50%' },
        },
        {
          name: 'key',
          type: 'text',
          required: true,
          index: true,
          label: 'Mã đợt',
          admin: { width: '50%', description: 'Dạng 2026-09. Chu kỳ một lần thì là "once".' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'startAt', type: 'date', label: 'Mở từ', admin: { width: '33%', date: { pickerAppearance: 'dayAndTime' } } },
        { name: 'endAt', type: 'date', required: true, label: 'Chốt lúc', admin: { width: '33%', date: { pickerAppearance: 'dayAndTime' } } },
        {
          name: 'announceAt',
          type: 'date',
          required: true,
          label: 'Công bố lúc',
          admin: { width: '34%', date: { pickerAppearance: 'dayAndTime' } },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'open',
          label: 'Trạng thái',
          options: [
            { value: 'open', label: 'Đang chạy' },
            { value: 'closed', label: 'Đã chốt — chờ công bố' },
            { value: 'announced', label: 'Đã công bố' },
          ],
          admin: { width: '34%' },
        },
        { name: 'slots', type: 'number', label: 'Số suất quà của đợt', admin: { width: '33%' } },
        { name: 'participants', type: 'number', label: 'Số người dự đợt', admin: { width: '33%', readOnly: true } },
      ],
    },
    {
      name: 'frozenAt',
      type: 'date',
      label: 'Đã chốt lúc',
      admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'winners',
      type: 'array',
      label: 'Người nhận quà',
      admin: { readOnly: true, description: 'Đóng băng lúc chốt. Muốn đổi thì bấm "Chốt lại danh sách" trong trang chiến dịch.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'participant', type: 'relationship', relationTo: SLUGS.participants, label: 'Người tham gia', admin: { width: '60%' } },
            { name: 'rank', type: 'number', label: 'Hạng', admin: { width: '20%' } },
            { name: 'points', type: 'number', label: 'Điểm', admin: { width: '20%' } },
          ],
        },
      ],
    },
  ],
}
