import type { Field } from 'payload'
import { slugify } from '../utils/slugify.js'

/**
 * Reusable URL slug field.
 * - Auto-generates from `sourceField` (default `title`) when left blank.
 * - Unique + indexed, lives in the sidebar.
 * Slug itself is NOT localized (one canonical path); localize the title instead.
 */
export const slugField = (sourceField = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  index: true,
  unique: true,
  admin: {
    position: 'sidebar',
    description: 'Để trống sẽ tự tạo từ tiêu đề.',
  },
  hooks: {
    beforeValidate: [
      ({ value, data, originalDoc }) => {
        if (typeof value === 'string' && value.length > 0) return slugify(value)
        const source = data?.[sourceField] ?? originalDoc?.[sourceField]
        return slugify(source)
      },
    ],
  },
})
