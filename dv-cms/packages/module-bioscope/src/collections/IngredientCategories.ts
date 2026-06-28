import type { CollectionConfig } from 'payload'
import { anyone, isAdminOrEditor, slugField } from '@dv/cms-core'

export const IngredientCategories: CollectionConfig = {
  slug: 'ingredient-categories',
  labels: { singular: 'Ingredient Category', plural: 'Ingredient Categories' },
  admin: { useAsTitle: 'name', group: 'Bioscope', defaultColumns: ['name', 'scope'] },
  access: { read: anyone, create: isAdminOrEditor, update: isAdminOrEditor, delete: isAdminOrEditor },
  fields: [
    { name: 'name', type: 'text', localized: true, required: true },
    slugField('name'),
    {
      name: 'scope',
      type: 'select',
      defaultValue: 'both',
      options: [
        { label: 'Supplement', value: 'supplement' },
        { label: 'Cosmetic', value: 'cosmetic' },
        { label: 'Both', value: 'both' },
      ],
    },
  ],
}
