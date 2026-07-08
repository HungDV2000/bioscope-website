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

/** Ping the frontend to revalidate the shared layout (header/footer) after edit. */
async function revalidateLayout() {
  const base = process.env.FRONTEND_URL
  const secret = process.env.REVALIDATE_SECRET
  if (!base) return
  try {
    await fetch(`${base}/api/revalidate?secret=${encodeURIComponent(secret ?? '')}&path=${encodeURIComponent('/')}`, {
      method: 'POST',
    })
  } catch {
    /* frontend may be offline in dev */
  }
}

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  admin: { group: ADMIN_GROUP_SYSTEM },
  access: { read: anyone, update: isAdminOrEditor },
  hooks: { afterChange: [async () => revalidateLayout()] },
  fields: [navItems('header', 'Menu đầu trang'), navItems('footer', 'Menu chân trang')],
}
