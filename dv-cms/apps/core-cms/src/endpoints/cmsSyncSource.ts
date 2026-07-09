import type { Endpoint, PayloadRequest } from 'payload'

/**
 * GET /api/cms-sync-source
 *
 * Gọi n8n webhook để lấy danh sách products/categories đã gộp từ rag_sync_state.
 * Trả về JSON thô từ n8n — chưa upsert vào Payload.
 * Payload: { categories: [...], products: [...], summary: {...} }
 *
 * Chỉ admin được gọi.
 */
export const cmsSyncSourceEndpoint: Endpoint = {
  path: '/cms-sync/source',
  method: 'get',
  handler: async (req: PayloadRequest): Promise<Response> => {
    const user = req.user as { role?: string } | undefined
    if (!user) {
      return Response.json({ ok: false, error: 'Chưa đăng nhập.' }, { status: 401 })
    }
    if (user.role !== 'admin') {
      return Response.json({ ok: false, error: 'Chỉ admin mới được gọi.' }, { status: 403 })
    }

    const n8nWebhookUrl = process.env.N8N_CMS_SYNC_WEBHOOK_URL
    if (!n8nWebhookUrl) {
      return Response.json(
        { ok: false, error: 'Chưa cấu hình N8N_CMS_SYNC_WEBHOOK_URL.' },
        { status: 500 },
      )
    }

    try {
      const res = await fetch(n8nWebhookUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        // Timeout 30s — đủ để n8n query Postgres trả về
        signal: AbortSignal.timeout(30_000),
      })

      if (!res.ok) {
        const body = await res.text().catch(() => '')
        return Response.json(
          { ok: false, error: `n8n webhook lỗi HTTP ${res.status}`, detail: body },
          { status: 502 },
        )
      }

      const data = (await res.json()) as unknown

      // Basic validation shape
      if (
        !data ||
        typeof data !== 'object' ||
        !Array.isArray((data as Record<string, unknown>).categories) ||
        !Array.isArray((data as Record<string, unknown>).products)
      ) {
        return Response.json(
          { ok: false, error: 'Shape JSON từ n8n không hợp lệ.' },
          { status: 502 },
        )
      }

      return Response.json({ ok: true, data }, { status: 200 })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return Response.json({ ok: false, error: `Lỗi gọi n8n: ${msg}` }, { status: 500 })
    }
  },
}
