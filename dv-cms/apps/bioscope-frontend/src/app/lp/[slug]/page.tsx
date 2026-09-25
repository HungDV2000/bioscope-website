import type { Metadata, Viewport } from 'next'
import { cookies, headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import Script from 'next/script'
import LandingApp from '@/components/landing/LandingApp'
import { getLandingMe, getLandingPage } from '@/lib/landing/cms'
import { lpCookieName } from '@/lib/landing/config'
import { parseLpSession } from '@/lib/landing/session'
import type { LpCampaign } from '@/lib/landing/types'

export const dynamic = 'force-dynamic'

const DEFAULT_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%2314939A'/%3E%3Cpath d='M32 14c9 0 16 7 16 16 0 12-16 22-16 22S16 42 16 30c0-9 7-16 16-16z' fill='%23fff'/%3E%3Ccircle cx='32' cy='30' r='6' fill='%23EC8A2C'/%3E%3C/svg%3E"

type Props = { params: Promise<{ slug: string }> }

/** Tên miền khách đang đứng — landing chạy trên tên miền riêng nên không dùng siteUrl của web Bioscope. */
async function origin() {
  const h = await headers()
  const host = h.get('x-forwarded-host')?.split(',')[0]?.trim() || h.get('host') || 'localhost:3000'
  const proto = h.get('x-forwarded-proto')?.split(',')[0]?.trim() || (host.startsWith('localhost') ? 'http' : 'https')
  return { url: `${proto}://${host}`, viaDomain: h.get('x-dv-landing-host') === '1' }
}

const autoTitle = (c: LpCampaign) =>
  c.status === 'ended'
    ? 'Gastroheal – Danh sách nhận quà | Bioscope'
    : c.status === 'draft'
      ? 'Gastroheal – Sắp ra mắt | Bioscope'
      : `Gastroheal – Còn ${c.slots} phần quà | Bioscope`
const autoDesc = (c: LpCampaign) =>
  `Bioscope tặng ${c.slots} phần Gastroheal cho ${c.slots} người tích điểm cao nhất. Tham gia miễn phí, làm 3 việc nhỏ, quà giao tận nhà.`

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await getLandingPage(slug)
  if (!data) return { title: { absolute: 'Không tìm thấy' }, robots: { index: false } }
  const c = data.campaign
  const o = await origin()
  const title = (c.status === 'active' && c.seo.title) || autoTitle(c)
  const description = c.seo.description || autoDesc(c)
  const image = c.seo.image || `${o.url}/landing/gastroheal/gastroheal.png`
  // Favicon tải lên trong admin (tab SEO & theo dõi); không có thì dùng biểu tượng màu Gastroheal.
  const icon = c.seo.favicon
    ? { url: c.seo.favicon, ...(c.seo.faviconType ? { type: c.seo.faviconType } : {}) }
    : { url: DEFAULT_ICON, type: 'image/svg+xml' }
  return {
    metadataBase: new URL(o.url),
    title: { absolute: title },
    description,
    alternates: { canonical: o.viaDomain ? '/' : `/lp/${slug}` },
    icons: { icon: [icon], ...(c.seo.favicon ? { apple: [{ url: c.seo.favicon }] } : {}) },
    // Xem thử qua /lp/<slug> trên web chính: không cho Google lập chỉ mục bản trùng.
    robots: c.status === 'active' && o.viaDomain ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: { type: 'website', locale: 'vi_VN', url: o.url, siteName: 'Bioscope', title, description, images: [{ url: image }] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  }
}

export const viewport: Viewport = { themeColor: '#F3F6F6', width: 'device-width', initialScale: 1, viewportFit: 'cover' }

export default async function LandingPage({ params }: Props) {
  const { slug } = await params
  const data = await getLandingPage(slug)
  if (!data) notFound()
  const c = data.campaign

  if (c.status === 'off') redirect(c.offRedirectUrl || 'https://web.bioscope.vn')
  if (c.status === 'draft') return <ComingSoon campaign={c} />

  const jar = await cookies()
  const session = parseLpSession(jar.get(lpCookieName(slug))?.value, slug)
  const me = session ? await getLandingMe(slug, session.pid) : null

  const o = await origin()
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(c, o.url) }} />
      {c.gtmId && /^GTM-[A-Z0-9]{4,12}$/.test(c.gtmId) && (
        <Script id="lp-gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${c.gtmId}');`}
        </Script>
      )}
      <LandingApp slug={slug} campaign={c} leaderboard={data.leaderboard} initialMe={me} />
    </>
  )
}

/**
 * Dữ liệu có cấu trúc: Organization (đơn vị tổ chức) + WebPage.
 *
 * CỐ Ý không khai `Product`: Google bắt Product phải có giá (offers), đánh giá
 * (review) hoặc điểm sao — landing không hiện giá, còn đánh giá/điểm sao cho
 * thực phẩm bảo vệ sức khoẻ dễ thành quảng cáo công dụng trái quy định. Khai
 * Product thiếu mấy trường đó chỉ sinh lỗi trong Search Console, không được gì.
 */
function jsonLd(c: LpCampaign, url: string): string {
  const co = c.company
  const org = {
    '@type': 'Organization',
    '@id': `${url}/#org`,
    name: co.name || 'Công ty Cổ phần Bioscope Việt Nam',
    url: co.website || 'https://www.bioscope.vn/',
    logo: `${url}/landing/gastroheal/bioscope-logo.png`,
    ...(co.taxCode ? { taxID: co.taxCode } : {}),
    ...(c.contactEmail ? { email: c.contactEmail } : {}),
    ...(c.hotline ? { telephone: c.hotline } : {}),
    ...(co.officeAddress ? { address: { '@type': 'PostalAddress', streetAddress: co.officeAddress, addressCountry: 'VN' } } : {}),
  }
  const page = {
    '@type': 'WebPage',
    '@id': `${url}/#page`,
    url: `${url}/`,
    name: (c.status === 'active' && c.seo.title) || autoTitle(c),
    description: c.seo.description || autoDesc(c),
    inLanguage: 'vi-VN',
    publisher: { '@id': `${url}/#org` },
    primaryImageOfPage: c.seo.image || `${url}/landing/gastroheal/gastroheal.png`,
  }
  // Chặn "</script>" trong dữ liệu admin nhập làm vỡ thẻ script.
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': [org, page] }).replace(/</g, '\\u003c')
}

/** Trạng thái "Nháp" trong admin: trang chờ, không lộ nội dung chiến dịch. */
function ComingSoon({ campaign }: { campaign: LpCampaign }) {
  return (
    <div className="lp-root flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-md rounded-[28px] bg-white p-8 text-center shadow-gh-float">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/landing/gastroheal/bioscope-logo.png" alt="Bioscope" className="mx-auto h-8 w-auto" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/landing/gastroheal/gastroheal.png" alt="" className="lp-bob mx-auto mt-6 h-40 w-auto" />
        <p className="mt-6 text-sm font-bold uppercase tracking-widest text-gh-brand-deep">Sắp ra mắt</p>
        <h1 className="mt-2 text-3xl font-extrabold leading-tight">Chương trình quà tặng Gastroheal sắp bắt đầu</h1>
        <p className="mt-3 text-lg text-gh-ink-soft">Bạn quay lại sau ít hôm nữa nhé.</p>
        {campaign.hotline && (
          <a href={`tel:${campaign.hotline.replace(/[^\d+]/g, '')}`} className="lp-tap mt-6 flex items-center justify-center rounded-full bg-gh-brand-soft font-bold text-gh-brand-deep">
            Gọi hotline {campaign.hotline}
          </a>
        )}
      </div>
    </div>
  )
}
