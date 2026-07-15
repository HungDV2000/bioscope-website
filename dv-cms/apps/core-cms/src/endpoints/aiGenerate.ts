/**
 * AI Generation Endpoints — Tạo nội dung tự động cho Ingredients.
 *
 * Flow:
 *   POST /api/ai-generate           → Tạo job mới, chạy nền
 *   GET  /api/ai-generate/jobs     → Danh sách jobs gần đây
 *   GET  /api/ai-generate/jobs/:id → Chi tiết job + kết quả JSON
 *
 * Backend worker:
 *   1. Lấy ingredient từ Payload
 *   2. Download tất cả file từ driveFiles (PDF) bằng Google Drive API
 *   3. Trích xuất text từ PDF bằng pdfjs-dist
 *   4. Gọi GPT-4o → sinh nội dung (description, benefits, applications...)
 *   5. Gọi DALL·E 3 → sinh featured image
 *   6. Upload image lên Payload Media
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

      // Reuse the request's Payload instance (global.__payload isn't set in the
      // running server — only in CLI scripts).
      const payload = req.payload

      // Chạy nền ngay
      setImmediate(async () => {
        try {
          const { runAiGenerate } = await import('../ai-generate/AiGenerateWorker.js')
          await runAiGenerate({
            jobId: String(jobId),
            ingredientId: String(ingredientId),
            locale: locale as Locale,
            payload,
          })
        } catch (err) {
          console.error('[ai-generate] Background error:', err)
        }
      })

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
export const aiGenerateListEndpoint = listJobsEndpoint
export const aiGenerateGetEndpoint = getJobEndpoint
