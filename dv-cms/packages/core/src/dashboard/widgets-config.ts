import type { Widget } from 'payload'

import { RANGE_OPTIONS } from './constants.js'

const W = '@dv/cms-core/dashboard'

export const dvDashboardWidgets: Widget[] = [
  {
    slug: 'dv-welcome',
    Component: `${W}#WelcomeWidget`,
    minWidth: 'medium',
    maxWidth: 'full',
  },
  {
    slug: 'dv-shortcuts',
    Component: `${W}#ShortcutsWidget`,
    minWidth: 'medium',
    maxWidth: 'full',
    fields: [
      {
        name: 'slugs',
        type: 'text',
        hasMany: true,
        admin: {
          description: 'Danh sách slug collection hiển thị (để trống = 16 mặc định).',
        },
      },
    ],
  },
  {
    slug: 'dv-stats',
    Component: `${W}#StatsOverviewWidget`,
    minWidth: 'small',
    maxWidth: 'full',
    fields: [
      {
        name: 'range',
        type: 'select',
        defaultValue: '30d',
        options: RANGE_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
      },
      {
        name: 'collections',
        type: 'text',
        hasMany: true,
        admin: { description: 'Slug collections cần đếm (vd: posts, pages, ingredients).' },
      },
    ],
  },
  {
    slug: 'dv-analytics',
    Component: `${W}#AnalyticsChartWidget`,
    minWidth: 'medium',
    maxWidth: 'full',
    fields: [
      {
        name: 'range',
        type: 'select',
        defaultValue: '30d',
        options: RANGE_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
      },
      {
        name: 'collection',
        type: 'text',
        admin: { description: 'Collection slug để vẽ biểu đồ theo ngày tạo.' },
      },
    ],
  },
]
