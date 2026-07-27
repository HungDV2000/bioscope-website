import type { NextRequest } from 'next/server'
import { getCatalogPage, type CatalogFilters } from '@/lib/cms/catalog'
import { getLocale } from '@/lib/i18n/server'

/**
 * GET /api/catalog — một trang thẻ nguyên liệu, lọc + phân trang ở server.
 * Client (Catalog) gọi route này mỗi khi đổi bộ lọc/trang; secret & URL nội bộ
 * CMS nằm ở server, không lộ ra trình duyệt.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const page = Math.max(1, Number(sp.get('page') ?? '1') || 1)
  const list = (k: string) => sp.getAll(k).filter(Boolean)

  const filters: CatalogFilters = {
    q: sp.get('q') ?? undefined,
    primary: sp.get('primary') ?? undefined,
    origin: sp.get('origin') ?? undefined,
    group: sp.get('group') ?? undefined,
    primaries: list('primaries'),
    functions: list('functions'),
    natures: list('natures'),
    forms: list('forms'),
    properties: list('properties'),
    industries: list('industries'),
    origins: list('origins'),
  }

  const locale = await getLocale()
  const data = await getCatalogPage(locale, filters, page)
  if (!data) return Response.json({ ok: false, cards: [], total: 0, totalPages: 1, page }, { status: 200 })
  return Response.json({ ok: true, ...data })
}
