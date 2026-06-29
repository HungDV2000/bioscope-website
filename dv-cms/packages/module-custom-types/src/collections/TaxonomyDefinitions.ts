import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '@dv/cms-core'

import { ADMIN_GROUP_CUSTOM_TYPES } from '../i18n/admin-groups.js'
import { contentCollectionSlugsField } from '../fields/contentCollectionSlugsField.js'
import { assertValidSlug, taxonomyCollectionSlug } from '../lib/reserved-slugs.js'
import { cascadeDeleteTaxonomy } from '../hooks/cascadeDeleteTaxonomy.js'
import { syncManifestAfterChange, syncManifestAfterDelete } from '../hooks/syncManifest.js'

/** Taxonomy definition — codegen creates collection `tax-{slug}`. */
export const TaxonomyDefinitions: CollectionConfig = {
  slug: 'tax-definitions',
  labels: {
    singular: { en: 'Taxonomy', vi: 'Taxonomy' },
    plural: { en: 'Taxonomies', vi: 'Taxonomies' },
  },
  trash: false,
  admin: {
    useAsTitle: 'slug',
    group: ADMIN_GROUP_CUSTOM_TYPES,
    defaultColumns: ['slug', 'status', 'updatedAt'],
  },
  access: {
    read: isAdminOrEditor,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.slug) assertValidSlug(String(data.slug), 'Taxonomy slug')
        if (data?.slug && taxonomyCollectionSlug(String(data.slug)).length > 63) {
          throw new Error('Taxonomy slug quá dài.')
        }
      },
    ],
    beforeDelete: [cascadeDeleteTaxonomy],
    afterChange: [syncManifestAfterChange],
    afterDelete: [syncManifestAfterDelete],
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Slug taxonomy (vd: topic). Collection: tax-topic.' },
    },
    {
      name: 'labels',
      type: 'group',
      fields: [
        { name: 'singular', type: 'text', localized: true, required: true },
        { name: 'plural', type: 'text', localized: true, required: true },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: { en: 'Draft', vi: 'Nháp' }, value: 'draft' },
        { label: { en: 'Published', vi: 'Đã xuất bản' }, value: 'published' },
        { label: { en: 'Archived', vi: 'Lưu trữ' }, value: 'archived' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'hierarchical', type: 'checkbox', defaultValue: false, label: 'Hierarchical (parent/child)' },
    contentCollectionSlugsField('contentTypes', {
      admin: {
        description:
          'Chọn loại nội dung dùng taxonomy này (pages, posts, CPT tùy chỉnh, v.v.).',
      },
    }),
  ],
}
