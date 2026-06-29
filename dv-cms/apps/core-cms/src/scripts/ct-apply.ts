import { execSync } from 'child_process'
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

  process.stdout.write(
    `[ct:apply] Manifest: ${manifest.contentTypes.length} CPT, ${manifest.taxonomies.length} taxonomy\n`,
  )
  process.stdout.write(`[ct:apply] Generated: ${files.join(', ')}\n`)

  process.stdout.write('[ct:apply] Running migrate...\n')
  execSync('pnpm migrate', { cwd: coreCmsRoot, stdio: 'inherit' })

  process.stdout.write('[ct:apply] Generating types...\n')
  execSync('pnpm generate:types', { cwd: coreCmsRoot, stdio: 'inherit' })

  process.stdout.write('[ct:apply] Done. Restart dev server if đang chạy.\n')
  process.exit(0)
} catch (err) {
  process.stderr.write(`[ct:apply] failed: ${(err as Error)?.stack || String(err)}\n`)
  process.exit(1)
}
