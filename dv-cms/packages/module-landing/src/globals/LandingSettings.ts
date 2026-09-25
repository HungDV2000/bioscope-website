import type { GlobalConfig } from 'payload'
import { SLUGS } from '../constants.js'

const staffOnly = ({ req: { user } }: { req: { user: unknown } }) =>
  (user as { collection?: string } | null)?.collection === 'users'

/**
 * Cấu hình dùng chung cho mọi landing: nhà cung cấp SMS OTP, IP máy chủ.
 *
 * Tách khỏi từng chiến dịch vì khoá API SMS là bí mật cấp hệ thống — không
 * nên nằm chung chỗ với nội dung mà biên tập viên được sửa.
 */
export const LandingSettings: GlobalConfig = {
  slug: SLUGS.settings,
  label: { vi: 'Cài đặt landing', en: 'Landing settings' },
  admin: {
    group: 'Landing page',
    description: 'Nhà cung cấp SMS gửi mã OTP và thông tin máy chủ để kiểm tra DNS.',
  },
  access: { read: staffOnly, update: staffOnly },
  fields: [
    {
      name: 'otpProvider',
      type: 'select',
      required: true,
      defaultValue: 'log',
      label: 'Gửi OTP qua',
      options: [
        { value: 'log', label: 'Chỉ ghi ra log (thử nghiệm — KHÔNG gửi SMS thật)' },
        { value: 'esms', label: 'eSMS.vn' },
        { value: 'speedsms', label: 'SpeedSMS.vn' },
      ],
      admin: {
        description:
          'Chế độ "Chỉ ghi ra log": mã OTP nằm trong log của container CMS, dùng để thử trước khi ký hợp đồng SMS. Không dùng khi chạy quảng cáo thật.',
      },
    },
    {
      name: 'smsTemplate',
      type: 'text',
      required: true,
      defaultValue: 'Ma xac thuc {brand} cua ban la {code}. Ma het han sau 5 phut. Khong chia se ma nay cho ai.',
      label: 'Nội dung tin nhắn',
      admin: {
        description:
          'Giữ {code} và {brand}. Viết KHÔNG DẤU: tin có dấu tính giá gấp đôi, và nhà mạng thường bắt đăng ký trước mẫu tin brandname.',
      },
    },
    { name: 'brand', type: 'text', defaultValue: 'Bioscope', label: 'Tên hiển thị trong tin ({brand})' },
    {
      name: 'esms',
      type: 'group',
      label: 'eSMS',
      admin: { condition: (data) => data?.otpProvider === 'esms' },
      fields: [
        { name: 'apiKey', type: 'text', label: 'ApiKey' },
        { name: 'secretKey', type: 'text', label: 'SecretKey' },
        { name: 'brandname', type: 'text', label: 'Brandname đã đăng ký' },
        {
          name: 'smsType',
          type: 'select',
          defaultValue: '2',
          label: 'Loại tin',
          options: [
            { value: '2', label: 'Brandname CSKH (khuyên dùng cho OTP)' },
            { value: '8', label: 'Đầu số cố định' },
          ],
        },
      ],
    },
    {
      name: 'speedsms',
      type: 'group',
      label: 'SpeedSMS',
      admin: { condition: (data) => data?.otpProvider === 'speedsms' },
      fields: [
        { name: 'accessToken', type: 'text', label: 'Access token' },
        { name: 'sender', type: 'text', label: 'Brandname / sender' },
        {
          name: 'smsType',
          type: 'select',
          defaultValue: '3',
          label: 'Loại tin',
          options: [
            { value: '3', label: 'Brandname' },
            { value: '2', label: 'Đầu số ngẫu nhiên (CSKH)' },
            { value: '5', label: 'Gửi qua app Android của bạn' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'otpPerPhonePerHour',
          type: 'number',
          defaultValue: 5,
          min: 1,
          label: 'Tối đa OTP / số / giờ',
          admin: { width: '50%' },
        },
        {
          name: 'otpPerIpPerHour',
          type: 'number',
          defaultValue: 20,
          min: 1,
          label: 'Tối đa OTP / IP / giờ',
          admin: { width: '50%', description: 'Chặn một máy spam tin nhắn tới hàng loạt số — mỗi tin đều tốn tiền.' },
        },
      ],
    },
    {
      name: 'serverIp',
      type: 'text',
      label: 'IP công khai của VPS',
      admin: {
        description: 'Dùng cho nút "Kiểm tra DNS": tên miền landing phải trỏ bản ghi A về đúng IP này.',
      },
    },
  ],
}
