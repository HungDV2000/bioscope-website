import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'

import { corePlugin, brandingPlugin } from '@dv/cms-core'
import { blocksPlugin } from '@dv/module-blocks'
import { catalogPlugin } from '@dv/module-catalog'
import { bioscopePlugin } from '@dv/module-bioscope'
import { b2bPlugin } from '@dv/module-b2b'

import { seedEndpoint } from './endpoints/seed.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const frontendUrl = process.env.FRONTEND_URL || ''
const serverURL = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001'
// Origins allowed for CORS + CSRF (cookie auth only honored for these origins).
const corsOrigins = Array.from(
  new Set([frontendUrl, serverURL, 'http://localhost:3000', 'http://localhost:3001'].filter(Boolean)),
)

const db = postgresAdapter({
  pool: { connectionString: process.env.DATABASE_URI || '' },
})

export default buildConfig({
  admin: {
    user: 'users',
    importMap: { baseDir: path.resolve(dirname) },
    components: {
      // One-click seed/refresh card on the dashboard (admin-only endpoint).
      beforeDashboard: ['/components/SeedButton#SeedButton'],
    },
  },
  serverURL,
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  db,
  localization: {
    locales: [
      { label: 'Tiếng Việt', code: 'vi' },
      { label: 'English', code: 'en' },
    ],
    defaultLocale: 'vi',
    fallback: true,
  },
  cors: corsOrigins,
  csrf: corsOrigins,
  sharp,
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  endpoints: [seedEndpoint],
  collections: [],
  plugins: [
    // Tier 1 — generic core (must come first: users + media).
    corePlugin({
      revalidate: {
        frontendUrl,
        secret: process.env.REVALIDATE_SECRET,
      },
    }),
    // Whitelabel admin (brand meta, theme, logo, dashboard). After core (needs media).
    brandingPlugin({
      brandName: 'Bioscope CMS',
      titleSuffix: '· Bioscope CMS',
      description: 'Hệ quản trị nội dung Bioscope',
      theme: 'light',
    }),
    // Page layout blocks — pick which blocks this site can use (omit `enabled` for all).
    blocksPlugin({
      enabled: ['hero', 'stats', 'featureGrid', 'gallery', 'cta', 'richText', 'videoEmbed', 'logoCloud'],
    }),
    // Generic catalog primitives (Partners only — Bioscope has its own categories).
    catalogPlugin({ productCategories: false }),
    // Bioscope-specific collections.
    bioscopePlugin(),
    // B2B portal; gated documents may relate to ingredients.
    b2bPlugin({ relatesTo: 'ingredients' }),
  ],
})
