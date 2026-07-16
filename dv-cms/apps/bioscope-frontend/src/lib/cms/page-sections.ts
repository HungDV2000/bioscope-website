import { cmsFetch, mediaUrl } from '@/lib/payload'
import { getMessages, type Messages } from '@/lib/i18n/messages'
import type { ContentModule } from '@/lib/get-content'
import type { Locale } from '@/lib/i18n/config'

/**
 * Overlay a static page's CMS section blocks onto the i18n messages + content, so
 * the bespoke page components (which read `t.<page>.<section>` and
 * `content.<PAGE>_*`) render CMS-edited content with the static copy as fallback
 * — the same approach as the home page. Returns overlaid messages, a content
 * override (deep-merged by LocaleProvider) and the CMS block id per section.
 */

type Block = { blockType?: string; id?: string } & Record<string, unknown>

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

function uploadUrl(v: unknown): string | undefined {
  const url = typeof v === 'object' && v !== null ? (v as { url?: string }).url : undefined
  return mediaUrl(url) ?? undefined
}

export type PageSections = {
  messages: Messages
  contentOverride: Partial<ContentModule>
  blockIds: Record<string, string>
}

export async function getPageSections(slug: string, locale: Locale): Promise<PageSections> {
  const messages = getMessages(locale)
  const res = await cmsFetch<{ docs: { layout?: Block[] }[] }>(
    `pages?where[slug][equals]=${encodeURIComponent(slug)}&depth=1&limit=1`,
    { locale, revalidate: 60 },
  )
  const blocks = res?.docs?.[0]?.layout
  if (!blocks?.length) return { messages, contentOverride: {}, blockIds: {} }

  const out: Messages = { ...messages, about: { ...messages.about } }
  const contentOverride: Record<string, unknown> = {}
  const blockIds: Record<string, string> = {}

  const setSection = (key: keyof Messages['about'], value: unknown, id?: string, mark?: string) => {
    out.about = { ...out.about, [key]: value } as Messages['about']
    if (mark && typeof id === 'string') blockIds[mark] = id
  }
  const markId = (id: unknown, mark: string) => {
    if (typeof id === 'string') blockIds[mark] = id
  }

  for (const b of blocks) {
    switch (b.blockType) {
      case 'aboutMission':
        if (Array.isArray(b.mission)) setSection('mission', overlay(messages.about.mission, b.mission), b.id, 'aboutMission')
        break
      case 'aboutDifferentiation':
        setSection('differentiation', overlay(messages.about.differentiation, b), b.id, 'aboutDifferentiation')
        break
      case 'aboutJourney':
        setSection('journey', overlay(messages.about.journey, b), b.id, 'aboutJourney')
        break
      case 'aboutPartners':
        setSection('partners', overlay(messages.about.partners, b), b.id, 'aboutPartners')
        break
      case 'aboutValues':
        setSection('coreValues', overlay(messages.about.coreValues, b), b.id, 'aboutValues')
        if (Array.isArray(b.items) && b.items.length) contentOverride.ABOUT_CORE_VALUES = b.items
        break
      case 'aboutProcess':
        contentOverride.ABOUT_PRODUCT_PROCESS = {
          ...(typeof b.title === 'string' ? { title: b.title } : {}),
          ...(typeof b.description === 'string' ? { description: b.description } : {}),
          ...(typeof b.imageAlt === 'string' ? { imageAlt: b.imageAlt } : {}),
          ...(uploadUrl(b.image) ? { image: uploadUrl(b.image) } : {}),
          ...(Array.isArray(b.steps) && b.steps.length ? { steps: b.steps } : {}),
        }
        markId(b.id, 'aboutProcess')
        break
      case 'aboutTimeline':
        if (Array.isArray(b.items) && b.items.length) contentOverride.ABOUT_TIMELINE = b.items
        markId(b.id, 'aboutTimeline')
        break
    }
  }

  return { messages: out, contentOverride, blockIds }
}
