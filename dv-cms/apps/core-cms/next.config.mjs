import { withPayload } from '@payloadcms/next/withPayload'
import { fileURLToPath } from 'node:url'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Monorepo: trace files from dv-cms workspace root (not parent package-lock).
  outputFileTracingRoot: fileURLToPath(new URL('../..', import.meta.url)),
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
  ],
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
