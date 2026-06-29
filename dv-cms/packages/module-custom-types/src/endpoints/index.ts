import type { Endpoint, PayloadRequest } from 'payload'
import { isAdminOrEditor } from '@dv/cms-core'
import path from 'path'
import { fileURLToPath } from 'url'

import { generateCollectionFiles } from '../codegen/generateCollectionFiles.js'
import { buildManifestFromPayload, writeManifest } from '../hooks/syncManifest.js'

const json = (data: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  })

const generatedDir = () => {
  const here = path.dirname(fileURLToPath(import.meta.url))
  return path.resolve(here, '../generated')
}

/** Admin endpoint: sync manifest + regenerate collection TS files. */
export const createCustomTypesEndpoints = (): Endpoint[] => [
  {
    path: '/ct/sync-manifest',
    method: 'post',
    handler: async (req: PayloadRequest) => {
      if (!isAdminOrEditor({ req })) {
        return json({ error: 'Unauthorized' }, { status: 403 })
      }
      try {
        const manifest = await buildManifestFromPayload(req.payload)
        await writeManifest(manifest)
        const files = await generateCollectionFiles({ manifest, outDir: generatedDir() })
        return json({
          ok: true,
          manifest,
          filesWritten: files,
          next: 'Chạy `pnpm ct:migrate` rồi restart dev server.',
        })
      } catch (err) {
        return json({ error: String(err) }, { status: 500 })
      }
    },
  },
  {
    path: '/ct/manifest',
    method: 'get',
    handler: async (req: PayloadRequest) => {
      if (!isAdminOrEditor({ req })) {
        return json({ error: 'Unauthorized' }, { status: 403 })
      }
      const manifest = await buildManifestFromPayload(req.payload)
      return json(manifest)
    },
  },
]
