/**
 * Rate-limit đơn giản trong RAM (per-container) — đủ chống spam endpoint chat
 * công khai mà không cần Redis. Cửa sổ trượt theo key (thường là IP).
 */
type Hit = { count: number; resetAt: number }
const buckets = new Map<string, Hit>()

/** Trả về true nếu ĐƯỢC PHÉP; false nếu vượt giới hạn. */
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const b = buckets.get(key)
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (b.count >= max) return false
  b.count++
  return true
}

/** Lấy IP khách từ header proxy (nginx x-forwarded-for). */
export function clientIp(req: { headers?: unknown }): string {
  const h = req.headers as { get?: (k: string) => string | null } | undefined
  const xff = h?.get?.('x-forwarded-for') || h?.get?.('x-real-ip') || ''
  return (xff.split(',')[0] || 'unknown').trim()
}

// Dọn định kỳ để Map không phình.
setInterval(() => {
  const now = Date.now()
  for (const [k, v] of buckets) if (now > v.resetAt) buckets.delete(k)
}, 10 * 60 * 1000).unref?.()
