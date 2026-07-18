import type { Locale } from './config'

/**
 * Some AI-generated content was stored as a single bilingual blob
 * ("VI: … | EN: …") inside one localized field. Extract the side for the
 * active locale so the UI shows clean, single-language text. Plain strings
 * (the correct shape going forward) pass through untouched.
 */
export function pickLocaleText(raw: string | undefined | null, locale: Locale): string {
  if (!raw) return ''
  const m = raw.match(/VI:\s*([\s\S]*?)\s*\|\s*EN:\s*([\s\S]*)$/i)
  if (m) {
    const vi = m[1].trim()
    const en = m[2].trim()
    return locale === 'en' ? en || vi : vi || en
  }
  // Single-sided leftover like "VI: …" with no counterpart.
  return raw.replace(/^\s*(VI|EN):\s*/i, '').trim()
}
