/**
 * Public consent endpoints:
 *  - GET  /consent/config  → banner + categories config for the frontend.
 *  - POST /consent/record  → store a proof-of-consent row (privacy-friendly).
 */

import type { Endpoint, PayloadRequest } from 'payload'
import { randomUUID } from 'node:crypto'

function truncateIp(ip: string): string {
  if (ip.includes('.')) return ip.split('.').slice(0, 3).join('.') + '.0'
  if (ip.includes(':')) return ip.split(':').slice(0, 4).join(':') + '::' // IPv6 /64
  return 'unknown'
}

function clientIp(req: PayloadRequest): string {
  const h = req.headers
  const xf = h?.get?.('x-forwarded-for')
  if (xf) return xf.split(',')[0].trim()
  return h?.get?.('x-real-ip') || 'unknown'
}

async function readBody(req: PayloadRequest): Promise<Record<string, unknown>> {
  try {
    if (req.data && typeof req.data === 'object') return req.data as Record<string, unknown>
    const j = await (req as unknown as { json?: () => Promise<unknown> }).json?.()
    return (j as Record<string, unknown>) ?? {}
  } catch {
    return {}
  }
}

export const consentConfigEndpoint: Endpoint = {
  path: '/consent/config',
  method: 'get',
  handler: async (req) => {
    try {
      const s = (await req.payload.findGlobal({ slug: 'consent-settings' as never, depth: 0, overrideAccess: true })) as unknown as Record<
        string,
        unknown
      >
      return Response.json(s, { headers: { 'cache-control': 'public, max-age=60, s-maxage=60' } })
    } catch {
      return Response.json({ enabled: false }, { status: 200 })
    }
  },
}

export const consentRecordEndpoint: Endpoint = {
  path: '/consent/record',
  method: 'post',
  handler: async (req) => {
    try {
      const body = await readBody(req)
      const categories = Array.isArray(body.categories) ? (body.categories as string[]).join(',') : String(body.categories ?? '')
      const action = String(body.action ?? 'save')

      // Only log if enabled in settings.
      const s = (await req.payload.findGlobal({ slug: 'consent-settings' as never, depth: 0, overrideAccess: true })) as unknown as {
        logConsent?: boolean
      }
      if (s?.logConsent === false) return Response.json({ ok: true, logged: false })

      await req.payload.create({
        collection: 'consent-log' as never,
        data: {
          consentId: randomUUID(),
          categories,
          action,
          ipTrunc: truncateIp(clientIp(req)),
          country: req.headers?.get?.('x-vercel-ip-country') || req.headers?.get?.('cf-ipcountry') || undefined,
          url: String(body.url ?? ''),
          userAgent: req.headers?.get?.('user-agent') ?? undefined,
          policyVersion: String(body.policyVersion ?? '1'),
        } as never,
        overrideAccess: true,
      })
      return Response.json({ ok: true, logged: true })
    } catch (e) {
      return Response.json({ error: (e as Error).message }, { status: 500 })
    }
  },
}

export const consentEndpoints: Endpoint[] = [consentConfigEndpoint, consentRecordEndpoint]
