import type { CollectionConfig } from 'payload'

const EXCLUDE_SLUGS = new Set([
  'payload-folders',
  'payload-kv',
  'payload-locked-documents',
  'payload-preferences',
  'payload-migrations',
  'users',
  'members',
])

const labelOf = (col: CollectionConfig): string => {
  const plural = col.labels?.plural
  if (typeof plural === 'string') return plural
  if (plural && typeof plural === 'object') {
    return String(plural.vi ?? plural.en ?? col.slug)
  }
  return col.slug
}

/** Collections hiển thị trong picker Content type (mọi CPT + core content, trừ hệ thống). */
export const listSelectableContentCollections = (
  collections: CollectionConfig[] | undefined,
): { label: string; value: string }[] => {
  if (!collections?.length) return []

  return collections
    .filter((col) => {
      const slug = col.slug
      if (!slug || slug.startsWith('payload-')) return false
      if (EXCLUDE_SLUGS.has(slug)) return false
      if (col.admin?.hidden === true) return false
      return true
    })
    .map((col) => ({ label: labelOf(col), value: col.slug }))
    .sort((a, b) => a.label.localeCompare(b.label, 'vi'))
}
