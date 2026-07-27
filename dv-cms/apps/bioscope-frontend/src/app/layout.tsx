import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import { RouteProgress } from '@/components/route-progress'
import { CmsThemeStyle } from '@/components/theme/cms-theme-style'
import { getFaviconUrl, getFrontendThemeColor } from '@/lib/branding'
import { getLocale } from '@/lib/i18n/server'
import { DEFAULT_OG_IMAGE } from '@/lib/seo'
import { getSeoSettings } from '@/lib/cms/seo-settings'
import { Analytics, GtmNoScript } from '@/components/analytics'
import { CookieBanner } from '@/components/consent/CookieBanner'
import { getTracking } from '@/lib/cms/site-settings'
import './globals.css'

const DESCRIPTION =
  'Không chỉ nguyên liệu — Bioscope đồng kiến tạo những giải pháp đột phá cho ngành Dược phẩm, Thực phẩm chức năng và Mỹ phẩm tại Việt Nam.'
const KEYWORDS = [
  'nguyên liệu thực phẩm chức năng',
  'nguyên liệu mỹ phẩm',
  'nguyên liệu dược phẩm',
  'gia công ODM',
  'đồng kiến tạo sản phẩm',
]

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const s = await getSeoSettings(locale)
  const siteName = s.siteName ?? 'Bioscope'
  const homeTitle = s.homeTitle ?? 'Bioscope — Đối tác đổi mới y tế · Nguyên liệu & Đồng kiến tạo'
  const description = s.homeDescription ?? DESCRIPTION
  const ogImage = s.defaultImage ?? DEFAULT_OG_IMAGE
  // Favicon is managed in the CMS (Branding global) so it can be changed
  // without a deploy. Omitted entirely when nothing is uploaded.
  const favicon = await getFaviconUrl()

  return {
    metadataBase: new URL(s.siteUrl),
    title: { default: homeTitle, template: `%s ${s.titleSeparator} ${siteName}` },
    description,
    keywords: KEYWORDS,
    alternates: { canonical: '/' },
    ...(favicon
      ? {
          icons: {
            icon: [{ url: favicon.url, type: favicon.type }],
            shortcut: [{ url: favicon.url, type: favicon.type }],
            apple: [{ url: favicon.url }],
          },
        }
      : {}),
    // Yoast "discourage search engines" → noindex the whole site.
    robots: s.discourageSearchEngines ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: 'website',
      locale: locale === 'en' ? 'en_US' : 'vi_VN',
      url: s.siteUrl,
      siteName,
      title: homeTitle,
      description,
      images: [{ url: ogImage, alt: siteName }],
    },
    twitter: { card: 'summary_large_image', title: homeTitle, description, images: [ogImage] },
    ...(s.googleVerification || s.bingVerification
      ? {
          verification: {
            ...(s.googleVerification ? { google: s.googleVerification } : {}),
            ...(s.bingVerification ? { other: { 'msvalidate.01': s.bingVerification } } : {}),
          },
        }
      : {}),
  }
}

export async function generateViewport(): Promise<Viewport> {
  const themeColor = await getFrontendThemeColor()
  return { themeColor }
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale()
  const [tracking, seo] = await Promise.all([getTracking(), getSeoSettings(locale)])

  const identityType = seo.siteRepresents === 'person' ? 'Person' : 'Organization'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': identityType,
        '@id': `${seo.siteUrl}/#identity`,
        name: seo.orgName ?? seo.siteName ?? 'Bioscope',
        url: seo.siteUrl,
        ...(seo.orgLogo ? { logo: seo.orgLogo } : { logo: `${seo.siteUrl}/logo.avif` }),
        ...(seo.sameAs.length ? { sameAs: seo.sameAs } : {}),
      },
      {
        '@type': 'WebSite',
        '@id': `${seo.siteUrl}/#website`,
        url: seo.siteUrl,
        name: seo.siteName ?? 'Bioscope',
        inLanguage: locale === 'en' ? 'en-US' : 'vi-VN',
        publisher: { '@id': `${seo.siteUrl}/#identity` },
      },
    ],
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <GtmNoScript gtm={tracking.gtm} />
        <Suspense fallback={null}>
          <RouteProgress />
        </Suspense>
        <CmsThemeStyle />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
        <Analytics tracking={tracking} />
        <CookieBanner />
      </body>
    </html>
  )
}
