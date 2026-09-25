import { LP_CMS_URL, LP_INTERNAL_SECRET } from './config'
import type { LpStatus } from './types'

/**
 * Bảng tên miền → chiến dịch, dùng trong proxy.
 *
 * Cache trong bộ nhớ 20 giây: proxy chạy ở MỌI request (kể cả web Bioscope),
 * không thể mỗi lần lại hỏi CMS. Đổi trạng thái/tên miền trong admin thì tối
 * đa 20 giây sau có hiệu lực. CMS không trả lời thì giữ bảng cũ — landing
 * không được sập chỉ vì CMS chậm một nhịp.
 */
export type LpDomain = { host: string; slug: string; status: LpStatus; offRedirectUrl: string }

const TTL_MS = 20_000
let cache: { at: number; map: Map<string, LpDomain> } | null = null

export async function getLandingDomains(): Promise<Map<string, LpDomain>> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.map
  if (!LP_INTERNAL_SECRET) return cache?.map ?? new Map()
  try {
    const res = await fetch(`${LP_CMS_URL}/api/lp/domains`, {
      headers: { 'x-internal-secret': LP_INTERNAL_SECRET },
      signal: AbortSignal.timeout(2000),
      cache: 'no-store',
    })
    if (res.ok) {
      const data = (await res.json()) as { domains?: LpDomain[] }
      const map = new Map<string, LpDomain>()
      for (const d of data.domains ?? []) map.set(d.host, d)
      cache = { at: Date.now(), map }
      return map
    }
  } catch {
    /* CMS không trả lời — dùng bảng cũ, thử lại sau TTL */
  }
  cache = { at: Date.now(), map: cache?.map ?? new Map() }
  return cache.map
}
