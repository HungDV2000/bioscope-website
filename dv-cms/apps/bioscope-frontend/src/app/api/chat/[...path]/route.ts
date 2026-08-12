import type { NextRequest } from 'next/server'
import { getMemberSession } from '@/lib/member/auth'

/**
 * Proxy /api/chat/* của website → CMS. Tránh CORS + giấu địa chỉ CMS nội bộ.
 * (Webhook Telegram gọi thẳng admin.bioscope.vn, KHÔNG qua đây.)
 */
const CMS = process.env.CMS_INTERNAL_URL || process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3001'

/** IP thật của khách để CMS lưu tracking (proxy nằm giữa nên phải chuyển tiếp). */
function visitorIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    ''
  )
}

async function forward(req: NextRequest, path: string[]): Promise<Response> {
  const url = `${CMS}/api/chat/${path.join('/')}${req.nextUrl.search}`
  const ip = visitorIp(req)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (ip) headers['x-forwarded-for'] = ip
  const init: RequestInit = {
    method: req.method,
    headers,
    signal: AbortSignal.timeout(15000),
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    let body = await req.text()
    // Chỉ /chat/start: đính danh tính thành viên (server-side, khách không giả mạo được).
    if (path.join('/') === 'start') {
      const session = await getMemberSession()
      try {
        const parsed = body ? (JSON.parse(body) as Record<string, unknown>) : {}
        if (session?.status === 'approved') {
          parsed.loggedIn = true
          parsed.memberName = session.contactName
          parsed.memberEmail = session.email
        }
        body = JSON.stringify(parsed)
      } catch {
        /* body không phải JSON — giữ nguyên */
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
