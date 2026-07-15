/**
 * Runtime helpers to read SecuritySettings + the active blocked-IP set from the
 * database, with a short in-process cache so the firewall/hooks don't hit the DB
 * on every request.
 */

import type { Payload } from 'payload'
import type { FirewallSettings } from './firewall.js'

export type SecuritySettingsDoc = FirewallSettings & {
  rateLimitMax?: number
  rateLimitWindowMs?: number
  rateLimitBlockSeconds?: number
  bruteForceEnabled?: boolean
  maxLoginAttempts?: number
  lockoutMinutes?: number
  immediateBlockInvalidUsers?: boolean
  enforce2fa?: 'off' | 'admin' | 'all'
  scanEnabled?: boolean
  scanMediaUploads?: boolean
  blockedUploadExtensions?: string
  alertEmail?: string
}

const CACHE_TTL_MS = 15_000

let settingsCache: { at: number; value: SecuritySettingsDoc } | null = null
let blockedCache: { at: number; value: Set<string> } | null = null

/** Load the security-settings global (cached ~15s). */
export async function getSecuritySettings(payload: Payload): Promise<SecuritySettingsDoc> {
  const now = Date.now()
  if (settingsCache && now - settingsCache.at < CACHE_TTL_MS) return settingsCache.value
  try {
    const value = (await payload.findGlobal({
      slug: 'security-settings',
      depth: 0,
      overrideAccess: true,
    })) as SecuritySettingsDoc
    settingsCache = { at: now, value }
    return value
  } catch {
    return settingsCache?.value ?? {}
  }
}

/** Set of currently-active (non-expired) blocked IPs from the collection (cached ~15s). */
export async function getActiveBlockedIps(payload: Payload): Promise<Set<string>> {
  const now = Date.now()
  if (blockedCache && now - blockedCache.at < CACHE_TTL_MS) return blockedCache.value
  try {
    const res = await payload.find({
      collection: 'blocked-ips',
      depth: 0,
      limit: 5000,
      overrideAccess: true,
      where: {
        or: [{ expiresAt: { exists: false } }, { expiresAt: { greater_than: new Date().toISOString() } }],
      },
    })
    const set = new Set<string>()
    for (const doc of res.docs as Array<{ ip?: string }>) if (doc.ip) set.add(doc.ip)
    blockedCache = { at: now, value: set }
    return set
  } catch {
    return blockedCache?.value ?? new Set()
  }
}

/** Invalidate caches (call after settings/blocklist changes). */
export function invalidateSecurityCaches(): void {
  settingsCache = null
  blockedCache = null
}

/**
 * Record a security event. Best-effort — never throws into the caller (a logging
 * failure must not break a request or a login).
 */
export async function recordSecurityEvent(
  payload: Payload,
  data: {
    type: 'firewall' | 'rate-limit' | 'login' | 'scan'
    action: 'blocked' | 'monitored' | 'allowed' | 'lockout'
    ip?: string
    reason?: string
    path?: string
    method?: string
    userAgent?: string
    country?: string
    username?: string
  },
): Promise<void> {
  try {
    await payload.create({ collection: 'security-events', data, overrideAccess: true })
  } catch {
    /* swallow */
  }
}

/**
 * Add/refresh a dynamic IP block. Best-effort upsert with an optional expiry.
 */
export async function blockIp(
  payload: Payload,
  ip: string,
  opts: { reason?: string; source?: 'manual' | 'brute-force' | 'rate-limit' | 'firewall'; minutes?: number; userAgent?: string } = {},
): Promise<void> {
  if (!ip) return
  const expiresAt = opts.minutes ? new Date(Date.now() + opts.minutes * 60_000).toISOString() : undefined
  try {
    const existing = await payload.find({
      collection: 'blocked-ips',
      where: { ip: { equals: ip } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (existing.docs[0]) {
      const cur = existing.docs[0] as unknown as { id: string | number; hits?: number }
      await payload.update({
        collection: 'blocked-ips',
        id: cur.id,
        data: { hits: (cur.hits ?? 0) + 1, expiresAt, reason: opts.reason, lastUserAgent: opts.userAgent },
        overrideAccess: true,
      })
    } else {
      await payload.create({
        collection: 'blocked-ips',
        data: { ip, reason: opts.reason, source: opts.source ?? 'firewall', expiresAt, hits: 1, lastUserAgent: opts.userAgent },
        overrideAccess: true,
      })
    }
    invalidateSecurityCaches()
  } catch {
    /* swallow */
  }
}
