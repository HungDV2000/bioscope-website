import type { Access, CollectionConfig } from 'payload'
import { isAdmin, isAdminFieldLevel } from '@dv/cms-core'

type AnyUser = { collection?: string; id?: string | number } | null | undefined

/** Members can read only their own record; staff can read all. */
const readSelfOrStaff: Access = ({ req: { user } }) => {
  const u = user as AnyUser
  if (u?.collection === 'users') return true
  if (u?.collection === 'members') return { id: { equals: u.id } }
  return false
}

/** B2B member accounts (separate auth collection from staff `users`). */
export const Members: CollectionConfig = {
  slug: 'members',
  // Stateless JWT (no server-side session lookup) — simpler for the headless
  // B2B API consumed by the frontend.
  auth: { useSessions: false },
  admin: {
    useAsTitle: 'email',
    group: 'B2B',
    defaultColumns: ['email', 'company', 'status'],
  },
  access: {
    // Only staff may open this collection in the admin panel.
    admin: ({ req: { user } }) => (user as AnyUser)?.collection === 'users',
    read: readSelfOrStaff,
    create: isAdmin, // public sign-up goes through the /b2b/register endpoint (overrideAccess)
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'company',
      type: 'text',
      /**
       * Bắt buộc với người tự đăng ký, NHƯNG tài khoản tạo qua Google thì
       * Google không cung cấp tên công ty — bắt buộc ở đây sẽ làm hỏng luôn
       * bước đăng nhập. Cho phép để trống với tài khoản Google; người dùng
       * điền sau ở trang Tài khoản (form bên đó vẫn bắt buộc).
       *
       * Hai đường ghi dữ liệu (/b2b/register và /b2b/profile) đều đã tự kiểm
       * trường này nên vẫn không lọt bản ghi thiếu thông tin.
       */
      validate: (value: unknown, { data }: { data?: { authProvider?: string } }) => {
        if (typeof value === 'string' && value.trim()) return true
        if (data?.authProvider === 'google') return true
        return 'This field is required.'
      },
      admin: { description: 'Tài khoản đăng nhập bằng Google có thể chưa có — sẽ tự bổ sung sau.' },
    },
    { name: 'contactName', type: 'text', required: true },
    { name: 'phone', type: 'text' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
      access: { update: isAdminFieldLevel },
      admin: { position: 'sidebar' },
    },
    {
      name: 'approvedAt',
      type: 'date',
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'authProvider',
      type: 'select',
      defaultValue: 'password',
      options: [
        { label: 'Email + mật khẩu', value: 'password' },
        { label: 'Google', value: 'google' },
      ],
      access: { update: isAdminFieldLevel },
      admin: { position: 'sidebar', readOnly: true, description: 'Cách tài khoản được tạo.' },
    },
    {
      name: 'googleId',
      type: 'text',
      index: true,
      access: { update: isAdminFieldLevel },
      admin: { hidden: true },
    },
    {
      name: 'emailVerified',
      type: 'checkbox',
      defaultValue: false,
      access: { update: isAdminFieldLevel },
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Email đã xác thực qua Google. KHÔNG tự mở quyền tài liệu B2B.',
      },
    },
    {
      // Tài khoản tạo bằng Google được cấp mật khẩu ngẫu nhiên (Payload bắt buộc),
      // nhưng chủ tài khoản chưa biết → cho đặt lần đầu mà không hỏi mật khẩu cũ.
      name: 'hasPassword',
      type: 'checkbox',
      defaultValue: true,
      access: { update: isAdminFieldLevel },
      admin: { hidden: true },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        // Stamp approvedAt the first time status flips to approved.
        if (data?.status === 'approved' && originalDoc?.status !== 'approved' && !data.approvedAt) {
          data.approvedAt = new Date().toISOString()
        }
        return data
      },
    ],
  },
}
