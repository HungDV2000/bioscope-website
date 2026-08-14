'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import {
  B2B_API_URL,
  MEMBER_SESSION_COOKIE,
  MEMBER_SESSION_MAX_AGE,
  MEMBER_TOKEN_COOKIE,
  SESSION_SECRET,
} from './config'
import { serializeSession, getMemberSession } from './auth'
import { b2bFetch } from './api'
import type { CustomerType, MemberSession, MemberStatus } from './types'

export type LoginState = {
  ok: boolean
  error?: string
  pending?: boolean
}

/** Thành viên trả về từ API B2B (Payload doc). */
type B2BUser = {
  id: string | number
  email: string
  customerType?: CustomerType
  company?: string
  taxCode?: string
  position?: string
  contactName?: string
  phone?: string
  status?: MemberStatus
  authProvider?: 'password' | 'google'
  emailVerified?: boolean
}

const toSession = (u: B2BUser): MemberSession => ({
  id: u.id,
  email: u.email,
  customerType: u.customerType,
  company: u.company ?? '',
  taxCode: u.taxCode,
  position: u.position,
  contactName: u.contactName ?? '',
  phone: u.phone,
  status: u.status ?? 'pending',
  authProvider: u.authProvider ?? 'password',
  emailVerified: u.emailVerified ?? false,
})

/**
 * Cờ Secure đặt theo giao thức THẬT của khách, không theo NODE_ENV: container
 * chạy NODE_ENV=production nhưng khi truy cập thẳng qua HTTP (localhost:26300,
 * bỏ qua nginx) trình duyệt sẽ từ chối lưu cookie Secure → đăng nhập im lặng
 * không vào. Truy cập qua tên miền HTTPS thật vẫn được đánh Secure như thường.
 */
async function cookieOptions() {
  let secure = process.env.NODE_ENV === 'production'
  try {
    const h = await headers()
    const proto = h.get('x-forwarded-proto')?.split(',')[0]?.trim()
    const host = h.get('x-forwarded-host') || h.get('host') || ''
    if (proto) secure = proto === 'https'
    else if (host.startsWith('localhost') || host.startsWith('127.0.0.1')) secure = false
  } catch {
    /* ngoài ngữ cảnh request — giữ mặc định */
  }
  return { path: '/', maxAge: MEMBER_SESSION_MAX_AGE, sameSite: 'lax' as const, httpOnly: true, secure }
}

/** Ghi cookie phiên (đã ký) + JWT để gọi API thay mặt thành viên. */
export async function writeMemberSession(user: B2BUser, token?: string) {
  const jar = await cookies()
  const opts = await cookieOptions()
  jar.set(MEMBER_SESSION_COOKIE, serializeSession(toSession(user)), opts)
  if (token) jar.set(MEMBER_TOKEN_COOKIE, token, opts)
}

export async function memberLogin(email: string, password: string): Promise<LoginState> {
  if (!SESSION_SECRET) return { ok: false, error: 'server_misconfigured' }

  let result: LoginState
  try {
    const res = await fetch(`${B2B_API_URL}/api/b2b/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    })
    const data = (await res.json()) as { user?: B2BUser; token?: string; error?: string }
    if (!res.ok || !data.user) {
      result = { ok: false, error: 'invalid_credentials' }
    } else if (data.user.status === 'rejected') {
      result = { ok: false, error: 'rejected' }
    } else {
      // Chờ duyệt VẪN đăng nhập được (chat/hồ sơ); khu tài liệu B2B chặn riêng
      // theo status ở portal layout.
      await writeMemberSession(data.user, data.token)
      result = { ok: true, pending: data.user.status !== 'approved' }
    }
  } catch {
    result = { ok: false, error: 'network' }
  }

  if (result.ok) {
    revalidatePath('/member', 'layout')
    redirect('/member')
  }
  return result
}

export type RegisterState = { ok: boolean; error?: string }

export async function memberRegister(input: {
  email: string
  password: string
  customerType: CustomerType
  company?: string
  taxCode?: string
  position?: string
  contactName: string
  phone?: string
}): Promise<RegisterState> {
  try {
    const res = await fetch(`${B2B_API_URL}/api/b2b/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      cache: 'no-store',
    })
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      return { ok: false, error: res.status === 409 ? 'email_taken' : (data.error ?? 'invalid') }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: 'network' }
  }
}

const authedFetch = (path: string, body: unknown) => b2bFetch(path, { body })

export type ProfileState = { ok: boolean; error?: string }

export async function updateMemberProfile(input: {
  customerType: CustomerType
  company?: string
  taxCode?: string
  position?: string
  contactName: string
  phone?: string
}): Promise<ProfileState> {
  const session = await getMemberSession()
  if (!session) return { ok: false, error: 'unauthenticated' }
  try {
    const res = await authedFetch('/api/b2b/profile', input)
    const data = (await res.json().catch(() => ({}))) as { user?: B2BUser; error?: string }
    if (!res.ok || !data.user) return { ok: false, error: data.error ?? 'failed' }
    // Cấp lại cookie để thông tin mới hiện ngay (không phải đăng nhập lại).
    await writeMemberSession(data.user)
    revalidatePath('/member', 'layout')
    return { ok: true }
  } catch {
    return { ok: false, error: 'network' }
  }
}

export async function changeMemberPassword(input: {
  currentPassword?: string
  newPassword: string
}): Promise<ProfileState> {
  const session = await getMemberSession()
  if (!session) return { ok: false, error: 'unauthenticated' }
  if (input.newPassword.length < 8) return { ok: false, error: 'too_short' }
  try {
    const res = await authedFetch('/api/b2b/change-password', input)
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    if (!res.ok) return { ok: false, error: data.error ?? 'failed' }
    return { ok: true }
  } catch {
    return { ok: false, error: 'network' }
  }
}

export async function memberLogout() {
  const jar = await cookies()
  jar.set(MEMBER_SESSION_COOKIE, '', { path: '/', maxAge: 0 })
  jar.set(MEMBER_TOKEN_COOKIE, '', { path: '/', maxAge: 0 })
  revalidatePath('/member', 'layout')
  redirect('/member/login')
}
