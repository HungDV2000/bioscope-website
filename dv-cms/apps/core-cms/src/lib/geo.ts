/**
 * Tra cứu vị trí gần đúng từ IP (best-effort). Dùng ipwho.is (miễn phí, HTTPS,
 * không cần key). Lỗi/timeout thì trả rỗng — không bao giờ chặn luồng chat.
 *
 * Toạ độ ở đây là toạ độ của DẢI IP (thường là trung tâm tỉnh/thành hoặc trạm
 * của nhà mạng), KHÔNG phải vị trí thật của khách. Không xin quyền GPS.
 */
export type GeoInfo = {
  country?: string
  region?: string
  city?: string
  postal?: string
  isp?: string
  timezone?: string
  latitude?: number
  longitude?: number
  /** Chuỗi gọn "thành phố, tỉnh, quốc gia" để hiện nhanh ở admin/Telegram. */
  label: string
}

const PRIVATE = /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1|fc|fd)/i

export async function lookupGeo(ip: string): Promise<GeoInfo> {
  if (!ip || ip === 'unknown' || PRIVATE.test(ip)) return { label: '' }
  try {
    const r = (await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      signal: AbortSignal.timeout(4000),
    }).then((x) => x.json())) as {
      success?: boolean
      country?: string
      region?: string
      city?: string
      postal?: string
      latitude?: number
      longitude?: number
      connection?: { isp?: string; org?: string }
      timezone?: { id?: string }
    }
    if (!r.success) return { label: '' }
    return {
      country: r.country,
      region: r.region,
      city: r.city,
      postal: r.postal,
      isp: r.connection?.isp || r.connection?.org,
      timezone: r.timezone?.id,
      latitude: r.latitude,
      longitude: r.longitude,
      label: [r.city, r.region, r.country].filter(Boolean).join(', '),
    }
  } catch {
    return { label: '' }
  }
}
