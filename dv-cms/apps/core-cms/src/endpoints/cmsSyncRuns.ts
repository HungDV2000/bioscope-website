import type { Endpoint, PayloadRequest } from 'payload'

/**
 * GET /api/cms-sync-runs
 *
 * Trả danh sách các lần chạy CMS sync, sắp xếp mới nhất trước.
 * Admin only.
 *
 * Query params:
 *   ?limit=10  (default 20, max 100)
 *   ?offset=0  (pagination)
 */
export const cmsSyncRunsEndpoint: Endpoint = {
  path: '/cms-sync-runs',
  method: 'get',
  handler: async (req: PayloadRequest): Promise<Response> => {
    const user = req.user as { role?: string } | undefined
    if (!user) {
      return Response.json({ ok: false, error: 'Chưa đăng nhập.' }, { status: 401 })
    }
    if (user.role !== 'admin') {
      return Response.json({ ok: false, error: 'Chỉ admin.' }, { status: 403 })
    }

    const url = new URL(req.url ?? 'http://localhost')
    const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '20', 10), 100)
    const page = parseInt(url.searchParams.get('page') ?? '1', 10)
    const offset = (page - 1) * limit

    try {
      const result = await req.payload.find({
        collection: 'cms-sync-runs',
        where: {},
        limit,
        page,
        sort: '-startedAt',
        depth: 1,
        overrideAccess: true,
      })

      return Response.json(
        {
          ok: true,
          docs: result.docs,
          totalDocs: result.totalDocs,
          page: result.page,
          totalPages: result.totalPages,
        },
        { status: 200 },
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return Response.json({ ok: false, error: msg }, { status: 500 })
    }
  },
}
