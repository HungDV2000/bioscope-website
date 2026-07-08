import { NextResponse, type NextRequest } from 'next/server'
import { inspect } from '@/lib/security/waf'

/**
 * CMS-managed URL redirects (Next 16 proxy convention) (collection `redirects`: from → to, 301/302).
 * The list is cached in module scope for TTL_MS so the CMS is hit at most
 * once a minute per server instance; on any failure we fail open (no redirect).
 */
const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL ?? 'http://localhost:3001'
const TTL_MS = 60_000

type RedirectRow = { from: string; to: string; type?: '301' | '302' }

let cache: { map: Map<string, RedirectRow>; at: number } | null = null

const normalize = (p: string) => {
  const clean = p.split('?')[0].replace(/\/+$/, '')
  return clean === '' ? '/' : clean
}

async function getRedirects(): Promise<Map<string, RedirectRow>> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.map
  const map = new Map<string, RedirectRow>()
  try {
    const res = await fetch(`${CMS_URL}/api/redirects?limit=500&depth=0`, {
      signal: AbortSignal.timeout(2000),
    })
    if (res.ok) {
      const data = (await res.json()) as { docs?: RedirectRow[] }
      for (const r of data.docs ?? []) {
        if (r.from && r.to) map.set(normalize(r.from), r)
      }
    }
  } catch {
    /* CMS unreachable — keep the (possibly empty) map and retry after TTL */
  }
  cache = { map, at: Date.now() }
  return map
}

export async function proxy(req: NextRequest) {
  // 1) Web-application firewall — block scanners/attacks before anything else.
  const waf = inspect(req)
  if (waf.blocked) {
    console.warn(`[waf] blocked ${waf.reason} ${req.method} ${req.nextUrl.pathname}`)
    return new NextResponse('Forbidden', {
      status: waf.status ?? 403,
      headers: { 'content-type': 'text/plain', 'x-waf': waf.reason ?? 'blocked' },
    })
  }

  // 2) CMS-managed redirects.
  const redirects = await getRedirects()
  if (redirects.size === 0) return NextResponse.next()

  const hit = redirects.get(normalize(req.nextUrl.pathname))
  if (!hit) return NextResponse.next()

  const to = hit.to.startsWith('http') ? hit.to : new URL(hit.to, req.url)
  return NextResponse.redirect(to, hit.type === '302' ? 307 : 308)
}

export const config = {
  // Skip Next internals, API routes, and static assets.
  matcher: ['/((?!_next/|api/|images/|favicon|logo\\.|.*\\.(?:svg|png|jpg|jpeg|webp|avif|ico|css|js|txt|xml)).*)'],
}
