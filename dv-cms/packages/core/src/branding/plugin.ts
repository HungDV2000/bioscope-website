import type { Config, Plugin } from 'payload'
import { Branding } from '../globals/Branding.js'
import { brandingFaviconEndpoint } from './faviconEndpoint.js'

export type BrandingPluginOptions = {
  /** Used for the admin <title> suffix when not overridden. */
  brandName?: string
  /** Admin browser tab title suffix, e.g. "· Bioscope CMS". */
  titleSuffix?: string
  /** Admin meta description (HTML meta tag; English recommended). */
  description?: string
  /** Register the editable Branding global (default: true). */
  enableGlobal?: boolean
  /** Show the dashboard welcome + shortcut cards (default: true). */
  enableDashboard?: boolean
  /** Force a theme. Default 'light' (Bioscope light-SaaS look). */
  theme?: 'light' | 'dark' | 'all'
}

const C = '@dv/cms-core/admin'

/**
 * Whitelabel the Payload admin: brand meta, forced theme, custom logo/icon,
 * a runtime ThemeInjector (reads the Branding global → CSS variables) and an
 * optional dashboard welcome. Reusable across sites via options + the Branding
 * global. Register AFTER corePlugin (needs the `media` collection for the logo).
 */
export const brandingPlugin =
  (options: BrandingPluginOptions = {}): Plugin =>
  (incoming: Config): Config => {
    const config = { ...incoming }
    const brand = options.brandName ?? 'CMS'

    const admin = { ...(config.admin ?? {}) }
    admin.theme = options.theme ?? admin.theme ?? 'light'
    admin.meta = {
      ...(admin.meta ?? {}),
      titleSuffix: options.titleSuffix ?? `· ${brand}`,
      description: options.description ?? admin.meta?.description,
      // Fixed URL, editable target. `admin.meta` is a static object evaluated at
      // config-build time and cannot read the Branding global per request, so the
      // endpoint resolves the current upload instead (see faviconEndpoint.ts).
      // It 404s when nothing is uploaded, which the browser treats as "no icon".
      icons: admin.meta?.icons ?? [{ rel: 'icon', url: '/api/branding-favicon' }],
    }

    const components = { ...(admin.components ?? {}) }
    components.graphics = {
      ...(components.graphics ?? {}),
      Logo: `${C}#BrandLogo`,
      Icon: `${C}#BrandIcon`,
    }
    admin.avatar = {
      Component: `${C}#AccountMenu`,
    }
    components.logout = {
      ...(components.logout ?? {}),
      Button: `${C}#HiddenLogout`,
    }
    components.beforeNav = [...(components.beforeNav ?? []), `${C}#NavBrand`]
    components.beforeLogin = [...(components.beforeLogin ?? []), `${C}#LoginShell`, `${C}#LoginSubtitle`]
    components.afterLogin = [...(components.afterLogin ?? []), `${C}#LoginFooter`]
    components.providers = [
      ...(components.providers ?? []),
      `${C}#ThemeInjector`,
      `${C}#AdminLocaleSync`,
      `${C}#NavIconRail`,
      `${C}#NavIcons`,
      `${C}#NavMobileDrawer`,
      // Mở Media ở chế độ thư mục. Phải là provider — xem chú thích trong
      // MediaLibraryRedirect.tsx (gắn vào views.list sẽ làm trắng drawer chọn ảnh).
      `${C}#MediaLibraryRedirect`,
    ]
    if (options.enableDashboard !== false) {
      components.beforeDashboard = [...(components.beforeDashboard ?? []), `${C}#DashboardWelcome`]
    }
    admin.components = components
    config.admin = admin

    if (options.enableGlobal !== false) {
      config.globals = [...(config.globals ?? []), Branding]
      config.endpoints = [...(config.endpoints ?? []), brandingFaviconEndpoint]
    }

    return config
  }
