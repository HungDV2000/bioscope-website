import type { CollectionConfig } from 'payload'
import { SLUGS } from '../constants.js'

/**
 * Mã OTP đã gửi.
 *
 * Chỉ lưu BĂM của mã (HMAC với khoá bí mật), không lưu mã gốc: đọc được CSDL
 * vẫn không dùng được mã để đăng ký hộ người khác. Bảng cũng là căn cứ giới
 * hạn tần suất gửi (theo số và theo IP) — mỗi tin SMS đều tốn tiền.
 *
 * Ẩn khỏi menu admin: không có lý do gì để nhân viên xem bảng này.
 */
export const Otps: CollectionConfig = {
  slug: SLUGS.otps,
  labels: { singular: 'OTP', plural: 'OTP' },
  admin: { hidden: true, group: 'Landing page' },
  access: {
    read: () => false,
    create: () => false,
    update: () => false,
    delete: () => false,
    admin: () => false,
  },
  fields: [
    { name: 'campaign', type: 'relationship', relationTo: SLUGS.campaigns, required: true, index: true },
    { name: 'phone', type: 'text', required: true, index: true },
    { name: 'codeHash', type: 'text', required: true },
    { name: 'expiresAt', type: 'date', required: true },
    { name: 'attempts', type: 'number', defaultValue: 0 },
    { name: 'consumedAt', type: 'date' },
    { name: 'ip', type: 'text', index: true },
    { name: 'delivered', type: 'checkbox', defaultValue: false },
  ],
}
