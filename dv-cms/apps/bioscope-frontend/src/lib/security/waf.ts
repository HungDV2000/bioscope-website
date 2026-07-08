import type { NextRequest } from 'next/server'
import { securityConfig as cfg } from './config'
import { rateLimit, clientIp } from '@/lib/rate-limit'

export type WafResult = { blocked: boolean; status?: number; reason?: string }

const PASS: WafResult = { blocked: false }

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s)
  } catch {
    return s
  }
}

/**
 * Inspect an incoming request against the firewall rules. Order: allowlist →
 * IP blocklist → bad paths → attack signatures → bad user agents → rate limit.
 */
export function inspect(req: NextRequest): WafResult {
  if (!cfg.enabled) return PASS

  const ip = clientIp(req)
  if (cfg.allowedIps.includes(ip)) return PASS
  if (cfg.blockedIps.includes(ip)) return { blocked: true, status: 403, reason: 'ip-blocklist' }

  const path = req.nextUrl.pathname
  const target = safeDecode(`${path}${req.nextUrl.search}`)
  const ua = req.headers.get('user-agent') ?? ''

  if (cfg.blockedPathPatterns.some((re) => re.test(path))) {
    return { blocked: true, status: 403, reason: 'bad-path' }
  }
  if (cfg.attackPatterns.some((re) => re.test(target))) {
    return { blocked: true, status: 403, reason: 'attack-signature' }
  }
  if (ua && cfg.blockedUserAgents.some((re) => re.test(ua))) {
    return { blocked: true, status: 403, reason: 'bad-user-agent' }
  }

  // Per-IP DoS guard on ordinary page traffic.
  const rl = rateLimit(`waf:${ip}`, cfg.rateLimit.max, cfg.rateLimit.windowMs)
  if (!rl.ok) return { blocked: true, status: 429, reason: 'rate-limit' }

  return PASS
}
