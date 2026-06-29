/** Slugs reserved by core modules — custom types cannot use these. */
export const RESERVED_COLLECTION_SLUGS = new Set([
  'users',
  'media',
  'pages',
  'posts',
  'categories',
  'tags',
  'forms',
  'form-submissions',
  'redirects',
  'members',
  'gated-documents',
  'partners',
  'product-categories',
  'products',
  'ingredient-categories',
  'ingredients',
  'technologies',
  'services',
  'certifications',
  'case-studies',
  'faqs',
  'payload-folders',
  'ct-definitions',
  'tax-definitions',
  'field-groups',
])

export const taxonomyCollectionSlug = (taxSlug: string) => `tax-${taxSlug}`

export const SLUG_PATTERN = /^[a-z][a-z0-9-]*$/

export const assertValidSlug = (slug: string, label = 'slug'): void => {
  if (!SLUG_PATTERN.test(slug)) {
    throw new Error(`${label} "${slug}" không hợp lệ (chỉ a-z, 0-9, gạch ngang, bắt đầu bằng chữ).`)
  }
  if (RESERVED_COLLECTION_SLUGS.has(slug)) {
    throw new Error(`${label} "${slug}" trùng collection hệ thống.`)
  }
  if (slug.startsWith('tax-')) {
    throw new Error(`${label} "${slug}" không được bắt đầu bằng "tax-".`)
  }
}
