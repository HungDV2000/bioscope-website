/**
 * Public firewall-config endpoint. Exposes ONLY the non-sensitive subset of the
 * security settings the edge firewall needs (rule toggles, custom patterns,
 * IP/country lists) plus the active blocked-IP set. The frontend proxy polls
 * this (cached) so admins can manage firewall rules from the CMS without a
 * redeploy. No secrets are returned, so it is safe to serve unauthenticated.
 */

import type { Endpoint } from 'payload'
import { getSecuritySettings, getActiveBlockedIps } from '../lib/settings.js'

export const firewallConfigEndpoint: Endpoint = {
  path: '/security/firewall-config',
  method: 'get',
  handler: async (req) => {
    try {
      const s = await getSecuritySettings(req.payload)
      const blocked = await getActiveBlockedIps(req.payload)

      const body = {
        settings: {
          firewallEnabled: s.firewallEnabled,
          firewallMode: s.firewallMode,
          blockKnownAttacks: s.blockKnownAttacks,
          blockScanners: s.blockScanners,
          blockWpProbes: s.blockWpProbes,
          customBlockedPatterns: (s.customBlockedPatterns ?? []).map((p) => ({ pattern: p.pattern })),
          rateLimitEnabled: s.rateLimitEnabled,
          rateLimitMax: s.rateLimitMax,
          rateLimitWindowMs: s.rateLimitWindowMs,
          allowedIps: (s.allowedIps ?? []).map((x) => ({ ip: x.ip })),
          blockedIps: (s.blockedIps ?? []).map((x) => ({ ip: x.ip })),
          blockedCountries: s.blockedCountries,
        },
        blockedIps: Array.from(blocked),
      }

      return Response.json(body, {
        headers: { 'cache-control': 'public, max-age=30, s-maxage=30' },
      })
    } catch {
      // Fail open — the frontend keeps its local static rules if this fails.
      return Response.json({ settings: {}, blockedIps: [] }, { status: 200 })
    }
  },
}
