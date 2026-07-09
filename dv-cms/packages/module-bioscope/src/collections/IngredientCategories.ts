import type { CollectionConfig } from 'payload'
import { anyone, isAdminOrEditor, slugField } from '@dv/cms-core'

export const IngredientCategories: CollectionConfig = {
  slug: 'ingredient-categories',
  labels: { singular: 'Ingredient Category', plural: 'Ingredient Categories' },
  admin: {
    useAsTitle: 'name',
    group: 'Bioscope',
    defaultColumns: ['name', 'scope', 'driveId'],
  },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    { name: 'name', type: 'text', localized: true, required: true },
    slugField('name'),
    {
      // Drive folder ID cấp 1 (dùng để dedup theo driveId thay vì externalId)
      name: 'driveId',
      label: 'Drive Folder ID',
      type: 'text',
      index: true,
      unique: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Google Drive folder ID của danh mục này.',
      },
    },
    {
      // Parent folder ID (thường là root)
      name: 'driveParentId',
      label: 'Drive Parent ID',
      type: 'text',
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      // Stable key cho sync — dùng driveId nếu có, không thì slugify
      name: 'externalId',
      label: 'External ID (CMS Sync)',
      type: 'text',
      index: true,
      unique: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Dùng driveId hoặc slugify(name).',
      },
    },
    {
      name: 'scope',
      type: 'select',
      defaultValue: 'both',
      options: [
        { label: 'Supplement', value: 'supplement' },
        { label: 'Cosmetic', value: 'cosmetic' },
        { label: 'Both', value: 'both' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
}
