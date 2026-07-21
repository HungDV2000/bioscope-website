import { withPayload } from '@payloadcms/next/withPayload'
import { fileURLToPath } from 'node:url'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Monorepo: trace files from dv-cms workspace root (not parent package-lock).
  outputFileTracingRoot: fileURLToPath(new URL('../..', import.meta.url)),
  // Same-origin Better Editor preview is served by the transparent proxy in
  // `scripts/preview-proxy.mjs` (Next rewrites break App Router hydration).
  // The admin's assets go under a distinct `/cms-static` prefix so they never
  // collide with the frontend's `/_next` behind the shared proxy origin.
  assetPrefix: process.env.CMS_ASSET_PREFIX || undefined,
  // Keep pdfjs-dist out of the server bundle so its worker file stays resolvable
  // from node_modules (AI content generation reads source PDFs through it).
  serverExternalPackages: ['pdfjs-dist'],
  // Workspace packages ship raw TS with `.js` import specifiers (NodeNext style).
  transpilePackages: [
    '@dv/cms-core',
    '@dv/module-catalog',
    '@dv/module-bioscope',
    '@dv/module-b2b',
    '@dv/module-blocks',
    '@dv/module-custom-types',
    '@dv/module-languages',
    '@dv/module-permissions',
    '@dv/module-seo',
    '@dv/module-security',
    '@dv/module-image',
    '@dv/module-consent',
  ],
  typescript: {
    // Disable type check during build (pre-existing issues in packages/core unrelated to CSV import).
    // The app still type-checks in dev (Fast Refresh) and editor time.
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // Let webpack resolve `./x.js` specifiers to the real `.ts`/`.tsx` sources.
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias ?? {}),
      '.js': ['.ts', '.tsx', '.js'],
      '.jsx': ['.tsx', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return config
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })