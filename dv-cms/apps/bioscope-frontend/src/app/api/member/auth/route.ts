import { type NextRequest, NextResponse } from 'next/server'
import { B2B_API_URL, SESSION_SECRET } from '@/lib/member/config'
import { writeMemberSession } from '@/lib/member/actions'

/**
 * Đăng nhập / đăng ký NGAY TRONG TRANG (dùng cho popup của widget chat) — không
 * điều hướng đi đâu cả. Server action `memberLogin` không dùng được ở đây vì nó
 * redirect sang /member.
 *
 * POST { action: 'login' | 'register', ... }
 */
export const dynamic = 'force-dynamic'

type B2BUser = {
  id: string | number
  email: string
  company?: string
  contactName?: string
  phone?: string
  status?: 'pending' | 'approved' | 'rejected'
  authProvider?: 'password' | 'google'
  emailVerified?: boolean
}

const bad = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status })

export async function POST(req: NextRequest) {
  if (!SESSION_SECRET) return bad('server', 500)

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return bad('invalid')
  }

  const str = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max)
  const email = str(body.email, 200).toLowerCase()
  const password = String(body.password ?? '')

  // ── Đăng ký ──────────────────────────────────────────────────────────────
  if (body.action === 'register') {
    const company = str(body.company, 200)
    const contactName = str(body.contactName, 120)
    if (!email || !company || !contactName) return bad('invalid')
    if (password.length < 8) return bad('too_short')
    try {
      const res = await fetch(`${B2B_API_URL}/api/b2b/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, company, contactName, phone: str(body.phone, 40) }),
        cache: 'no-store',
      })
      if (!res.ok) return bad(res.status === 409 ? 'email_taken' : 'invalid', res.status === 409 ? 409 : 400)
    } catch {
      return bad('network', 502)
    }
    // Đăng ký xong đăng nhập luôn để khách chat được ngay, khỏi nhập lại.
  }

  // ── Đăng nhập ────────────────────────────────────────────────────────────
  if (!email || !password) return bad('invalid')
  try {
    const res = await fetch(`${B2B_API_URL}/api/b2b/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    })
    const data = (await res.json().catch(() => ({}))) as { user?: B2BUser; token?: string }
    if (!res.ok || !data.user) return bad('invalid_credentials', 401)
    if (data.user.status === 'rejected') return bad('rejected', 403)

    await writeMemberSession(data.user, data.token)
    return NextResponse.json({
      ok: true,
      name: data.user.contactName || data.user.email,
      pending: data.user.status !== 'approved',
    })
  } catch {
    return bad('network', 502)
  }
}
