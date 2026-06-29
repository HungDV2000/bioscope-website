import type { CollectionConfig, WidgetServerProps } from 'payload'

import { DEFAULT_DASHBOARD_SHORTCUTS } from '../constants.js'

const labelOf = (col: CollectionConfig): string => {
  const plural = col.labels?.plural
  if (typeof plural === 'string') return plural
  if (plural && typeof plural === 'object') {
    return String(plural.vi ?? plural.en ?? col.slug)
  }
  return col.slug
}

export default async function ShortcutsWidget({ req, widgetData }: WidgetServerProps) {
  const adminRoute = req.payload.config.routes.admin
  const data = (widgetData ?? {}) as { slugs?: string[] | null }
  const configured = data.slugs?.filter(Boolean)
  const slugs =
    configured && configured.length > 0 ? configured : [...DEFAULT_DASHBOARD_SHORTCUTS]

  const bySlug = new Map(
    (req.payload.config.collections ?? []).map((c) => [c.slug, c] as const),
  )

  const items = slugs
    .map((slug: string) => {
      const col = bySlug.get(slug)
      if (!col || col.admin?.hidden) return null
      return { slug, label: labelOf(col) }
    })
    .filter(Boolean) as { slug: string; label: string }[]

  const locale = req.locale === 'en' ? 'en' : 'vi'
  const title = locale === 'vi' ? 'Truy cập nhanh' : 'Quick access'
  const hint =
    locale === 'vi'
      ? 'Chỉnh danh sách trong menu ⋮ → Chỉnh sửa Bảng điều khiển'
      : 'Customize via ⋮ → Edit Dashboard'

  return (
    <div className="card dv-dashboard-shortcuts">
      <header className="dv-dashboard-shortcuts__header">
        <h3 className="dv-dashboard-shortcuts__title">{title}</h3>
        <p className="dv-dashboard-shortcuts__hint">{hint}</p>
      </header>
      <nav className="dv-dashboard-shortcuts__grid" aria-label={title}>
        {items.map((item) => (
          <a
            key={item.slug}
            className="dv-dashboard-shortcuts__link"
            href={`${adminRoute}/collections/${item.slug}`}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  )
}

export { ShortcutsWidget }
