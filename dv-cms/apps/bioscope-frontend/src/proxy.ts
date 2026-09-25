import { NextResponse, type NextRequest } from 'next/server'
import { inspectManaged } from '@/lib/security/managed'
import { getLandingDomains } from '@/lib/landing/domains'
import { LP_HEADER } from '@/lib/landing/config'

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
  //    Uses CMS-managed rules (cached) with the local static WAF as a fallback.
  const waf = await inspectManaged(req)
  if (waf.blocked) {
    console.warn(`[waf] blocked ${waf.reason} ${req.method} ${req.nextUrl.pathname}`)
    return new NextResponse('Forbidden', {
      status: waf.status ?? 403,
      headers: { 'content-type': 'text/plain', 'x-waf': waf.reason ?? 'blocked' },
    })
  }

  // 2) Landing page chạy trên tên miền riêng (khai trong admin → Landing page → Tên miền).
  const landing = await routeLanding(req)
  if (landing) return landing

  // Hai header này chỉ proxy được đặt — xoá bản khách tự gửi kèm.
  const clean = new Headers(req.headers)
  clean.delete(LP_HEADER)
  clean.delete(LP_HOST_HEADER)
  const pass = () => NextResponse.next({ request: { headers: clean } })

  // 3) CMS-managed redirects.
  const redirects = await getRedirects()
  if (redirects.size === 0) return pass()

  const hit = redirects.get(normalize(req.nextUrl.pathname))
  if (!hit) return pass()

  const to = hit.to.startsWith('http') ? hit.to : new URL(hit.to, req.url)
  return NextResponse.redirect(to, hit.type === '302' ? 307 : 308)
}

const LP_HOST_HEADER = 'x-dv-landing-host'

/** Host khách gõ trên thanh địa chỉ (aaPanel chuyển tiếp với Host = $host). */
function requestHost(req: NextRequest): string {
  const raw = req.headers.get('x-forwarded-host')?.split(',')[0] || req.headers.get('host') || ''
  return raw.trim().toLowerCase().replace(/:\d+$/, '').replace(/\.$/, '')
}

/**
 * - Host là tên miền landing → mọi đường dẫn (trừ /lp-api) hiển thị trang
 *   `/lp/<slug>`, giữ nguyên query (?ref=, utm…). Trạng thái "Tắt" → chuyển
 *   hướng 302 sang địa chỉ admin đặt.
 * - Đường dẫn `/lp/*` trên web chính (xem thử trước khi trỏ DNS) → chỉ gắn
 *   header để root layout bỏ khung web Bioscope.
 * Trả null = không phải landing, đi tiếp luồng web Bioscope.
 */
async function routeLanding(req: NextRequest): Promise<NextResponse | null> {
  const path = req.nextUrl.pathname
  const domains = await getLandingDomains()
  const hit = domains.size ? domains.get(requestHost(req)) : undefined

  if (!hit) {
    if (path === '/lp' || path.startsWith('/lp/')) {
      const h = new Headers(req.headers)
      h.set(LP_HEADER, path.split('/')[2] ?? '')
      h.delete(LP_HOST_HEADER)
      return NextResponse.next({ request: { headers: h } })
    }
    return null
  }

  if (path.startsWith('/lp-api/')) return NextResponse.next()
  if (hit.status === 'off') return NextResponse.redirect(hit.offRedirectUrl, 302)
  const base = `https://${requestHost(req)}`
  if (path === '/robots.txt') {
    const body =
      hit.status === 'active'
        ? `User-agent: *\nAllow: /\nDisallow: /lp-api/\n\nSitemap: ${base}/sitemap.xml\n`
        : 'User-agent: *\nDisallow: /\n'
    return new NextResponse(body, {
      headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=300' },
    })
  }
  // Landing chỉ có một trang → sitemap một dòng. Không phải "Đang chạy" thì để trống.
  if (path === '/sitemap.xml') {
    const url = hit.status === 'active' ? `<url><loc>${base}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>` : ''
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${url}</urlset>\n`, {
      headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=300' },
    })
  }

  const url = req.nextUrl.clone()
  url.pathname = `/lp/${hit.slug}`
  const h = new Headers(req.headers)
  h.set(LP_HEADER, hit.slug)
  h.set(LP_HOST_HEADER, '1')
  return NextResponse.rewrite(url, { request: { headers: h } })
}

export const config = {
  // Skip Next internals, API routes, and static assets.
  // robots.txt / sitemap.xml được khớp riêng: tên miền landing cần bản của nó, không phải của web Bioscope.
  matcher: ['/((?!_next/|api/|images/|landing/|favicon|logo\\.|.*\\.(?:svg|png|jpg|jpeg|webp|avif|ico|css|js|txt|xml)).*)', '/robots.txt', '/sitemap.xml'],
}
