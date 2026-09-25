import 'server-only'
import { LP_CMS_URL, LP_INTERNAL_SECRET } from './config'
import type { LpMe, LpPageData } from './types'

/**
 * Gọi endpoint `/api/lp/*` của CMS kèm khoá nội bộ.
 *
 * KHÔNG để hàm này trong file 'use server' (như ghi chú ở lib/member/api.ts):
 * khi đó nó thành server action gọi được từ trình duyệt với `path` tuỳ ý.
 */
export async function lpFetch(
  path: string,
  init: {
    method?: string
    body?: BodyInit
    headers?: Record<string, string>
    participantId?: string
    ip?: string
    revalidate?: number
    tags?: string[]
  } = {},
): Promise<Response> {
  const headers: Record<string, string> = { 'x-internal-secret': LP_INTERNAL_SECRET, ...(init.headers ?? {}) }
  if (init.participantId) headers['x-participant-id'] = init.participantId
  if (init.ip) headers['x-lp-client-ip'] = init.ip
  return fetch(`${LP_CMS_URL}/api/lp${path}`, {
    method: init.method ?? 'GET',
    headers,
    ...(init.body !== undefined ? { body: init.body } : {}),
    ...(init.revalidate !== undefined
      ? { next: { revalidate: init.revalidate, ...(init.tags ? { tags: init.tags } : {}) } }
      : { cache: 'no-store' as const }),
    signal: AbortSignal.timeout(20_000),
  })
}

/** Tag cache của một chiến dịch — /api/revalidate xoá tag này khi admin lưu. */
export const lpTag = (slug: string) => `lp:${slug}`

/** Cấu hình + bảng xếp hạng cho trang. Cache ngắn; admin lưu là CMS gọi làm mới ngay. */
export async function getLandingPage(slug: string): Promise<LpPageData | null> {
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return null
  try {
    const res = await lpFetch(`/c/${slug}`, { revalidate: 20, tags: [lpTag(slug)] })
    if (!res.ok) return null
    return (await res.json()) as LpPageData
  } catch {
    return null
  }
}

export async function getLandingMe(slug: string, participantId: string): Promise<LpMe | null> {
  try {
    const res = await lpFetch(`/c/${slug}/me`, { participantId })
    if (!res.ok) return null
    return ((await res.json()) as { me: LpMe }).me
  } catch {
    return null
  }
}
