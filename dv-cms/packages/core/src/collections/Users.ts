import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminFieldLevel, isStaffUser } from '../access/index.js'
import { ADMIN_GROUP_SYSTEM } from '../i18n/admin-groups.js'

/** Staff accounts for the admin panel (separate from B2B `members`). */
export const Users: CollectionConfig = {
  slug: 'users',
  // Brute-force protection: lock an account for 15 min after 5 failed logins.
  auth: {
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    // Payload's default is 2h. The admin schedules an inactivity logout from the
    // token's remaining life, so editors were being kicked to /admin/login in the
    // middle of a task — e.g. right as the "choose from library" media drawer
    // opened, which left a blank screen behind the drawer. 8h covers a work day.
    tokenExpiration: 60 * 60 * 8,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
    group: ADMIN_GROUP_SYSTEM,
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
