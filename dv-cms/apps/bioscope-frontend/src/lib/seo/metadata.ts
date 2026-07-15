/**
 * Build a Next.js Metadata object from a document's `seo` group, honouring the
 * Yoast-style overrides (title/description, Open Graph + Twitter social fields,
 * canonical, noIndex). Falls back to the provided page defaults.
 */

import type { Metadata } from 'next'
import { absUrl, DEFAULT_OG_IMAGE, SITE_URL } from '@/lib/seo'

export type SeoGroup = {
  title?: string
  description?: string
  image?: { url?: string } | string | null
  canonical?: string
  noIndex?: boolean
  ogTitle?: string
  ogDescription?: string
  twitterTitle?: string
  twitterDescription?: string
} | null | undefined

function imageUrl(image: SeoGroup extends null ? never : NonNullable<SeoGroup>['image']): string {
  if (!image) return absUrl(DEFAULT_OG_IMAGE)
  if (typeof image === 'string') return image.startsWith('http') ? image : absUrl(image)
  if (image.url) return image.url.startsWith('http') ? image.url : absUrl(image.url)
  return absUrl(DEFAULT_OG_IMAGE)
}

export function buildDocMetadata(
  seo: SeoGroup,
  defaults: { title: string; description: string; path: string },
): Metadata {
  const title = seo?.title || defaults.title
  const description = seo?.description || defaults.description
  const url = absUrl(defaults.path)
  const canonical = seo?.canonical || url
  const og = imageUrl(seo?.image)

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical },
    robots: seo?.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
      url,
      images: [{ url: og, width: 1200, height: 630 }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo?.twitterTitle || seo?.ogTitle || title,
      description: seo?.twitterDescription || seo?.ogDescription || description,
      images: [og],
    },
  }
}
