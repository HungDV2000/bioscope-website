/**
 * Wordfence-style firewall configuration (code-managed, env-overridable — NOT
 * editable from the CMS). Consumed by `waf.ts` and the Next proxy.
 */
const list = (v?: string) =>
  (v ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

export const securityConfig = {
  /** Master switch — set SECURITY_WAF=off to disable. */
  enabled: process.env.SECURITY_WAF !== 'off',

  /** Always-blocked / always-allowed client IPs (comma-separated env). */
  blockedIps: list(process.env.SECURITY_BLOCKED_IPS),
  allowedIps: list(process.env.SECURITY_ALLOWED_IPS),

  /** Light per-IP DoS guard on page traffic. */
  rateLimit: {
    max: Number(process.env.SECURITY_RATE_MAX ?? 240),
    windowMs: 60_000,
  },

  /**
   * Paths only vulnerability scanners / bots request (we serve no PHP, no WP).
   * Matched against the pathname → instant 403.
   */
  blockedPathPatterns: [
    /\/wp-(admin|login|content|includes|json)/i,
    /\/xmlrpc\.php/i,
    /\/(phpmyadmin|pma|adminer)/i,
    /\/administrator\//i,
    /\/\.(env|git|svn|hg|htaccess|htpasswd|aws|ssh|DS_Store)/i,
    /\/(vendor|storage|config)\/.*\.(log|sql|bak|old|ya?ml)/i,
    /\.(php|asp|aspx|jsp|cgi)$/i,
    /\/(shell|c99|r57|backdoor|eval-stdin)/i,
  ],

  /** Unambiguous attack signatures in the (decoded) path+query → 403. */
  attackPatterns: [
    /\.\.[/\\]/, // path traversal
    /\/etc\/passwd/i,
    /<script[\s>]/i,
    /\bon(error|load|click)\s*=/i,
    /\bunion\s+select\b/i,
    /\bbase64_decode\s*\(/i,
    /\b(exec|system|passthru|shell_exec)\s*\(/i,
    /\$\{jndi:/i, // Log4Shell
  ],

  /** Known scanner / malicious user agents → 403. */
  blockedUserAgents: [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /acunetix/i,
    /nessus/i,
    /fimap/i,
    /netsparker/i,
    /(libwww-perl|python-urllib|zgrab)/i,
  ],
}
