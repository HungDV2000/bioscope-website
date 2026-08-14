import { type NextRequest, NextResponse } from 'next/server'
import { MEMBER_SESSION_COOKIE, MEMBER_TOKEN_COOKIE } from '@/lib/member/config'
import { publicOrigin, safeReturnTo } from '@/lib/member/google'

/**
 * Đăng xuất từ bất kỳ trang nào (nút ở header) rồi ở lại đúng trang đó — khác
 * với `memberLogout` của cổng đối tác vốn luôn đá về trang đăng nhập.
 */
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null)
  const returnTo = safeReturnTo(form?.get('returnTo')?.toString(), '/')

  const res = NextResponse.redirect(new URL(returnTo, publicOrigin(req)), { status: 303 })
  for (const name of [MEMBER_SESSION_COOKIE, MEMBER_TOKEN_COOKIE]) {
    res.cookies.set(name, '', { path: '/', maxAge: 0 })
  }
  return res
}
