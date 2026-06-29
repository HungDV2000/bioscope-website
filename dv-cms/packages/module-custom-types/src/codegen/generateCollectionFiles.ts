import fs from 'fs/promises'
import path from 'path'

import type { CollectionConfig } from 'payload'

import type { CustomTypesManifest } from '../types.js'
import { buildContentTypeCollection, buildTaxonomyCollection } from './buildCollections.js'

export type GenerateCollectionsOptions = {
  manifest: CustomTypesManifest
  /** Output directory for per-collection modules + index.ts */
  outDir: string
}

const fileSlug = (s: string) => s.replace(/[^a-z0-9-]/gi, '-')

/** Write TypeScript modules that export materialized CollectionConfig objects. */
export const generateCollectionFiles = async ({
  manifest,
  outDir,
}: GenerateCollectionsOptions): Promise<string[]> => {
  await fs.mkdir(outDir, { recursive: true })

  const written: string[] = []
  const exports: string[] = []

  for (const tax of manifest.taxonomies) {
    const fileName = `${fileSlug(tax.collectionSlug)}.ts`
    const varName = `tax_${tax.slug.replace(/-/g, '_')}`
    const body = `import type { CollectionConfig } from 'payload'
import { buildTaxonomyCollection } from '../codegen/buildCollections.js'

/** Auto-generated from tax-definitions — ${tax.slug} */
export const ${varName}: CollectionConfig = buildTaxonomyCollection(${JSON.stringify(tax, null, 2)} as never)
`
    await fs.writeFile(path.join(outDir, fileName), body, 'utf-8')
    written.push(fileName)
    exports.push(`import { ${varName} } from './${fileName.replace(/\.ts$/, '.js')}'`)
  }

  for (const ct of manifest.contentTypes) {
    const fileName = `${fileSlug(ct.slug)}.ts`
    const varName = `ct_${ct.slug.replace(/-/g, '_')}`
    const body = `import type { CollectionConfig } from 'payload'
import { buildContentTypeCollection } from '../codegen/buildCollections.js'

/** Auto-generated from ct-definitions — ${ct.slug} */
export const ${varName}: CollectionConfig = buildContentTypeCollection(
  ${JSON.stringify(ct, null, 2)} as never,
  ${JSON.stringify(manifest.taxonomies, null, 2)} as never,
)
`
    await fs.writeFile(path.join(outDir, fileName), body, 'utf-8')
    written.push(fileName)
    exports.push(`import { ${varName} } from './${fileName.replace(/\.ts$/, '.js')}'`)
  }

  const indexBody =
    exports.length === 0
      ? `import type { CollectionConfig } from 'payload'

/** No published custom types — add definitions in admin and run pnpm ct:apply */
export const generatedCustomTypeCollections: CollectionConfig[] = []
`
      : `${exports.join('\n')}

import type { CollectionConfig } from 'payload'

export const generatedCustomTypeCollections: CollectionConfig[] = [
${exports.map((line) => {
  const m = line.match(/import \{ (\w+) \}/)
  return `  ${m?.[1]},`
}).join('\n')}
]
`

  await fs.writeFile(path.join(outDir, 'index.ts'), indexBody, 'utf-8')
  written.push('index.ts')

  return written
}

/** Build collections in-memory from manifest (no file write). */
export const collectionsFromManifest = (manifest: CustomTypesManifest): CollectionConfig[] => {
  const taxCols = manifest.taxonomies.map(buildTaxonomyCollection)
  const ctCols = manifest.contentTypes.map((ct) => buildContentTypeCollection(ct, manifest.taxonomies))
  return [...taxCols, ...ctCols]
}
