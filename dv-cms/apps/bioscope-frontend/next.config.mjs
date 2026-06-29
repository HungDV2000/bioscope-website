import { fileURLToPath } from 'node:url'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@dv/cms-core'],
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
}

export default nextConfig
