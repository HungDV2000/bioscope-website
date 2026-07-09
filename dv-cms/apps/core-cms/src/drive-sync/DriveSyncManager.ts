/**
 * DriveSyncManager — Background sync manager.
 *
 * Chạy nền trong Payload process. Job state được lưu vào Payload DB
 * (DriveSyncJobs collection) để UI đọc real-time kể cả sau refresh.
 *
 * Flow:
 *   1. Create DriveSyncJobs record (status=queued)
 *   2. Run setImmediate → background
 *   3. Crawl Google Drive (categories → ingredients → files)
 *   4. Upsert categories → upsert ingredients
 *   5. Update job record liên tục (progress)
 */

import type { Payload } from 'payload'
import { getDriveService } from '../lib/googleDriveService.js'
import type { CrawlResult, IngredientNode, DriveFolder } from '../lib/googleDriveService.js'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface JobTotals {
  categories: { found: number; created: number; updated: number; skipped: number }
  ingredients: { found: number; created: number; updated: number; skipped: number }
  errors: number
}

interface LogEntry {
  ts: string
  level: 'info' | 'warn' | 'error'
  message: string
  data?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Slugify
// ---------------------------------------------------------------------------

function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ---------------------------------------------------------------------------
// Job updater helpers
// ---------------------------------------------------------------------------

async function updateJob(
  payload: Payload,
  jobId: string,
  patch: Partial<{
    status: string
    phase: string
    totalItems: number
    processedItems: number
    totals: JobTotals
    startedAt: string
    finishedAt: string
    errorMessage: string
  }>,
): Promise<void> {
  try {
    await payload.update({
      collection: 'drive-sync-jobs',
      id: jobId,
      data: patch as any,
      overrideAccess: true,
      depth: 0,
    })
  } catch {
    // Non-fatal — don't crash worker
  }
}

async function appendLog(
  payload: Payload,
  jobId: string,
  level: LogEntry['level'],
  message: string,
  data?: Record<string, unknown>,
): Promise<void> {
  try {
    const job = await payload.findByID({
      collection: 'drive-sync-jobs',
      id: jobId,
      depth: 0,
      overrideAccess: true,
    })
    const currentLogs = ((job.logs as LogEntry[] | undefined) ?? []).slice(-499)
    currentLogs.push({ ts: new Date().toISOString(), level, message, data })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await payload.update({ collection: 'drive-sync-jobs', id: jobId, data: { logs: currentLogs } as any, overrideAccess: true, depth: 0 })
  } catch {
    // Non-fatal
  }
}

// ---------------------------------------------------------------------------
// Upsert helpers
// ---------------------------------------------------------------------------

/** Find category by driveId. */
async function findCategoryByDriveId(
  payload: Payload,
  driveId: string,
): Promise<{ id: string | number } | null> {
  const r = await payload.find({
    collection: 'ingredient-categories',
    where: { driveId: { equals: driveId } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return r.docs[0] ?? null
}

/** Upsert one category. Returns action. */
async function upsertCategory(
  payload: Payload,
  cat: DriveFolder,
  totals: JobTotals,
): Promise<{ action: 'created' | 'updated' | 'skipped'; id: string | number }> {
  const existing = await findCategoryByDriveId(payload, cat.id)
  const externalId = cat.id // driveId is the natural externalId
  const nameVi = cat.name

  if (existing) {
    const doc = existing as unknown as { name?: string }
      if (doc.name !== nameVi) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await payload.update({ collection: 'ingredient-categories', id: existing.id, data: { name: { vi: nameVi }, driveParentId: cat.parentId ?? '' } as any, overrideAccess: true })
        totals.categories.updated++
      return { action: 'updated', id: existing.id }
    }
    totals.categories.skipped++
    return { action: 'skipped', id: existing.id }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const created = await payload.create({ collection: 'ingredient-categories', data: { name: { vi: nameVi }, driveId: cat.id, driveParentId: cat.parentId ?? '', externalId, scope: 'both' } as any, overrideAccess: true })
  totals.categories.created++
  return { action: 'created', id: created.id }
}

/** Upsert one ingredient. */
async function upsertIngredient(
  payload: Payload,
  ing: IngredientNode,
  categoryId: string | number | undefined,
  totals: JobTotals,
): Promise<'created' | 'updated' | 'skipped'> {
  // Drive files metadata
  const driveFiles = ing.files.map((f) => ({
    fileId: f.id,
    fileName: f.name,
    mimeType: f.mimeType,
    webViewLink: f.webViewLink,
    webContentLink: f.webContentLink,
    size: f.size ?? '0',
    modifiedTime: f.modifiedTime ?? null,
  }))

  const latestModified = ing.files.reduce<string | null>((latest, f) => {
    if (!f.modifiedTime) return latest
    if (!latest || f.modifiedTime > latest) return f.modifiedTime
    return latest
  }, null)

  const existing = await payload.find({
    collection: 'ingredients',
    where: { driveId: { equals: ing.ingredientId } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const baseData = {
    name: { vi: ing.ingredientName },
    driveId: ing.ingredientId,
    driveParentId: ing.categoryId,
    externalId: ing.ingredientId,
    type: 'supplement' as const,
    driveFiles,
    fileCount: ing.files.length,
    lastDriveSyncAt: new Date().toISOString(),
  }

  if (existing.docs.length > 0) {
    const doc = existing.docs[0] as unknown as {
      id: string | number
      name?: string
      driveFiles?: unknown[]
    }
    const nameChanged = doc.name !== ing.ingredientName
    const filesChanged =
      JSON.stringify(doc.driveFiles ?? []) !== JSON.stringify(driveFiles)

    if (nameChanged || filesChanged) {
      const updateData: Record<string, unknown> = { ...baseData }
      if (categoryId !== undefined) updateData.category = categoryId
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await payload.update({ collection: 'ingredients', id: doc.id, data: updateData as any, overrideAccess: true })
      totals.ingredients.updated++
      return 'updated'
    }
    totals.ingredients.skipped++
    return 'skipped'
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await payload.create({ collection: 'ingredients', data: { ...baseData, ...(categoryId !== undefined ? { category: categoryId } : {}) } as any, overrideAccess: true })
  totals.ingredients.created++
  return 'created'
}

// ---------------------------------------------------------------------------
// Main worker
// ---------------------------------------------------------------------------

export async function runDriveSync(params: {
  jobId: string
  rootFolderId: string
}): Promise<void> {
  const { jobId, rootFolderId } = params

  // Get Payload instance from global
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload = (global as any).__payload as Payload | undefined
  if (!payload) {
    console.error('[drive-sync] Payload instance not found on global.')
    return
  }

  const totals: JobTotals = {
    categories: { found: 0, created: 0, updated: 0, skipped: 0 },
    ingredients: { found: 0, created: 0, updated: 0, skipped: 0 },
    errors: 0,
  }

  // Mark as running
  await updateJob(payload, jobId, {
    status: 'crawling',
    phase: 'Đang kết nối Google Drive...',
    startedAt: new Date().toISOString(),
  })
  await appendLog(payload, jobId, 'info', `Bắt đầu sync từ Drive folder: ${rootFolderId}`)

  // Init Drive service
  let driveService: ReturnType<typeof getDriveService>
  try {
    driveService = getDriveService()
    const conn = await driveService.testConnection()
    if (!conn.ok) {
      throw new Error(conn.error ?? 'Kết nối thất bại')
    }
    await appendLog(
      payload,
      jobId,
      'info',
      `Kết nối OK — Root: "${conn.rootFolderName}", Categories: ~${conn.categoryCount}`,
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await updateJob(payload, jobId, { status: 'error', errorMessage: `Lỗi khởi tạo: ${msg}` })
    await appendLog(payload, jobId, 'error', `Lỗi khởi tạo Drive service: ${msg}`)
    console.error('[drive-sync] Init error:', err)
    return
  }

  // Phase 1: Crawl
  let crawlResult: CrawlResult
  try {
    crawlResult = await driveService.crawl(
      (batch, catCount, ingCount, message) => {
        void updateJob(payload, jobId, {
          phase: message,
          totalItems: catCount + ingCount,
          processedItems: batch,
        })
      },
    )
    totals.categories.found = crawlResult.categories.length
    totals.ingredients.found = crawlResult.ingredients.length

    await appendLog(
      payload,
      jobId,
      'info',
      `Crawl xong: ${crawlResult.categories.length} categories, ${crawlResult.ingredients.length} ingredients, ${crawlResult.errors.length} lỗi`,
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await updateJob(payload, jobId, { status: 'error', errorMessage: `Lỗi crawl: ${msg}` })
    await appendLog(payload, jobId, 'error', `Lỗi crawl: ${msg}`)
    console.error('[drive-sync] Crawl error:', err)
    return
  }

  // Phase 2: Upsert categories
  await updateJob(payload, jobId, { status: 'upserting', phase: 'Đang đồng bộ danh mục...' })
  const categoryMap = new Map<string, string | number>() // driveId → Payload id

  for (let i = 0; i < crawlResult.categories.length; i++) {
    const cat = crawlResult.categories[i]
    try {
      const { id } = await upsertCategory(payload, cat, totals)
      categoryMap.set(cat.id, id)
    } catch (err) {
      totals.errors++
      const msg = err instanceof Error ? err.message : String(err)
      await appendLog(payload, jobId, 'error', `Lỗi upsert category "${cat.name}": ${msg}`)
    }
    // Update progress every 10 items
    if (i % 10 === 0 || i === crawlResult.categories.length - 1) {
      await updateJob(payload, jobId, {
        phase: `Đang đồng bộ danh mục (${i + 1}/${crawlResult.categories.length})`,
        totals: totals as unknown as JobTotals,
      })
    }
  }

  await appendLog(
    payload,
    jobId,
    'info',
    `Categories: found=${totals.categories.found}, created=${totals.categories.created}, updated=${totals.categories.updated}, skipped=${totals.categories.skipped}`,
  )

  // Phase 3: Upsert ingredients
  await updateJob(payload, jobId, { phase: 'Đang đồng bộ nguyên liệu...' })

  for (let i = 0; i < crawlResult.ingredients.length; i++) {
    const ing = crawlResult.ingredients[i]
    try {
      const categoryId = categoryMap.get(ing.categoryId)
      await upsertIngredient(payload, ing, categoryId, totals)
    } catch (err) {
      totals.errors++
      const msg = err instanceof Error ? err.message : String(err)
      await appendLog(payload, jobId, 'error', `Lỗi upsert ingredient "${ing.ingredientName}": ${msg}`)
    }
    // Update progress every 20 items
    if (i % 20 === 0 || i === crawlResult.ingredients.length - 1) {
      await updateJob(payload, jobId, {
        processedItems: i + 1,
        phase: `Đang đồng bộ nguyên liệu (${i + 1}/${crawlResult.ingredients.length})`,
        totals: totals as unknown as JobTotals,
      })
    }
  }

  // Finalize
  const status = totals.errors > 0 ? 'done' : 'done'
  await updateJob(payload, jobId, {
    status,
    phase: 'Hoàn tất!',
    totals: totals as unknown as JobTotals,
    processedItems: crawlResult.ingredients.length,
    finishedAt: new Date().toISOString(),
  })
  await appendLog(
    payload,
    jobId,
    'info',
    `Hoàn tất! Categories: +${totals.categories.created} ~${totals.categories.updated} ⊘${totals.categories.skipped} | Ingredients: +${totals.ingredients.created} ~${totals.ingredients.updated} ⊘${totals.ingredients.skipped} | Errors: ${totals.errors}`,
    totals as unknown as Record<string, unknown>,
  )
  console.info('[drive-sync] Done:', totals)
}
