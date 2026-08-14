import type { NextRequest } from 'next/server'
import { getMemberSession } from '@/lib/member/auth'

/**
 * Proxy /api/chat/* của website → CMS. Tránh CORS + giấu địa chỉ CMS nội bộ.
 * (Webhook Telegram gọi thẳng admin.bioscope.vn, KHÔNG qua đây.)
 */
const CMS = process.env.CMS_INTERNAL_URL || process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3001'

/**
 * Mọi thứ TRỪ `config` đều đòi đăng nhập.
 *
 * Kể cả `poll` và `file` (chỉ đọc): token chat nằm trong localStorage và không
 * mất khi đăng xuất, nên nếu chỉ cần token là đọc được thì trên máy dùng chung
 * người sau sẽ xem được hội thoại của người trước.
 */
const PUBLIC_PATHS = new Set(['config'])

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

  let session: Awaited<ReturnType<typeof getMemberSession>> = null
  if (!PUBLIC_PATHS.has(p)) {
    session = await getMemberSession()
    if (!session || session.status === 'rejected') {
      return Response.json({ ok: false, error: 'login_required' }, { status: 401 })
    }
    // CMS đối chiếu id này với chủ hội thoại trước khi cho đọc/ghi.
    headers['x-chat-member'] = String(session.id)
  }

  const init: RequestInit = { method: req.method, headers, signal: AbortSignal.timeout(15000) }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    let body = await req.text()
    // Riêng /chat/start mới cần đính danh tính + để CMS lưu tracking.
    if (p === 'start' && session) {
      try {
        const parsed = body ? (JSON.parse(body) as Record<string, unknown>) : {}
        parsed.loggedIn = true
        parsed.memberId = session.id
        parsed.memberName = session.contactName
        parsed.memberEmail = session.email
        parsed.memberCompany = session.company
        parsed.memberType = session.customerType
        body = JSON.stringify(parsed)
      } catch {
        /* body không phải JSON — giữ nguyên */
      }
    }
    init.body = body
  }

  try {
    const res = await fetch(url, init)
    // Tệp đính kèm là nhị phân — trả thẳng, không ép về JSON.
    const type = res.headers.get('content-type') ?? ''
    if (!type.includes('application/json')) {
      return new Response(res.body, {
        status: res.status,
        headers: {
          'Content-Type': type || 'application/octet-stream',
          ...(res.headers.get('content-disposition')
            ? { 'Content-Disposition': res.headers.get('content-disposition') as string }
            : {}),
          'Cache-Control': 'private, no-store',
        },
      })
    }
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
