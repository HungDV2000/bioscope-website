/**
 * Internal-linking suggestions (Yoast Premium-style). Given a query (the current
 * doc's focus keyphrase / title), searches the linkable collections for related
 * published content and returns title + public URL so the editor can insert
 * internal links. Requires an authenticated editor.
 */

import type { Endpoint } from 'payload'

// Collection slug → public URL prefix on the frontend.
const LINKABLE: Record<string, string> = {
  pages: '',
  posts: '/tai-nguyen/blog-chuyen-mon',
  ingredients: '/nguyen-lieu',
  'case-studies': '/case-study',
  services: '/giai-phap',
}

export const internalLinksEndpoint: Endpoint = {
  path: '/seo/internal-links',
  method: 'get',
  handler: async (req) => {
    if (!req.user) return Response.json({ results: [] }, { status: 401 })

    const url = new URL(req.url ?? 'http://x/?', 'http://x')
    const q = (url.searchParams.get('q') ?? '').trim()
    const exclude = url.searchParams.get('exclude') ?? ''
    if (q.length < 2) return Response.json({ results: [] })

    // Split into meaningful terms; match any term against title/name.
    const terms = q.split(/\s+/).filter((t) => t.length >= 2).slice(0, 6)
    const results: Array<{ title: string; url: string; collection: string }> = []

    for (const [slug, prefix] of Object.entries(LINKABLE)) {
      try {
        const or = terms.flatMap((t) => [{ title: { like: t } }, { name: { like: t } }])
        const where = {
          and: [{ or }, ...(exclude ? [{ id: { not_equals: exclude } }] : [])],
        } as never
        const res = await req.payload.find({
          collection: slug as never,
          where,
          limit: 5,
          depth: 0,
          overrideAccess: false,
          user: req.user,
        })
        for (const doc of res.docs as Array<Record<string, unknown>>) {
          const title = String(doc.title ?? doc.name ?? '')
          const docSlug = String(doc.slug ?? doc.id ?? '')
          if (!title) continue
          results.push({ title, url: `${prefix}/${docSlug}`.replace(/\/+/g, '/'), collection: slug })
        }
      } catch {
        // Collection may not exist in this install — skip.
      }
    }

    return Response.json({ results: results.slice(0, 12) })
  },
}
