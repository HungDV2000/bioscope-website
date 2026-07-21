import type { Field } from 'payload'
import { slugify } from '../utils/slugify.js'

/**
 * Reusable URL slug field.
 * - **Localized**: each language keeps its own path (vi/en). The frontend resolves
 *   a page by `?locale=xx` so the slug is matched against that language's value.
 * - Auto-generates from `sourceField` (default `title`, also localized) when left
 *   blank, per the language currently being edited.
 * - Indexed + unique **per locale**.
 *
 * ⚠️ Migration: turning this localized moves `slug` into each collection's
 * `*_locales` table. Existing (non-localized) slugs MUST be copied into the `vi`
 * locale first, otherwise pages 404. See docs/09-migration-localized-slug.md.
 */
export const slugField = (sourceField = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  index: true,
  unique: true,
  localized: true,
  admin: {
    position: 'sidebar',
    description: 'Đường dẫn theo từng ngôn ngữ. Để trống sẽ tự tạo từ tiêu đề của ngôn ngữ đang chọn.',
  },
  hooks: {
    beforeValidate: [
      ({ value, data, originalDoc }) => {
        // Runs per-locale: `value` / `data[sourceField]` are already the values
        // for the locale being validated.
        if (typeof value === 'string' && value.length > 0) return slugify(value)
        const source = data?.[sourceField] ?? originalDoc?.[sourceField]
        return slugify(source)
      },
    ],
  },
})
