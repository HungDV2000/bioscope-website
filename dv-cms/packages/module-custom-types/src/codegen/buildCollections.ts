import type { CollectionConfig, CollectionSlug, Field } from 'payload'
import { isAdminOrEditor, readPublishedOrStaff, seoField, slugField } from '@dv/cms-core'

import { ADMIN_GROUP_CUSTOM_TYPES } from '../i18n/admin-groups.js'
import type { ManifestContentType, ManifestTaxonomy, LocalizedLabel } from '../types.js'
import { fieldDefToPayloadField } from './fieldDefToPayloadField.js'

const toCollectionLabel = (label: LocalizedLabel): { en: string; vi: string } => {
  if (typeof label === 'string') return { en: label, vi: label }
  return { en: label.en ?? label.vi ?? '', vi: label.vi ?? label.en ?? '' }
}

const taxRelationshipName = (taxSlug: string) =>
  taxSlug.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()).replace(/-/g, '') + 'Terms'

/** Build a materialized Payload collection from a published content type manifest entry. */
export const buildContentTypeCollection = (
  ct: ManifestContentType,
  allTaxonomies: ManifestTaxonomy[],
): CollectionConfig => {
  const supports = ct.supports ?? {}
  const useDrafts = supports.drafts !== false
  const useLocalization = supports.localization !== false
  const useSlug = supports.slug !== false
  const useSeo = Boolean(supports.seo)

  const taxRelations = ct.taxonomies
    .map((taxSlug) => allTaxonomies.find((t) => t.slug === taxSlug))
    .filter((t): t is ManifestTaxonomy => Boolean(t))

  const fields: Field[] = [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: useLocalization,
    },
    ...(useSlug ? [slugField('title')] : []),
    ...ct.fields.map(fieldDefToPayloadField),
    ...taxRelations.map(
      (tax): Field => ({
        name: taxRelationshipName(tax.slug),
        type: 'relationship',
        relationTo: tax.collectionSlug as CollectionSlug,
        hasMany: true,
        admin: {
          position: 'sidebar',
          description: `Taxonomy: ${tax.slug}`,
        },
      }),
    ),
    ...(useSeo ? [seoField()] : []),
  ]

  return {
    slug: ct.slug,
    labels: {
      singular: toCollectionLabel(ct.labels.singular),
      plural: toCollectionLabel(ct.labels.plural),
    },
    trash: false,
    admin: {
      useAsTitle: 'title',
      group: ADMIN_GROUP_CUSTOM_TYPES,
      defaultColumns: ['title', ...(useSlug ? ['slug'] : []), '_status'],
    },
    ...(useDrafts ? { versions: { drafts: { autosave: false }, maxPerDoc: 20 } } : {}),
    access: {
      read: useDrafts ? readPublishedOrStaff : isAdminOrEditor,
      create: isAdminOrEditor,
      update: isAdminOrEditor,
      delete: isAdminOrEditor,
    },
    fields,
  }
}

/** Build taxonomy term collection `tax-{slug}`. */
export const buildTaxonomyCollection = (tax: ManifestTaxonomy): CollectionConfig => {
  const fields: Field[] = [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    slugField('name'),
    ...(tax.hierarchical
      ? [
          {
            name: 'parent',
            type: 'relationship',
            relationTo: tax.collectionSlug as CollectionSlug,
            admin: { position: 'sidebar' },
          } satisfies Field,
        ]
      : []),
  ]

  return {
    slug: tax.collectionSlug,
    labels: {
      singular: toCollectionLabel(tax.labels.singular),
      plural: toCollectionLabel(tax.labels.plural),
    },
    trash: false,
    admin: {
      useAsTitle: 'name',
      group: ADMIN_GROUP_CUSTOM_TYPES,
      defaultColumns: ['name', 'slug'],
    },
    access: {
      read: isAdminOrEditor,
      create: isAdminOrEditor,
      update: isAdminOrEditor,
      delete: isAdminOrEditor,
    },
    fields,
  }
}

export { taxRelationshipName }
