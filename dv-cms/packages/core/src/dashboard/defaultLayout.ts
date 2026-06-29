import type { PayloadRequest, WidgetInstance } from 'payload'

import { DEFAULT_DASHBOARD_SHORTCUTS } from './constants.js'

/** Layout mặc định — dùng khi reset bố cục dashboard. */
export const defaultDashboardLayout = ({ req }: { req: PayloadRequest }): WidgetInstance[] => {
  const collections = (req.payload.config.collections ?? [])
    .filter((c) => !c.slug.startsWith('payload-') && c.admin?.hidden !== true)
    .map((c) => c.slug)

  const statsCollections = ['posts', 'pages', 'ingredients', 'form-submissions'].filter((s) =>
    collections.includes(s),
  )

  const chartCollections = ['posts', 'pages'].filter((s) => collections.includes(s))
  if (chartCollections.length === 0 && collections[0]) {
    chartCollections.push(collections[0])
  }

  const layout: WidgetInstance[] = [
    { widgetSlug: 'dv-welcome', width: 'full' },
    ...chartCollections.map(
      (collection) =>
        ({
          widgetSlug: 'dv-analytics',
          width: 'full',
          data: { range: '30d', collection },
        }) as WidgetInstance,
    ),
    {
      widgetSlug: 'dv-stats',
      width: 'full',
      data: {
        range: '30d',
        collections: statsCollections.length ? statsCollections : ['posts', 'pages'],
      },
    },
    {
      widgetSlug: 'dv-shortcuts',
      width: 'full',
      data: { slugs: [...DEFAULT_DASHBOARD_SHORTCUTS].filter((s) => collections.includes(s)) },
    },
    { widgetSlug: 'dv-seed', width: 'full' },
  ]

  return layout
}
