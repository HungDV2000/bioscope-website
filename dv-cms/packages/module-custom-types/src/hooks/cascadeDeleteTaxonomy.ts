import type { CollectionBeforeDeleteHook } from 'payload'

import { taxonomyCollectionSlug } from '../lib/reserved-slugs.js'

/** Hard-delete all terms in `tax-{slug}` before removing taxonomy definition. */
export const cascadeDeleteTaxonomy: CollectionBeforeDeleteHook = async ({ req, id }) => {
  const doc = await req.payload.findByID({
    collection: 'tax-definitions',
    id,
    depth: 0,
    req,
  })
  if (!doc?.slug || doc.status !== 'published') return
  const collection = taxonomyCollectionSlug(String(doc.slug))

  try {
    const found = await req.payload.find({
      collection: collection as never,
      limit: 500,
      pagination: false,
      depth: 0,
      req,
    })
    for (const term of found.docs) {
      await req.payload.delete({
        collection: collection as never,
        id: term.id,
        req,
      })
    }
  } catch {
    // Collection may not exist yet.
  }
}
