import { cmsFetch } from '@/lib/payload'

export type Tracking = { ga4?: string; gtm?: string; pixel?: string }

/** Analytics IDs from the `site-settings` global (empty object when unavailable). */
export async function getTracking(): Promise<Tracking> {
  const res = await cmsFetch<{ tracking?: Tracking }>('globals/site-settings?depth=0', { revalidate: 300 })
  return res?.tracking ?? {}
}
