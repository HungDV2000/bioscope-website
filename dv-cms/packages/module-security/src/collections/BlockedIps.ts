/**
 * BlockedIps — dynamic IP blocklist (brute-force lockouts, rate-limit bans,
 * manual bans). The firewall consults this on every request, so it is the
 * runtime counterpart to the static blocklist in SecuritySettings.
 */

import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrEditor } from '@dv/cms-core'

export const BlockedIps: CollectionConfig = {
  slug: 'blocked-ips',
  admin: {
    group: 'Security',
    useAsTitle: 'ip',
    defaultColumns: ['ip', 'reason', 'source', 'expiresAt', 'hits', 'createdAt'],
    description: 'IP đang bị chặn (tự động + thủ công).',
  },
  access: {
    read: isAdminOrEditor,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  indexes: [{ fields: ['ip'], unique: true }],
  fields: [
    { name: 'ip', type: 'text', required: true, index: true },
    {
      name: 'reason',
      type: 'text',
      admin: { description: 'VD: brute-force, rate-limit, manual, attack-signature.' },
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'manual',
      options: [
        { label: 'Thủ công', value: 'manual' },
        { label: 'Brute-force', value: 'brute-force' },
        { label: 'Rate limit', value: 'rate-limit' },
        { label: 'Firewall', value: 'firewall' },
      ],
    },
    {
      name: 'expiresAt',
      type: 'date',
      admin: {
        description: 'Bỏ trống = chặn vĩnh viễn.',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    { name: 'hits', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'lastUserAgent', type: 'text', admin: { readOnly: true } },
  ],
}
