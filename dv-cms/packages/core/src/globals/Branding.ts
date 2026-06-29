import type { GlobalConfig } from 'payload'
import { anyone, isAdminOrEditor } from '../access/index.js'
import { hexColorField } from '../fields/defineHexColorField.js'
import { googleFontField } from '../fields/googleFontField.js'
import { ADMIN_GROUP_SYSTEM } from '../i18n/admin-groups.js'
import { DEFAULT_ADMIN_THEME, DEFAULT_FRONTEND_THEME } from '../theme/defaults.js'

const px = (
  name: string,
  label: { en: string; vi: string },
  defaultValue: number,
  description?: { en: string; vi: string },
) => ({
  name,
  type: 'number' as const,
  label,
  defaultValue,
  admin: description ? { description } : undefined,
})

async function revalidateFrontendTheme() {
  const base = process.env.FRONTEND_URL
  const secret = process.env.REVALIDATE_SECRET
  if (!base) return
  const url = `${base}/api/revalidate?secret=${encodeURIComponent(secret ?? '')}&path=${encodeURIComponent('/')}`
  try {
    await fetch(url, { method: 'POST' })
  } catch {
    /* frontend may be offline in dev */
  }
}

/**
 * Whitelabel + theme tokens for the public website and the admin dashboard.
 * Admin colors use flat fields (existing DB columns). Website tokens use `frontendTheme` group.
 */
export const Branding: GlobalConfig = {
  slug: 'branding',
  label: { en: 'Branding & Theme', vi: 'Thương hiệu & Giao diện' },
  admin: {
    group: ADMIN_GROUP_SYSTEM,
    description: {
      en: 'Logo, brand name, and separate style tokens for the website and admin dashboard.',
      vi: 'Logo, tên thương hiệu và cấu hình giao diện riêng cho website và bảng quản trị.',
    },
  },
  access: { read: anyone, update: isAdminOrEditor },
  hooks: {
    afterChange: [async () => revalidateFrontendTheme()],
  },
  fields: [
    {
      name: 'brandName',
      type: 'text',
      label: { en: 'Brand name', vi: 'Tên thương hiệu' },
      defaultValue: 'Bioscope',
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: { en: 'Logo', vi: 'Logo' },
      admin: {
        description: {
          en: 'Used on the website, admin login, and sidebar.',
          vi: 'Dùng trên website, màn đăng nhập và menu admin.',
        },
      },
    },
    {
      name: 'loginSubtitle',
      type: 'text',
      localized: true,
      label: { en: 'Admin login subtitle', vi: 'Phụ đề đăng nhập admin' },
      defaultValue: 'Bảng điều khiển quản trị',
    },
    {
      type: 'collapsible',
      label: { en: 'Frontend website', vi: 'Giao diện website' },
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'frontendTheme',
          type: 'group',
          label: { en: 'Website colors & radius', vi: 'Màu & bo góc website' },
          admin: {
            description: {
              en: 'Maps to CSS variables on the public site (Tailwind tokens).',
              vi: 'Áp dụng lên biến CSS của website (token Tailwind).',
            },
          },
          fields: [
            hexColorField('primaryColor', { en: 'Primary', vi: 'Màu chính' }, DEFAULT_FRONTEND_THEME.primaryColor),
            hexColorField('primaryDark', { en: 'Primary dark', vi: 'Màu chính đậm' }, DEFAULT_FRONTEND_THEME.primaryDark),
            hexColorField('primaryTint', { en: 'Primary tint', vi: 'Nền nhạt' }, DEFAULT_FRONTEND_THEME.primaryTint),
            hexColorField('primaryBorder', { en: 'Primary border', vi: 'Viền nhạt' }, DEFAULT_FRONTEND_THEME.primaryBorder),
            hexColorField('accentColor', { en: 'Accent', vi: 'Màu nhấn' }, DEFAULT_FRONTEND_THEME.accentColor),
            hexColorField('accentSoft', { en: 'Accent soft', vi: 'Nền accent' }, DEFAULT_FRONTEND_THEME.accentSoft),
            hexColorField('ink', { en: 'Text ink', vi: 'Màu chữ' }, DEFAULT_FRONTEND_THEME.ink),
            hexColorField('mist', { en: 'Mist background', vi: 'Nền mist' }, DEFAULT_FRONTEND_THEME.mist),
            googleFontField('fontFamily', { en: 'Google Font', vi: 'Font Google' }, DEFAULT_FRONTEND_THEME.fontFamily, {
              en: 'Loaded from Google Fonts on the public website.',
              vi: 'Tải từ Google Fonts và áp dụng lên toàn bộ website.',
            }),
            px('radiusLg', { en: 'Radius LG (px)', vi: 'Bo góc LG (px)' }, DEFAULT_FRONTEND_THEME.radiusLg),
            px('radiusXl', { en: 'Radius XL (px)', vi: 'Bo góc XL (px)' }, DEFAULT_FRONTEND_THEME.radiusXl),
            px('radius2xl', { en: 'Radius 2XL (px)', vi: 'Bo góc 2XL (px)' }, DEFAULT_FRONTEND_THEME.radius2xl),
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: { en: 'Admin dashboard', vi: 'Giao diện quản trị' },
      admin: { initCollapsed: false },
      fields: [
        hexColorField('primaryColor', { en: 'Primary', vi: 'Màu chính' }, DEFAULT_ADMIN_THEME.primaryColor, {
          en: 'Admin buttons, links, accents.',
          vi: 'Nút, link và accent trong admin.',
        }),
        hexColorField('primaryDark', { en: 'Primary dark', vi: 'Màu chính đậm' }, DEFAULT_ADMIN_THEME.primaryDark),
        hexColorField('accentColor', { en: 'Accent', vi: 'Màu nhấn' }, DEFAULT_ADMIN_THEME.accentColor),
        hexColorField('sidebarBackground', { en: 'Sidebar background', vi: 'Nền sidebar' }, DEFAULT_ADMIN_THEME.sidebarBackground),
        px('radius', { en: 'Base radius (px)', vi: 'Bo góc cơ bản (px)' }, DEFAULT_ADMIN_THEME.radius),
        googleFontField('fontFamily', { en: 'Google Font', vi: 'Font Google' }, DEFAULT_ADMIN_THEME.fontFamily, {
          en: 'Admin dashboard typography.',
          vi: 'Font chữ trong bảng quản trị.',
        }),
      ],
    },
  ],
}
