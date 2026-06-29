/** Field types supported by the custom field builder (codegen → Payload fields). */
export type CustomFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'checkbox'
  | 'select'
  | 'date'
  | 'richText'
  | 'upload'
  | 'relationship'
  | 'repeater'
  | 'group'

export type LocalizedLabel = string | { en?: string | null; vi?: string | null }

export type CustomFieldDef = {
  name: string
  label?: LocalizedLabel
  type: CustomFieldType
  required?: boolean | null
  localized?: boolean | null
  /** Options for `select` fields. */
  options?: { label?: LocalizedLabel; value: string }[] | null
  /** Target collection slug for `relationship` (e.g. `media`, `tax-topics`, `my-cpt`). */
  relationTo?: string | null
  /** Nested fields for `repeater` / `group`. */
  subFields?: CustomFieldDef[] | null
}

export type ContentTypeSupports = {
  drafts?: boolean | null
  localization?: boolean | null
  slug?: boolean | null
  seo?: boolean | null
}

export type ManifestContentType = {
  id: string | number
  slug: string
  labels: {
    singular: LocalizedLabel
    plural: LocalizedLabel
  }
  supports: ContentTypeSupports
  fields: CustomFieldDef[]
  taxonomies: string[]
}

export type ManifestTaxonomy = {
  id: string | number
  slug: string
  /** Generated Payload collection slug (`tax-{slug}`). */
  collectionSlug: string
  labels: {
    singular: LocalizedLabel
    plural: LocalizedLabel
  }
  hierarchical: boolean
  contentTypes: string[]
}

export type CustomTypesManifest = {
  version: 1
  generatedAt: string
  contentTypes: ManifestContentType[]
  taxonomies: ManifestTaxonomy[]
}
