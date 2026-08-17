import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import {
  lexicalEditor,
  FixedToolbarFeature,
  InlineToolbarFeature,
  EXPERIMENTAL_TableFeature,
  TextStateFeature,
} from '@payloadcms/richtext-lexical'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { en } from 'payload/i18n/en'
import { vi } from 'payload/i18n/vi'
import sharp from 'sharp'

import { corePlugin, brandingPlugin, dashboardPlugin, dvTranslations, auditPlugin } from '@dv/cms-core'
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

import { seedEndpoint } from './endpoints/seed.js'
import { backupEndpoint } from './endpoints/backup.js'
import { ingredientDuplicatesEndpoint } from './endpoints/duplicates.js'
import { duplicateScanEndpoints } from './endpoints/duplicateScan.js'
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
import { ingredientExportEndpoint, ingredientImportEndpoint } from './endpoints/ingredientData.js'
import { clearCacheEndpoint } from './endpoints/clearCache.js'
import { moduleStatusEndpoint } from './endpoints/moduleStatus.js'
import { ChatSettings } from './globals/ChatSettings.js'
import { AuthSettings } from './globals/AuthSettings.js'
import { ChatConversations } from './collections/ChatConversations.js'
import { ChatMessages } from './collections/ChatMessages.js'
import { chatEndpoints } from './endpoints/chat.js'
import { googleAuthEndpoints } from './endpoints/googleAuth.js'
import { catalogEndpoints } from './endpoints/catalog.js'
import { catalogKeyEndpoints } from './endpoints/catalogKeys.js'
import { ApiKeys } from './collections/ApiKeys.js'
import {
  aiGenerateTriggerEndpoint,
  aiGenerateBulkEndpoint,
  aiGenerateImageEndpoint,
  aiGenerateListEndpoint,
  aiGenerateGetEndpoint,
  aiGenerateQueueStatusEndpoint,
} from './endpoints/aiGenerate.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const localesManifestPath = path.resolve(dirname, 'generated/locales-manifest.json')

const frontendUrl = process.env.FRONTEND_URL || ''
const serverURL = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001'

/**
 * SMTP email adapter — used for form-submission notifications and admin
 * account/error emails. Only enabled when SMTP_HOST is set; otherwise Payload
 * logs "No email adapter provided" and sendEmail no-ops (safe in dev).
 * Env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE, EMAIL_FROM, EMAIL_FROM_NAME.
 */
