/**
 * ConsentLog — proof-of-consent records (GDPR accountability). One row per
 * consent action: which categories were granted, when, from where. IP is stored
 * truncated (last octet dropped) to stay privacy-friendly.
 */

import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrEditor } from '@dv/cms-core'

export const ConsentLog: CollectionConfig = {
  slug: 'consent-log',
  admin: {
    group: 'Security',
    useAsTitle: 'consentId',
    defaultColumns: ['consentId', 'categories', 'ipTrunc', 'url', 'createdAt'],
    description: 'Bằng chứng đồng ý cookie (proof-of-consent).',
  },
  access: {
    read: isAdminOrEditor,
    create: () => true, // written by the public record endpoint via overrideAccess
    update: () => false,
    delete: isAdmin,
  },
  fields: [
    { name: 'consentId', type: 'text', index: true, admin: { readOnly: true } },
    { name: 'categories', type: 'text', admin: { readOnly: true, description: 'Danh mục đã đồng ý (CSV).' } },
    { name: 'action', type: 'text', admin: { readOnly: true } },
    { name: 'ipTrunc', type: 'text', admin: { readOnly: true, description: 'IP đã ẩn octet cuối.' } },
    { name: 'country', type: 'text', admin: { readOnly: true } },
    { name: 'url', type: 'text', admin: { readOnly: true } },
    { name: 'userAgent', type: 'text', admin: { readOnly: true } },
    { name: 'policyVersion', type: 'text', admin: { readOnly: true } },
  ],
  timestamps: true,
}
