/** 16 shortcut cards mặc định trên dashboard Bioscope. */
export const DEFAULT_DASHBOARD_SHORTCUTS = [
  'pages',
  'posts',
  'media',
  'ingredients',
  'case-studies',
  'faqs',
  'services',
  'technologies',
  'certifications',
  'products',
  'partners',
  'forms',
  'categories',
  'ct-definitions',
  'tax-definitions',
  'staff-roles',
] as const

export const RANGE_OPTIONS = [
  { label: '7 ngày', value: '7d' },
  { label: '30 ngày', value: '30d' },
  { label: '90 ngày', value: '90d' },
  { label: '365 ngày', value: '365d' },
] as const

export type DashboardRange = (typeof RANGE_OPTIONS)[number]['value']

export const rangeToDate = (range: string): Date => {
  const days = parseInt(range.replace('d', ''), 10) || 30
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(0, 0, 0, 0)
  return d
}

/** Điền đủ từng ngày trong khoảng (ngày không có dữ liệu = 0). */
export const fillDaysInRange = (
  since: Date,
  dates: string[],
): { label: string; count: number }[] => {
  const map = new Map<string, number>()
  for (const iso of dates) {
    const d = iso.slice(0, 10)
    map.set(d, (map.get(d) ?? 0) + 1)
  }

  const out: { label: string; count: number }[] = []
  const cur = new Date(since)
  const end = new Date()
  cur.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)

  while (cur <= end) {
    const key = cur.toISOString().slice(0, 10)
    out.push({ label: key, count: map.get(key) ?? 0 })
    cur.setDate(cur.getDate() + 1)
  }

  return out
}
