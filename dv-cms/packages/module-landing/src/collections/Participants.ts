import type { CollectionConfig } from 'payload'
import { SLUGS, SYMPTOMS } from '../constants.js'

const staffOnly = ({ req: { user } }: { req: { user: unknown } }) =>
  (user as { collection?: string } | null)?.collection === 'users'

/**
 * Người tham gia chương trình.
 *
 * Tạo ra qua endpoint đăng ký (sau khi xác thực OTP), không tạo tay trong
 * admin — nên `create` chỉ mở cho nhân viên để còn nhập bù khi cần.
 *
 * `points` là bản CACHE của tổng sổ điểm, luôn tính lại từ `lp-point-events`.
 * Không sửa tay con số này: muốn cộng/trừ thì thêm một dòng vào Sổ điểm kèm
 * lý do, để luôn truy ngược được vì sao ai đó có bao nhiêu điểm.
 */
export const Participants: CollectionConfig = {
  slug: SLUGS.participants,
  labels: {
    singular: { vi: 'Người tham gia', en: 'Participant' },
    plural: { vi: 'Người tham gia', en: 'Participants' },
  },
  admin: {
    useAsTitle: 'name',
    group: 'Landing page',
    defaultColumns: ['name', 'phone', 'campaign', 'points', 'joinSeq', 'winner', 'createdAt'],
    listSearchableFields: ['name', 'phone', 'referralCode'],
    description:
      'Dữ liệu sức khoẻ và số điện thoại — chỉ vai trò Admin (hoặc được cấp riêng) mới xem được. Điểm tính lại tự động từ Sổ điểm.',
  },
  access: {
    read: staffOnly,
    create: staffOnly,
    update: staffOnly,
    delete: staffOnly,
    admin: staffOnly,
  },
  indexes: [
    // Một số điện thoại chỉ đăng ký một lần trong một chiến dịch.
    { fields: ['campaign', 'phone'], unique: true },
    // Thứ tự vào danh sách — căn cứ tính điểm "người vào sau" và phân định
    // khi bằng điểm, nên không được trùng.
    { fields: ['campaign', 'joinSeq'], unique: true },
    // Thứ tự trong ĐỢT hiện hành (chốt theo tháng): cũng phải duy nhất.
    { fields: ['campaign', 'roundKey', 'roundJoinSeq'], unique: true },
  ],
  fields: [
    {
      name: 'campaign',
      type: 'relationship',
      relationTo: SLUGS.campaigns,
      required: true,
      index: true,
      label: 'Chiến dịch',
    },
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, label: 'Họ tên', admin: { width: '50%' } },
        { name: 'phone', type: 'text', required: true, index: true, label: 'Số điện thoại', admin: { width: '50%' } },
      ],
    },
    {
      name: 'symptoms',
      type: 'select',
      hasMany: true,
      label: 'Vấn đề đã chọn',
      options: Object.entries(SYMPTOMS).map(([value, label]) => ({ value, label })),
    },
    { name: 'symptomOther', type: 'text', label: 'Vấn đề khác (tự gõ)' },
    {
      type: 'row',
      fields: [
        {
          name: 'referralCode',
          type: 'text',
          unique: true,
          index: true,
          label: 'Mã giới thiệu',
          admin: { width: '50%', readOnly: true },
        },
        {
          name: 'referredBy',
          type: 'relationship',
          relationTo: SLUGS.participants,
          label: 'Được giới thiệu bởi',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'sharedAt',
      type: 'date',
      label: 'Lần đầu gửi mã cho người thân',
      admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
    },

    // ── Cột phải ────────────────────────────────────────────────────────
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      required: true,
      label: 'Trạng thái',
      options: [
        { value: 'active', label: 'Đang tham gia' },
        { value: 'blocked', label: 'Loại (gian lận / trùng)' },
      ],
      admin: { position: 'sidebar', description: 'Người bị loại không xếp hạng và không nhận quà.' },
    },
    {
      name: 'points',
      type: 'number',
      defaultValue: 0,
      label: 'Điểm nhiệm vụ (cộng dồn)',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Tổng điểm mọi đợt. Xếp hạng dùng điểm của đợt đang chạy bên dưới.',
      },
    },
    {
      name: 'joinSeq',
      type: 'number',
      label: 'Thứ tự đăng ký',
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'roundKey',
      type: 'text',
      index: true,
      label: 'Đợt đang dự',
      admin: { position: 'sidebar', readOnly: true, description: 'Dạng 2026-09.' },
    },
    {
      name: 'roundJoinSeq',
      type: 'number',
      label: 'Thứ tự trong đợt',
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'roundPoints',
      type: 'number',
      defaultValue: 0,
      label: 'Điểm trong đợt',
      admin: { position: 'sidebar', readOnly: true, description: 'Chưa gồm điểm "người vào sau" — phần đó tính theo thứ tự trong đợt.' },
    },
    {
      name: 'winner',
      type: 'checkbox',
      defaultValue: false,
      label: 'Nhận quà',
      admin: { position: 'sidebar', readOnly: true },
    },
    { name: 'winnerRank', type: 'number', label: 'Hạng khi chốt', admin: { position: 'sidebar', readOnly: true } },
    {
      name: 'inviteCredited',
      type: 'checkbox',
      defaultValue: false,
      label: 'Đã cộng điểm cho người mời',
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'winAt',
      type: 'date',
      label: 'Được chọn nhận quà lúc',
      admin: { position: 'sidebar', readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'verifiedAt',
      type: 'date',
      label: 'Xác thực SĐT lúc',
      admin: { position: 'sidebar', readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'consentAt',
      type: 'date',
      label: 'Đồng ý lúc',
      admin: { position: 'sidebar', readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'consentText',
      type: 'textarea',
      label: 'Nguyên văn câu đã đồng ý',
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'tracking',
      type: 'group',
      label: 'Nguồn truy cập',
      admin: { position: 'sidebar' },
      fields: [
        { name: 'ip', type: 'text', label: 'IP', admin: { readOnly: true } },
        { name: 'userAgent', type: 'text', label: 'Trình duyệt', admin: { readOnly: true } },
        { name: 'host', type: 'text', label: 'Tên miền đăng ký', admin: { readOnly: true } },
        { name: 'utm', type: 'json', label: 'UTM', admin: { readOnly: true } },
      ],
    },
  ],
}
