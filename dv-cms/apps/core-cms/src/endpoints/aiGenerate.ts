/**
 * AI Generation Endpoints — Tạo nội dung tự động cho Ingredients.
 *
 * Flow:
 *   POST /api/ai-generate           → Tạo job mới, chạy nền
 *   GET  /api/ai-generate/jobs     → Danh sách jobs gần đây
 *   GET  /api/ai-generate/jobs/:id → Chi tiết job + kết quả JSON
 *
 * Mọi trigger (lẻ / hàng loạt / chỉ ảnh) chỉ TẠO job ở trạng thái `queued` rồi
 * gọi ensureQueueRunner — hàng đợi tuần tự claim từng job. Không được gọi thẳng
 * runAiGenerate() ở đây: job vừa tạo mang đúng trạng thái mà queue đang quét,
 * nên chạy trực tiếp sẽ đua với queue và xử lý cùng một job hai lần.
 *
 * Backend worker:
 *   1. Lấy ingredient từ Payload
 *   2. Download tất cả file từ driveFiles (PDF) bằng Google Drive API
 *   3. Trích xuất text từ PDF bằng pdfjs-dist (scan → Vision OCR)
 *   4. Gọi AI → sinh nội dung + hồ sơ kỹ thuật/pháp lý/nghiên cứu
 *   5. Ghi nội dung vào ingredient (cả 2 ngôn ngữ + specs)
 *   6. Sinh featured image TỪ BẢN GHI ĐÃ LƯU rồi upload lên Payload Media
 *      (ảnh chạy sau cùng: lỗi ảnh không làm mất phần nội dung đã lưu)
 *   7. Lưu kết quả vào job record (preview JSON)
 *
 * Result format (returned as JSON preview in modal):
 * {
 *   "subtitle": { "vi": "...", "en": "..." },
 *   "description": { "vi": "...", "en": "..." },
 *   "benefits": ["..."],
 *   "applications": ["..."],
 *   "badges": ["..."],
 *   "suggestedDosage": "...",
 *   "featuredImage": { "id": "123", "url": "..." },
 *   "metadata": { "tokenUsage": { ... }, "filesProcessed": 3, "modelUsed": "gpt-4o" }
 * }
 */

import type { Endpoint, PayloadRequest } from 'payload'
import type { GeneratedContent, Locale } from '../lib/openaiService.js'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type GenerationStatus =
  | 'queued'
  | 'downloading'
  | 'extracting'
  | 'generating_content'
  | 'generating_image'
  | 'saving'
  | 'done'
  | 'error'
  | 'cancelled'

