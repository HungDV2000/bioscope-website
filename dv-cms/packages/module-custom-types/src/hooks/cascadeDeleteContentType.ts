import type { CollectionBeforeDeleteHook, Payload } from 'payload'

const deleteAllInCollection = async (
  payload: Payload,
  collection: string,
  req: Parameters<CollectionBeforeDeleteHook>[0]['req'],
) => {
  try {
    const found = await payload.find({
      collection: collection as never,
      limit: 500,
      pagination: false,
      depth: 0,
      req,
    })
    for (const doc of found.docs) {
      await payload.delete({
        collection: collection as never,
        id: doc.id,
        req,
      })
    }
    if (found.docs.length === 500) {
      await deleteAllInCollection(payload, collection, req)
    }
  } catch {
    // Collection may not exist yet if schema not applied.
  }
}

/** Hard-delete all entries in the materialized collection before removing the definition. */
export const cascadeDeleteContentType: CollectionBeforeDeleteHook = async ({ req, id }) => {
  const doc = await req.payload.findByID({
    collection: 'ct-definitions',
    id,
    depth: 0,
    req,
  })
  if (!doc?.slug || doc.status !== 'published') return
  await deleteAllInCollection(req.payload, String(doc.slug), req)
}
