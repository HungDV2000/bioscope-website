import { cmsFetch } from '@/lib/payload'
import type { Locale } from '@/lib/i18n/config'

/**
 * Nội dung chân trang, đọc từ global `site-settings` (tab "Chân trang").
 *
 * Trước đây thông tin công ty nằm trong global `navigation` — sai chỗ, vì
 * Navigation nên chỉ giữ menu. Tagline, khối bản tin và icon mạng xã hội thì
 * còn tệ hơn: nằm cứng trong code, biên tập viên không sửa được, và icon mạng
 * xã hội trỏ href="#" (link chết).
 */

export type FooterCompany = {
  companyName?: string
  tagline?: string
  address?: string
  officeAddress?: string
  mst?: string
  phone?: string
  email?: string
  invoiceEmail?: string
  website?: string
}

export type FooterNewsletter = {
  title?: string
  description?: string
  placeholder?: string
  buttonLabel?: string
}

export type SocialLink = { platform?: string; url: string }

export type FooterContent = {
  company?: FooterCompany
  newsletter?: FooterNewsletter
  social: SocialLink[]
  copyright?: string
}

type Raw = {
  contact?: FooterCompany | null
  newsletter?: FooterNewsletter | null
  social?: { platform?: string; url?: string }[] | null
  copyright?: string | null
}

/** Bỏ nhóm rỗng để giao diện dùng được `??` mà không phải kiểm từng trường. */
const nonEmpty = <T extends object>(o: T | null | undefined): T | undefined =>
  o && Object.values(o).some((v) => typeof v === 'string' && v.trim()) ? o : undefined

export async function getFooterContent(locale: Locale): Promise<FooterContent | null> {
  const s = await cmsFetch<Raw>('globals/site-settings?depth=0', { locale, revalidate: 300 })
  if (!s) return null

  return {
    company: nonEmpty(s.contact),
    newsletter: nonEmpty(s.newsletter),
    // Bỏ mục thiếu URL — icon không có link thì vô nghĩa.
    social: (s.social ?? [])
      .filter((x): x is { platform?: string; url: string } => Boolean(x?.url?.trim()))
      .map((x) => ({ platform: x.platform, url: x.url.trim() })),
    copyright: s.copyright?.trim() || undefined,
  }
}
