/**
 * Thin client for the shared Payload backend (`@dv/core-cms`).
 * REST API base — over/ride via NEXT_PUBLIC_CMS_URL.
 */
export const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL ?? 'http://localhost:3001'

type FetchOptions = {
  /** ISR revalidate window in seconds (default 60). */
  revalidate?: number
  locale?: 'vi' | 'en'
}

export async function cmsFetch<T>(
  path: string,
  { revalidate = 60, locale }: FetchOptions = {},
): Promise<T | null> {
  const url = new URL(`/api/${path.replace(/^\//, '')}`, CMS_URL)
  if (locale) url.searchParams.set('locale', locale)

  try {
    const res = await fetch(url, { next: { revalidate } })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    // Backend may be offline during early frontend development.
    return null
  }
}

/** Resolve a Payload media relative URL to an absolute one. */
export function mediaUrl(url?: string | null): string | null {
  if (!url) return null
  return url.startsWith('http') ? url : `${CMS_URL}${url}`
}
