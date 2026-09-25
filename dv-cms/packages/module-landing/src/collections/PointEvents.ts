import { APIError } from 'payload'
import type { CollectionConfig } from 'payload'
import { SLUGS, POINT_TYPES } from '../constants.js'
import { recomputePoints } from '../lib/points.js'

const staffOnly = ({ req: { user } }: { req: { user: unknown } }) =>
  (user as { collection?: string } | null)?.collection === 'users'

const TYPE_LABELS: Record<(typeof POINT_TYPES)[number], string> = {
  video: 'Xem video',
  record: 'Ghi âm kể chuyện',
  order: 'Đơn dùng mã giới thiệu',
  result: 'Kể lại kết quả',
  manual: 'Điều chỉnh tay',
}

const relId = (v: unknown): string | number | null => {
  if (v == null) return null
  if (typeof v === 'object') return ((v as { id?: string | number }).id ?? null) as string | number | null
  return v as string | number
}

/**
 * Sổ điểm — mỗi lần cộng/trừ là một dòng.
 *
 * `refKey` + người tham gia là DUY NHẤT: cùng một video, cùng một đơn hàng
 * không bao giờ được cộng hai lần, kể cả khi hai request đến cùng lúc. Ràng
 * buộc nằm ở CSDL chứ không ở code, vì code kiểm "đã có chưa rồi mới ghi" luôn
 * có khe hở giữa hai bước.
 *
 * Admin cộng/trừ tay bằng cách tạo dòng loại "Điều chỉnh tay" (điểm âm để
 * trừ) và BẮT BUỘC ghi lý do.
 */
export const PointEvents: CollectionConfig = {
  slug: SLUGS.pointEvents,
  labels: {
    singular: { vi: 'Dòng sổ điểm', en: 'Point event' },
    plural: { vi: 'Sổ điểm', en: 'Point events' },
  },
  admin: {
    useAsTitle: 'refKey',
    group: 'Landing page',
    defaultColumns: ['participant', 'type', 'points', 'note', 'createdAt'],
    description: 'Muốn cộng/trừ điểm tay: tạo dòng mới loại "Điều chỉnh tay", điểm âm để trừ, bắt buộc ghi lý do.',
  },
  access: {
    read: staffOnly,
    create: staffOnly,
    update: () => false, // sổ chỉ ghi thêm, không sửa lịch sử
    delete: staffOnly,
    admin: staffOnly,
  },
  indexes: [{ fields: ['participant', 'refKey'], unique: true }],
  hooks: {
    beforeValidate: [
      ({ data, req, operation }) => {
        if (!data || operation !== 'create') return data
        // Dòng do nhân viên tạo tay: tự đặt khoá và loại.
        if (req.user && (req.user as { collection?: string }).collection === 'users' && !data.refKey) {
          data.type = 'manual'
          data.refKey = `manual:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`
          data.createdBy = req.user.id
        }
        if (data.type === 'manual' && !String(data.note ?? '').trim()) {
          throw new APIError('Điều chỉnh tay phải ghi lý do.', 400, null, true)
        }
        return data
      },
    ],
    beforeChange: [
      async ({ data, req, operation }) => {
        // Quyền `update: false` ở trên chỉ chặn được khách: module phân quyền
        // cho nhân viên đi theo ma trận vai trò, nên phải chặn thêm ở đây.
        if (operation === 'update') {
          throw new APIError('Sổ điểm chỉ ghi thêm. Muốn điều chỉnh, tạo một dòng "Điều chỉnh tay" mới.', 400, null, true)
        }
        // Suy ra chiến dịch từ người tham gia để lọc sổ điểm theo chiến dịch.
        if (operation === 'create' && !data.campaign && data.participant) {
          const p = await req.payload.findByID({
            collection: SLUGS.participants,
            id: relId(data.participant) as string,
            depth: 0,
            overrideAccess: true,
            req,
          })
          data.campaign = relId((p as { campaign?: unknown }).campaign)
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, req }) => {
        await recomputePoints(req.payload, relId(doc.participant), req)
        return doc
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        await recomputePoints(req.payload, relId(doc.participant), req)
      },
    ],
  },
  fields: [
    {
      name: 'participant',
      type: 'relationship',
      relationTo: SLUGS.participants,
      required: true,
      index: true,
      label: 'Người tham gia',
    },
    {
      name: 'campaign',
      type: 'relationship',
      relationTo: SLUGS.campaigns,
      index: true,
      label: 'Chiến dịch',
      admin: { readOnly: true },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'manual',
          label: 'Loại',
          options: POINT_TYPES.map((value) => ({ value, label: TYPE_LABELS[value] })),
          admin: { width: '50%' },
        },
        { name: 'points', type: 'number', required: true, label: 'Điểm (+/-)', admin: { width: '50%' } },
      ],
    },
    { name: 'note', type: 'text', label: 'Lý do / ghi chú' },
    {
      name: 'round',
      type: 'text',
      index: true,
      label: 'Đợt',
      admin: { readOnly: true, description: 'Điểm thuộc đợt nào (2026-09). Xếp hạng chỉ tính điểm trong đợt đang chạy.' },
    },
    {
      name: 'refKey',
      type: 'text',
      label: 'Khoá chống cộng trùng',
      admin: { readOnly: true, description: 'Tự sinh. Ví dụ video:1, order:25, record:intro.' },
    },
    { name: 'createdBy', type: 'relationship', relationTo: 'users', label: 'Người nhập', admin: { readOnly: true } },
  ],
}
