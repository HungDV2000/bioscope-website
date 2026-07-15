/**
 * Aggregate optimization stats across the media library: number of optimized
 * images and total bytes saved. Used by the ImageStats admin panel.
 */

import type { Endpoint } from 'payload'

export const imageStatsEndpoint: Endpoint = {
  path: '/image/stats',
  method: 'get',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'unauthorized' }, { status: 401 })
    try {
      // Pull the savings fields for image docs (paginated scan, capped).
      let page = 1
      let totalSaved = 0
      let totalOriginal = 0
      let optimized = 0
      let images = 0
      for (;;) {
        const res = await req.payload.find({
          collection: 'media',
          where: { mimeType: { like: 'image' } },
          limit: 500,
          page,
          depth: 0,
          overrideAccess: true,
        })
        for (const doc of res.docs as Array<{ savedBytes?: number; originalSize?: number }>) {
          images++
          if (doc.savedBytes) {
            optimized++
            totalSaved += doc.savedBytes
            totalOriginal += doc.originalSize ?? 0
          }
        }
        if (!res.hasNextPage || page >= 10) break
        page++
      }
      return Response.json({
        images,
        optimized,
        totalSavedBytes: totalSaved,
        totalOriginalBytes: totalOriginal,
        savedPct: totalOriginal ? Math.round((totalSaved / totalOriginal) * 100) : 0,
      })
    } catch (e) {
      return Response.json({ error: (e as Error).message }, { status: 500 })
    }
  },
}
