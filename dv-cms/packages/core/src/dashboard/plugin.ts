import type { Config, Plugin, Widget } from 'payload'

import { defaultDashboardLayout } from './defaultLayout.js'
import { dvDashboardWidgets } from './widgets-config.js'

export type DashboardPluginOptions = {
  enabled?: boolean
  /** Client seed card — path tới component trong app (vd. /components/SeedButton#SeedButton). */
  seedComponent?: string
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
          return true
        })
      },
      widgets: [...(admin.dashboard?.widgets ?? []), ...widgets],
    }

    config.admin = admin
    return config
  }
