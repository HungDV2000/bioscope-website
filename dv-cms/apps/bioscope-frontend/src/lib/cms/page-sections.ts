import { cmsFetch } from '@/lib/payload'
import { getMessages, type Messages } from '@/lib/i18n/messages'
import type { Locale } from '@/lib/i18n/config'

/**
 * Overlay a static page's CMS section blocks onto the i18n messages, so the
 * bespoke page components (which read `t.<page>.<section>`) render CMS-edited
 * content with the static copy as fallback — the same approach as the home page.
 * Returns overlaid messages + the CMS block id per section (for Better Editor).
 */

type Block = { blockType?: string; id?: string } & Record<string, unknown>

// Deep overlay: CMS values win when present; walks the (typed) base shape so the
// result always matches it and extra CMS keys (id, blockType…) are dropped.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function overlay(base: any, over: any): any {
  if (over == null) return base
  if (Array.isArray(base)) {
    if (!Array.isArray(over) || over.length === 0) return base
    return over.map((o, i) => overlay(base[i] ?? base[0], o))
  }
  if (base && typeof base === 'object') {
    const out: Record<string, unknown> = { ...base }
    for (const k of Object.keys(base)) {
      if (over && typeof over === 'object' && k in over) out[k] = overlay(base[k], over[k])
    }
    return out
  }
  return over ?? base
}

export type PageSections = { messages: Messages; blockIds: Record<string, string> }

export async function getPageSections(slug: string, locale: Locale): Promise<PageSections> {
  const messages = getMessages(locale)
  const res = await cmsFetch<{ docs: { layout?: Block[] }[] }>(
    `pages?where[slug][equals]=${encodeURIComponent(slug)}&depth=1&limit=1`,
    { locale, revalidate: 60 },
  )
  const blocks = res?.docs?.[0]?.layout
  if (!blocks?.length) return { messages, blockIds: {} }

  // Shallow clone + per-section overlay (only sections we map are touched).
  const out: Messages = { ...messages, about: { ...messages.about } }
  const blockIds: Record<string, string> = {}

  for (const b of blocks) {
    switch (b.blockType) {
      case 'aboutMission':
        if (Array.isArray(b.mission)) {
          out.about = { ...out.about, mission: overlay(messages.about.mission, b.mission) }
          if (typeof b.id === 'string') blockIds.aboutMission = b.id
        }
        break
      // Further sections are added here as they become editable.
    }
  }

  return { messages: out, blockIds }
}
