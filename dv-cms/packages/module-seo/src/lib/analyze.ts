/**
 * Yoast-style content analysis (framework-agnostic, pure functions). Produces
 * traffic-light "assessments" for the SEO focus keyphrase and for readability.
 * Works for Vietnamese + English; language-specific heuristics degrade
 * gracefully (a check that can't apply is simply omitted).
 */

export type Rating = 'good' | 'ok' | 'bad'
export type Assessment = { id: string; rating: Rating; text: string }

export type SeoInput = {
  keyphrase?: string
  seoTitle?: string
  metaDescription?: string
  slug?: string
  /** Full body text (plain, richText already flattened). */
  body?: string
  /** Number of images in the content/upload. */
  imageCount?: number
  /** Number of links (any) in the content. */
  linkCount?: number
}

const words = (s: string): string[] => (s.trim().match(/[\p{L}\p{N}]+/gu) ?? [])
const wordCount = (s: string): number => words(s).length
const norm = (s: string): string => s.toLowerCase().normalize('NFC').trim()

function includesPhrase(haystack: string, phrase: string): boolean {
  if (!phrase) return false
  return norm(haystack).includes(norm(phrase))
}

function keyphraseDensity(body: string, phrase: string): number {
  const total = wordCount(body)
  if (!total || !phrase) return 0
  const p = norm(phrase)
  const hay = norm(body)
  let count = 0
  let idx = hay.indexOf(p)
  while (idx !== -1) {
    count++
    idx = hay.indexOf(p, idx + p.length)
  }
  const phraseLen = Math.max(1, wordCount(phrase))
  return (count * phraseLen * 100) / total
}

/** SEO assessments (Yoast "SEO" tab). */
export function analyzeSeo(input: SeoInput): { assessments: Assessment[]; score: number } {
  const a: Assessment[] = []
  const kp = (input.keyphrase ?? '').trim()
  const body = input.body ?? ''

  if (!kp) {
    a.push({ id: 'keyphrase', rating: 'bad', text: 'Chưa đặt từ khóa trọng tâm (focus keyphrase).' })
  } else {
    a.push({ id: 'keyphrase', rating: 'good', text: `Từ khóa trọng tâm: “${kp}”.` })

    a.push(
      includesPhrase(input.seoTitle ?? '', kp)
        ? { id: 'kp-title', rating: 'good', text: 'Từ khóa xuất hiện trong tiêu đề SEO.' }
        : { id: 'kp-title', rating: 'bad', text: 'Từ khóa chưa có trong tiêu đề SEO.' },
    )
    a.push(
      includesPhrase(input.metaDescription ?? '', kp)
        ? { id: 'kp-meta', rating: 'good', text: 'Từ khóa xuất hiện trong meta description.' }
        : { id: 'kp-meta', rating: 'ok', text: 'Nên đưa từ khóa vào meta description.' },
    )
    a.push(
      includesPhrase(input.slug ?? '', kp)
        ? { id: 'kp-slug', rating: 'good', text: 'Từ khóa xuất hiện trong đường dẫn (slug).' }
        : { id: 'kp-slug', rating: 'ok', text: 'Nên đưa từ khóa vào slug.' },
    )

    const firstPara = body.split(/\n{2,}/)[0] ?? body.slice(0, 300)
    a.push(
      includesPhrase(firstPara, kp)
        ? { id: 'kp-intro', rating: 'good', text: 'Từ khóa xuất hiện ở đoạn mở đầu.' }
        : { id: 'kp-intro', rating: 'ok', text: 'Nên nhắc từ khóa ngay đoạn mở đầu.' },
    )

    const density = keyphraseDensity(body, kp)
    if (density === 0) a.push({ id: 'density', rating: 'bad', text: 'Từ khóa chưa xuất hiện trong nội dung.' })
    else if (density < 0.5) a.push({ id: 'density', rating: 'ok', text: `Mật độ từ khóa hơi thấp (${density.toFixed(1)}%).` })
    else if (density <= 3) a.push({ id: 'density', rating: 'good', text: `Mật độ từ khóa tốt (${density.toFixed(1)}%).` })
    else a.push({ id: 'density', rating: 'bad', text: `Mật độ từ khóa quá cao (${density.toFixed(1)}%) — tránh nhồi nhét.` })
  }

  // Title width (~chars as a proxy for pixel width).
  const titleLen = (input.seoTitle ?? '').length
  if (!titleLen) a.push({ id: 'title-len', rating: 'bad', text: 'Chưa có tiêu đề SEO.' })
  else if (titleLen < 30) a.push({ id: 'title-len', rating: 'ok', text: `Tiêu đề hơi ngắn (${titleLen} ký tự).` })
  else if (titleLen <= 60) a.push({ id: 'title-len', rating: 'good', text: `Độ dài tiêu đề tốt (${titleLen} ký tự).` })
  else a.push({ id: 'title-len', rating: 'bad', text: `Tiêu đề quá dài (${titleLen} ký tự) — dễ bị cắt.` })

  // Meta description length.
  const mdLen = (input.metaDescription ?? '').length
  if (!mdLen) a.push({ id: 'meta-len', rating: 'bad', text: 'Chưa có meta description.' })
  else if (mdLen < 120) a.push({ id: 'meta-len', rating: 'ok', text: `Meta description hơi ngắn (${mdLen} ký tự).` })
  else if (mdLen <= 156) a.push({ id: 'meta-len', rating: 'good', text: `Độ dài meta description tốt (${mdLen} ký tự).` })
  else a.push({ id: 'meta-len', rating: 'bad', text: `Meta description quá dài (${mdLen} ký tự) — dễ bị cắt.` })

  // Content length.
  const wc = wordCount(body)
  if (wc < 300) a.push({ id: 'length', rating: wc < 150 ? 'bad' : 'ok', text: `Nội dung ${wc} từ — nên ≥ 300 từ.` })
  else a.push({ id: 'length', rating: 'good', text: `Độ dài nội dung tốt (${wc} từ).` })

  // Links + images (light checks).
  a.push(
    (input.linkCount ?? 0) > 0
      ? { id: 'links', rating: 'good', text: 'Có liên kết trong nội dung.' }
      : { id: 'links', rating: 'ok', text: 'Nên thêm liên kết nội bộ/ngoài.' },
  )
  a.push(
    (input.imageCount ?? 0) > 0
      ? { id: 'images', rating: 'good', text: 'Có hình ảnh minh họa.' }
      : { id: 'images', rating: 'ok', text: 'Nên thêm hình ảnh (kèm alt).' },
  )

  return { assessments: a, score: scoreOf(a) }
}

