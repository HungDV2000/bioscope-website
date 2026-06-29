import type { Field } from 'payload'

import type { CustomFieldType } from '../types.js'

const FIELD_TYPE_OPTIONS: { label: string; value: CustomFieldType }[] = [
  { label: 'Text', value: 'text' },
  { label: 'Textarea', value: 'textarea' },
  { label: 'Number', value: 'number' },
  { label: 'Email', value: 'email' },
  { label: 'Checkbox', value: 'checkbox' },
  { label: 'Select', value: 'select' },
  { label: 'Date', value: 'date' },
  { label: 'Rich text', value: 'richText' },
  { label: 'Image / file', value: 'upload' },
  { label: 'Relationship', value: 'relationship' },
  { label: 'Repeater', value: 'repeater' },
  { label: 'Group', value: 'group' },
]

const LEAF_FIELD_TYPE_OPTIONS = FIELD_TYPE_OPTIONS.filter(
  (o) => o.value !== 'repeater' && o.value !== 'group',
)

/**
 * Schema for the field builder UI.
 * @param allowNested — root level may define repeater/group sub-fields; nested level is leaf-only (avoids infinite recursion).
 */
export const customFieldDefFields = (allowNested = true): Field[] => [
  {
    name: 'name',
    type: 'text',
    required: true,
    admin: { description: 'Khóa field (vd: subtitle, hero_image).' },
  },
  {
    name: 'label',
    type: 'text',
    localized: true,
    admin: { description: 'Nhãn hiển thị trong admin.' },
  },
  {
    name: 'type',
    type: 'select',
    required: true,
    defaultValue: 'text',
    options: allowNested ? FIELD_TYPE_OPTIONS : LEAF_FIELD_TYPE_OPTIONS,
  },
  { name: 'required', type: 'checkbox', defaultValue: false },
  { name: 'localized', type: 'checkbox', defaultValue: false },
  {
    name: 'options',
    type: 'array',
    admin: { condition: (_, sibling) => sibling?.type === 'select' },
    fields: [
      { name: 'label', type: 'text', localized: true },
      { name: 'value', type: 'text', required: true },
    ],
  },
  {
    name: 'relationTo',
    type: 'text',
    admin: {
      condition: (_, sibling) => sibling?.type === 'relationship',
      description: 'Slug collection đích: media, tax-xxx, hoặc CPT slug.',
    },
  },
  ...(allowNested
    ? [
        {
          name: 'subFields',
          type: 'array' as const,
          admin: {
            condition: (_: unknown, sibling: { type?: string }) =>
              sibling?.type === 'repeater' || sibling?.type === 'group',
            description: 'Field con cho repeater / group (1 cấp lồng).',
          },
          fields: customFieldDefFields(false),
        },
      ]
    : []),
]
