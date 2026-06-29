import type { GlobalConfig } from 'payload'
import { anyone, isAdminOrEditor } from '../access/index.js'
import { ADMIN_GROUP_SYSTEM } from '../i18n/admin-groups.js'

const navItems = (name: string, label: string) => ({
  name,
  label,
  type: 'array' as const,
  fields: [
    { name: 'label', type: 'text' as const, localized: true, required: true },
    { name: 'url', type: 'text' as const, required: true },
    {
      name: 'children',
      type: 'array' as const,
      labels: { singular: 'Sub-item', plural: 'Sub-items' },
      fields: [
        { name: 'label', type: 'text' as const, localized: true, required: true },
        { name: 'url', type: 'text' as const, required: true },
      ],
    },
  ],
})

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  admin: { group: ADMIN_GROUP_SYSTEM },
  access: { read: anyone, update: isAdminOrEditor },
  fields: [navItems('header', 'Menu đầu trang'), navItems('footer', 'Menu chân trang')],
}