type AiGenerateJob = {
  id: string | number
  status: GenerationStatus
  phase: string
  ingredientId: string | number
  ingredientName: string
  createdAt: string
  startedAt?: string
  finishedAt?: string
  result?: GeneratedContent & {
    featuredImage?: { id: string | number; url: string }
    metadata?: {
      filesProcessed: number
      modelUsed: string
      imageGenerated: boolean
      locale: Locale
      errors?: string[]
    }
  }
  errorMessage?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isAdmin(req: PayloadRequest): boolean {
  const user = req.user as { role?: string } | undefined
  return Boolean(user?.role === 'admin')
}

async function readJob(req: PayloadRequest, id: string) {
  return req.payload.findByID({
    collection: 'ai-generate-jobs',
    id,
    depth: 0,
    overrideAccess: true,
  })
}

// ---------------------------------------------------------------------------
// POST /api/ai-generate — Trigger new generation
// ---------------------------------------------------------------------------

const triggerGenerateEndpoint: Endpoint = {
  path: '/ai-generate',
  method: 'post',
  handler: async (req: PayloadRequest): Promise<Response> => {
    if (!isAdmin(req)) {
      return Response.json({ ok: false, error: 'Chỉ admin được phép.' }, { status: 403 })
    }

    let body: { ingredientId?: string; locale?: string }
    try {
      body = await (req as unknown as Request).json()
    } catch {
      return Response.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 })
    }

    const { ingredientId, locale = 'vi' } = body

    if (!ingredientId) {
      return Response.json({ ok: false, error: 'Thiếu ingredientId.' }, { status: 400 })
    }

    // Verify ingredient exists
    let ingredientName = 'Unknown'
    try {
      const ing = await req.payload.findByID({
        collection: 'ingredients',
        id: ingredientId,
        depth: 0,
        overrideAccess: true,
      })
      // Get localized name
      const nameField = ing.name as { vi?: string; en?: string } | string | undefined
      if (typeof nameField === 'object' && nameField !== null) {
        ingredientName = (nameField as { vi?: string }).vi ?? (nameField as { en?: string }).en ?? String(ingredientId)
      } else {
        ingredientName = String(nameField ?? ingredientId)
      }
    } catch {
      return Response.json({ ok: false, error: `Ingredient ${ingredientId} không tồn tại.` }, { status: 404 })
    }

    const user = req.user as { id?: string | number }
    const triggerId = typeof user.id === 'number' ? user.id : String(user.id ?? '')

    // Tạo job record
    let jobId: string | number = ''
    try {
      const job = await req.payload.create({
        collection: 'ai-generate-jobs',
        data: {
          status: 'queued',
          phase: 'Đang xếp hàng...',
          ingredientId: String(ingredientId),
          ingredientName,
          locale: locale as Locale,
          totals: {
            filesFound: 0,
            filesDownloaded: 0,
            filesExtracted: 0,
            errors: 0,
          },
          logs: [],
        } as unknown as Record<string, unknown>,
        overrideAccess: true,
      })
      jobId = String(job.id)

      // Hand off to the shared sequential queue — same path as bulk + image-only.
      // Calling runAiGenerate() directly here used to race the queue drainer:
      // this job is created with status 'queued', which is exactly what the
      // drainer polls for, so a bulk run in progress could claim and run the
      // same job concurrently — double OpenAI spend and interleaved writes.
      // The queue claims each job before running it, so one runner wins.
      const { ensureQueueRunner } = await import('../ai-generate/queue.js')
      ensureQueueRunner(req.payload)

      return Response.json(
        {
          ok: true,
          message: 'Đã tạo job tạo nội dung. Theo dõi tiến trình bên dưới.',
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
// POST /api/ai-generate/image — Regenerate ONLY the featured image
// ---------------------------------------------------------------------------

const imageOnlyEndpoint: Endpoint = {
  path: '/ai-generate/image',
  method: 'post',
  handler: async (req: PayloadRequest): Promise<Response> => {
    if (!isAdmin(req)) {
      return Response.json({ ok: false, error: 'Chỉ admin được phép.' }, { status: 403 })
    }

    let body: { ingredientId?: string; locale?: string }
    try {
      body = await (req as unknown as Request).json()
    } catch {
      return Response.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 })
    }
    const { ingredientId, locale = 'vi' } = body
    if (!ingredientId) {
      return Response.json({ ok: false, error: 'Thiếu ingredientId.' }, { status: 400 })
    }

    let ingredientName = String(ingredientId)
    try {
      const ing = await req.payload.findByID({ collection: 'ingredients', id: ingredientId, depth: 0, overrideAccess: true })
      const nf = ing.name as { vi?: string; en?: string } | string | undefined
      ingredientName = typeof nf === 'object' && nf !== null ? nf.vi ?? nf.en ?? String(ingredientId) : String(nf ?? ingredientId)
    } catch {
      return Response.json({ ok: false, error: `Ingredient ${ingredientId} không tồn tại.` }, { status: 404 })
    }

    try {
      const job = await req.payload.create({
        collection: 'ai-generate-jobs',
        data: {
          mode: 'image',
          status: 'queued',
          phase: 'Đang xếp hàng (chỉ tạo ảnh)...',
          ingredientId: String(ingredientId),
          ingredientName,
          locale: locale as Locale,
          totals: { filesFound: 0, filesDownloaded: 0, filesExtracted: 0, errors: 0 },
          logs: [],
        } as never,
        overrideAccess: true,
      })

      // The sequential queue picks it up and runs the image-only worker (mode).
      const { ensureQueueRunner } = await import('../ai-generate/queue.js')
      ensureQueueRunner(req.payload)

      return Response.json(
        { ok: true, message: 'Đã tạo job tạo lại ảnh. Theo dõi tiến trình bên dưới.', jobId: String(job.id) },
        { status: 202 },
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return Response.json({ ok: false, error: `Lỗi tạo job: ${msg}` }, { status: 500 })
    }
  },
}

// ---------------------------------------------------------------------------
// POST /api/ai-generate/bulk — Enqueue generation for many/all ingredients
// ---------------------------------------------------------------------------

const ACTIVE_STATUSES = ['queued', 'downloading', 'extracting', 'generating_content', 'generating_image', 'saving']

const bulkGenerateEndpoint: Endpoint = {
  path: '/ai-generate/bulk',
  method: 'post',
  handler: async (req: PayloadRequest): Promise<Response> => {
    if (!isAdmin(req)) {
      return Response.json({ ok: false, error: 'Chỉ admin được phép.' }, { status: 403 })
    }

    let body: { ids?: (string | number)[]; all?: boolean; locale?: string }
    try {
      body = await (req as unknown as Request).json()
    } catch {
      return Response.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 })
    }
    const locale = (body.locale ?? 'vi') as Locale
    const payload = req.payload

    // Count how many will be targeted (fast) so the UI can show a number now.
    let targetCount = 0
    try {
      if (body.all) {
        const c = await payload.count({ collection: 'ingredients', overrideAccess: true })
        targetCount = c.totalDocs
      } else {
        targetCount = Array.isArray(body.ids) ? body.ids.length : 0
      }
    } catch {
      /* non-fatal */
    }

    if (!body.all && (!Array.isArray(body.ids) || body.ids.length === 0)) {
      return Response.json({ ok: false, error: 'Chưa chọn nguyên liệu nào.' }, { status: 400 })
    }

    // Enqueue + drain in the background so this request returns immediately
    // (creating hundreds of job rows must not block/timeout the HTTP call).
    setImmediate(async () => {
      try {
        // Resolve the target ingredient ids.
        const ids: (string | number)[] = []
        if (body.all) {
          let page = 1
          for (;;) {
            const res = await payload.find({ collection: 'ingredients', limit: 500, page, depth: 0, overrideAccess: true })
            for (const d of res.docs) ids.push(d.id)
            if (!res.hasNextPage) break
            page++
          }
        } else {
          ids.push(...(body.ids ?? []))
        }

        // Skip ingredients that already have an active (queued/in-progress) job.
        const active = new Set<string>()
        try {
          const res = await payload.find({
            collection: 'ai-generate-jobs',
            where: { status: { in: ACTIVE_STATUSES } },
            limit: 5000,
            depth: 0,
            overrideAccess: true,
          })
          for (const j of res.docs) active.add(String(j.ingredientId))
        } catch {
          /* ignore — worst case we create a duplicate job */
        }

        let created = 0
        for (const id of ids) {
          if (active.has(String(id))) continue
          try {
            const ing = await payload.findByID({ collection: 'ingredients', id, depth: 0, overrideAccess: true })
            const nf = ing.name as { vi?: string; en?: string } | string | undefined
            const ingredientName =
              typeof nf === 'object' && nf !== null ? nf.vi ?? nf.en ?? String(id) : String(nf ?? id)
            await payload.create({
              collection: 'ai-generate-jobs',
              data: {
                status: 'queued',
                phase: 'Đang xếp hàng (bulk)...',
                ingredientId: String(id),
                ingredientName,
                locale,
                totals: { filesFound: 0, filesDownloaded: 0, filesExtracted: 0, errors: 0 },
                logs: [],
              } as never,
              overrideAccess: true,
            })
            active.add(String(id))
            created++
          } catch (err) {
            console.error('[ai-generate/bulk] enqueue failed for', id, err)
          }
        }

        console.log(`[ai-generate/bulk] enqueued ${created} jobs; starting sequential queue`)
        const { ensureQueueRunner } = await import('../ai-generate/queue.js')
        ensureQueueRunner(payload)
      } catch (err) {
        console.error('[ai-generate/bulk] background error:', err)
      }
    })

    return Response.json(
      {
        ok: true,
        message: `Đã nhận yêu cầu cho ${targetCount} nguyên liệu. Job sẽ chạy lần lượt trong nền — theo dõi ở AI Generate Jobs.`,
        targeted: targetCount,
      },
      { status: 202 },
    )
  },
}

// ---------------------------------------------------------------------------
// GET /api/ai-generate/jobs — List recent jobs
// ---------------------------------------------------------------------------

const listJobsEndpoint: Endpoint = {
  path: '/ai-generate/jobs',
  method: 'get',
  handler: async (req: PayloadRequest): Promise<Response> => {
    if (!isAdmin(req)) {
      return Response.json({ ok: false, error: 'Chỉ admin được phép.' }, { status: 403 })
    }

    const limit = Math.min(Number(req.query?.limit ?? 10), 50)

    try {
      const result = await req.payload.find({
        collection: 'ai-generate-jobs',
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
        ingredientId: j.ingredientId,
        ingredientName: j.ingredientName,
        locale: j.locale,
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
// GET /api/ai-generate/jobs/:id — Job detail + result
// ---------------------------------------------------------------------------

const getJobEndpoint: Endpoint = {
  path: '/ai-generate/jobs/:id',
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
          ingredientId: job.ingredientId,
          ingredientName: job.ingredientName,
          locale: job.locale,
          totals: job.totals,
          logs: job.logs,
          result: job.result,
          createdAt: job.createdAt,
          startedAt: job.startedAt,
          finishedAt: job.finishedAt,
          errorMessage: job.errorMessage,
        },
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return Response.json({ ok: false, error: msg }, { status: 404 })
    }
  },
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const aiGenerateTriggerEndpoint = triggerGenerateEndpoint
export const aiGenerateBulkEndpoint = bulkGenerateEndpoint
export const aiGenerateImageEndpoint = imageOnlyEndpoint
export const aiGenerateListEndpoint = listJobsEndpoint
export const aiGenerateGetEndpoint = getJobEndpoint
