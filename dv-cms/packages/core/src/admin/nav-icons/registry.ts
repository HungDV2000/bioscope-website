import type { NavIconName } from './types.js'

/** Map collection / global slug → icon (extend when adding modules). */
export const NAV_ICON_BY_SLUG: Record<string, NavIconName> = {
  // Permissions
  'staff-roles': 'shield',

  // System
  users: 'users',
  media: 'image',
  redirects: 'redirect',
  'site-settings': 'settings',
  navigation: 'navigation',
  branding: 'palette',
  languages: 'languages',

  // Content
  pages: 'file',
  posts: 'newspaper',
  categories: 'folder',
  tags: 'tag',
  forms: 'form',
  'form-submissions': 'inbox',

  // Custom types
  'ct-definitions': 'layers',
  'tax-definitions': 'list-tree',
  'field-groups': 'blocks',

  // Catalog
  partners: 'handshake',
  'product-categories': 'grid',
  products: 'package',

  // Bioscope
  'ingredient-categories': 'beaker',
  ingredients: 'flask',
  technologies: 'cpu',
  services: 'briefcase',
  certifications: 'award',
  'case-studies': 'book',
  faqs: 'help',

  // B2B
  members: 'user-circle',
  'gated-documents': 'lock',
}

export function parseNavLinkId(id: string): string | null {
  if (id.startsWith('nav-global-')) return id.slice('nav-global-'.length)
  if (id.startsWith('nav-')) return id.slice('nav-'.length)
  return null
}

export function getNavIconName(slug: string): NavIconName {
  return NAV_ICON_BY_SLUG[slug] ?? 'default'
}
