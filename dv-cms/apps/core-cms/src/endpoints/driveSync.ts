/**
 * Drive Sync Endpoints
 *
 * POST /api/drive-sync          → Tạo job mới, chạy nền
 * GET  /api/drive-sync/jobs    → Danh sách jobs gần đây
 * GET  /api/drive-sync/jobs/:id → Chi tiết job (progress, logs)
 * POST /api/drive-sync/jobs/:id/cancel → Hủy job đang chạy
 */

import type { Endpoint, PayloadRequest } from 'payload'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isAdmin(req: PayloadRequest): boolean {
  const user = req.user as { role?: string } | undefined
  return Boolean(user?.role === 'admin')
}

function readJob(req: PayloadRequest, id: string) {
  return req.payload.findByID({
    collection: 'drive-sync-jobs',
    id,
    depth: 1,
    overrideAccess: true,
  })
}

// ---------------------------------------------------------------------------
// POST /api/drive-sync  — Trigger new sync
// ---------------------------------------------------------------------------

const triggerSyncEndpoint: Endpoint = {
  path: '/drive-sync',
  method: 'post',
  handler: async (req: PayloadRequest): Promise<Response> => {
    if (!isAdmin(req)) {
      return Response.json({ ok: false, error: 'Chỉ admin được phép.' }, { status: 403 })
    }

    const rootFolderId =
      (req.query?.rootFolderId as string) ||
      process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID ||
      '1YFh__V4da3Q6rU3grYgd5YCBH70HcVbs'

    const user = req.user as { id?: string | number }
    const triggerId = typeof user.id === 'number' ? user.id : String(user.id ?? '')

    // Tạo job record
    let jobId: string | number = ''
    try {
      const job = await req.payload.create({
        collection: 'drive-sync-jobs',
        data: {
          status: 'queued',
          phase: 'Đang khởi tạo...',
          rootFolderId,
          triggeredBy: triggerId,
          totals: {
            categories: { found: 0, created: 0, updated: 0, skipped: 0 },
            ingredients: { found: 0, created: 0, updated: 0, skipped: 0 },
            errors: 0,
          },
          logs: [],
        } as any,
        overrideAccess: true,
      })
      jobId = String(job.id)

      // Chạy nền ngay — dynamic import để tránh bundling googleapis vào client
      setImmediate(async () => {
        try {
          const { runDriveSync } = await import('../drive-sync/DriveSyncManager.js')
          await runDriveSync({ jobId: String(jobId), rootFolderId })
        } catch (err) {
          console.error('[drive-sync] Background error:', err)
        }
      })

      return Response.json(
        {
          ok: true,
          message: 'Đã tạo job sync. Theo dõi tiến trình bên dưới.',
          jobId: String(jobId),
        },
        { status: 202 },
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return Response.json({ ok: false, error: `Lỗi tạo job: ${msg}` }, { status: 500 })
    }
  },
}

// ---------------------------------------------------------------------------
// GET /api/drive-sync/jobs  — List recent jobs
// ---------------------------------------------------------------------------

const listJobsEndpoint: Endpoint = {
  path: '/drive-sync/jobs',
  method: 'get',
  handler: async (req: PayloadRequest): Promise<Response> => {
    if (!isAdmin(req)) {
      return Response.json({ ok: false, error: 'Chỉ admin được phép.' }, { status: 403 })
    }

    const limit = Math.min(Number(req.query?.limit ?? 10), 50)

    try {
      const result = await req.payload.find({
        collection: 'drive-sync-jobs',
        where: {},
        sort: '-createdAt',
        limit,
        depth: 0,
        overrideAccess: true,
      })

      const jobs = result.docs.map((j) => ({
        id: j.id,
        status: j.status,
        phase: j.phase,
        totalItems: j.totalItems,
        processedItems: j.processedItems,
        totals: j.totals,
        createdAt: j.createdAt,
        startedAt: j.startedAt,
        finishedAt: j.finishedAt,
        errorMessage: j.errorMessage,
      }))

      return Response.json({ ok: true, jobs })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return Response.json({ ok: false, error: msg }, { status: 500 })
    }
  },
}

// ---------------------------------------------------------------------------
// GET /api/drive-sync/jobs/:id  — Job detail
// ---------------------------------------------------------------------------

const getJobEndpoint: Endpoint = {
  path: '/drive-sync/jobs/:id',
  method: 'get',
  handler: async (req: PayloadRequest): Promise<Response> => {
    if (!isAdmin(req)) {
      return Response.json({ ok: false, error: 'Chỉ admin được phép.' }, { status: 403 })
    }

    const id = req.routeParams?.id as string
    if (!id) {
      return Response.json({ ok: false, error: 'Thiếu job ID.' }, { status: 400 })
    }

    try {
      const job = await readJob(req, id)
      return Response.json({
        ok: true,
        job: {
          id: job.id,
          status: job.status,
          phase: job.phase,
          totalItems: job.totalItems,
          processedItems: job.processedItems,
          totals: job.totals,
          logs: job.logs,
          createdAt: job.createdAt,
          startedAt: job.startedAt,
          finishedAt: job.finishedAt,
          errorMessage: job.errorMessage,
          rootFolderId: job.rootFolderId,
        },
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return Response.json({ ok: false, error: msg }, { status: 404 })
    }
  },
}

// ---------------------------------------------------------------------------
// POST /api/drive-sync/jobs/:id/cancel
// ---------------------------------------------------------------------------

const cancelJobEndpoint: Endpoint = {
  path: '/drive-sync/jobs/:id/cancel',
  method: 'post',
  handler: async (req: PayloadRequest): Promise<Response> => {
    if (!isAdmin(req)) {
      return Response.json({ ok: false, error: 'Chỉ admin được phép.' }, { status: 403 })
    }

    const id = req.routeParams?.id as string
    if (!id) {
      return Response.json({ ok: false, error: 'Thiếu job ID.' }, { status: 400 })
    }

    try {
      const job = await readJob(req, id)
      if (job.status === 'done' || job.status === 'error' || job.status === 'cancelled') {
        return Response.json({ ok: false, error: `Job đã ở trạng thái "${job.status}".` }, { status: 409 })
      }

      await req.payload.update({
        collection: 'drive-sync-jobs',
        id,
        data: {
          status: 'cancelled',
          phase: 'Đã hủy bởi admin.',
          finishedAt: new Date().toISOString(),
        },
        overrideAccess: true,
      })

      return Response.json({ ok: true, message: 'Job đã được hủy.' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return Response.json({ ok: false, error: msg }, { status: 500 })
    }
  },
}

export const driveSyncTriggerEndpoint = triggerSyncEndpoint
export const driveSyncListEndpoint = listJobsEndpoint
export const driveSyncGetEndpoint = getJobEndpoint
export const driveSyncCancelEndpoint = cancelJobEndpoint
