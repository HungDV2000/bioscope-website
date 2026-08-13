import { type NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'
import { B2B_API_URL, SESSION_SECRET } from '@/lib/member/config'
import { GOOGLE_STATE_COOKIE, googleRedirectUri, safeReturnTo, signState } from '@/lib/member/google'

/**
 * Bắt đầu đăng nhập Google: hỏi CMS xem có bật + clientId, dựng URL Google rồi
 * chuyển hướng. `state` được ký để chống CSRF và mang theo trang cần quay lại.
 */
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin
  if (!SESSION_SECRET) return NextResponse.redirect(new URL('/member/login?error=server', origin))

  let clientId = ''
  try {
    const cfg = (await fetch(`${B2B_API_URL}/api/b2b/google/config`, { cache: 'no-store' }).then((r) =>
      r.json(),
    )) as { googleEnabled?: boolean; clientId?: string }
    if (cfg.googleEnabled && cfg.clientId) clientId = cfg.clientId
  } catch {
    /* CMS không phản hồi */
  }
  if (!clientId) return NextResponse.redirect(new URL('/member/login?error=google_off', origin))

  const returnTo = safeReturnTo(req.nextUrl.searchParams.get('returnTo'))
  const nonce = randomBytes(16).toString('base64url')

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', googleRedirectUri(origin))
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', 'openid email profile')
  url.searchParams.set('state', signState(nonce, returnTo))
  url.searchParams.set('prompt', 'select_account')

  const res = NextResponse.redirect(url)
  res.cookies.set(GOOGLE_STATE_COOKIE, nonce, {
    path: '/',
    maxAge: 600,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
  return res
}
