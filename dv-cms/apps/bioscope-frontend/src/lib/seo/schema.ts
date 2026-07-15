/**
 * Reusable schema.org (JSON-LD) builders. Consolidates the previously ad-hoc
 * per-page structured data so every content type emits consistent, valid JSON-LD.
 */

import { absUrl, SITE_URL } from '@/lib/seo'

type Json = Record<string, unknown>

export type Crumb = { name: string; path: string }

/** BreadcrumbList from an ordered list of crumbs (last = current page). */
export function breadcrumbSchema(crumbs: Crumb[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.path.startsWith('http') ? c.path : absUrl(c.path),
    })),
  }
}

export function productSchema(input: {
  name: string
  description?: string
  image?: string
  brand?: string
  url: string
  category?: string
  sku?: string
}): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    ...(input.description ? { description: input.description } : {}),
    ...(input.image ? { image: input.image } : {}),
    ...(input.category ? { category: input.category } : {}),
    ...(input.sku ? { sku: input.sku } : {}),
    ...(input.brand ? { brand: { '@type': 'Brand', name: input.brand } } : {}),
    url: input.url,
  }
}

export function articleSchema(input: {
  headline: string
  description?: string
  image?: string
  url: string
  datePublished?: string
  dateModified?: string
  authorName?: string
  publisherName?: string
}): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.headline,
    ...(input.description ? { description: input.description } : {}),
    ...(input.image ? { image: input.image } : {}),
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
    mainEntityOfPage: input.url,
    author: { '@type': 'Organization', name: input.authorName ?? input.publisherName ?? 'Bioscope' },
    publisher: {
      '@type': 'Organization',
      name: input.publisherName ?? 'Bioscope',
      logo: { '@type': 'ImageObject', url: absUrl('/logo.avif') },
    },
  }
}

export function faqSchema(items: { question: string; answer: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.question,
      acceptedAnswer: { '@type': 'Answer', text: it.answer },
    })),
  }
}

export function webPageSchema(input: { name: string; description?: string; url: string }): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: input.name,
    ...(input.description ? { description: input.description } : {}),
    url: input.url,
    isPartOf: { '@type': 'WebSite', url: SITE_URL },
  }
}
