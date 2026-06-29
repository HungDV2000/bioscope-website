import type { Endpoint, PayloadRequest } from 'payload'
import { isAdmin } from '@dv/cms-core'

import { buildManifestFromPayload, buildPublicLocales, writeManifest } from '../hooks/syncManifest.js'
import { getManifestPath } from '../lib/manifestPath.js'

const json = (data: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  })

export const createLanguagesEndpoints = (): Endpoint[] => [
  /** Public — enabled locales for frontend language switcher */
  {
    path: '/lang/locales',
    method: 'get',
    handler: async (req: PayloadRequest) => {
      try {
        const locales = await buildPublicLocales(req.payload)
        return json({ locales, defaultLocale: locales.find((l) => l.isDefault)?.code ?? 'vi' })
      } catch (err) {
        return json({ error: String(err) }, { status: 500 })
      }
    },
  },
  /** Admin — sync manifest from DB */
  {
    path: '/lang/sync-manifest',
    method: 'post',
    handler: async (req: PayloadRequest) => {
      if (!isAdmin({ req })) {
        return json({ error: 'Unauthorized' }, { status: 403 })
      }
      try {
        const manifest = await buildManifestFromPayload(req.payload)
        const filePath = getManifestPath()
        await writeManifest(manifest, filePath)
        return json({
          ok: true,
          manifest,
          filePath,
          next: 'Restart dev server để Payload áp dụng locale mới.',
        })
      } catch (err) {
        return json({ error: String(err) }, { status: 500 })
      }
    },
  },
  {
    path: '/lang/manifest',
    method: 'get',
    handler: async (req: PayloadRequest) => {
      if (!isAdmin({ req })) {
        return json({ error: 'Unauthorized' }, { status: 403 })
      }
      const manifest = await buildManifestFromPayload(req.payload)
      return json(manifest)
    },
  },
]
