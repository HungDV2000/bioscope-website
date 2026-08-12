/**
 * Tra cứu vị trí gần đúng từ IP (best-effort). Dùng ipwho.is (miễn phí, HTTPS,
 * không cần key). Lỗi/timeout thì trả rỗng — không chặn luồng chat.
 */
export async function lookupGeo(ip: string): Promise<string> {
  if (!ip || ip === 'unknown' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.')) return ''
  try {
    const r = (await fetch(`https://ipwho.is/${encodeURIComponent(ip)}?fields=success,city,region,country`, {
      signal: AbortSignal.timeout(4000),
    }).then((x) => x.json())) as { success?: boolean; city?: string; region?: string; country?: string }
    if (!r.success) return ''
    return [r.city, r.region, r.country].filter(Boolean).join(', ')
  } catch {
    return ''
  }
}
