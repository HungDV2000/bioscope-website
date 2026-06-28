import type { CollectionConfig, CollectionSlug, Field } from 'payload'
import { isAdminOrEditor, readPublishedOrStaff, seoField, slugField } from '@dv/cms-core'
import { specsField } from '../fields/specs.js'

export type ProductCollectionOptions = {
  slug?: string
  labels?: { singular: string; plural: string }
  /** Slug of the category collection to relate to (optional). */
  categoriesSlug?: string
  group?: string
  /** Extra fields appended before the SEO group. */
  extraFields?: Field[]
}

/**
 * Factory for a generic, catalog-style collection (localized, drafts, SEO,
 * partner + specs). Sites compose it for simple product catalogs; Bioscope
 * instead defines bespoke collections but reuses `specsField`/`Partners`.
 */
export const createProductCollection = (opts: ProductCollectionOptions = {}): CollectionConfig => {
  const slug = opts.slug ?? 'products'
  return {
    slug,
    labels: opts.labels,
    admin: {
      useAsTitle: 'name',
      group: opts.group ?? 'Catalog',
      defaultColumns: ['name', 'partner', 'featured', '_status'],
    },
    versions: { drafts: { autosave: false }, maxPerDoc: 10 },
    access: {
      read: readPublishedOrStaff,
      create: isAdminOrEditor,
      update: isAdminOrEditor,
      delete: isAdminOrEditor,
    },
    fields: [
      { name: 'name', type: 'text', localized: true, required: true },
      slugField('name'),
      { name: 'subtitle', type: 'text', localized: true },
      ...(opts.categoriesSlug
        ? ([
            {
              name: 'category',
              type: 'relationship',
              relationTo: opts.categoriesSlug as CollectionSlug,
              admin: { position: 'sidebar' },
            },
          ] as Field[])
        : []),
      {
        name: 'partner',
        type: 'relationship',
        relationTo: 'partners' as CollectionSlug,
        admin: { position: 'sidebar' },
      },
      { name: 'description', type: 'richText', localized: true },
      { name: 'featuredImage', type: 'upload', relationTo: 'media' },
      {
        name: 'gallery',
        type: 'array',
        fields: [{ name: 'image', type: 'upload', relationTo: 'media' }],
      },
      specsField('specs'),
      { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
      ...(opts.extraFields ?? []),
      seoField(),
    ],
  }
}
