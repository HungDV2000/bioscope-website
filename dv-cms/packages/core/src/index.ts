// Plugins
export { corePlugin, type CorePluginOptions } from './plugin.js'
export { brandingPlugin, type BrandingPluginOptions } from './branding/plugin.js'
export { dashboardPlugin, type DashboardPluginOptions } from './dashboard/plugin.js'

// Access helpers
export * from './access/index.js'

// Field helpers
export { slugField } from './fields/slug.js'
export { seoField } from './fields/seo.js'

// Hooks
export { buildRevalidateHooks, type RevalidateOptions } from './hooks/revalidate.js'

// Utils
export { slugify } from './utils/slugify.js'

// Admin i18n
export { ADMIN_GROUP_SYSTEM, ADMIN_GROUP_CONTENT, dvTranslations, useDvTranslation } from './i18n/index.js'

// Shared theme tokens (frontend + admin)
export {
  DEFAULT_ADMIN_THEME,
  DEFAULT_FRONTEND_THEME,
  adminThemeToCssVars,
  cssVarsToBlock,
  frontendThemeToCssVars,
  resolveAdminTheme,
  resolveFrontendTheme,
  type AdminTheme,
  type BrandingGlobal,
  type FrontendTheme,
} from './theme/index.js'

// Collections (exported for advanced composition / overrides)
export { Users } from './collections/Users.js'
export { Media } from './collections/Media.js'
export { Pages } from './collections/Pages.js'
export { Posts } from './collections/Posts.js'
export { Categories } from './collections/Categories.js'
export { Tags } from './collections/Tags.js'
export { Forms } from './collections/Forms.js'
export { FormSubmissions } from './collections/FormSubmissions.js'
export { Redirects } from './collections/Redirects.js'
export { SiteSettings } from './globals/SiteSettings.js'
export { Navigation } from './globals/Navigation.js'
export { Branding } from './globals/Branding.js'
