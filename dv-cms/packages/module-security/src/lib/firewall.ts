/**
 * Framework-agnostic firewall engine. Consumes a normalized request + the
 * resolved SecuritySettings and returns a decision. Both the Next.js proxy
 * (frontend) and the Payload server can call this — no next/payload imports
 * here so it stays portable and unit-testable.
 */

export type FirewallSettings = {
  firewallEnabled?: boolean
  firewallMode?: 'block' | 'monitor'
  blockKnownAttacks?: boolean
  blockScanners?: boolean
  blockWpProbes?: boolean
  customBlockedPatterns?: Array<{ pattern?: string; note?: string }>
  rateLimitEnabled?: boolean
  allowedIps?: Array<{ ip?: string }>
  blockedIps?: Array<{ ip?: string }>
  blockedCountries?: string
}

export type FirewallRequest = {
  ip: string
  path: string
  query?: string
  userAgent?: string
  country?: string
}

export type FirewallDecision = {
  blocked: boolean
  /** True when a rule matched but firewallMode=monitor (logged, not blocked). */
  monitored?: boolean
  status?: number
  reason?: string
}

const PASS: FirewallDecision = { blocked: false }

// ── Built-in signature sets ───────────────────────────────────────────────

export const WP_PROBE_PATTERNS: RegExp[] = [
  /\/wp-(admin|login|content|includes|json)/i,
  /\/xmlrpc\.php/i,
  /\/(phpmyadmin|pma|adminer)/i,
  /\/administrator\//i,
  /\/\.(env|git|svn|hg|htaccess|htpasswd|aws|ssh|DS_Store)/i,
  /\/(vendor|storage|config)\/.*\.(log|sql|bak|old|ya?ml)/i,
  /\.(php|asp|aspx|jsp|cgi)$/i,
  /\/(shell|c99|r57|backdoor|eval-stdin)/i,
]

export const ATTACK_PATTERNS: RegExp[] = [
  /\.\.[/\\]/, // path traversal
  /\/etc\/passwd/i,
  /<script[\s>]/i,
  /\bon(error|load|click)\s*=/i,
  /\bunion\s+select\b/i,
  /\bselect\b.+\bfrom\b.+\bwhere\b/i,
  /\bbase64_decode\s*\(/i,
  /\b(exec|system|passthru|shell_exec)\s*\(/i,
  /\$\{jndi:/i, // Log4Shell
  /\binformation_schema\b/i,
]

export const SCANNER_UA_PATTERNS: RegExp[] = [
  /sqlmap/i,
  /nikto/i,
  /nmap/i,
  /masscan/i,
  /acunetix/i,
  /nessus/i,
  /fimap/i,
  /netsparker/i,
  /(libwww-perl|python-urllib|zgrab|go-http-client)/i,
]

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s)
  } catch {
    return s
  }
}

function compile(patterns?: Array<{ pattern?: string }>): RegExp[] {
  if (!patterns?.length) return []
  const out: RegExp[] = []
  for (const p of patterns) {
    if (!p?.pattern) continue
    try {
      out.push(new RegExp(p.pattern, 'i'))
    } catch {
      // Ignore invalid admin-entered regex rather than crashing the firewall.
    }
  }
  return out
}

function ipList(arr?: Array<{ ip?: string }>): string[] {
  return (arr ?? []).map((x) => x?.ip?.trim()).filter(Boolean) as string[]
}

/**
 * Inspect a request. `dynamicBlockedIps` is the runtime blocklist from the
 * BlockedIps collection (already filtered to non-expired entries by the caller).
 */
export function inspect(
  req: FirewallRequest,
  settings: FirewallSettings,
  dynamicBlockedIps: Set<string> = new Set(),
): FirewallDecision {
  if (settings.firewallEnabled === false) return PASS

  const monitor = settings.firewallMode === 'monitor'
  const decide = (status: number, reason: string): FirewallDecision =>
    monitor ? { blocked: false, monitored: true, status, reason } : { blocked: true, status, reason }

  // Allowlist wins over everything.
  if (ipList(settings.allowedIps).includes(req.ip)) return PASS

  // IP blocklists (static setting + dynamic collection).
  if (ipList(settings.blockedIps).includes(req.ip) || dynamicBlockedIps.has(req.ip)) {
    return decide(403, 'ip-blocklist')
  }

  // Country block.
  const countries = (settings.blockedCountries ?? '')
    .split(',')
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean)
  if (req.country && countries.includes(req.country.toUpperCase())) {
    return decide(403, 'country-block')
  }

  const path = req.path
  const target = safeDecode(`${path}${req.query ?? ''}`)
  const ua = req.userAgent ?? ''

  if (settings.blockWpProbes !== false && WP_PROBE_PATTERNS.some((re) => re.test(path))) {
    return decide(403, 'wp-probe')
  }
  if (settings.blockKnownAttacks !== false && ATTACK_PATTERNS.some((re) => re.test(target))) {
    return decide(403, 'attack-signature')
  }
  if (settings.blockScanners !== false && ua && SCANNER_UA_PATTERNS.some((re) => re.test(ua))) {
    return decide(403, 'bad-user-agent')
  }
  const custom = compile(settings.customBlockedPatterns)
  if (custom.some((re) => re.test(target))) {
    return decide(403, 'custom-rule')
  }

  return PASS
}
