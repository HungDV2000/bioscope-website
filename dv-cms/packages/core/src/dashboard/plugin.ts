import type { Config, Plugin, Widget } from 'payload'

import { defaultDashboardLayout } from './defaultLayout.js'
import { dvDashboardWidgets } from './widgets-config.js'

export type DashboardPluginOptions = {
  enabled?: boolean
  /** Client seed card — path tới component trong app (vd. /components/SeedButton#SeedButton). */
  seedComponent?: string
  /** Client CMS sync panel — path tới component (vd. /components/CmsSyncPanel#CmsSyncPanel). */
  cmsSyncComponent?: string
  /** Client AI Generate panel — path tới component. */
  aiGenerateComponent?: string
}

/**
 * Modular dashboard (Payload 3.85+): widgets, defaultLayout cho reset bố cục,
 * thống kê và shortcut cards.
 */
export const dashboardPlugin =
  (options: DashboardPluginOptions = {}): Plugin =>
  (incoming: Config): Config => {
    if (options.enabled === false) return incoming

    const widgets: Widget[] = [...dvDashboardWidgets]

    if (options.seedComponent) {
      widgets.push({
        slug: 'dv-seed',
        Component: options.seedComponent,
        minWidth: 'medium',
        maxWidth: 'full',
      })
    }

    if (options.cmsSyncComponent) {
      widgets.push({
        slug: 'dv-cms-sync',
        Component: options.cmsSyncComponent,
        minWidth: 'medium',
        maxWidth: 'full',
      })
    }

    if (options.aiGenerateComponent) {
      widgets.push({
        slug: 'dv-ai-generate',
        Component: options.aiGenerateComponent,
        minWidth: 'medium',
        maxWidth: 'full',
      })
    }

    const config = { ...incoming }
    const admin = { ...(config.admin ?? {}) }

    admin.dashboard = {
      ...(admin.dashboard ?? {}),
      defaultLayout: (args) => {
        const layout = defaultDashboardLayout(args)
        return layout.filter((w) => {
          const slug = w.widgetSlug as string
          if (slug === 'collections') return false
          if (!options.seedComponent && slug === 'dv-seed') return false
          if (!options.cmsSyncComponent && slug === 'dv-cms-sync') return false
          if (!options.aiGenerateComponent && slug === 'dv-ai-generate') return false
          return true
        })
      },
      widgets: [...(admin.dashboard?.widgets ?? []), ...widgets],
    }

    config.admin = admin
    return config
  }
