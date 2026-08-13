import { type NextRequest, NextResponse } from 'next/server'
import { B2B_API_URL } from '@/lib/member/config'
import { GOOGLE_STATE_COOKIE, googleRedirectUri, verifyState } from '@/lib/member/google'
import { writeMemberSession } from '@/lib/member/actions'

/**
 * Google trả về `code` — gửi sang CMS để đổi lấy hồ sơ (client secret nằm ở
 * CMS, không bao giờ xuống frontend), rồi ghi cookie phiên đã ký.
 */
export const dynamic = 'force-dynamic'

const fail = (origin: string, reason: string) =>
  NextResponse.redirect(new URL(`/member/login?error=${reason}`, origin))

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin
  const params = req.nextUrl.searchParams

  if (params.get('error')) return fail(origin, 'google_cancelled')

  const returnTo = verifyState(params.get('state'), req.cookies.get(GOOGLE_STATE_COOKIE)?.value)
  if (!returnTo) return fail(origin, 'google_state')

  const code = params.get('code')
  if (!code) return fail(origin, 'google_code')

  let user: { id: string | number; email: string } | undefined
  try {
    const res = await fetch(`${B2B_API_URL}/api/b2b/google/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirectUri: googleRedirectUri(origin) }),
      cache: 'no-store',
    })
    const data = (await res.json()) as { user?: typeof user; error?: string }
    if (!res.ok || !data.user) return fail(origin, 'google_exchange')
    user = data.user
  } catch {
    return fail(origin, 'network')
  }

  try {
    await writeMemberSession(user)
  } catch {
    return fail(origin, 'server')
  }

  const res = NextResponse.redirect(new URL(returnTo, origin))
  res.cookies.set(GOOGLE_STATE_COOKIE, '', { path: '/', maxAge: 0 })
  return res
}
