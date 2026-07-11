/**
 * CsvImportManager — parse CSV đã export từ drive_crawler.py, upsert vào Payload.
 *
 * CSV columns:
 *   STT | Mã danh mục | Danh mục | ID Danh mục | URL Danh mục
 *   | Mã sản phẩm | Sản phẩm | ID Sản phẩm | URL Sản phẩm
 *   | Số lượng file | Danh sách file (Tên) | Files metadata (JSON)
 *
 * Upsert logic (theo driveId):
 *   - category: driveId = "ID Danh mục"
 *   - ingredient: driveId = "ID Sản phẩm", driveParentId = "ID Danh mục"
 *   - ingredient.category = lookup(category by driveId)
 *
 * Progress: ghi liên tục vào CsvImportJobs record (persistent)
 */

import type { Payload } from 'payload'
import path from 'node:path'
import { readFile } from 'node:fs/promises'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types (ASCII-safe for SWC compatibility)
// CsvRow column map:
//   0=STT, 1=MaDM, 2=TenDM, 3=IDDM, 4=URLDM
//   5=MaSP, 6=TenSP, 7=IDSP, 8=URLSP
//   9=SoLuongFile, 10=DanhSachFile, 11=FilesMeta
// ---------------------------------------------------------------------------

type RawCsvRow = [string, string, string, string, string, string, string, string, string, string, string, string]

type CsvFileMetadata = {
  id: string
  name: string
  url: string
  type: string
  size: string
  size_formatted: string
  modified: string
}

type ImportTotals = {
  categories: { found: number; created: number; updated: number; skipped: number }
  ingredients: { found: number; created: number; updated: number; skipped: number; no_category: number }
  errors: number
}

type ImportLog = {
  ts: string
  level: 'info' | 'warn' | 'error'
  message: string
  data?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Helpers
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

function safeParseFilesJson(raw: string): CsvFileMetadata[] {
  if (!raw || raw.trim() === '') return []
  try {
    const parsed = JSON.parse(raw.trim())
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

// ---------------------------------------------------------------------------
// Job updaters
// ---------------------------------------------------------------------------

async function updateJob(
  payload: Payload,
  jobId: string,
  patch: Partial<{
    status: string
    phase: string
    totalItems: number
    processedItems: number
    totals: ImportTotals
    startedAt: string
    finishedAt: string
    errorMessage: string
  }>,
): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await payload.update({ collection: 'drive-sync-jobs', id: jobId, data: patch as any, overrideAccess: true, depth: 0 })
  } catch {
    // non-fatal
  }
}

async function appendLog(
  payload: Payload,
  jobId: string,
  level: ImportLog['level'],
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
    const currentLogs = ((job.logs as ImportLog[] | undefined) ?? []).slice(-499)
    currentLogs.push({ ts: new Date().toISOString(), level, message, data })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await payload.update({ collection: 'drive-sync-jobs', id: jobId, data: { logs: currentLogs } as any, overrideAccess: true, depth: 0 })
  } catch {
    // non-fatal
  }
}

// ---------------------------------------------------------------------------
// Core: parse CSV → upsert
// ---------------------------------------------------------------------------

