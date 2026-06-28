import type { Field } from 'payload'

/**
 * Reusable "technical specs" array — used by any product-like collection
 * (ingredients, technologies, …). Supports several display styles so the
 * frontend can render bars/donuts/plain values.
 */
export const specsField = (name = 'specs'): Field => ({
  name,
  type: 'array',
  labels: { singular: 'Spec', plural: 'Specs' },
  fields: [
    { name: 'label', type: 'text', localized: true, required: true },
    { name: 'value', type: 'text', required: true },
    { name: 'unit', type: 'text' },
    {
      name: 'display',
      type: 'select',
      defaultValue: 'text',
      options: [
        { label: 'Text', value: 'text' },
        { label: 'Number', value: 'number' },
        { label: 'Bar', value: 'bar' },
        { label: 'Donut', value: 'donut' },
      ],
    },
    {
      name: 'percent',
      type: 'number',
      min: 0,
      max: 100,
      admin: {
        description: '0–100 (cho dạng bar/donut).',
        condition: (_, sibling) => ['bar', 'donut'].includes(sibling?.display),
      },
    },
  ],
})
