import type { Endpoint, PayloadRequest } from 'payload'
import { runSeed } from '../seed/runSeed.js'

/**
 * Admin-triggered seed. Mounted at `POST /api/seed`. Idempotent — creates
 * missing records and updates existing ones. Restricted to admin users.
 */
export const seedEndpoint: Endpoint = {
  path: '/seed',
  method: 'post',
  handler: async (req: PayloadRequest): Promise<Response> => {
    const user = req.user as { role?: string } | undefined
    if (!user) {
      return Response.json({ ok: false, error: 'Chưa đăng nhập.' }, { status: 401 })
    }
    if (user.role !== 'admin') {
      return Response.json({ ok: false, error: 'Chỉ quản trị viên (admin) mới được chạy seed.' }, { status: 403 })
    }
    try {
      const summary = await runSeed(req.payload)
      return Response.json({ ok: true, summary })
    } catch (err) {
      req.payload.logger.error(err)
      return Response.json({ ok: false, error: (err as Error)?.message ?? 'Seed thất bại.' }, { status: 500 })
    }
  },
}
