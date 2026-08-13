import type { GlobalConfig } from 'payload'
import { isAdmin, isAdminOrEditor } from '@dv/cms-core'

/**
 * Cài đặt đăng nhập thành viên B2B — CẤU HÌNH ĐỘNG trong admin.
 *
 * Client Secret của Google CHỈ nằm ở CMS (không đưa xuống frontend): frontend
 * gửi `code` về đây, CMS đổi lấy token với Google rồi trả hồ sơ. Nhờ vậy đổi
 * ứng dụng Google mà không cần deploy lại frontend.
 */
export const AuthSettings: GlobalConfig = {
  slug: 'auth-settings',
  label: { en: 'Member Login', vi: 'Cài đặt Đăng nhập' },
  admin: {
    group: { en: 'System', vi: 'Hệ thống' },
    description: 'Cấu hình đăng nhập thành viên B2B: đăng ký, đăng nhập bằng Google.',
  },
  access: {
    read: isAdminOrEditor,
    update: isAdmin,
  },
  fields: [
    {
      name: 'allowRegistration',
      type: 'checkbox',
      defaultValue: true,
      label: { en: 'Allow self sign-up', vi: 'Cho phép tự đăng ký' },
      admin: { description: 'Tắt = chỉ admin tạo tài khoản thành viên.' },
    },
    {
      type: 'collapsible',
      label: { en: 'Google Sign-in', vi: 'Đăng nhập bằng Google' },
      fields: [
        {
          name: 'googleEnabled',
          type: 'checkbox',
          defaultValue: false,
          label: { en: 'Enable Google sign-in', vi: 'Bật đăng nhập bằng Google' },
        },
        {
          name: 'googleClientId',
          type: 'text',
          label: 'Google Client ID',
          admin: {
            description:
              'Lấy ở Google Cloud Console → APIs & Services → Credentials → OAuth client ID (Web application). (fallback: GOOGLE_OAUTH_CLIENT_ID)',
          },
        },
        {
          name: 'googleClientSecret',
          type: 'text',
          label: 'Google Client Secret',
          admin: {
            description:
              'Bí mật — chỉ admin xem/sửa, KHÔNG bao giờ gửi xuống trình duyệt. (fallback: GOOGLE_OAUTH_CLIENT_SECRET)',
          },
        },
        {
          name: 'googleNote',
          type: 'ui',
          admin: { components: { Field: '/components/GoogleAuthNote/GoogleAuthNote#GoogleAuthNote' } },
        },
      ],
    },
  ],
}
