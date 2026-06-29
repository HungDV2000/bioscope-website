import type { WidgetServerProps } from 'payload'

import { fillDaysInRange, rangeToDate } from '../constants.js'

const collectionLabel = (
  slug: string,
  req: WidgetServerProps['req'],
): string => {
  const col = req.payload.config.collections?.find((c) => c.slug === slug)
  const plural = col?.labels?.plural
  if (typeof plural === 'string') return plural
  if (plural && typeof plural === 'object') {
    return String(plural.vi ?? plural.en ?? slug)
  }
  return slug
}

export default async function AnalyticsChartWidget({
  req,
  widgetData,
}: WidgetServerProps) {
  const locale = req.locale === 'en' ? 'en' : 'vi'
  const data = (widgetData ?? {}) as { range?: string; collection?: string }
  const range = data.range ?? '30d'
  const collection = data.collection ?? 'posts'
  const since = rangeToDate(range)

  const known = (req.payload.config.collections ?? []).some((c) => c.slug === collection)
  let buckets: { label: string; count: number }[] = []

  if (known) {
    try {
      const result = await req.payload.find({
        collection: collection as never,
        where: { createdAt: { greater_than_equal: since.toISOString() } },
        limit: 500,
        depth: 0,
        pagination: false,
      })
      buckets = fillDaysInRange(
        since,
        result.docs.map((d) => String((d as { createdAt?: string }).createdAt ?? '')),
      )
    } catch {
      buckets = fillDaysInRange(since, [])
    }
  }

  const max = Math.max(1, ...buckets.map((b) => b.count))
  const title = locale === 'vi' ? 'Tạo mới theo ngày' : 'New per day'
  const label = collectionLabel(collection, req)
  const subtitle =
    locale === 'vi'
      ? `${label} · ${range.replace('d', ' ngày')}`
      : `${label} · ${range}`

  return (
    <div className="card dv-dashboard-chart">
      <div className="dv-dashboard-chart__header">
        <h3 className="dv-dashboard-chart__title">{title}</h3>
        <p className="dv-dashboard-chart__subtitle">{subtitle}</p>
      </div>
      {buckets.length === 0 ? (
        <p className="dv-dashboard-empty">
          {locale === 'vi' ? 'Không có dữ liệu trong khoảng thời gian này.' : 'No data in this period.'}
        </p>
      ) : (
        <div className="dv-dashboard-chart__plot">
          <div className="dv-dashboard-chart__bars" role="img" aria-label={title}>
            {buckets.map((b, i) => (
              <div key={b.label} className="dv-dashboard-chart__bar-col">
                <div
                  className={`dv-dashboard-chart__bar${b.count === 0 ? ' dv-dashboard-chart__bar--zero' : ''}`}
                  style={{
                    height: `${Math.max(b.count > 0 ? 8 : 2, (b.count / max) * 100)}px`,
                  }}
                  title={`${b.label}: ${b.count}`}
                />
                {i % 5 === 0 || i === buckets.length - 1 ? (
                  <span className="dv-dashboard-chart__label">{b.label.slice(5)}</span>
                ) : (
                  <span className="dv-dashboard-chart__label dv-dashboard-chart__label--empty" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export { AnalyticsChartWidget }
