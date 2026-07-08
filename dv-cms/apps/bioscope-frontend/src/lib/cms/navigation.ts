import { cmsFetch } from '@/lib/payload'
import type { Locale } from '@/lib/i18n/config'

type NavRow = { label?: string; url?: string; children?: { label?: string; url?: string }[] }

export type NavLink = { label: string; href: string }
export type FooterColumn = { title: string; links: NavLink[] }
export type SiteNav = { header: NavLink[]; footerColumns: FooterColumn[] }

/**
 * Header menu + footer columns from the CMS `navigation` global.
 * Returns null on failure/empty so callers fall back to the static i18n menu.
 */
export async function getNavigation(locale: Locale): Promise<SiteNav | null> {
  const nav = await cmsFetch<{ header?: NavRow[]; footer?: NavRow[] }>('globals/navigation', {
    locale,
    revalidate: 300,
  })
  if (!nav?.header?.length) return null

  const header: NavLink[] = nav.header
    .filter((i) => i.label && i.url)
    .map((i) => ({ label: i.label!, href: i.url! }))

  const footerColumns: FooterColumn[] = (nav.footer ?? [])
    .filter((c) => c.label)
    .map((c) => ({
      title: c.label!,
      links: (c.children ?? [])
        .filter((l) => l.label && l.url)
        .map((l) => ({ label: l.label!, href: l.url! })),
    }))

  return header.length ? { header, footerColumns } : null
}
