import type { Endpoint, PayloadRequest } from 'payload'

/**
 * Serves the admin's browser-tab icon from the Branding global.
 *
 * Why the indirection: Payload's `admin.meta` is a plain static object
 * (`MetaConfig = {...} & DeepClone<Metadata>`), evaluated once when the config
 * is built — it cannot read a global per request. So `admin.meta.icons` points
 * at this fixed URL, and the icon behind it changes whenever an editor uploads
 * a new one. No rebuild, no config edit.
 *
 * Returns 404 when nothing is uploaded, which makes the browser fall back to
 * its default icon — the same result as declaring no icon at all.
 */
export const brandingFaviconEndpoint: Endpoint = {
  path: '/branding-favicon',
  method: 'get',
  handler: async (req: PayloadRequest): Promise<Response> => {
    let url: string | undefined
    try {
      // overrideAccess: this runs unauthenticated too — the admin login page
      // requests the favicon before anyone has signed in. An icon is not secret.
      // Cast rather than rely on the app's generated `payload-types.ts`: this is
      // a shared package and cannot import the consuming app's types. The field
      // is declared on the Branding global in this same package.
      const branding = (await req.payload.findGlobal({
        slug: 'branding',
        depth: 1,
        overrideAccess: true,
      })) as { favicon?: { url?: string | null } | null }
      url = branding?.favicon?.url ?? undefined
    } catch (err) {
      req.payload.logger.error(`[branding-favicon] không đọc được global: ${String(err)}`)
      return new Response(null, { status: 500 })
    }

    if (!url) return new Response(null, { status: 404 })

    // Payload returns a root-relative media URL; Location needs an absolute one.
    const base = req.payload.config.serverURL || new URL(req.url ?? '/', 'http://localhost').origin
    const absolute = url.startsWith('http') ? url : `${base.replace(/\/$/, '')}${url}`

    return new Response(null, {
      status: 302,
      headers: {
        Location: absolute,
        // Short cache: long enough to avoid hammering the DB on every page load,
        // short enough that a newly uploaded icon shows up the same session.
        'Cache-Control': 'public, max-age=300',
      },
    })
  },
}
