/**
 * CMS-managed firewall layer. Polls the CMS `/api/security/firewall-config`
 * endpoint (cached in module scope) so admins can manage rules/blocklists from
 * the CMS, and evaluates requests with the shared `@dv/module-security` engine.
 *
 * On any CMS failure we fall back to the local static WAF (`./waf`) so page
 * traffic is never blocked by an unreachable CMS.
 */

import type { NextRequest } from 'next/server'
import { inspect as engineInspect, type FirewallSettings } from '@dv/module-security'
import { inspect as localInspect, type WafResult } from './waf'
import { clientIp } from '@/lib/rate-limit'

const CMS_URL = process.env.CMS_INTERNAL_URL || process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3001'
const TTL_MS = 30_000

type Config = { settings: FirewallSettings; blockedIps: string[] }

let cache: { at: number; cfg: Config } | null = null
let inflight: Promise<Config | null> | null = null

async function fetchConfig(): Promise<Config | null> {
  try {
    const res = await fetch(`${CMS_URL}/api/security/firewall-config`, {
      signal: AbortSignal.timeout(2000),
    })
    if (!res.ok) return null
    return (await res.json()) as Config
  } catch {
    return null
  }
}

async function getConfig(): Promise<Config | null> {
  const now = Date.now()
  if (cache && now - cache.at < TTL_MS) return cache.cfg
  if (!inflight) {
    inflight = fetchConfig().then((cfg) => {
      if (cfg) cache = { at: Date.now(), cfg }
      inflight = null
      return cfg
    })
  }
  const cfg = await inflight
  return cfg ?? cache?.cfg ?? null
}

/** Best-effort geo country from common CDN headers. */
function country(req: NextRequest): string | undefined {
  const h = req.headers
  return (
    h.get('x-vercel-ip-country') ||
    h.get('cf-ipcountry') ||
    h.get('x-country-code') ||
    undefined
  )
}

/**
 * Inspect a request with CMS-managed rules, falling back to the local static WAF
 * when the CMS config is unavailable.
 */
export async function inspectManaged(req: NextRequest): Promise<WafResult> {
  const cfg = await getConfig()
  if (!cfg) return localInspect(req)

  const decision = engineInspect(
    {
      ip: clientIp(req),
      path: req.nextUrl.pathname,
      query: req.nextUrl.search,
      userAgent: req.headers.get('user-agent') ?? undefined,
      country: country(req),
    },
    cfg.settings,
    new Set(cfg.blockedIps),
  )

  // Always also run the local static signatures as a safety net (defense in depth).
  const local = localInspect(req)
  if (local.blocked) return local

  return { blocked: decision.blocked, status: decision.status, reason: decision.reason }
}
