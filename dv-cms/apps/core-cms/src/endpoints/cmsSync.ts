import type { Endpoint, PayloadRequest } from 'payload'

// ---------------------------------------------------------------------------
// Source configs — thêm webhook URL vào .env
// ---------------------------------------------------------------------------
const SOURCE_WEBHOOKS: Record<string, string | undefined> = {
  rag: process.env.N8N_CMS_SYNC_WEBHOOK_RAG,
  qdrant: process.env.N8N_CMS_SYNC_WEBHOOK_QDRANT,
}

export type SyncSource = 'rag' | 'qdrant'

/**
 * POST /api/cms-sync
 *
 * Trigger đồng bộ sản phẩm & danh mục từ n8n (RAG hoặc Qdrant) vào Payload CMS.
 *
 * Body (optional):
 *   { "source": "rag" | "qdrant" }   // default: "qdrant"
 *
 * Flow:
 *   1. Validate admin
 *   2. Gọi n8n webhook (theo source) → nhận JSON
 *   3. Tạo CmsSyncRuns record (status=queued, source=gì)
 *   4. Trả 202 + runId (admin không phải đợi)
 *   5. Background: upsert categories → upsert products → auto-map → attach placeholder
 */
export const cmsSyncEndpoint: Endpoint = {
  path: '/cms-sync',
  method: 'post',
  handler: async (req: PayloadRequest): Promise<Response> => {
    const user = req.user as { role?: string; id?: string | number } | undefined
    if (!user) {
      return Response.json({ ok: false, error: 'Chưa đăng nhập.' }, { status: 401 })
    }
    if (user.role !== 'admin') {
      return Response.json({ ok: false, error: 'Chỉ admin mới được chạy sync.' }, { status: 403 })
    }

    // Parse body — chọn source
    let source: SyncSource = 'qdrant'
    try {
      if (req.method === 'POST') {
        const body = (await (req as unknown as Request).json()) as { source?: string }
        if (body.source === 'rag' || body.source === 'qdrant') {
          source = body.source
        }
      }
    } catch {
      // ignore parse error — use default
    }

    const webhookUrl = SOURCE_WEBHOOKS[source]
    if (!webhookUrl) {
      return Response.json(
        { ok: false, error: `Chưa cấu hình N8N_CMS_SYNC_WEBHOOK_${source.toUpperCase()} trong .env.` },
        { status: 500 },
      )
    }

    try {
      // 1. Gọi n8n webhook
      const res = await fetch(webhookUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(180_000), // 3 phút — Qdrant scroll có thể chậm
      })

      if (!res.ok) {
        const body = await res.text().catch(() => '')
        return Response.json(
          { ok: false, error: `n8n webhook (${source}) lỗi HTTP ${res.status}`, detail: body },
          { status: 502 },
        )
      }

      const raw = (await res.json()) as unknown

      if (
        !raw ||
        typeof raw !== 'object' ||
        !Array.isArray((raw as Record<string, unknown>).categories) ||
        !Array.isArray((raw as Record<string, unknown>).products)
      ) {
        return Response.json(
          { ok: false, error: `Shape JSON từ n8n (${source}) không hợp lệ.` },
          { status: 502 },
        )
      }

      const { categories, products, summary } = raw as {
        categories: unknown[]
        products: unknown[]
        summary?: Record<string, unknown>
      }

      // 2. Tạo audit record
      const run = await req.payload.create({
        collection: 'cms-sync-runs',
        data: {
          source,
          status: 'queued',
          triggeredBy: (typeof user.id === 'number' ? user.id : String(user.id ?? '')) as any,
          startedAt: new Date().toISOString(),
          totals: {
            categories: { created: 0, updated: 0, skipped: 0 },
            products: { created: 0, updated: 0, skipped: 0 },
            errors: 0,
          },
          log: [{ ts: new Date().toISOString(), level: 'info', message: `Sync source: ${source} | categories: ${categories.length} | products: ${products.length}` }],
        } as any,
        overrideAccess: true,
      })

      // 3. Trả 202 ngay — chạy nền (dynamic import tránh bundling client)
      setImmediate(async () => {
        try {
          const { runCmsSync } = await import('../cms-sync/runCmsSync.js')
          await runCmsSync({
            runId: String(run.id),
            source,
            categories: categories as CmsSyncRawCategory[],
            products: products as CmsSyncRawProduct[],
            summary: summary as Record<string, unknown> | undefined,
          })
        } catch (err) {
          console.error(`[cms-sync] Background sync failed (source=${source}):`, err)
        }
      })

      return Response.json(
        {
          ok: true,
          message: `Sync (source=${source}) đã xếp hàng chạy nền.`,
          runId: run.id,
          preview: {
            categories: categories.length,
            products: products.length,
            summary,
          },
        },
        { status: 202 },
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return Response.json({ ok: false, error: `Lỗi: ${msg}` }, { status: 500 })
    }
  },
}

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

export type CmsSyncRawCategory = {
  external_id: string
  name: { vi: string }
}

/** Cả 2 nguồn đều trả shape chung:
 *  - RAG: file_names (string[]), last_modified
 *  - Qdrant: source_file_ids ({file_id, file_name, mime_type}[]), last_indexed_at, description
 *  Các field đều optional để 2 nguồn tương thích.
 */
export type CmsSyncRawProduct = {
  external_id: string
  name: { vi: string }
  category_external_id: string | null
  type: 'supplement' | 'cosmetic'
  file_count: number
  // RAG source
  file_names?: string[]
  last_modified?: string | null
  // Qdrant source
  source_file_ids?: Array<{ file_id?: string; file_name: string; mime_type?: string }>
  last_indexed_at?: string | null
  description?: { vi?: string; en?: string }
}
