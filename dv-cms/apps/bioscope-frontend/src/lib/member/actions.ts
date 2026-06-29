'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { B2B_API_URL, MEMBER_SESSION_COOKIE } from './config'
import { serializeSession } from './auth'
import { MOCK_MEMBER_ACCOUNTS } from './mock-data'
import type { MemberSession } from './types'

export type LoginState = {
  ok: boolean
  error?: string
  pending?: boolean
}

async function mockLogin(email: string, password: string): Promise<LoginState> {
  const account = MOCK_MEMBER_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === email.trim().toLowerCase(),
  )
  if (!account || account.password !== password) {
    return { ok: false, error: 'invalid_credentials' }
  }
  if (account.status === 'pending') {
    return { ok: false, pending: true, error: 'pending_approval' }
  }
  if (account.status === 'rejected') {
    return { ok: false, error: 'rejected' }
  }

  const session: MemberSession = {
    email: account.email,
    company: account.company,
    contactName: account.contactName,
    phone: account.phone,
    status: account.status,
  }

  const jar = await cookies()
  jar.set(MEMBER_SESSION_COOKIE, serializeSession(session), {
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
    httpOnly: true,
  })

  return { ok: true }
}

async function apiLogin(email: string, password: string): Promise<LoginState> {
  try {
    const res = await fetch(`${B2B_API_URL}/api/b2b/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    })
    const data = (await res.json()) as { user?: MemberSession; error?: string }
    if (!res.ok) {
      if (data.user?.status === 'pending') return { ok: false, pending: true, error: 'pending_approval' }
      return { ok: false, error: 'invalid_credentials' }
    }
    if (!data.user || data.user.status !== 'approved') {
      return { ok: false, pending: data.user?.status === 'pending', error: 'pending_approval' }
    }
    const jar = await cookies()
    jar.set(MEMBER_SESSION_COOKIE, serializeSession(data.user), {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
      httpOnly: true,
    })
    return { ok: true }
  } catch {
    return { ok: false, error: 'network' }
  }
}

export async function memberLogin(email: string, password: string): Promise<LoginState> {
  const result = B2B_API_URL ? await apiLogin(email, password) : await mockLogin(email, password)
  if (result.ok) {
    revalidatePath('/member', 'layout')
    redirect('/member')
  }
  return result
}

export async function memberLogout() {
  const jar = await cookies()
  jar.set(MEMBER_SESSION_COOKIE, '', { path: '/', maxAge: 0 })
  revalidatePath('/member', 'layout')
  redirect('/member/login')
}
