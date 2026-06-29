import type { WidgetServerProps } from 'payload'

import { rangeToDate } from '../constants.js'

export default async function StatsOverviewWidget({ req, widgetData }: WidgetServerProps) {
  const locale = req.locale === 'en' ? 'en' : 'vi'
  const data = (widgetData ?? {}) as { range?: string; collections?: string[] | null }
  const range = data.range ?? '30d'
  const since = rangeToDate(range)
  const slugs = (data.collections?.filter(Boolean) ?? ['posts', 'pages', 'ingredients']).slice(0, 8)

  const known = new Set((req.payload.config.collections ?? []).map((c) => c.slug))
  const targets = slugs.filter((s: string) => known.has(s))

  const counts = await Promise.all(
    targets.map(async (slug: string) => {
      try {
        const total = await req.payload.count({ collection: slug as never })
        const recent = await req.payload.count({
          collection: slug as never,
          where: { createdAt: { greater_than_equal: since.toISOString() } },
        })
        const col = req.payload.config.collections?.find((c) => c.slug === slug)
        const plural = col?.labels?.plural
        const label =
          typeof plural === 'string'
            ? plural
            : plural && typeof plural === 'object'
              ? String(plural.vi ?? plural.en ?? slug)
              : slug
        return { slug, label, total: total.totalDocs, recent: recent.totalDocs }
      } catch {
        return null
      }
    }),
  )

  const rows = counts.filter(Boolean) as {
    slug: string
    label: string
    total: number
    recent: number
  }[]

  const title = locale === 'vi' ? 'Thống kê nội dung' : 'Content statistics'
  const rangeLabel =
    locale === 'vi' ? `${range.replace('d', ' ngày')} qua` : `Last ${range}`
  const newLabel = locale === 'vi' ? 'mới' : 'new'

  return (
    <div className="card dv-dashboard-stats">
      <header className="dv-dashboard-stats__header">
        <h3 className="dv-dashboard-stats__title">{title}</h3>
        <p className="dv-dashboard-stats__range">{rangeLabel}</p>
      </header>
      {rows.length === 0 ? (
        <p className="dv-dashboard-empty">
          {locale === 'vi' ? 'Chưa có collection hợp lệ.' : 'No valid collections.'}
        </p>
      ) : (
        <div className="dv-dashboard-stats__grid">
          {rows.map((row) => (
            <div key={row.slug} className="dv-dashboard-stats__card">
              <span className="dv-dashboard-stats__card-label">{row.label}</span>
              <span className="dv-dashboard-stats__card-total">{row.total}</span>
              <span className="dv-dashboard-stats__card-new">
                +{row.recent} {newLabel}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export { StatsOverviewWidget }
