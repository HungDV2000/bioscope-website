import type { NextRequest } from 'next/server'
import { getMemberSession } from '@/lib/member/auth'

/**
 * Proxy /api/chat/* của website → CMS. Tránh CORS + giấu địa chỉ CMS nội bộ.
 * (Webhook Telegram gọi thẳng admin.bioscope.vn, KHÔNG qua đây.)
 */
const CMS = process.env.CMS_INTERNAL_URL || process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3001'

/** Các thao tác ghi — đều đòi đăng nhập. */
const GUARDED = new Set(['start', 'message', 'contact'])

/** IP thật của khách để CMS lưu tracking (proxy nằm giữa nên phải chuyển tiếp). */
function visitorIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || ''
}

async function forward(req: NextRequest, path: string[]): Promise<Response> {
  const p = path.join('/')
  const url = `${CMS}/api/chat/${p}${req.nextUrl.search}`
  const ip = visitorIp(req)

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (ip) headers['x-forwarded-for'] = ip

  const init: RequestInit = { method: req.method, headers, signal: AbortSignal.timeout(15000) }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    let body = await req.text()

    if (GUARDED.has(p)) {
      // Bắt buộc đăng nhập mới được chat. Xác thực ở SERVER bằng cookie phiên
      // CÓ KÝ nên khách không tự khai loggedIn được; token cũ trong localStorage
      // cũng không dùng tiếp được sau khi đăng xuất. Mọi tài khoản đã đăng nhập
      // đều chat được (kể cả chờ duyệt) — chỉ khu tài liệu mới cần duyệt.
      const session = await getMemberSession()
      if (!session || session.status === 'rejected') {
        return Response.json({ ok: false, error: 'login_required' }, { status: 401 })
      }
      // Riêng /chat/start mới cần đính danh tính + để CMS lưu tracking.
      if (p === 'start') {
        try {
          const parsed = body ? (JSON.parse(body) as Record<string, unknown>) : {}
          parsed.loggedIn = true
          parsed.memberId = session.id
          parsed.memberName = session.contactName
          parsed.memberEmail = session.email
          parsed.memberCompany = session.company
          body = JSON.stringify(parsed)
        } catch {
          /* body không phải JSON — giữ nguyên */
        }
      }
    }

    init.body = body
  }

  try {
    const res = await fetch(url, init)
    return new Response(await res.text(), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    return Response.json({ ok: false, error: 'Không kết nối được máy chủ chat.' }, { status: 502 })
  }
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return forward(req, (await ctx.params).path)
}
export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return forward(req, (await ctx.params).path)
}
