/**
 * Thin client for the shared Payload backend (`@dv/core-cms`).
 *
 * - `CMS_URL` (public) is baked into the browser bundle and used for media URLs
 *   the client loads — must be the public domain.
 * - `SERVER_CMS_URL` is used for server-side data fetches (`cmsFetch`). In Docker,
 *   set `CMS_INTERNAL_URL=http://cms:<port>` so the frontend container reaches the
 *   CMS over the internal network instead of hair-pinning through the public domain
 *   (which usually fails from inside the container). Falls back to the public URL.
 */
export const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL ?? 'http://localhost:3001'
const SERVER_CMS_URL = process.env.CMS_INTERNAL_URL || CMS_URL

type FetchOptions = {
  /** ISR revalidate window in seconds (default 60). */
  revalidate?: number
  locale?: 'vi' | 'en'
  /** Abort after this many ms so a slow/hung CMS never blocks a page render. */
  timeoutMs?: number
}

export async function cmsFetch<T>(
  path: string,
  { revalidate = 60, locale, timeoutMs = 4000 }: FetchOptions = {},
): Promise<T | null> {
  const url = new URL(`/api/${path.replace(/^\//, '')}`, SERVER_CMS_URL)
  if (locale) url.searchParams.set('locale', locale)

  try {
    const res = await fetch(url, { next: { revalidate }, signal: AbortSignal.timeout(timeoutMs) })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    // Backend offline / slow: fall back to static content rather than hang.
    return null
  }
}

/** Resolve a Payload media relative URL to an absolute one. */
export function mediaUrl(url?: string | null): string | null {
  if (!url) return null
  return url.startsWith('http') ? url : `${CMS_URL}${url}`
}
