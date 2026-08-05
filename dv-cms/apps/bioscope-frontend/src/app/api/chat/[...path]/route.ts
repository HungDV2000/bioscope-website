import type { NextRequest } from 'next/server'

/**
 * Proxy /api/chat/* của website → CMS. Tránh CORS + giấu địa chỉ CMS nội bộ.
 * (Webhook Telegram gọi thẳng admin.bioscope.vn, KHÔNG qua đây.)
 */
const CMS = process.env.CMS_INTERNAL_URL || process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3001'

async function forward(req: NextRequest, path: string[]): Promise<Response> {
  const url = `${CMS}/api/chat/${path.join('/')}${req.nextUrl.search}`
  const init: RequestInit = {
    method: req.method,
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(15000),
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') init.body = await req.text()
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
