/**
 * Restore the Drive-related IDs on ingredients from the source CSV, WITHOUT
 * touching name/content. Some ingredients lost their externalId / driveId /
 * driveParentId / driveFiles (e.g. after edits or AI runs). This re-links them
 * from data/danh_sach_san_pham.csv.
 *
 * Matching (robust to AI-renamed products, since the slug is fixed at import):
 *   1) by driveId === "ID Sản phẩm"  (for rows that still have it)
 *   2) by the reconstructed slug  slugify(name)-slugify(productCode)
 *   3) by externalId === "ID Sản phẩm"
 *
 * Only these fields are updated: externalId, driveId, driveParentId,
 * driveFiles, fileCount, lastDriveSyncAt.
 *
 *   docker compose exec -e NODE_ENV=development -w /app/apps/core-cms cms \
 *     ./node_modules/.bin/payload run src/scripts/restoreDriveIds.ts
 *
 * Add DRY_RUN=1 to preview counts without writing.
 */

import { getPayload } from 'payload'
import { readFile } from 'node:fs/promises'
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import config from '../payload.config.js'
import { parseCsv, slugify, safeParseFilesJson } from '../drive-sync/CsvImportManager.js'

const CSV_PATH = process.env.CSV_PATH || path.resolve(process.cwd(), 'data/danh_sach_san_pham.csv')
const DRY_RUN = process.env.DRY_RUN === '1'

// 0-based column indices (see CsvImportManager): 3=IDDM, 5=MaSP, 6=TenSP, 7=IDSP,
// 9=SoLuongFile, 11=FilesMeta.
const COL = { catId: 3, productCode: 5, name: 6, driveId: 7, fileCount: 9, filesMeta: 11 } as const

// Top-level await — `payload run` waits for this (a wrapping function would not).
try {
  process.stderr.write(`[restore-drive-ids] CSV: ${CSV_PATH} ${DRY_RUN ? '(DRY RUN)' : ''}\n`)
  const payload = await getPayload({ config })
  const content = await readFile(CSV_PATH, 'utf8')
  const rows = parseCsv(content)
  const dataRows = rows.slice(1) // drop header
  process.stderr.write(`[restore-drive-ids] ${dataRows.length} dòng dữ liệu\n`)

  let updated = 0
  let notFound = 0
  let skipped = 0
  let unchanged = 0
  const missing: string[] = []

  for (const row of dataRows) {
    const driveId = row[COL.driveId]?.trim() ?? ''
    const name = row[COL.name]?.trim() ?? ''
    const productCode = row[COL.productCode]?.trim() ?? ''
    const catId = row[COL.catId]?.trim() ?? ''
    if (!driveId || !name) {
      skipped++
      continue
    }

    const files = safeParseFilesJson(row[COL.filesMeta]?.trim() ?? '')
    const driveFiles = files.map((f) => ({
      fileId: f.id,
      fileName: f.name,
      mimeType: f.type,
      webViewLink: f.url,
      webContentLink: '',
      size: f.size,
      modifiedTime: f.modified,
    }))
    const fileCount = parseInt(row[COL.fileCount]?.trim() ?? '', 10) || driveFiles.length
    const latestModified = files.reduce<string | null>(
      (l, f) => (f.modified && (!l || f.modified > l) ? f.modified : l),
      null,
    )
    const expectedSlug = [slugify(name), slugify(productCode)].filter(Boolean).join('-')

    // Find the ingredient by driveId → slug → externalId.
    type IngDoc = { id: string | number; driveId?: string; externalId?: string; driveParentId?: string; fileCount?: number }
    const find = async (where: Record<string, unknown>) => {
      const r = await payload.find({ collection: 'ingredients', where: where as never, limit: 1, depth: 0, overrideAccess: true })
      return r.docs[0] as IngDoc | undefined
    }
    const doc =
      (await find({ driveId: { equals: driveId } })) ||
      (expectedSlug ? await find({ slug: { equals: expectedSlug } }) : undefined) ||
      (await find({ externalId: { equals: driveId } }))

    if (!doc) {
      notFound++
      if (missing.length < 40) missing.push(`${name} (${productCode})`)
      continue
    }

    // Skip if the Drive ids are already correct (avoids re-writing 1500+ docs
    // and bloating versions — only the broken ones are updated).
    const already =
      doc.driveId === driveId &&
      doc.externalId === driveId &&
      (doc.driveParentId ?? '') === catId &&
      (doc.fileCount ?? 0) === fileCount
    if (already) {
      unchanged++
      continue
    }

    if (!DRY_RUN) {
      await payload.update({
        collection: 'ingredients',
        id: doc.id,
        data: {
          externalId: driveId,
          driveId,
          driveParentId: catId,
          driveFiles,
          fileCount,
          lastDriveSyncAt: latestModified ? new Date(latestModified).toISOString() : new Date().toISOString(),
        } as never,
        overrideAccess: true,
      })
    }
    updated++
    if (updated % 200 === 0) process.stderr.write(`  …${updated} cập nhật\n`)
  }

  process.stderr.write(
    `\n[restore-drive-ids] ${DRY_RUN ? '(DRY RUN) ' : ''}Hoàn tất:\n  Cập nhật: ${updated}\n  Không tìm thấy khớp: ${notFound}\n  Đã đúng sẵn (bỏ qua): ${unchanged}\n  Bỏ qua (thiếu id/tên): ${skipped}\n`,
  )
  writeFileSync('/tmp/restore-result.json', JSON.stringify({ updated, unchanged, notFound, skipped, missing }, null, 2))
  if (missing.length) process.stderr.write(`  Ví dụ không khớp: ${missing.join(' | ')}\n`)
  process.exit(0)
} catch (err) {
  process.stderr.write(`[restore-drive-ids] failed: ${(err as Error)?.stack || String(err)}\n`)
  process.exit(1)
}