const email = process.env.SMTP_HOST
  ? nodemailerAdapter({
      defaultFromAddress: process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@bioscope.vn',
      defaultFromName: process.env.EMAIL_FROM_NAME || 'Bioscope Việt Nam',
      transportOptions: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
        auth:
          process.env.SMTP_USER && process.env.SMTP_PASS
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            : undefined,
      },
    })
  : undefined
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
      // Thanh công cụ nhanh trên cùng (giống admin bar WordPress): tìm kiếm toàn
      // admin (Ctrl/Cmd+K) + nút Xoá cache.
      actions: ['/components/GlobalSearch/GlobalSearch#GlobalSearch', '@dv/cms-core/admin#ClearCacheAction'],
      // Bọc toàn admin để chèn thanh tiến trình chuyển trang.
      providers: ['@dv/cms-core/admin#AdminRouteProgress'],
    },
  },
  serverURL,
  // Rich text: Word-like fixed toolbar + on-selection inline toolbar, tables, and
  // brand text colors / highlights. NOTE: keep the color keys below in sync with the
  // frontend renderer (apps/bioscope-frontend/src/components/ui/rich-text.tsx).
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      FixedToolbarFeature(),
      InlineToolbarFeature(),
      EXPERIMENTAL_TableFeature(),
      TextStateFeature({
        state: {
          color: {
            green: { label: 'Xanh Bioscope', css: { color: '#008E4D' } },
            orange: { label: 'Cam', css: { color: '#F58E33' } },
            red: { label: 'Đỏ', css: { color: '#DC2626' } },
            muted: { label: 'Xám', css: { color: '#5B6B62' } },
          },
          highlight: {
            greenBg: { label: 'Nền xanh nhạt', css: { 'background-color': '#EEF6F1' } },
            orangeBg: { label: 'Nền cam nhạt', css: { 'background-color': '#FFF4E8' } },
          },
        },
      }),
    ],
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  ...(email ? { email } : {}),
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
  endpoints: [seedEndpoint, backupEndpoint, ingredientDuplicatesEndpoint, ...duplicateScanEndpoints, cmsSyncSourceEndpoint, cmsSyncEndpoint, cmsSyncRunsEndpoint, driveSyncTriggerEndpoint, driveSyncListEndpoint, driveSyncGetEndpoint, driveSyncCancelEndpoint, csvImportEndpoint, ingredientExportEndpoint, ingredientImportEndpoint, aiGenerateTriggerEndpoint, aiGenerateBulkEndpoint, aiGenerateImageEndpoint, aiGenerateListEndpoint, aiGenerateGetEndpoint, aiGenerateQueueStatusEndpoint, clearCacheEndpoint, moduleStatusEndpoint, ...chatEndpoints, ...googleAuthEndpoints, ...catalogEndpoints, ...catalogKeyEndpoints],
  collections: [ChatConversations, ChatMessages, ApiKeys],
  globals: [ChatSettings, AuthSettings],
  // Sau khi container khởi động lại (deploy/rebuild), runner AI trong RAM chết
  // theo tiến trình cũ — job đang chạy hoặc còn 'queued' sẽ nằm im vĩnh viễn
  // tới khi có người bấm tạo mới. Kích lại hàng đợi ngay lúc onInit để tự nhặt
  // các job còn tồn (drain đã lọc status='queued' + requeue job in-progress bị
  // bỏ). Chạy nền, không chặn khởi động; bọc try/catch để lỗi không làm sập CMS.
  onInit: async (payload) => {
    try {
      const { ensureQueueRunner } = await import('./ai-generate/queue.js')
      ensureQueueRunner(payload)
      payload.logger.info('[ai-queue] onInit: đã kích hàng đợi AI để nhặt lại job còn tồn.')
    } catch (err) {
      payload.logger.error(`[ai-queue] onInit kick hàng đợi lỗi: ${String(err)}`)
    }
    try {
      const { startScheduledBackups } = await import('./lib/scheduledBackup.js')
      startScheduledBackups(payload)
    } catch (err) {
      payload.logger.error(`[backup] onInit lỗi khởi động lịch sao lưu: ${String(err)}`)
    }
    try {
      const { startScheduledPublish } = await import('./lib/scheduledPublish.js')
      startScheduledPublish(payload)
    } catch (err) {
      payload.logger.error(`[scheduled-publish] onInit lỗi: ${String(err)}`)
    }
    try {
      const { startChatRetention } = await import('./lib/chatRetention.js')
      startChatRetention(payload)
    } catch (err) {
      payload.logger.error(`[chat-retention] onInit lỗi: ${String(err)}`)
    }
  },
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
      backupComponent: '/components/BackupButton#BackupButton',
      duplicateComponent: '/components/DuplicatePanel#DuplicatePanel',
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
    // Live editing now uses Payload's official Live Preview (Pages.admin.livePreview
    // + RefreshRouteOnSave on the frontend) — no same-origin proxy needed.
    // Wordfence-style security: managed firewall, IP blocklist, event log.
    securityPlugin(),
    // Complianz-style GDPR cookie consent (banner + proof-of-consent).
    consentPlugin(),
    // Nhật ký thay đổi — gắn hook ghi log vào mọi collection nội dung. Trước
    // permissions để audit-logs cũng nằm trong RBAC.
    auditPlugin(),
    // RBAC — must be last so it wraps all collections/globals.
    permissionsPlugin(),
  ],
})
