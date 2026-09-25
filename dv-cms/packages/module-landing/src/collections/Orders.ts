import type { CollectionConfig } from 'payload'
import { SLUGS, ORDER_STATUS } from '../constants.js'
import { getCampaignById } from '../lib/campaign.js'

const staffOnly = ({ req: { user } }: { req: { user: unknown } }) =>
  (user as { collection?: string } | null)?.collection === 'users'

const STATUS_LABELS: Record<(typeof ORDER_STATUS)[number], string> = {
  new: 'Mới — chưa gọi xác nhận',
  confirmed: 'Đã xác nhận',
  shipped: 'Đã giao',
  cancelled: 'Huỷ',
}

const relId = (v: unknown): string | number | null => {
  if (v == null) return null
  if (typeof v === 'object') return ((v as { id?: string | number }).id ?? null) as string | number | null
  return v as string | number
}

const COUNTS = new Set(['confirmed', 'shipped'])

/**
 * Đơn đặt mua từ landing.
 *
 * Điểm giới thiệu chỉ cộng khi đơn được XÁC NHẬN (sau cuộc gọi của Bioscope),
 * không cộng lúc khách bấm đặt: nếu cộng ngay, ai cũng tự đặt vài đơn ảo bằng
 * mã của mình để leo hạng. Đơn bị huỷ thì điểm tự thu hồi.
 */
export const Orders: CollectionConfig = {
  slug: SLUGS.orders,
  labels: {
    singular: { vi: 'Đơn hàng landing', en: 'Landing order' },
    plural: { vi: 'Đơn hàng landing', en: 'Landing orders' },
  },
  admin: {
    useAsTitle: 'name',
    group: 'Landing page',
    defaultColumns: ['name', 'phone', 'code', 'quantity', 'status', 'createdAt'],
    listSearchableFields: ['name', 'phone', 'code'],
    description: 'Gọi xác nhận rồi chuyển sang "Đã xác nhận" — lúc đó người giới thiệu mới được cộng điểm.',
  },
  access: {
    read: staffOnly,
    create: staffOnly,
    update: staffOnly,
    delete: staffOnly,
    admin: staffOnly,
  },
  /**
   * Từ 09/2026 đơn hàng KHÔNG còn cộng điểm.
   *
   * Bảng điểm marketing chốt là "mời được 1 người tham gia +10", điểm cộng
   * ngay khi người được mời xác thực số và xem xong 1 video (xem
   * `endpoints/public.ts`). Nếu cộng thêm theo đơn nữa thì một lượt giới thiệu
   * được tính hai lần. Đơn vẫn lưu mã giới thiệu để đối chiếu doanh số.
   */
  fields: [
    { name: 'campaign', type: 'relationship', relationTo: SLUGS.campaigns, required: true, index: true, label: 'Chiến dịch' },
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, label: 'Người nhận', admin: { width: '50%' } },
        { name: 'phone', type: 'text', required: true, index: true, label: 'Số điện thoại', admin: { width: '50%' } },
      ],
    },
    { name: 'address', type: 'text', required: true, label: 'Địa chỉ nhận hàng' },
    {
      type: 'row',
      fields: [
        { name: 'quantity', type: 'number', required: true, defaultValue: 1, min: 1, max: 20, label: 'Số lọ', admin: { width: '33%' } },
        { name: 'code', type: 'text', index: true, label: 'Mã giảm giá', admin: { width: '33%' } },
        { name: 'discountPercent', type: 'number', label: 'Giảm (%)', admin: { width: '33%', readOnly: true } },
      ],
    },
    { name: 'note', type: 'textarea', label: 'Ghi chú của khách' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      label: 'Trạng thái',
      options: ORDER_STATUS.map((value) => ({ value, label: STATUS_LABELS[value] })),
      admin: { position: 'sidebar' },
    },
    {
      name: 'referrer',
      type: 'relationship',
      relationTo: SLUGS.participants,
      label: 'Người giới thiệu (chủ mã)',
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'buyer',
      type: 'relationship',
      relationTo: SLUGS.participants,
      label: 'Người mua (nếu đã tham gia)',
      admin: { position: 'sidebar', readOnly: true },
    },
    { name: 'staffNote', type: 'textarea', label: 'Ghi chú nội bộ', admin: { position: 'sidebar' } },
    { name: 'ip', type: 'text', label: 'IP', admin: { position: 'sidebar', readOnly: true } },
  ],
}
