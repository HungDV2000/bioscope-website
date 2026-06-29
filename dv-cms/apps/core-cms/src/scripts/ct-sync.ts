import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'

import {
  buildManifestFromPayload,
  generateCollectionFiles,
  writeManifest,
} from '@dv/module-custom-types'

import config from '../payload.config.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const coreCmsRoot = path.resolve(here, '../..')
const generatedOut = path.resolve(coreCmsRoot, '../../packages/module-custom-types/src/generated')

try {
  const payload = await getPayload({ config })
  const manifest = await buildManifestFromPayload(payload)
  await writeManifest(manifest, path.join(coreCmsRoot, 'generated/ct-manifest.json'))
  const files = await generateCollectionFiles({ manifest, outDir: generatedOut })
  process.stdout.write(`[ct:sync] OK — ${manifest.contentTypes.length} CPT, ${manifest.taxonomies.length} tax\n`)
  process.stdout.write(`[ct:sync] Files: ${files.join(', ')}\n`)
  process.exit(0)
} catch (err) {
  process.stderr.write(`[ct:sync] failed: ${(err as Error)?.stack || String(err)}\n`)
  process.exit(1)
}
