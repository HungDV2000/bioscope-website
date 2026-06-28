import type { GlobalConfig } from 'payload'
import { anyone, isAdminOrEditor } from '../access/index.js'

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
  admin: { group: 'Hệ thống' },
  access: { read: anyone, update: isAdminOrEditor },
  fields: [navItems('header', 'Menu đầu trang'), navItems('footer', 'Menu chân trang')],
}
