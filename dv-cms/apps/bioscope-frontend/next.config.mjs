import { fileURLToPath } from 'node:url'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the monorepo root (multiple lockfiles exist above this dir).
  turbopack: {
    root: fileURLToPath(new URL('../..', import.meta.url)),
  },
  images: {
    // Payload media is served from the core-cms instance.
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '3001' },
      { protocol: 'https', hostname: '**' },
    ],
  },
}

export default nextConfig
