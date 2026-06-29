import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'

import { buildManifestFromPayload, writeManifest } from '@dv/module-languages'

import config from '../payload.config.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const coreCmsRoot = path.resolve(here, '../..')
const manifestPath = path.join(coreCmsRoot, 'generated/locales-manifest.json')

try {
  const payload = await getPayload({ config })
  const manifest = await buildManifestFromPayload(payload)
  await writeManifest(manifest, manifestPath)
  process.stdout.write(`[lang:sync] OK — ${manifest.locales.length} locale(s), default=${manifest.defaultLocale}\n`)
  process.stdout.write(`[lang:sync] Written: ${manifestPath}\n`)
  process.stdout.write('[lang:sync] Restart dev server để Payload áp dụng locale mới.\n')
  process.exit(0)
} catch (err) {
  process.stderr.write(`[lang:sync] failed: ${(err as Error)?.stack || String(err)}\n`)
  process.exit(1)
}
