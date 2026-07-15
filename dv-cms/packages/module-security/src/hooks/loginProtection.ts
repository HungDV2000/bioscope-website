/**
 * Login protection — brute-force + blocked-IP enforcement on auth collections.
 *
 * - beforeLogin: reject logins from a currently-blocked IP and log the attempt.
 * - afterLogin: log a successful login and clear that IP's failed-attempt tally.
 *
 * Failed-attempt counting is IP-based and kept in a small in-process map; once
 * an IP exceeds the configured threshold it is added to the blocked-ips
 * collection for `lockoutMinutes`. Per-account lockout is additionally handled
 * by Payload's native auth.maxLoginAttempts/lockTime (configured in the plugin).
 */

import type { CollectionBeforeLoginHook, CollectionAfterLoginHook, PayloadRequest } from 'payload'
import { getSecuritySettings, getActiveBlockedIps, recordSecurityEvent, blockIp } from '../lib/settings.js'

// ip → { count, first } sliding tally of failed logins (process-local).
const failTally = new Map<string, { count: number; first: number }>()

export function clientIpFromReq(req: PayloadRequest): string {
  const h = req.headers
  const xf = h?.get?.('x-forwarded-for')
  if (xf) return xf.split(',')[0].trim()
  return h?.get?.('x-real-ip') || 'unknown'
}

/** Record a failed login for an IP; block it once over the threshold. */
export async function registerFailedLogin(
  req: PayloadRequest,
  username: string | undefined,
): Promise<void> {
  const settings = await getSecuritySettings(req.payload)
  if (settings.bruteForceEnabled === false) return

  const ip = clientIpFromReq(req)
  const max = settings.maxLoginAttempts ?? 5
  const windowMs = 15 * 60_000

  const now = Date.now()
  const cur = failTally.get(ip)
  const next = cur && now - cur.first < windowMs ? { count: cur.count + 1, first: cur.first } : { count: 1, first: now }
  failTally.set(ip, next)

  await recordSecurityEvent(req.payload, {
    type: 'login',
    action: 'blocked',
    ip,
    reason: 'failed-login',
    username,
    userAgent: req.headers?.get?.('user-agent') ?? undefined,
  })

  if (next.count >= max) {
    failTally.delete(ip)
    await blockIp(req.payload, ip, {
      reason: `brute-force (${next.count} lần sai)`,
      source: 'brute-force',
      minutes: settings.lockoutMinutes ?? 30,
      userAgent: req.headers?.get?.('user-agent') ?? undefined,
    })
    await recordSecurityEvent(req.payload, { type: 'login', action: 'lockout', ip, reason: 'brute-force', username })
  }
}

export const beforeLoginHook: CollectionBeforeLoginHook = async ({ req, user }) => {
  const ip = clientIpFromReq(req)
  const blockedIps = await getActiveBlockedIps(req.payload)
  if (blockedIps.has(ip)) {
    await recordSecurityEvent(req.payload, {
      type: 'login',
      action: 'blocked',
      ip,
      reason: 'ip-blocklist',
      username: user?.email,
    })
    throw new Error('Truy cập bị chặn.')
  }
  return user
}

export const afterLoginHook: CollectionAfterLoginHook = async ({ req, user }) => {
  const ip = clientIpFromReq(req)
  failTally.delete(ip)
  await recordSecurityEvent(req.payload, {
    type: 'login',
    action: 'allowed',
    ip,
    username: user?.email,
    userAgent: req.headers?.get?.('user-agent') ?? undefined,
  })
  return user
}
