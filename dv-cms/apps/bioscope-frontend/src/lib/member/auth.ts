import { cookies } from 'next/headers'
import { MEMBER_SESSION_COOKIE } from './config'
import type { MemberSession } from './types'

export function serializeSession(session: MemberSession): string {
  return Buffer.from(JSON.stringify(session), 'utf-8').toString('base64url')
}

export function parseSession(raw: string | undefined): MemberSession | null {
  if (!raw) return null
  try {
    const json = Buffer.from(raw, 'base64url').toString('utf-8')
    const data = JSON.parse(json) as MemberSession
    if (!data.email || !data.status) return null
    return data
  } catch {
    return null
  }
}

export async function getMemberSession(): Promise<MemberSession | null> {
  const jar = await cookies()
  return parseSession(jar.get(MEMBER_SESSION_COOKIE)?.value)
}

export async function requireApprovedMember(): Promise<MemberSession> {
  const session = await getMemberSession()
  if (!session) throw new Error('UNAUTHENTICATED')
  if (session.status !== 'approved') throw new Error('NOT_APPROVED')
  return session
}
