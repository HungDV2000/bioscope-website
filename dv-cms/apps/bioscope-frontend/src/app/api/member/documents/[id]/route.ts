import { type NextRequest, NextResponse } from 'next/server'
import { getMemberSession } from '@/lib/member/auth'
import { b2bFetch } from '@/lib/member/api'

/**
 * Tải tài liệu gated: xác thực phiên ở đây rồi nhờ CMS kiểm quyền lần nữa
 * (kiểm hai lớp), sau đó chuyển tiếp nội dung file về cho khách.
 */
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getMemberSession()
  if (!session) return NextResponse.redirect(new URL('/member/login', req.nextUrl.origin))
  if (session.status !== 'approved') {
    return NextResponse.json({ error: 'Tài khoản chưa được duyệt.' }, { status: 403 })
  }

  const { id } = await ctx.params
  try {
    const res = await b2bFetch(`/api/b2b/documents/${encodeURIComponent(id)}/download`, { method: 'GET' })
    if (!res.ok || !res.body) {
      return NextResponse.json({ error: 'Không tải được tài liệu.' }, { status: res.status || 502 })
    }
    return new NextResponse(res.body, {
      status: 200,
      headers: {
        'Content-Type': res.headers.get('content-type') ?? 'application/octet-stream',
        ...(res.headers.get('content-disposition')
          ? { 'Content-Disposition': res.headers.get('content-disposition') as string }
          : {}),
        'Cache-Control': 'private, no-store',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Không kết nối được máy chủ.' }, { status: 502 })
  }
}
