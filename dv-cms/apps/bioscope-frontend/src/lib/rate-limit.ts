/**
 * Tiny in-memory fixed-window rate limiter (per key, per server instance).
 * Good enough for a single-node deploy / basic abuse protection; swap for a
 * shared store (Redis/Upstash) if the app is scaled horizontally.
 */
type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

export function rateLimit(key: string, limit = 5, windowMs = 60_000): { ok: boolean; retryAfter: number } {
  const now = Date.now()
  const b = buckets.get(key)
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfter: 0 }
  }
  b.count += 1
  if (b.count > limit) {
    return { ok: false, retryAfter: Math.ceil((b.resetAt - now) / 1000) }
  }
  return { ok: true, retryAfter: 0 }
}

/** Best-effort client IP from proxy headers (falls back to a shared bucket). */
export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}
