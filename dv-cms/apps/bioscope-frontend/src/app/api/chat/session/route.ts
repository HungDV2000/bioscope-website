import { NextResponse } from 'next/server'
import { getMemberSession } from '@/lib/member/auth'

/**
 * Widget hỏi: khách đã đăng nhập chưa (để hiện popup mời đăng nhập hay khung
 * chat). Chỉ trả tên hiển thị — không lộ thêm dữ liệu tài khoản.
 */
export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getMemberSession()
  const ok = Boolean(session) && session?.status !== 'rejected'
  return NextResponse.json(
    { loggedIn: ok, name: ok ? (session?.contactName ?? session?.email ?? '') : '' },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
