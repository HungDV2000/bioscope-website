import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionConfig, Config, Plugin } from 'payload'
import { AuditLogs } from '../collections/AuditLogs.js'

/**
 * Nhật ký thay đổi — gắn hook ghi log vào MỌI collection nội dung.
 *
 * Đăng ký CUỐI trong plugins để thấy hết collection các module thêm vào. Bỏ qua
 * các collection log/hệ thống để không tự ghi log về log (loop) và không nhiễu.
 */
const EXCLUDE = new Set([
  'audit-logs',
  'form-submissions',
  'ai-generate-jobs',
  'drive-sync-jobs',
  'duplicate-scans',
  'cms-sync-runs',
  'consent-log',
  'blocked-ips',
  'payload-locked-documents',
  'payload-preferences',
  'payload-migrations',
])

const titleOf = (doc: Record<string, unknown>): string => {
  for (const k of ['title', 'name', 'question', 'slug']) {
    const v = doc?.[k]
    if (typeof v === 'string' && v.trim()) return v.slice(0, 200)
  }
  return String(doc?.id ?? '')
}

const write = async (
  req: { payload: { create: (a: unknown) => Promise<unknown>; logger: { error: (m: string) => void } }; user?: unknown },
  action: 'create' | 'update' | 'delete',
  slug: string,
  doc: Record<string, unknown>,
) => {
  const user = req.user as { email?: string; name?: string } | undefined
  const title = titleOf(doc)
  try {
    await req.payload.create({
      collection: 'audit-logs',
      data: {
        summary: `${action} · ${slug} · ${title}`,
        action,
        collectionSlug: slug,
        documentId: String(doc?.id ?? ''),
        documentTitle: title,
        userEmail: user?.email ?? '',
        userName: user?.name ?? user?.email ?? 'hệ thống',
      },
      overrideAccess: true,
    })
  } catch (err) {
    req.payload.logger.error(`[audit] ghi log lỗi (${slug}/${action}): ${String(err)}`)
  }
}

const afterChange: CollectionAfterChangeHook = async ({ doc, req, operation, collection }) => {
  await write(req as never, operation, collection.slug, doc as Record<string, unknown>)
  return doc
}
const afterDelete: CollectionAfterDeleteHook = async ({ doc, req, collection }) => {
  await write(req as never, 'delete', collection.slug, doc as Record<string, unknown>)
  return doc
}

export const auditPlugin =
  (): Plugin =>
  (incoming: Config): Config => {
    const config = { ...incoming }
    config.collections = [
      ...(config.collections ?? []).map((col: CollectionConfig) =>
        EXCLUDE.has(col.slug)
          ? col
          : {
              ...col,
              hooks: {
                ...col.hooks,
                afterChange: [...(col.hooks?.afterChange ?? []), afterChange],
                afterDelete: [...(col.hooks?.afterDelete ?? []), afterDelete],
              },
            },
      ),
      AuditLogs,
    ]
    return config
  }
