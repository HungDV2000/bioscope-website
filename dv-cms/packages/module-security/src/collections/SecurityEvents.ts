/**
 * SecurityEvents — live traffic / audit log of blocked (or, in monitor mode,
 * would-be-blocked) requests and login events. This is the "Live Traffic" +
 * "Blocked" view analogous to Wordfence.
 */

import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrEditor } from '@dv/cms-core'

export const SecurityEvents: CollectionConfig = {
  slug: 'security-events',
  admin: {
    group: 'Security',
    useAsTitle: 'ip',
    defaultColumns: ['type', 'action', 'ip', 'path', 'reason', 'createdAt'],
    description: 'Nhật ký sự kiện bảo mật (request bị chặn, đăng nhập, quét).',
    // Read-only history — created by the firewall/hooks, never edited by hand.
    disableCopyToLocale: true,
  },
  access: {
    read: isAdminOrEditor,
    create: () => true, // written by the firewall/hooks via overrideAccess
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'firewall',
      options: [
        { label: 'Firewall', value: 'firewall' },
        { label: 'Rate limit', value: 'rate-limit' },
        { label: 'Login', value: 'login' },
        { label: 'Scan', value: 'scan' },
      ],
      index: true,
    },
    {
      name: 'action',
      type: 'select',
      required: true,
      defaultValue: 'blocked',
      options: [
        { label: 'Blocked', value: 'blocked' },
        { label: 'Monitored (không chặn)', value: 'monitored' },
        { label: 'Allowed', value: 'allowed' },
        { label: 'Lockout', value: 'lockout' },
      ],
    },
    { name: 'ip', type: 'text', index: true },
    { name: 'reason', type: 'text' },
    { name: 'path', type: 'text' },
    { name: 'method', type: 'text' },
    { name: 'userAgent', type: 'text' },
    { name: 'country', type: 'text' },
    { name: 'username', type: 'text', admin: { description: 'Cho sự kiện đăng nhập.' } },
  ],
  timestamps: true,
}
