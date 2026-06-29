import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '@dv/cms-core'

import { ADMIN_GROUP_CUSTOM_TYPES } from '../i18n/admin-groups.js'
import { contentCollectionSlugsField } from '../fields/contentCollectionSlugsField.js'
import { customFieldDefFields } from '../fields/customFieldDefFields.js'
import { cascadeDeleteContentType } from '../hooks/cascadeDeleteContentType.js'
import { syncManifestAfterChange, syncManifestAfterDelete } from '../hooks/syncManifest.js'

/** Field group — reusable ACF-style field sets attached to content types. */
export const FieldGroups: CollectionConfig = {
  slug: 'field-groups',
  labels: {
    singular: { en: 'Field group', vi: 'Nhóm field' },
    plural: { en: 'Field groups', vi: 'Nhóm field' },
  },
  trash: false,
  admin: {
    useAsTitle: 'title',
    group: ADMIN_GROUP_CUSTOM_TYPES,
    defaultColumns: ['title', 'updatedAt'],
  },
  access: {
    read: isAdminOrEditor,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    afterChange: [syncManifestAfterChange],
    afterDelete: [syncManifestAfterDelete],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'fields',
      type: 'array',
      labels: { singular: 'Field', plural: 'Fields' },
      fields: customFieldDefFields(),
    },
    contentCollectionSlugsField('attachTo', {
      admin: {
        description:
          'Chọn loại nội dung nhận bộ field này (pages, posts, CPT tùy chỉnh, v.v.).',
      },
    }),
  ],
}