export async function runCsvImport(params: {
  jobId: string
  filePath: string
}): Promise<void> {
  const { jobId, filePath } = params

  const payload = (global as unknown as { __payload?: Payload }).__payload
  if (!payload) {
    console.error('[csv-import] Payload instance not found on global.')
    return
  }

  const totals: ImportTotals = {
    categories: { found: 0, created: 0, updated: 0, skipped: 0 },
    ingredients: { found: 0, created: 0, updated: 0, skipped: 0, no_category: 0 },
    errors: 0,
  }

  await updateJob(payload, jobId, {
    status: 'crawling',
    phase: 'Đang đọc file CSV...',
    startedAt: new Date().toISOString(),
  })
  await appendLog(payload, jobId, 'info', `Bắt đầu import CSV: ${path.basename(filePath)}`)

  // Read file
  let csvContent: string
  try {
    csvContent = await readFile(filePath, 'utf-8')
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await updateJob(payload, jobId, { status: 'error', errorMessage: `Đọc file thất bại: ${msg}` })
    await appendLog(payload, jobId, 'error', `Lỗi đọc file: ${msg}`)
    return
  }

  // Parse CSV (multiline-aware — the "Files metadata (JSON)" column contains
  // embedded newlines inside quotes, so a naive split('\n') corrupts rows).
  const records = parseCsv(csvContent.replace(/^﻿/, ''))
  if (records.length < 2) {
    await updateJob(payload, jobId, { status: 'error', errorMessage: 'File CSV rỗng hoặc không có header.' })
    return
  }

  // Verify column count from the header row.
  const headers = records[0]
  if (headers.length < 12) {
    await updateJob(payload, jobId, { status: 'error', errorMessage: `Header không đúng. Cần 12 cột, có ${headers.length}.` })
    await appendLog(payload, jobId, 'error', `Header sai định dạng: ${headers.length} cột (cần ≥ 12).`)
    return
  }

  // Data rows = a product each; keep rows that carry a category or product id.
  const dataRows = records.slice(1).filter((r) => r.length >= 5 && (r[3]?.trim() || r[7]?.trim()))
  const totalRows = dataRows.length
  await updateJob(payload, jobId, { totalItems: totalRows })

  // Group rows by category (column 3 = ID Danh mục)
  const categories = new Map<string, { name: string; driveId: string; rows: string[][] }>()

  for (const row of dataRows) {
    const catId = row[3]?.trim() ?? ''
    const catName = row[2]?.trim() ?? ''
    if (!catId) continue

    if (!categories.has(catId)) {
      categories.set(catId, { name: catName, driveId: catId, rows: [] })
    }
    categories.get(catId)!.rows.push(row)
  }

  await updateJob(payload, jobId, {
    status: 'upserting',
    phase: `Đang đồng bộ ${categories.size} danh mục...`,
    totals,
  })
  await appendLog(payload, jobId, 'info', `Tìm thấy ${categories.size} danh mục, ${totalRows} ingredients`)

  // Phase 1: Upsert categories
  const categoryIdMap = new Map<string, string | number>() // driveId → Payload id

  for (const [catId, cat] of categories) {
    try {
      const existing = await payload.find({
        collection: 'ingredient-categories',
        where: { driveId: { equals: catId } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })

      if (existing.docs.length > 0) {
        const doc = existing.docs[0] as unknown as { id: string | number; name?: string | Record<string, string> }
        const currentName = typeof doc.name === 'string' ? doc.name : doc.name?.vi
        if (currentName !== cat.name) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await payload.update({ collection: 'ingredient-categories', id: doc.id, data: { name: cat.name, driveParentId: ROOT_FOLDER_ID } as any, overrideAccess: true })
          totals.categories.updated++
        } else {
          totals.categories.skipped++
        }
        categoryIdMap.set(catId, doc.id)
      } else {
        const created = await payload.create({
          collection: 'ingredient-categories',
          // slug must be set explicitly — the auto-slug hook can't read the
          // localized `name` object, and an empty slug breaks the unique index.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: { name: cat.name, slug: slugify(cat.name) || slugify(catId), driveId: catId, driveParentId: ROOT_FOLDER_ID, externalId: catId, scope: 'both' } as any,
          overrideAccess: true,
        })
        totals.categories.created++
        categoryIdMap.set(catId, (created as { id: string | number }).id)
      }
      totals.categories.found++
    } catch (err) {
      totals.errors++
      const msg = err instanceof Error ? err.message : String(err)
      await appendLog(payload, jobId, 'error', `Lỗi upsert category "${cat.name}": ${msg}`)
    }

    // Progress every 10 categories
    if (totals.categories.found % 10 === 0) {
      await updateJob(payload, jobId, {
        phase: `Đang đồng bộ danh mục (${totals.categories.found}/${categories.size})`,
        totals,
      })
    }
  }

  await appendLog(
    payload,
    jobId,
    'info',
    `Categories: found=${totals.categories.found}, created=${totals.categories.created}, updated=${totals.categories.updated}, skipped=${totals.categories.skipped}`,
  )

  // Phase 2: Upsert ingredients (batched for performance)
  await updateJob(payload, jobId, {
    phase: `Đang đồng bộ ${totalRows} nguyên liệu...`,
    totals,
  })

  let processedRows = 0

  for (const [catId, cat] of categories) {
    const categoryId = categoryIdMap.get(catId)

    for (const row of cat.rows) {
      processedRows++

      // Fixed column indices: 5=MaSP, 6=TenSP, 7=IDSP, 9=SoLuongFile, 11=FilesMeta
      const productCode = row[5]?.trim() ?? ''
      const ingId = row[7]?.trim() ?? ''
      const ingName = row[6]?.trim() ?? ''
      const filesJson = row[11]?.trim() ?? ''
      const fileCountStr = row[9]?.trim() ?? ''
      const fileCount = parseInt(fileCountStr, 10) || 0
      // Unique slug: name + product code (SP0001…) guarantees no unique-index clash.
      const slug = [slugify(ingName), slugify(productCode)].filter(Boolean).join('-') || slugify(ingId)

      if (!ingId || !ingName) {
        totals.errors++
        continue
      }

      const files: CsvFileMetadata[] = safeParseFilesJson(filesJson)
      const driveFiles = files.map((f) => ({
        fileId: f.id,
        fileName: f.name,
        mimeType: f.type,
        webViewLink: f.url,
        webContentLink: '',
        size: f.size,
        modifiedTime: f.modified,
      }))

      const latestModified = files.reduce<string | null>((latest, f) => {
        if (!f.modified) return latest
        if (!latest || f.modified > latest) return f.modified
        return latest
      }, null)

      try {
        const existing = await payload.find({
          collection: 'ingredients',
          where: { driveId: { equals: ingId } },
          limit: 1,
          depth: 0,
          overrideAccess: true,
        })

        const baseData = {
          name: ingName,
          driveId: ingId,
          driveParentId: catId,
          externalId: ingId,
          type: 'supplement' as const,
          driveFiles,
          fileCount,
          lastDriveSyncAt: latestModified ? new Date(latestModified).toISOString() : new Date().toISOString(),
          // Publish immediately so the public frontend (published-only) shows it.
          _status: 'published' as const,
          ...(categoryId !== undefined ? { category: categoryId } : {}),
        }

        if (existing.docs.length > 0) {
          const doc = existing.docs[0] as unknown as { id: string | number }
          const docName = (doc as unknown as { name?: string | Record<string, string> })?.name
          const currentName = typeof docName === 'string' ? docName : docName?.vi
          const nameChanged = currentName !== ingName
          const filesChanged = JSON.stringify((doc as unknown as { driveFiles?: unknown[] })?.driveFiles ?? []) !== JSON.stringify(driveFiles)
          // Re-publish any previously-imported drafts.
          const needsPublish = (doc as unknown as { _status?: string })?._status !== 'published'

          if (nameChanged || filesChanged || needsPublish) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await payload.update({ collection: 'ingredients', id: doc.id, data: baseData as any, overrideAccess: true })
            totals.ingredients.updated++
          } else {
            totals.ingredients.skipped++
          }
        } else {
          // slug set only on create (preserve any manual slug on re-sync).
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await payload.create({ collection: 'ingredients', data: { ...baseData, slug } as any, overrideAccess: true })
          totals.ingredients.created++
        }
        totals.ingredients.found++
      } catch (err) {
        totals.errors++
        const msg = err instanceof Error ? err.message : String(err)
        await appendLog(payload, jobId, 'error', `Lỗi upsert ingredient "${ingName}": ${msg}`, { ingId })
      }

      // Progress every 100 rows
      if (processedRows % 100 === 0 || processedRows === totalRows) {
        const pct = Math.round((processedRows / totalRows) * 100)
        await updateJob(payload, jobId, {
          processedItems: processedRows,
          phase: `Đang đồng bộ nguyên liệu (${processedRows}/${totalRows} — ${pct}%)`,
          totals,
        })
      }
    }
  }

  // Finalize
  await updateJob(payload, jobId, {
    status: 'done',
    phase: 'Hoàn tất!',
    processedItems: processedRows,
    totals,
    finishedAt: new Date().toISOString(),
  })
  await appendLog(
    payload,
    jobId,
    'info',
    `Hoàn tất! Categories: +${totals.categories.created} ~${totals.categories.updated} ⊘${totals.categories.skipped} | Ingredients: +${totals.ingredients.created} ~${totals.ingredients.updated} ⊘${totals.ingredients.skipped} | Errors: ${totals.errors}`,
    totals,
  )
  console.info('[csv-import] Done:', totals)
}

// ---------------------------------------------------------------------------
// CSV parser (RFC-4180-ish: quoted fields may contain commas AND newlines,
// escaped quotes "" become "). Parses the whole file into rows of fields.
// ---------------------------------------------------------------------------

function parseCsv(content: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < content.length; i++) {
    const ch = content[i]
    if (inQuotes) {
      if (ch === '"') {
        if (content[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      row.push(field)
      field = ''
    } else if (ch === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (ch !== '\r') {
      field += ch
    }
  }
  // Flush the final field/row when the file doesn't end with a newline.
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ROOT_FOLDER_ID = '1YFh__V4da3Q6rU3grYgd5YCBH70HcVbs'
