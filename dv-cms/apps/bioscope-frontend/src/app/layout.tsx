import type { Metadata } from 'next'
import { Be_Vietnam_Pro } from 'next/font/google'
import './globals.css'

const beVietnam = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-be-vietnam',
  display: 'swap',
})

const SITE_URL = 'https://bioscope.vn'
const DESCRIPTION =
  'Không chỉ nguyên liệu — Bioscope đồng kiến tạo những giải pháp đột phá cho ngành Dược phẩm, Thực phẩm chức năng và Mỹ phẩm tại Việt Nam.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Bioscope — Đối tác đổi mới y tế · Nguyên liệu & Đồng kiến tạo',
    template: '%s · Bioscope',
  },
  description: DESCRIPTION,
  keywords: [
    'nguyên liệu thực phẩm chức năng',
    'nguyên liệu mỹ phẩm',
    'nguyên liệu dược phẩm',
    'gia công ODM',
    'đồng kiến tạo sản phẩm',
  ],
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: SITE_URL,
    siteName: 'Bioscope',
    title: 'Bioscope — Đối tác đổi mới y tế',
    description: DESCRIPTION,
  },
}

export const viewport = {
  themeColor: '#008e4d',
}

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Bioscope',
      url: SITE_URL,
      logo: `${SITE_URL}/logo.avif`,
      description: DESCRIPTION,
      slogan: 'Đối tác được lựa chọn của Việt Nam cho nguyên liệu cao cấp và đổi mới đột phá.',
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Bioscope',
      inLanguage: 'vi-VN',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={beVietnam.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        {children}
      </body>
    </html>
  )
}
