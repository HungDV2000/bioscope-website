import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { en } from 'payload/i18n/en'
import { vi } from 'payload/i18n/vi'
import sharp from 'sharp'

import { corePlugin, brandingPlugin, dashboardPlugin, dvTranslations } from '@dv/cms-core'
import { blocksPlugin } from '@dv/module-blocks'
import { catalogPlugin } from '@dv/module-catalog'
import { bioscopePlugin } from '@dv/module-bioscope'
import { b2bPlugin } from '@dv/module-b2b'
import { customTypesPlugin } from '@dv/module-custom-types'
import { languagesPlugin, resolveLocalizationConfig } from '@dv/module-languages'
import { permissionsPlugin } from '@dv/module-permissions'

import { seedEndpoint } from './endpoints/seed.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const localesManifestPath = path.resolve(dirname, 'generated/locales-manifest.json')

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
    suppressHydrationWarning: true,
    importMap: { baseDir: path.resolve(dirname) },
  },
  serverURL,
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  db,
  localization: resolveLocalizationConfig(localesManifestPath),
  i18n: {
    supportedLanguages: { en, vi },
    fallbackLanguage: 'en',
    translations: {
      en: { ...en, ...dvTranslations.en, general: { ...en.general, ...dvTranslations.en.general } },
      vi: { ...vi, ...dvTranslations.vi, general: { ...vi.general, ...dvTranslations.vi.general } },
    },
  },
  cors: corsOrigins,
  csrf: corsOrigins,
  sharp,
  folders: {
    // Chỉ dùng Media library trong nhóm SYSTEM — không hiện nút "Browse by Folder" riêng trên nav.
    browseByFolder: false,
    collectionSpecific: true,
  },
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
      description: 'Bioscope content management system',
      theme: 'light',
      enableDashboard: false,
    }),
    dashboardPlugin({
      seedComponent: '/components/SeedButton#SeedButton',
    }),
    // Custom content types (ACF-like) — after core (needs users/media/access).
    customTypesPlugin(),
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
    // Site languages — manifest drives `localization` config above.
    languagesPlugin({ manifestPath: localesManifestPath }),
    // RBAC — must be last so it wraps all collections/globals.
    permissionsPlugin(),
  ],
})
