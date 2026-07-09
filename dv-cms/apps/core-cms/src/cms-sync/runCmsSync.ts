/**
 * Background worker cho CMS sync.
 *
 * Chạy nền trong Payload process (setImmediate) sau khi POST /api/cms-sync trả 202.
 * Hỗ trợ 2 nguồn: RAG (rag_sync_state) và Qdrant (biobot_products).
 *
 * Thuật toán:
 *   1. Fetch placeholder media (idempotent, tạo 1 lần nếu chưa có)
 *   2. Upsert categories (batch 200) → xây map: externalId → Payload id
 *   3. Upsert products (batch 200) → auto-map category, attach placeholder + metadata
 *   4. Update CmsSyncRuns (totals, status, log)
 */

import type { Payload } from 'payload'
import { getOrCreatePlaceholderMedia } from '@dv/module-bioscope'
import type { CmsSyncRawCategory, CmsSyncRawProduct, SyncSource } from '../endpoints/cmsSync.js'

const BATCH_SIZE = 200

interface SyncCounts {
  categories: { created: number; updated: number; skipped: number }
  products: { created: number; updated: number; skipped: number }
  errors: number
}

interface LogEntry {
  ts: string
  level: 'info' | 'warn' | 'error'
  message: string
}

/** Append a log entry and update totals on the CmsSyncRuns record. */
async function appendLog(
  payload: Payload,
  runId: string,
  level: LogEntry['level'],
  message: string,
  counts: Partial<SyncCounts> = {},
): Promise<void> {
  try {
    const run = await payload.findByID({
      collection: 'cms-sync-runs',
      id: runId,
      depth: 0,
      overrideAccess: true,
    })
    const currentTotals = (run.totals as SyncCounts | null) ?? {
      categories: { created: 0, updated: 0, skipped: 0 },
      products: { created: 0, updated: 0, skipped: 0 },
      errors: 0,
    }
    const currentLog = (run.log as LogEntry[] | null) ?? []
    const updatedTotals: SyncCounts = {
      categories: {
        created: currentTotals.categories.created + (counts.categories?.created ?? 0),
        updated: currentTotals.categories.updated + (counts.categories?.updated ?? 0),
        skipped: currentTotals.categories.skipped + (counts.categories?.skipped ?? 0),
      },
      products: {
        created: currentTotals.products.created + (counts.products?.created ?? 0),
        updated: currentTotals.products.updated + (counts.products?.updated ?? 0),
        skipped: currentTotals.products.skipped + (counts.products?.skipped ?? 0),
      },
      errors: currentTotals.errors + (counts.errors ?? 0),
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await payload.update({ collection: 'cms-sync-runs', id: runId, data: { totals: updatedTotals as any, log: [...currentLog, { ts: new Date().toISOString(), level, message }].slice(-500) } as any, overrideAccess: true })
  } catch {
    console.warn(`[cms-sync run ${runId}] Failed to append log: ${message}`)
  }
}

/** Upsert one category. Returns action type. */
async function upsertCategory(
  payload: Payload,
  cat: CmsSyncRawCategory,
): Promise<'created' | 'updated' | 'skipped'> {
  if (!cat.external_id || !cat.external_id.trim()) return 'skipped'
  const extId = cat.external_id.trim()

  const existing = await payload.find({
    collection: 'ingredient-categories',
    where: { externalId: { equals: extId } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (existing.docs.length > 0) {
    const doc = existing.docs[0] as unknown as { id: string | number; name?: string }
    const currentVi = doc.name ?? ''
    const newVi = cat.name?.vi ?? extId
    if (currentVi !== newVi) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await payload.update({ collection: 'ingredient-categories', id: doc.id, data: { name: newVi } as any, overrideAccess: true })
      return 'updated'
    }
    return 'skipped'
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await payload.create({ collection: 'ingredient-categories', data: { externalId: extId, name: cat.name?.vi ?? extId } as any, overrideAccess: true })
  return 'created'
}

/** Build product update/create data from raw product + source. */
function buildProductData(
  prod: CmsSyncRawProduct,
  categoryId: string | number | undefined,
  placeholderId: string | number | undefined,
): Record<string, unknown> {
  const extId = prod.external_id.trim()
  const data: Record<string, unknown> = {
    externalId: extId,
    name: prod.name?.vi ?? extId,
    type: prod.type ?? 'supplement',
  }

  if (categoryId !== undefined) data.category = categoryId
  if (placeholderId !== undefined) data.featuredImage = placeholderId

  // fileCount
  if (prod.file_count !== undefined) data.fileCount = prod.file_count

  // sourceFileIds — chuẩn hóa từ cả 2 nguồn
  if (prod.source_file_ids !== undefined) {
    data.sourceFileIds = prod.source_file_ids
  } else if (prod.file_names !== undefined) {
    // RAG source: chỉ có file_names (string[]) → convert sang format chuẩn
    data.sourceFileIds = prod.file_names.map((name: string) => ({
      file_name: name,
      mime_type: 'application/pdf',
    }))
  }

  // lastIndexedAt — chuẩn hóa từ cả 2 nguồn
  const indexedAt = prod.last_indexed_at ?? prod.last_modified ?? null
  if (indexedAt) {
    data.lastIndexedAt = new Date(indexedAt).toISOString()
  }

  // description — chỉ có ở Qdrant source
  if (prod.description?.vi) {
    data.description = [{ root: { children: [{ type: 'text', text: prod.description.vi }] } }]
  }

  return data
}

/** Upsert one product. Returns action type. */
async function upsertProduct(
  payload: Payload,
  prod: CmsSyncRawProduct,
  categoryMap: Map<string, string | number>,
  placeholderId: string | number | undefined,
): Promise<'created' | 'updated' | 'skipped'> {
  if (!prod.external_id || !prod.external_id.trim()) return 'skipped'
  const extId = prod.external_id.trim()

  const categoryId =
    prod.category_external_id && categoryMap.has(prod.category_external_id.trim())
      ? categoryMap.get(prod.category_external_id.trim())
      : undefined

  const existing = await payload.find({
    collection: 'ingredients',
    where: { externalId: { equals: extId } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const data = buildProductData(prod, categoryId, placeholderId)

  if (existing.docs.length > 0) {
    const doc = existing.docs[0] as unknown as { id: string | number }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await payload.update({ collection: 'ingredients', id: doc.id, data: data as any, overrideAccess: true })
    return 'updated'
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await payload.create({ collection: 'ingredients', data: data as any, overrideAccess: true })
  return 'created'
}

/**
 * Main sync worker.
 */
export async function runCmsSync(params: {
  runId: string
  source: SyncSource
  categories: CmsSyncRawCategory[]
  products: CmsSyncRawProduct[]
  summary?: Record<string, unknown>
}): Promise<void> {
  const { runId, source, categories, products } = params

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload = (global as any).__payload as Payload | undefined
  if (!payload) {
    console.error('[cms-sync] Payload instance not found on global.')
    return
  }

  // 0. Mark as running
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await payload.update({ collection: 'cms-sync-runs', id: runId, data: { status: 'running' } as any, overrideAccess: true })
  await appendLog(
    payload,
    runId,
    'info',
    `Bắt đầu sync (source=${source}). Categories: ${categories.length}, Products: ${products.length}`,
  )

  const counts: SyncCounts = {
    categories: { created: 0, updated: 0, skipped: 0 },
    products: { created: 0, updated: 0, skipped: 0 },
    errors: 0,
  }

  try {
    // 1. Placeholder media (idempotent)
    let placeholderId: string | number | undefined
    try {
      placeholderId = await getOrCreatePlaceholderMedia(payload)
      await appendLog(payload, runId, 'info', `Placeholder media ready: ${placeholderId}`)
    } catch (err) {
      console.warn('[cms-sync] Could not create placeholder media:', err)
    }

    // 2. Upsert categories
    const categoryMap = new Map<string, string | number>()
    for (let i = 0; i < categories.length; i += BATCH_SIZE) {
      const batch = categories.slice(i, i + BATCH_SIZE)
      for (const cat of batch) {
        try {
          const action = await upsertCategory(payload, cat)
          counts.categories[action]++

          if (cat.external_id?.trim()) {
            const found = await payload.find({
              collection: 'ingredient-categories',
              where: { externalId: { equals: cat.external_id.trim() } },
              limit: 1,
              depth: 0,
              overrideAccess: true,
            })
            if (found.docs.length > 0) {
              categoryMap.set(cat.external_id.trim(), found.docs[0].id)
            }
          }
        } catch (err) {
          counts.errors++
          const msg = err instanceof Error ? err.message : String(err)
          await appendLog(payload, runId, 'error', `Lỗi upsert category "${cat.external_id}": ${msg}`, { errors: 1 })
        }
      }
      await appendLog(
        payload,
        runId,
        'info',
        `Đã upsert categories: ${Math.min(i + BATCH_SIZE, categories.length)}/${categories.length}`,
      )
    }

    // 3. Upsert products
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE)
      for (const prod of batch) {
        try {
          const action = await upsertProduct(payload, prod, categoryMap, placeholderId)
          counts.products[action]++
        } catch (err) {
          counts.errors++
          const msg = err instanceof Error ? err.message : String(err)
          await appendLog(
            payload,
            runId,
            'error',
            `Lỗi upsert product "${prod.external_id}": ${msg}`,
            { errors: 1 },
          )
        }
      }
      await appendLog(
        payload,
        runId,
        'info',
        `Đã upsert products: ${Math.min(i + BATCH_SIZE, products.length)}/${products.length}`,
      )
    }

    // 4. Finalize
    const status = counts.errors > 0 ? 'partial' : 'done'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await payload.update({ collection: 'cms-sync-runs', id: runId, data: { status, totals: counts, finishedAt: new Date().toISOString() } as any, overrideAccess: true })
    await appendLog(
      payload,
      runId,
      'info',
      `Hoàn tất (source=${source}). Status: ${status}. Errors: ${counts.errors}`,
      counts,
    )
    console.info(`[cms-sync run ${runId}] Done. Status=${status}, source=${source}`, counts)
  } catch (err) {
    counts.errors++
    const msg = err instanceof Error ? err.message : String(err)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await payload.update({ collection: 'cms-sync-runs', id: runId, data: { status: 'error', errorMessage: msg, totals: counts, finishedAt: new Date().toISOString() } as any, overrideAccess: true })
    await appendLog(payload, runId, 'error', `Lỗi nghiêm trọng: ${msg}`, { errors: 1 })
    console.error(`[cms-sync run ${runId}] Fatal error:`, err)
  }
}