/** Readability assessments (Yoast "Readability" tab). */
export function analyzeReadability(body: string): { assessments: Assessment[]; score: number } {
  const a: Assessment[] = []
  const text = (body ?? '').trim()
  if (!text) {
    a.push({ id: 'empty', rating: 'bad', text: 'Chưa có nội dung để phân tích.' })
    return { assessments: a, score: 0 }
  }

  const sentences = text.split(/[.!?…]+/).map((s) => s.trim()).filter(Boolean)
  const longSentences = sentences.filter((s) => wordCount(s) > 20)
  const longPct = sentences.length ? (longSentences.length * 100) / sentences.length : 0
  if (longPct <= 25) a.push({ id: 'sentence-len', rating: 'good', text: `Câu ngắn gọn (${longPct.toFixed(0)}% câu > 20 từ).` })
  else if (longPct <= 40) a.push({ id: 'sentence-len', rating: 'ok', text: `${longPct.toFixed(0)}% câu dài (> 20 từ) — nên rút gọn.` })
  else a.push({ id: 'sentence-len', rating: 'bad', text: `${longPct.toFixed(0)}% câu quá dài — chia nhỏ câu.` })

  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  const longParas = paragraphs.filter((p) => wordCount(p) > 150)
  if (!longParas.length) a.push({ id: 'para-len', rating: 'good', text: 'Độ dài đoạn văn hợp lý.' })
  else a.push({ id: 'para-len', rating: 'ok', text: `${longParas.length} đoạn quá dài (> 150 từ) — nên tách.` })

  const wc = wordCount(text)
  const headingMarkers = (text.match(/\n#{1,6}\s|\n[A-ZĐ][^\n]{0,60}\n/g) ?? []).length
  if (wc > 300 && headingMarkers === 0)
    a.push({ id: 'subheadings', rating: 'ok', text: 'Nội dung dài nhưng thiếu tiêu đề phụ (subheading).' })
  else a.push({ id: 'subheadings', rating: 'good', text: 'Có phân bổ tiêu đề phụ / nội dung ngắn.' })

  return { assessments: a, score: scoreOf(a) }
}

function scoreOf(a: Assessment[]): number {
  if (!a.length) return 0
  const pts = a.reduce((s, x) => s + (x.rating === 'good' ? 1 : x.rating === 'ok' ? 0.5 : 0), 0)
  return Math.round((pts / a.length) * 100)
}

export function overallRating(score: number): Rating {
  if (score >= 70) return 'good'
  if (score >= 40) return 'ok'
  return 'bad'
}
