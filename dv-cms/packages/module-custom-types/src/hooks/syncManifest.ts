import fs from 'fs/promises'
import path from 'path'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, Payload } from 'payload'

import type {
  CustomFieldDef,
  CustomTypesManifest,
  ManifestContentType,
  ManifestTaxonomy,
} from '../types.js'
import { taxonomyCollectionSlug } from '../lib/reserved-slugs.js'

export const defaultManifestPath = () =>
  path.resolve(process.cwd(), 'generated/ct-manifest.json')

const asId = (v: unknown): string | number => {
  if (typeof v === 'object' && v !== null && 'id' in v) return (v as { id: string | number }).id
  return v as string | number
}

const asSlug = (v: unknown): string => {
  if (typeof v === 'object' && v !== null && 'slug' in v) return String((v as { slug: string }).slug)
  return String(v)
}

const flattenFieldGroup = (group: Record<string, unknown>): CustomFieldDef[] => {
  const fields = group.fields
  if (!Array.isArray(fields)) return []
  return fields as CustomFieldDef[]
}

const inlineFields = (ct: Record<string, unknown>): CustomFieldDef[] => {
  const fields = ct.fields
  if (!Array.isArray(fields)) return []
  return fields as CustomFieldDef[]
}

const matchesContentTarget = (targets: unknown[], ctId: string | number, ctSlug: string): boolean =>
  targets.some((c) => asId(c) === ctId || asSlug(c) === ctSlug)

const taxonomyAppliesToCt = (
  tax: Record<string, unknown>,
  ctId: string | number,
  ctSlug: string,
): boolean => {
  const ctypes = Array.isArray(tax.contentTypes) ? tax.contentTypes : []
  return matchesContentTarget(ctypes, ctId, ctSlug)
}

const mergeFields = (inline: CustomFieldDef[], fromGroups: CustomFieldDef[]): CustomFieldDef[] => {
  const seen = new Set<string>()
  const out: CustomFieldDef[] = []
  for (const f of [...inline, ...fromGroups]) {
    if (!f.name || seen.has(f.name)) continue
    seen.add(f.name)
    out.push(f)
  }
  return out
}

export const buildManifestFromPayload = async (payload: Payload): Promise<CustomTypesManifest> => {
  const [cts, taxes, groups] = await Promise.all([
    payload.find({
      collection: 'ct-definitions',
      where: { status: { equals: 'published' } },
      limit: 200,
      depth: 1,
      pagination: false,
    }),
    payload.find({
      collection: 'tax-definitions',
      where: { status: { equals: 'published' } },
      limit: 200,
      depth: 1,
      pagination: false,
    }),
    payload.find({
      collection: 'field-groups',
      limit: 500,
      depth: 1,
      pagination: false,
    }),
  ])

  const contentTypes: ManifestContentType[] = cts.docs.map((ct) => {
    const ctId = ct.id
    const ctSlug = String(ct.slug)

    const groupFields: CustomFieldDef[] = []
    for (const g of groups.docs) {
      const attach = Array.isArray(g.attachTo) ? g.attachTo : []
      if (matchesContentTarget(attach, ctId, ctSlug)) {
        groupFields.push(...flattenFieldGroup(g as Record<string, unknown>))
      }
    }

    const taxSlugs = taxes.docs
      .filter((tax) => taxonomyAppliesToCt(tax as Record<string, unknown>, ctId, ctSlug))
      .map((tax) => String(tax.slug))

    return {
      id: ct.id,
      slug: ctSlug,
      labels: {
        singular: (ct.labels as ManifestContentType['labels'])?.singular ?? ct.slug,
        plural: (ct.labels as ManifestContentType['labels'])?.plural ?? ct.slug,
      },
      supports: (ct.supports as ManifestContentType['supports']) ?? {},
      fields: mergeFields(inlineFields(ct as Record<string, unknown>), groupFields),
      taxonomies: taxSlugs,
    }
  })

  const taxonomies: ManifestTaxonomy[] = taxes.docs.map((tax) => ({
    id: tax.id,
    slug: String(tax.slug),
    collectionSlug: taxonomyCollectionSlug(String(tax.slug)),
    labels: {
      singular: (tax.labels as ManifestTaxonomy['labels'])?.singular ?? tax.slug,
      plural: (tax.labels as ManifestTaxonomy['labels'])?.plural ?? tax.slug,
    },
    hierarchical: Boolean(tax.hierarchical),
    contentTypes: (Array.isArray(tax.contentTypes) ? tax.contentTypes : []).map((c) => {
      const slug = asSlug(c)
      const found = cts.docs.find((ct) => ct.id === asId(c) || String(ct.slug) === slug)
      return found ? String(found.slug) : slug
    }),
  }))

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    contentTypes,
    taxonomies,
  }
}

export const writeManifest = async (manifest: CustomTypesManifest, filePath?: string) => {
  const target = filePath ?? defaultManifestPath()
  await fs.mkdir(path.dirname(target), { recursive: true })
  await fs.writeFile(target, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8')
}

export const readManifest = async (filePath?: string): Promise<CustomTypesManifest | null> => {
  const target = filePath ?? defaultManifestPath()
  try {
    const raw = await fs.readFile(target, 'utf-8')
    return JSON.parse(raw) as CustomTypesManifest
  } catch {
    return null
  }
}

const syncManifest = async (payload: Payload) => {
  const manifest = await buildManifestFromPayload(payload)
  await writeManifest(manifest)
}

/** Refresh manifest JSON after definition / field-group changes. */
export const syncManifestAfterChange: CollectionAfterChangeHook = async ({ req }) => {
  try {
    await syncManifest(req.payload)
  } catch (err) {
    req.payload.logger.error(`[custom-types] manifest sync failed: ${String(err)}`)
  }
}

export const syncManifestAfterDelete: CollectionAfterDeleteHook = async ({ req }) => {
  try {
    await syncManifest(req.payload)
  } catch (err) {
    req.payload.logger.error(`[custom-types] manifest sync failed: ${String(err)}`)
  }
}

export const syncManifestFromPayload = syncManifest
