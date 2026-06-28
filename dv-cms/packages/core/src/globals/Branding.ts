import type { GlobalConfig } from 'payload'
import { anyone, isAdminOrEditor } from '../access/index.js'

/**
 * Whitelabel theme/branding for the admin panel. Editable live; the admin
 * `ThemeInjector` reads it and applies CSS variables, and `BrandLogo` renders
 * the logo. One Branding doc per site instance.
 */
export const Branding: GlobalConfig = {
  slug: 'branding',
  label: 'Branding / Theme',
  admin: { group: 'Hệ thống', description: 'Whitelabel: logo, màu sắc, bo góc cho trang quản trị.' },
  access: { read: anyone, update: isAdminOrEditor },
  fields: [
    { name: 'brandName', type: 'text', defaultValue: 'Bioscope' },
    { name: 'logo', type: 'upload', relationTo: 'media', admin: { description: 'Logo hiển thị ở đăng nhập & menu.' } },
    { name: 'loginSubtitle', type: 'text', localized: true, defaultValue: 'Bảng điều khiển quản trị' },
    {
      type: 'collapsible',
      label: 'Màu & Style',
      fields: [
        { name: 'primaryColor', type: 'text', defaultValue: '#0E6147', admin: { description: 'Màu thương hiệu chính (hex).' } },
        { name: 'primaryDark', type: 'text', defaultValue: '#00301A' },
        { name: 'accentColor', type: 'text', defaultValue: '#F7941D' },
        { name: 'radius', type: 'number', defaultValue: 12, admin: { description: 'Bo góc (px).' } },
        { name: 'fontFamily', type: 'text', admin: { description: 'Font CSS, vd: "Be Vietnam Pro", sans-serif.' } },
      ],
    },
  ],
}
