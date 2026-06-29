import type { CollectionSlug, Field } from 'payload'

import type { CustomFieldDef, LocalizedLabel } from '../types.js'

const toStaticLabel = (label: LocalizedLabel | undefined): string | Record<string, string> | undefined => {
  if (!label) return undefined
  if (typeof label === 'string') return label
  const out: Record<string, string> = {}
  if (label.en) out.en = label.en
  if (label.vi) out.vi = label.vi
  return Object.keys(out).length ? out : undefined
}

/** Map admin field definition → Payload Field (used by codegen). */
export const fieldDefToPayloadField = (def: CustomFieldDef): Field => {
  const base = {
    name: def.name,
    label: toStaticLabel(def.label ?? undefined),
    required: Boolean(def.required),
    ...(def.localized ? { localized: true } : {}),
  }

  switch (def.type) {
    case 'text':
      return { ...base, type: 'text' }
    case 'textarea':
      return { ...base, type: 'textarea' }
    case 'number':
      return { ...base, type: 'number' }
    case 'email':
      return { ...base, type: 'email' }
    case 'checkbox':
      return { ...base, type: 'checkbox' }
    case 'date':
      return { ...base, type: 'date' }
    case 'richText':
      return { ...base, type: 'richText' }
    case 'upload':
      return { ...base, type: 'upload', relationTo: 'media' }
    case 'select':
      return {
        ...base,
        type: 'select',
        options: (def.options ?? []).map((o) => ({
          label: toStaticLabel(o.label ?? o.value) ?? o.value,
          value: o.value,
        })),
      }
    case 'relationship':
      return {
        ...base,
        type: 'relationship',
        relationTo: (def.relationTo ?? 'media') as CollectionSlug,
      }
    case 'repeater':
      return {
        ...base,
        type: 'array',
        fields: (def.subFields ?? []).map(fieldDefToPayloadField),
      }
    case 'group':
      return {
        ...base,
        type: 'group',
        fields: (def.subFields ?? []).map(fieldDefToPayloadField),
      }
    default:
      return { ...base, type: 'text' }
  }
}
