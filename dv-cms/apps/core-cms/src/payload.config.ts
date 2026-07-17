import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor, FixedToolbarFeature } from '@payloadcms/richtext-lexical'
import { en } from 'payload/i18n/en'
import { vi } from 'payload/i18n/vi'
import sharp from 'sharp'

import { corePlugin, brandingPlugin, dashboardPlugin, dvTranslations } from '@dv/cms-core'
import { blocksPlugin } from '@dv/module-blocks'
import { catalogPlugin } from '@dv/module-catalog'
import { bioscopePlugin } from '@dv/module-bioscope'
import { b2bPlugin } from '@dv/module-b2b'
import { customTypesPlugin } from '@dv/module-custom-types'
import { seoPlugin } from '@dv/module-seo'
import { securityPlugin } from '@dv/module-security'
import { imagePlugin } from '@dv/module-image'
import { consentPlugin } from '@dv/module-consent'
import { languagesPlugin, resolveLocalizationConfig } from '@dv/module-languages'
import { permissionsPlugin } from '@dv/module-permissions'
import { betterEditor } from 'payload-better-editor'

import { seedEndpoint } from './endpoints/seed.js'
import { cmsSyncSourceEndpoint } from './endpoints/cmsSyncSource.js'
import { cmsSyncEndpoint } from './endpoints/cmsSync.js'
import { cmsSyncRunsEndpoint } from './endpoints/cmsSyncRuns.js'
import {
  driveSyncTriggerEndpoint,
  driveSyncListEndpoint,
  driveSyncGetEndpoint,
  driveSyncCancelEndpoint,
} from './endpoints/driveSync.js'
import { csvImportEndpoint } from './endpoints/csvImport.js'
import {
  aiGenerateTriggerEndpoint,
  aiGenerateBulkEndpoint,
  aiGenerateListEndpoint,
  aiGenerateGetEndpoint,
} from './endpoints/aiGenerate.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const localesManifestPath = path.resolve(dirname, 'generated/locales-manifest.json')

const frontendUrl = process.env.FRONTEND_URL || ''
const serverURL = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001'
// Origins allowed for CORS + CSRF (cookie auth only honored for these origins).
const corsOrigins = Array.from(
  new Set(
    [
      frontendUrl,
      serverURL,
      'http://localhost:3000',
      'http://localhost:3001',
      // Same-origin Better Editor preview proxy (scripts/preview-proxy.mjs).
      process.env.PREVIEW_PROXY_URL || 'http://localhost:8080',
    ].filter(Boolean),
  ),
)

const db = postgresAdapter({
  pool: { connectionString: process.env.DATABASE_URI || '' },
  // Auto-create/evolve the schema on startup (incl. production) — the deploy
  // relies on push rather than migrations. Set PAYLOAD_DB_PUSH=false to disable
  // and use `payload migrate` instead once migrations are maintained.
  push: process.env.PAYLOAD_DB_PUSH !== 'false',
})

export default buildConfig({
  admin: {
    user: 'users',
    suppressHydrationWarning: true,
    importMap: { baseDir: path.resolve(dirname) },
    components: {
      // WordPress-style sidebar: consolidated groups, collapsed parents with a
      // hover flyout + click-to-expand. Replaces Payload's default flat nav.
      Nav: '@dv/cms-core/admin#WpNav',
    },
  },
  serverURL,
  // Always-visible toolbar (Word-like) instead of the floating on-selection one.
  editor: lexicalEditor({ features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature()] }),
  secret: process.env.PAYLOAD_SECRET || '',
  db,
  localization: resolveLocalizationConfig(localesManifestPath),
  i18n: {
    supportedLanguages: { en, vi },
    fallbackLanguage: 'en',
    translations: {
      en: { ...en, ...dvTranslations.en } as typeof en & typeof dvTranslations.en,
      vi: { ...vi, ...dvTranslations.vi } as typeof vi & typeof dvTranslations.vi,
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
  endpoints: [seedEndpoint, cmsSyncSourceEndpoint, cmsSyncEndpoint, cmsSyncRunsEndpoint, driveSyncTriggerEndpoint, driveSyncListEndpoint, driveSyncGetEndpoint, driveSyncCancelEndpoint, csvImportEndpoint, aiGenerateTriggerEndpoint, aiGenerateBulkEndpoint, aiGenerateListEndpoint, aiGenerateGetEndpoint],
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
      cmsSyncComponent: '/components/CmsSyncPanel/CmsSyncPanel#CmsSyncPanel',
      aiGenerateComponent: '/components/AiGeneratePanel/AiGeneratePanel#AiGeneratePanel',
    }),
    // Image optimization — after core (enhances the media upload config).
    imagePlugin(),
    // Custom content types (ACF-like) — after core (needs users/media/access).
    customTypesPlugin(),
    // Page layout blocks — pick which blocks this site can use (omit `enabled` for all).
    blocksPlugin({
      enabled: ['hero', 'stats', 'featureGrid', 'gallery', 'cta', 'richText', 'videoEmbed', 'logoCloud'],
    }),
    // Generic catalog primitives (Partners only — Bioscope has its own categories).
    catalogPlugin({ productCategories: false }),
    // Bioscope-specific collections.
    // Home page is composed in Pages (home blocks) + Site Settings → homePage.
    // The legacy Home global stays registered (schema kept) but is hidden in admin.
    bioscopePlugin(),
    // B2B portal; gated documents may relate to ingredients.
    b2bPlugin({ relatesTo: 'ingredients' }),
    // Yoast-style SEO settings global (search appearance, schema, sitemap, robots).
    seoPlugin(),
    // Site languages — manifest drives `localization` config above.
    languagesPlugin({ manifestPath: localesManifestPath }),
    // Visual "Better Editor" preview toggle on Pages (needs admin.preview URL +
    // same-origin frontend proxy — see next.config rewrites).
    betterEditor({ collections: ['pages'] }),
    // Wordfence-style security: managed firewall, IP blocklist, event log.
    securityPlugin(),
    // Complianz-style GDPR cookie consent (banner + proof-of-consent).
    consentPlugin(),
    // RBAC — must be last so it wraps all collections/globals.
    permissionsPlugin(),
  ],
})
