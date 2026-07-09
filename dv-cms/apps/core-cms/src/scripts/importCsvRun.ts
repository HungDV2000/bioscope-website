import { getPayload } from 'payload'
import config from '../payload.config.js'
import { runCsvImport } from '../drive-sync/CsvImportManager.js'

const CSV =
  process.env.CSV_PATH ||
  '/Users/kcode/Documents/Sources/DeepViewJSC/CrawlerDriveData/output/danh_sach_san_pham.csv'

/* eslint-disable @typescript-eslint/no-explicit-any */
try {
  const payload = await getPayload({ config })
  ;(global as any).__payload = payload

  const job = await payload.create({
    collection: 'drive-sync-jobs',
    data: {
      status: 'queued',
      phase: 'CLI import',
      rootFolderId: 'csv-import',
      totals: {
        categories: { found: 0, created: 0, updated: 0, skipped: 0 },
        ingredients: { found: 0, created: 0, updated: 0, skipped: 0, no_category: 0 },
        errors: 0,
      },
      logs: [],
    } as any,
    overrideAccess: true,
  })
  const jobId = String(job.id)
  process.stdout.write(`[import] job ${jobId} — file ${CSV}\n`)

  await runCsvImport({ jobId, filePath: CSV })

  const done = await payload.findByID({ collection: 'drive-sync-jobs', id: jobId, depth: 0, overrideAccess: true })
  process.stdout.write(`[import] status=${(done as any).status} phase=${(done as any).phase}\n`)
  process.stdout.write(`[import] totals=${JSON.stringify((done as any).totals)}\n`)

  const cats = await payload.count({ collection: 'ingredient-categories', overrideAccess: true })
  const ings = await payload.count({ collection: 'ingredients', overrideAccess: true })
  process.stdout.write(`[import] DB → categories=${cats.totalDocs} ingredients=${ings.totalDocs}\n`)
  process.exit(0)
} catch (err) {
  process.stderr.write(`[import] failed: ${(err as Error)?.stack || String(err)}\n`)
  process.exit(1)
}
