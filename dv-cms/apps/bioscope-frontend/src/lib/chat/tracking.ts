'use client'

/**
 * Thu thập thông tin phiên duyệt web ở phía trình duyệt (không xin quyền GPS).
 * Lưu trong sessionStorage nên hết lượt truy cập là mất.
 */
const K = {
  landing: 'bsLandingPage',
  referrer: 'bsReferrer',
  views: 'bsPageViews',
  utm: 'bsUtm',
}

type Utm = { utmSource?: string; utmMedium?: string; utmCampaign?: string }

/** Gọi một lần khi vào site + mỗi lần chuyển trang. */
export function trackPageView(pathname: string) {
  if (typeof window === 'undefined') return
  try {
    if (!sessionStorage.getItem(K.landing)) {
      sessionStorage.setItem(K.landing, pathname)
      // Referrer chỉ có ở lần tải trang đầu tiên.
      if (document.referrer && !document.referrer.startsWith(location.origin)) {
        sessionStorage.setItem(K.referrer, document.referrer)
      }
      const q = new URLSearchParams(location.search)
      const utm: Utm = {
        utmSource: q.get('utm_source') ?? undefined,
        utmMedium: q.get('utm_medium') ?? undefined,
        utmCampaign: q.get('utm_campaign') ?? undefined,
      }
      if (utm.utmSource || utm.utmMedium || utm.utmCampaign) {
        sessionStorage.setItem(K.utm, JSON.stringify(utm))
      }
    }
    const n = Number(sessionStorage.getItem(K.views) ?? '0') + 1
    sessionStorage.setItem(K.views, String(n))
  } catch {
    /* trình duyệt chặn storage — bỏ qua, tracking là tuỳ chọn */
  }
}

/** Gói dữ liệu tracking gửi kèm khi bắt đầu hội thoại. */
export function collectTracking(): Record<string, unknown> {
  if (typeof window === 'undefined') return {}
  let utm: Utm = {}
  try {
    utm = JSON.parse(sessionStorage.getItem(K.utm) ?? '{}') as Utm
  } catch {
    /* bỏ qua */
  }
  const s = (k: string) => {
    try {
      return sessionStorage.getItem(k) ?? undefined
    } catch {
      return undefined
    }
  }
  return {
    startPage: location.pathname,
    userAgent: navigator.userAgent,
    screen: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language,
    referrer: s(K.referrer),
    landingPage: s(K.landing),
    pageViews: Number(s(K.views) ?? '0') || undefined,
    ...utm,
  }
}
