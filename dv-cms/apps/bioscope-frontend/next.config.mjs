import { fileURLToPath } from 'node:url'

// CMS origin (Payload) — allowed to embed the site in its edit-preview iframe,
// and to be called by fetch/images. Derived from the public CMS URL.
const CMS_ORIGIN = (process.env.NEXT_PUBLIC_CMS_URL ?? 'http://localhost:3001').replace(/\/$/, '')

// Content-Security-Policy. `unsafe-inline`/`unsafe-eval` are kept for Next
// hydration + GTM/analytics inline snippets; tighten with nonces in a later
// hardening pass. `frame-ancestors` allows the CMS to preview this site.
const csp = [
  `default-src 'self'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `object-src 'none'`,
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: https: ${CMS_ORIGIN}`,
  `font-src 'self' data:`,
  `connect-src 'self' ${CMS_ORIGIN} https://www.googletagmanager.com https://www.google-analytics.com https://region1.google-analytics.com https://connect.facebook.net`,
  `frame-src 'self' https://www.googletagmanager.com`,
  `frame-ancestors 'self' ${CMS_ORIGIN}`,
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /**
   * Thời gian tối đa dựng MỖI trang tĩnh (giây). Mặc định của Next là 60.
   *
   * Trang tĩnh phải gọi API sang CMS để lấy nội dung. Trên VPS, nếu build chạy
   * cùng lúc với việc khác (build CMS song song, hàng đợi AI đang xử lý PDF…)
   * thì CPU bị tranh và một trang có thể vượt 60 giây → cả bản build hỏng dù
   * code không có lỗi gì. Nới lên 5 phút: máy khoẻ vẫn nhanh như cũ, máy yếu
   * thì chậm chứ không đứt.
   */
  staticPageGenerationTimeout: 300,
  transpilePackages: ['@dv/cms-core', '@dv/module-security'],
  turbopack: {
    root: fileURLToPath(new URL('../..', import.meta.url)),
  },
  // VPS / aaPanel: serve /public trực tiếp, không qua /_next/image
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '3001' },
      { protocol: 'https', hostname: '**' },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
