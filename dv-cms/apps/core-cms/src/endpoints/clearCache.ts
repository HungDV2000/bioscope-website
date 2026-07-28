/**
 * POST /api/clear-cache — xoá cache website (ISR) theo yêu cầu.
 *
 * Nội dung sửa trong CMS đã tự ping revalidate (xem hooks/revalidate). Endpoint
 * này để BẤM TAY khi cần đẩy ngay toàn bộ site, hoặc sau khi seed/nhập liệu
 * hàng loạt không đi qua hook. Gọi thẳng route `/api/revalidate` của frontend
 * với secret dùng chung — secret nằm ở server, KHÔNG lộ ra trình duyệt.
 */
import type { Endpoint, PayloadRequest } from 'payload'
import { moduleGate } from '../lib/modules.js'

function isStaff(req: PayloadRequest): boolean {
  const role = (req.user as { role?: string } | undefined)?.role
  return role === 'admin' || role === 'editor'
}

export const clearCacheEndpoint: Endpoint = {
  path: '/clear-cache',
  method: 'post',
  handler: async (req: PayloadRequest): Promise<Response> => {
    if (!isStaff(req)) {
      return Response.json({ ok: false, error: 'Không đủ quyền.' }, { status: 403 })
    }
    const gate = await moduleGate(req.payload, 'moduleClearCache')
    if (gate) return gate

    const frontendUrl = process.env.FRONTEND_URL
    const secret = process.env.REVALIDATE_SECRET
    if (!frontendUrl || !secret) {
      return Response.json(
        { ok: false, error: 'Chưa cấu hình FRONTEND_URL / REVALIDATE_SECRET trên CMS.' },
        { status: 500 },
      )
    }

    // path=/ + type 'layout' ở phía frontend revalidate toàn bộ trang chung layout
    // gốc → coi như xoá cache cả site.
    const url = `${frontendUrl.replace(/\/$/, '')}/api/revalidate?secret=${encodeURIComponent(secret)}&path=${encodeURIComponent('/')}`
    try {
      const res = await fetch(url, { method: 'POST' })
      if (!res.ok) {
        const body = await res.text().catch(() => '')
        return Response.json(
          { ok: false, error: `Frontend trả ${res.status}. ${body.slice(0, 200)}` },
          { status: 502 },
        )
      }
      return Response.json({ ok: true, message: 'Đã xoá cache website. Trang sẽ dựng lại ở lượt truy cập kế tiếp.' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      req.payload.logger.error(`[clear-cache] gọi frontend lỗi: ${msg}`)
      return Response.json({ ok: false, error: `Không gọi được frontend: ${msg}` }, { status: 502 })
    }
  },
}
