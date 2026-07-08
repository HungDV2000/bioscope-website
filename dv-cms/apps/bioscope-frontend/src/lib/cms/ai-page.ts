import { cmsFetch } from '@/lib/payload'
import { getMessages } from '@/lib/i18n/messages'
import type { Locale } from '@/lib/i18n/config'

type AiPage = ReturnType<typeof getMessages>['aiAssistantPage']

/** Field-by-field overlay: use a CMS value only when it is non-empty. */
function overlay(fb: AiPage, cms: Partial<Record<keyof AiPage, unknown>> | null): AiPage {
  if (!cms) return fb
  const out = { ...fb } as Record<keyof AiPage, unknown>
  for (const k of Object.keys(fb) as (keyof AiPage)[]) {
    const v = cms[k]
    if (Array.isArray(v)) {
      if (v.length) out[k] = v
    } else if (typeof v === 'string') {
      if (v.trim()) out[k] = v
    } else if (v != null) {
      out[k] = v
    }
  }
  return out as AiPage
}

/**
 * Bioscope AI page content from the `bioscope-ai` global, overlaid on the
 * static i18n fallback so the page always renders even if the CMS is offline.
 */
export async function getAiPage(locale: Locale): Promise<AiPage> {
  const fb = getMessages(locale).aiAssistantPage
  const cms = await cmsFetch<Partial<Record<keyof AiPage, unknown>>>('globals/bioscope-ai?depth=0', {
    locale,
    revalidate: 120,
  })
  return overlay(fb, cms)
}
