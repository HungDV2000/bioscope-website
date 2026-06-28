import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

export type RevalidateOptions = {
  /** Frontend base URL. When empty, revalidation is a no-op (FE not wired yet). */
  frontendUrl?: string
  /** Shared secret expected by the frontend `/api/revalidate` route. */
  secret?: string
  /** Map a changed doc to the FE paths that should be revalidated. */
  resolvePaths?: (doc: Record<string, unknown>) => string[]
}

/**
 * Build afterChange/afterDelete hooks that ping the frontend to revalidate ISR.
 * Safe to attach everywhere: it silently does nothing until `frontendUrl` is set.
 */
export const buildRevalidateHooks = (
  opts: RevalidateOptions,
): {
  afterChange: CollectionAfterChangeHook[]
  afterDelete: CollectionAfterDeleteHook[]
} => {
  const enabled = Boolean(opts.frontendUrl)

  const ping = async (doc: Record<string, unknown>, req: { payload: { logger: { error: (m: string) => void } } }) => {
    if (!enabled) return
    const paths = opts.resolvePaths?.(doc) ?? ['/']
    await Promise.all(
      paths.map(async (path) => {
        const url = `${opts.frontendUrl}/api/revalidate?secret=${encodeURIComponent(
          opts.secret ?? '',
        )}&path=${encodeURIComponent(path)}`
        try {
          await fetch(url, { method: 'POST' })
        } catch (err) {
          req.payload.logger.error(`[revalidate] failed for ${path}: ${String(err)}`)
        }
      }),
    )
  }

  const afterChange: CollectionAfterChangeHook = async ({ doc, req }) => {
    await ping(doc as Record<string, unknown>, req as never)
    return doc
  }
  const afterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
    await ping(doc as Record<string, unknown>, req as never)
    return doc
  }

  return { afterChange: [afterChange], afterDelete: [afterDelete] }
}
