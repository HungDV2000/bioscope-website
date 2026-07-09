/**
 * CSV Import Endpoint
 *
 * POST /api/csv-import
 *   Body (JSON): { "csvContent": "<base64 encoded CSV>" }
 *   Response: { ok, jobId }
 *
 * CSV file is saved to disk, then CsvImportManager runs it in background.
 * Progress is tracked via DriveSyncJobs record (shared with Drive Sync).
 */

import type { Endpoint, PayloadRequest } from 'payload'
import path from 'node:path'
import { writeFile, mkdir } from 'node:fs/promises'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isAdmin(req: PayloadRequest): boolean {
  const user = req.user as { role?: string } | undefined
  return Boolean(user?.role === 'admin')
}

async function tmpCsvPath(): Promise<string> {
  const tmpDir = path.resolve(process.cwd(), 'tmp')
  await mkdir(tmpDir, { recursive: true })
  return path.resolve(tmpDir, `csv-import-${Date.now()}.csv`)
}

// ---------------------------------------------------------------------------
// POST /api/csv-import
// ---------------------------------------------------------------------------

const csvImportEndpoint: Endpoint = {
  path: '/csv-import',
  method: 'post',
  handler: async (req: PayloadRequest): Promise<Response> => {
    if (!isAdmin(req)) {
      return Response.json({ ok: false, error: 'Chỉ admin được phép.' }, { status: 403 })
    }

    let body: { csvContent?: string; filePath?: string }
    try {
      body = await (req as unknown as Request).json() as { csvContent?: string; filePath?: string }
    } catch {
      return Response.json(
        { ok: false, error: 'Body phải là JSON { csvContent: "<base64>" } hoặc { filePath: "..." }.' },
        { status: 400 },
      )
    }

    let filePath: string

    if (body.filePath) {
      filePath = body.filePath
    } else if (body.csvContent) {
      try {
        const csvText = Buffer.from(body.csvContent, 'base64').toString('utf-8')
        filePath = await tmpCsvPath()
        await writeFile(filePath, csvText, 'utf-8')
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        return Response.json({ ok: false, error: `Lỗi giải mã CSV: ${msg}` }, { status: 400 })
      }
    } else {
      return Response.json(
        { ok: false, error: 'Body phải có { csvContent: "<base64>" } hoặc { filePath: "..." }.' },
        { status: 400 },
      )
    }

    const user = req.user as { id?: string | number }
    const triggerId = typeof user.id === 'number' ? user.id : String(user.id ?? '')

    // Create job record
    try {
      const job = await req.payload.create({
        collection: 'drive-sync-jobs',
        data: {
          status: 'queued',
          phase: 'Đang khởi tạo import CSV...',
          rootFolderId: 'csv-import',
          triggeredBy: triggerId,
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

      // Run in background — dynamic import to avoid bundling manager into client
      const savedPath = filePath
      setImmediate(async () => {
        try {
          const { runCsvImport } = await import('../drive-sync/CsvImportManager.js')
          await runCsvImport({ jobId, filePath: savedPath })
        } catch (err) {
          console.error('[csv-import] Background error:', err)
        } finally {
          try {
            const { unlink } = await import('node:fs/promises')
            await unlink(savedPath)
          } catch { /* ignore */ }
        }
      })

      return Response.json(
        { ok: true, message: 'Đã tạo job import CSV. Theo dõi tiến trình bên dưới.', jobId },
        { status: 202 },
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return Response.json({ ok: false, error: `Lỗi tạo job: ${msg}` }, { status: 500 })
    }
  },
}

export { csvImportEndpoint }
