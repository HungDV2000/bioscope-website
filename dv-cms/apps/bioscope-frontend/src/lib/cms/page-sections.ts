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

/** Deep-merge a content override onto the static content (for pages that read
 *  `content` directly rather than via LocaleProvider). */
export function applyContentOverride(base: ContentModule, override: Partial<ContentModule>): ContentModule {
  return override && Object.keys(override).length ? (overlay(base, override) as ContentModule) : base
}

function uploadUrl(v: unknown): string | undefined {
  const url = typeof v === 'object' && v !== null ? (v as { url?: string }).url : undefined
  return mediaUrl(url) ?? undefined
}

export type PageSections = {
  messages: Messages
  contentOverride: Partial<ContentModule>
  blockIds: Record<string, string>
  /** Raw block data keyed by blockType — for pages that read arbitrary fields. */
  sections: Record<string, Record<string, unknown>>
}

export async function getPageSections(slug: string, locale: Locale): Promise<PageSections> {
  const messages = getMessages(locale)
  const res = await cmsFetch<{ docs: { layout?: Block[] }[] }>(
    `pages?where[slug][equals]=${encodeURIComponent(slug)}&depth=1&limit=1`,
    { locale, revalidate: 60 },
  )
  const blocks = res?.docs?.[0]?.layout
  if (!blocks?.length) return { messages, contentOverride: {}, blockIds: {}, sections: {} }

  const out: Messages = { ...messages }
  const contentOverride: Record<string, unknown> = {}
  const blockIds: Record<string, string> = {}
  const sections: Record<string, Record<string, unknown>> = {}

  const setSection = (key: keyof Messages['about'], value: unknown, id?: string, mark?: string) => {
    out.about = { ...out.about, [key]: value } as Messages['about']
    if (mark && typeof id === 'string') blockIds[mark] = id
  }
  const markId = (id: unknown, mark: string) => {
    if (typeof id === 'string') blockIds[mark] = id
  }
  // Merge a patch onto a top-level messages section (e.g. coCreatePage).
  const mergeMsg = (key: string, patch: Record<string, unknown>) => {
    const cur = (out as unknown as Record<string, Record<string, unknown>>)[key] ?? {}
    ;(out as unknown as Record<string, unknown>)[key] = { ...cur, ...patch }
  }
  const str = (v: unknown) => (typeof v === 'string' && v ? v : undefined)

  for (const b of blocks) {
    if (b.blockType) sections[b.blockType] = b
    switch (b.blockType) {
      case 'contactInfo':
        if (Array.isArray(b.faq) && b.faq.length) contentOverride.CONTACT_FAQ = b.faq
        markId(b.id, 'contactInfo')
        break
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

      // ── Solutions page ──────────────────────────────────────────────────
      case 'solutionsIntro': {
        const sp = (out as unknown as { solutionsPage?: Record<string, unknown> }).solutionsPage
        if (sp) {
          const next = { ...sp }
          if (typeof b.icpTitle === 'string' && b.icpTitle) next.icpTitle = b.icpTitle
          if (typeof b.icpDesc === 'string' && b.icpDesc) next.icpDesc = b.icpDesc
          ;(out as unknown as { solutionsPage: unknown }).solutionsPage = next
        }
        if (Array.isArray(b.icp) && b.icp.length) contentOverride.SOLUTIONS_ICP = b.icp
        markId(b.id, 'solutionsIntro')
        break
      }
      case 'solutionsList':
        if (Array.isArray(b.items) && b.items.length) contentOverride.SOLUTIONS = b.items
        markId(b.id, 'solutionsList')
        break

      // ── Co-create page ──────────────────────────────────────────────────
      case 'coCreateCompare': {
        const patch: Record<string, unknown> = {}
        for (const k of ['compareTitle', 'compareDesc', 'traditionalTitle', 'bioscopeTitle']) {
          const v = str(b[k])
          if (v) patch[k] = v
        }
        mergeMsg('coCreatePage', patch)
        const cmp: Record<string, unknown> = {}
        if (Array.isArray(b.traditional) && b.traditional.length) cmp.traditional = b.traditional
        if (Array.isArray(b.bioscope) && b.bioscope.length) cmp.bioscope = b.bioscope
        if (Object.keys(cmp).length) contentOverride.CO_CREATE_COMPARISON = cmp
        markId(b.id, 'coCreateCompare')
        break
      }
      case 'coCreateJourney': {
        const patch: Record<string, unknown> = {}
        if (str(b.stepLabel)) patch.stepLabel = b.stepLabel
        const journey = Array.isArray(b.journey) ? (b.journey as Record<string, unknown>[]) : []
        if (journey.length) {
          const cur = (messages as unknown as { coCreatePage?: { journey?: unknown } }).coCreatePage?.journey
          patch.journey = overlay(cur, journey.map((j) => ({ title: j.title, desc: j.desc })))
          contentOverride.CO_CREATE_STEP_DURATIONS = journey.map((j) => ({ duration: j.duration }))
        }
        mergeMsg('coCreatePage', patch)
        markId(b.id, 'coCreateJourney')
        break
      }
      case 'coCreateCases': {
        const patch: Record<string, unknown> = {}
        for (const k of ['casesTitle', 'casesDesc', 'readCase']) {
          const v = str(b[k])
          if (v) patch[k] = v
        }
        mergeMsg('coCreatePage', patch)
        markId(b.id, 'coCreateCases')
        break
      }

      // ── R&D page ────────────────────────────────────────────────────────
      case 'rdContent': {
        const patch: Record<string, unknown> = {}
        for (const k of ['techTitle', 'researchTitle', 'researchDesc', 'partnersTitle', 'partnersDesc', 'papersTitle', 'papersDesc', 'gated']) {
          const v = str(b[k])
          if (v) patch[k] = v
        }
        const rdBase = (messages as unknown as { rdPage?: { stats?: unknown } }).rdPage
        if (Array.isArray(b.stats) && b.stats.length) patch.stats = overlay(rdBase?.stats, b.stats)
        mergeMsg('rdPage', patch)
        if (Array.isArray(b.researchAreas) && b.researchAreas.length) contentOverride.RD_RESEARCH_AREAS = b.researchAreas
        if (Array.isArray(b.papers) && b.papers.length) contentOverride.RD_WHITEPAPERS = b.papers
        markId(b.id, 'rdContent')
        break
      }
    }
  }

  return { messages: out, contentOverride, blockIds, sections }
}
