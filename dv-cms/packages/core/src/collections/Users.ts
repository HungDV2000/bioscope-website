import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminFieldLevel, isStaffUser } from '../access/index.js'

/** Staff accounts for the admin panel (separate from B2B `members`). */
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Hệ thống',
  },
  access: {
    read: isStaffUser,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
    admin: isStaffUser,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Viewer', value: 'viewer' },
      ],
      access: { update: isAdminFieldLevel },
      admin: { description: 'Phân quyền truy cập admin.' },
    },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
  ],
}
