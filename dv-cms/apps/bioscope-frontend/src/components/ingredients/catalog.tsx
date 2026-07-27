'use client'

import { Children, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Search, ArrowUpRight, SlidersHorizontal, X, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import { ingredientForm, parseMoqKg, type Ingredient } from '@/lib/content'
import { useLocale } from '@/lib/i18n/context'
import { ingredientImg } from '@/lib/images'
import { pickDefaultImages, seededRandom } from '@/lib/default-images'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 9

// Thứ tự tab danh mục chính (khớp `order` khi seed facet, cả vi lẫn en) — dữ
// liệu gửi lên chỉ có TÊN thẻ nên không mang theo `order`; giữ danh sách này để
// tab luôn hiện đúng thứ tự chủ đích thay vì xếp theo abc. Tên lạ đẩy xuống cuối.
const PRIMARY_ORDER = [
  'Chiết xuất thực vật', 'Botanical extract',
  'Omega & dầu cá', 'Omega & fish oil',
  'Lợi khuẩn', 'Probiotics',
  'Hoạt chất công nghệ cao', 'High-tech actives',
  'Nguyên liệu mới', 'New ingredients',
]
const orderPrimaries = (names: string[]) =>
  [...names].sort((a, b) => {
    const ia = PRIMARY_ORDER.indexOf(a)
    const ib = PRIMARY_ORDER.indexOf(b)
    if (ia === -1 && ib === -1) return a.localeCompare(b, 'vi')
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
  })

const TAG_STYLE: Record<string, string> = {
  NEW: 'bg-accent-soft text-accent',
  TRENDING: 'bg-primary-tint text-primary-dark',
  EXCLUSIVE: 'bg-ink text-white',
}

type MoqFilter = 'any' | '10' | '25'

type AdvancedFilters = {
  // Danh mục chính — nhóm lọc cấp cao nhất, dùng cho card trang chủ.
  primaries: string[]
  // Thẻ lọc từ CMS — nhóm chính xác nhất vì do biên tập viên/AI gán có chủ đích.
  functions: string[]
  natures: string[]
  properties: string[]
  industries: string[]
  categories: string[]
  origins: string[]
  certs: string[]
  tags: string[]
  forms: string[]
  applications: string[]
  moq: MoqFilter
}

const EMPTY_ADVANCED: AdvancedFilters = {
  primaries: [],
  functions: [],
  natures: [],
  properties: [],
  industries: [],
  categories: [],
  origins: [],
  certs: [],
  tags: [],
  forms: [],
  applications: [],
  moq: 'any',
}

function countAdvanced(f: AdvancedFilters) {
  return (
    f.primaries.length +
    f.functions.length +
    f.natures.length +
    f.properties.length +
    f.industries.length +
    f.categories.length +
    f.origins.length +
    f.certs.length +
    f.tags.length +
    f.forms.length +
    f.applications.length +
    (f.moq !== 'any' ? 1 : 0)
  )
}

/** Chọn nhiều thẻ trong CÙNG một nhóm = OR (mở rộng kết quả), giữa các nhóm = AND. */
const matchesFacet = (selected: string[], owned: string[] | undefined) =>
  !selected.length || selected.some((s) => (owned ?? []).includes(s))

function matchesAdvanced(it: Ingredient, f: AdvancedFilters) {
  if (!matchesFacet(f.primaries, it.facets?.primaries)) return false
  if (!matchesFacet(f.functions, it.facets?.functions)) return false
  if (!matchesFacet(f.natures, it.facets?.natures)) return false
  if (!matchesFacet(f.properties, it.facets?.properties)) return false
  if (f.industries.length && !f.industries.includes(it.industry)) return false
  if (f.categories.length && !f.categories.includes(it.category)) return false
  if (f.origins.length && !f.origins.includes(it.origin)) return false
  if (f.certs.length && !f.certs.every((c) => it.badges.some((b) => b.toLowerCase().includes(c.toLowerCase())))) {
    return false
  }
  if (f.tags.length && (!it.tag || !f.tags.includes(it.tag))) return false
  // Dạng bào chế: ưu tiên thẻ CMS; nguyên liệu chưa gán thẻ thì lùi về suy từ
  // specs "Dạng" như trước, để bộ lọc không bỏ sót dữ liệu cũ.
  if (f.forms.length) {
    const owned = it.facets?.forms?.length ? it.facets.forms : [ingredientForm(it)].filter(Boolean)
    if (!f.forms.some((x) => owned.includes(x))) return false
  }
  if (
    f.applications.length &&
    !f.applications.some((app) => it.applications.some((a) => a.includes(app) || app.includes(a)))
  ) {
    return false
  }
  if (f.moq !== 'any') {
    const kg = parseMoqKg(it.moq)
    if (kg === null) return false
    if (f.moq === '10' && kg > 10) return false
    if (f.moq === '25' && kg > 25) return false
  }
  return true
}

export function Catalog({ items, imageSeed }: { items: Ingredient[]; imageSeed: number }) {
  const { content, t } = useLocale()
  const cat = t.ingredientsCatalog
  const { INDUSTRIES, CERT_FILTERS, INGREDIENT_TAGS, INGREDIENT_CATEGORIES, ORIGINS, PRODUCT_FORMS, APPLICATION_TYPES } =
    content

  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [cloudOpen, setCloudOpen] = useState(false)
  const [advancedDraft, setAdvancedDraft] = useState<AdvancedFilters>(EMPTY_ADVANCED)
  const [advancedApplied, setAdvancedApplied] = useState<AdvancedFilters>(EMPTY_ADVANCED)

  // Tab danh mục chính, select xuất xứ và select nhóm (công dụng) đều là bộ lọc
  // NHANH đơn-chọn, ghi thẳng vào advancedApplied để chỉ có MỘT nguồn sự thật —
  // modal nâng cao và tag cloud vẫn đọc/ghi cùng các mảng này.
  const setPrimary = (v: string | null) =>
    setAdvancedApplied((p) => ({ ...p, primaries: v ? [v] : [] }))
  const setOrigin = (v: string | null) =>
    setAdvancedApplied((p) => ({ ...p, origins: v ? [v] : [] }))
  const setGroup = (v: string | null) =>
    setAdvancedApplied((p) => ({ ...p, functions: v ? [v] : [] }))
  // Tab chỉ sáng khi đúng một danh mục chính đang chọn (chọn nhiều qua tag cloud
  // thì không tab nào sáng — vẫn đúng vì đó là trạng thái đa lựa chọn).
  const activePrimary = advancedApplied.primaries.length === 1 ? advancedApplied.primaries[0] : null
  const activeOrigin = advancedApplied.origins.length === 1 ? advancedApplied.origins[0] : null
  const activeGroup = advancedApplied.functions.length === 1 ? advancedApplied.functions[0] : null

  // Card danh mục ở trang chủ link sang /nguyen-lieu?primary=<tên>. Áp ngay khi
  // mount để người dùng thấy đúng danh mục mình vừa bấm.
  const searchParams = useSearchParams()
  useEffect(() => {
    const p = searchParams.get('primary')
    if (!p) return
    setAdvancedApplied((prev) => (prev.primaries.includes(p) ? prev : { ...EMPTY_ADVANCED, primaries: [p] }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  /** Bật/tắt một danh mục chính hoặc công dụng từ tag cloud (áp lọc ngay). */
  const toggleCloud = (group: 'primaries' | 'functions', value: string) => {
    setAdvancedApplied((prev) => {
      const has = prev[group].includes(value)
      return { ...prev, [group]: has ? prev[group].filter((v) => v !== value) : [...prev[group], value] }
    })
  }

  // Filter options derived from the actual items so every chip maps to ≥1 result
  // (keeps the static ordering, drops dead options, surfaces CMS-only values).
  const facets = useMemo(() => {
    const uniq = (vals: (string | undefined)[]) => [...new Set(vals.filter((v): v is string => Boolean(v)))]
    const ordered = (present: string[], order: readonly string[]) => [
      ...order.filter((v) => present.includes(v)),
      ...present.filter((v) => !order.includes(v)),
    ]
    // Thẻ lọc CMS: gom từ chính dữ liệu nên chip nào cũng ra ≥1 kết quả, và
    // thẻ mới biên tập viên thêm trong admin tự xuất hiện, không cần sửa code.
    const fromFacets = (key: 'primaries' | 'functions' | 'natures' | 'forms' | 'properties') =>
      [...new Set(items.flatMap((it) => it.facets?.[key] ?? []))].sort((a, b) => a.localeCompare(b, 'vi'))

    return {
      primaries: fromFacets('primaries'),
      functions: fromFacets('functions'),
      natures: fromFacets('natures'),
      properties: fromFacets('properties'),
      industries: ordered(uniq(items.map((it) => it.industry)), INDUSTRIES),
      categories: ordered(uniq(items.map((it) => it.category)), INGREDIENT_CATEGORIES),
      origins: ordered(uniq(items.map((it) => it.origin)), ORIGINS),
      forms: ordered(
        uniq([...items.flatMap((it) => it.facets?.forms ?? []), ...items.map((it) => ingredientForm(it))]),
        PRODUCT_FORMS,
      ),
      tags: INGREDIENT_TAGS.filter((tg) => items.some((it) => it.tag === tg)),
      certs: CERT_FILTERS.filter((c) => items.some((it) => it.badges.some((b) => b.toLowerCase().includes(c.toLowerCase())))),
      applications: APPLICATION_TYPES.filter((app) =>
        items.some((it) => it.applications.some((a) => a.includes(app) || app.includes(a))),
      ),
    }
  }, [items, INDUSTRIES, INGREDIENT_CATEGORIES, ORIGINS, PRODUCT_FORMS, INGREDIENT_TAGS, CERT_FILTERS, APPLICATION_TYPES])

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    const bump = (k: string) => (c[k] = (c[k] ?? 0) + 1)
    for (const it of items) {
      for (const g of ['primaries', 'functions', 'natures', 'forms', 'properties'] as const)
        for (const v of it.facets?.[g] ?? []) bump(v)
      it.badges.forEach(bump)
      if (it.industry) bump(it.industry)
      if (it.origin) bump(it.origin)
    }
    return c
  }, [items])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return items.filter((it) => {
      if (!matchesAdvanced(it, advancedApplied)) return false
      if (
        term &&
        !`${it.name} ${it.category} ${it.shortDesc} ${it.benefits.join(' ')} ${it.origin}`.toLowerCase().includes(term)
      ) {
        return false
      }
      return true
    })
  }, [items, q, advancedApplied])

  // Reset to page 1 when the active filters change (render-time, not an effect).
  const filterKey = `${q}|${JSON.stringify(advancedApplied)}`
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey)
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey)
    setPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  // `safePage` clamps a stale-high page without needing a sync effect.
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const advancedCount = countAdvanced(advancedApplied)
  // Tab danh mục chính theo thứ tự chủ đích; tag cloud chỉ mở khi có dữ liệu thẻ.
  const orderedPrimaries = useMemo(() => orderPrimaries(facets.primaries), [facets.primaries])
  const cloudHasData = facets.primaries.length > 0 || facets.functions.length > 0

  // Default imagery for cards with no featured image in the CMS, resolved to a
  // slug -> src map so rendering stays pure (no counter mutated mid-render).
  //
  // `imageSeed` comes from the server (this route is dynamic — `getLocale()`
  // reads cookies — so it is regenerated on every request, i.e. every refresh).
  // Seeding on the server rather than after mount means the markup React
  // hydrates already has the final image, so there is no swap on load and no
  // second round of image downloads.
  //
  // Offsetting by `safePage` gives each page its own assignment while keeping it
  // stable as the user pages back and forth without refreshing.
  const defaultImageBySlug = useMemo(() => {
    const needsDefault = paginated.filter((it) => !it.imageSrc)
    const pool = pickDefaultImages(needsDefault.length, seededRandom(imageSeed + safePage))
    return new Map<string, string>(needsDefault.map((it, i) => [it.slug, pool[i].src]))
  }, [paginated, imageSeed, safePage])

  const openAdvanced = () => {
    setAdvancedDraft(advancedApplied)
    setAdvancedOpen(true)
  }

  const applyAdvanced = () => {
    setAdvancedApplied(advancedDraft)
    setAdvancedOpen(false)
  }

  // Xoá SẠCH mọi bộ lọc: ô tìm kiếm + tab danh mục + 2 select + chip nâng cao
  // (tất cả tab/select đều ghi vào advancedApplied). Dùng cho nút "Xoá bộ lọc"
  // ở toolbar lẫn "Đặt lại" trong popup — xoá tức thì để catalog cập nhật ngay.
  const clearAll = () => {
    setQ('')
    setAdvancedDraft(EMPTY_ADVANCED)
    setAdvancedApplied(EMPTY_ADVANCED)
  }
  const hasAnyFilter = q.trim().length > 0 || advancedCount > 0

  return (
    <>
      <section className="bg-white pb-24 pt-16">
        <div className="container-bs">
          {/* Toolbar */}
          <div className="flex flex-col gap-4 rounded-[2rem] border border-primary-border/60 bg-mist/50 p-5 sm:p-6">
            {/* Hàng 1: tab danh mục chính + nút Xem thêm (mở tag cloud) */}
            <div className="flex flex-wrap items-center gap-2">
              <Filter label={cat.allPrimaries} active={activePrimary === null} onClick={() => setPrimary(null)} />
              {orderedPrimaries.map((p) => (
                <Filter
                  key={p}
                  label={p}
                  active={activePrimary === p}
                  onClick={() => setPrimary(activePrimary === p ? null : p)}
                />
              ))}
              <div className="ml-auto flex items-center gap-2">
                {hasAnyFilter && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent-soft px-3.5 py-2 text-[13px] font-semibold text-accent transition-colors hover:border-accent"
                  >
                    <X className="h-3.5 w-3.5" />
                    {cat.clearFilters}
                  </button>
                )}
                {cloudHasData && (
                  <button
                    type="button"
                    onClick={() => setCloudOpen(true)}
                    className="inline-flex items-center gap-1 rounded-full border border-primary-border bg-white px-3.5 py-2 text-[13px] font-semibold text-primary transition-colors hover:border-primary/40"
                  >
                    {cat.showMore}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Hàng 2: tìm kiếm + select xuất xứ + select nhóm + nút nâng cao */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={cat.searchPlaceholder}
                  className="w-full rounded-full border border-primary-border bg-white py-3 pl-11 pr-4 text-[14.5px] outline-none transition-colors focus:border-primary/50"
                />
              </div>
              <SelectFilter
                label={cat.allOrigins}
                value={activeOrigin}
                options={facets.origins}
                onChange={setOrigin}
              />
              <div className="flex gap-2">
                <SelectFilter
                  label={cat.allGroups}
                  value={activeGroup}
                  options={facets.functions}
                  onChange={setGroup}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={openAdvanced}
                  aria-label={cat.advancedSearch}
                  title={cat.advancedSearch}
                  className={cn(
                    'relative grid h-12 w-12 shrink-0 place-items-center rounded-full border transition-colors duration-300',
                    advancedCount > 0
                      ? 'border-primary bg-primary text-white'
                      : 'border-primary-border bg-white text-ink/50 hover:border-primary/40 hover:text-primary',
                  )}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {advancedCount > 0 && (
                    <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                      {advancedCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-[13.5px]">
              <span className="inline-flex items-baseline gap-1 rounded-full bg-primary-tint px-3 py-1 font-semibold text-primary-dark">
                <span className="text-[15px] font-bold">{filtered.length.toLocaleString('vi-VN')}</span>
                {cat.ingredientsUnit}
              </span>
              {filtered.length > PAGE_SIZE && (
                <span className="text-ink/45">
                  {cat.pageOf} <span className="font-semibold text-ink/70">{safePage}</span>/{totalPages}
                </span>
              )}
            </div>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {paginated.map((it) => (
              <Link
                key={it.slug}
                href={`/nguyen-lieu/${it.slug}`}
                className="group flex flex-col overflow-hidden rounded-[1.75rem] border border-primary-border/60 bg-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:shadow-card"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-mist">
                  <Image
                    src={it.imageSrc ? ingredientImg(it, 600) : defaultImageBySlug.get(it.slug)!}
                    alt={it.name}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 360px"
                    className={cn(
                      // Full-bleed cover so the image fills the whole card frame.
                      'object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105',
                    )}
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-primary-dark backdrop-blur-sm">
                    {it.category}
                  </span>
                  {it.tag && (
                    <span
                      className={cn(
                        'absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide',
                        TAG_STYLE[it.tag],
                      )}
                    >
                      {cat.tags[it.tag] ?? it.tag}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  {/* Tên nguyên liệu hay rất dài ("019.001 Chiết xuất cúc la mã/
                      Cúc đức - Camomile Flower CO2-to extract - Đức") và đẩy thẻ
                      cao lên; chặn 2 dòng để các thẻ đều nhau. */}
                  <h3 className="line-clamp-2 text-[16.5px] font-bold leading-snug text-ink">{it.name}</h3>
                  {/* Mô tả ngắn lấy từ `subtitle` trong CMS. Nhiều bản ghi cũ
                      chưa có — bỏ hẳn thẻ <p> thay vì để nó chiếm chỗ rỗng. */}
                  {it.shortDesc && (
                    <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-ink/60">
                      {it.shortDesc}
                    </p>
                  )}
                  {/* Đẩy phần chân xuống đáy để nút "Xem chi tiết" thẳng hàng
                      giữa các thẻ cùng dòng, dù nội dung dài ngắn khác nhau. */}
                  <div className="flex-1" />
                  {/* Hầu hết bản ghi chưa nhập MOQ, và ~29% chưa có xuất xứ —
                      hiện nhãn trống chỉ tổ chiếm một dòng vô nghĩa. */}
                  {(it.origin || it.moq) && (
                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-primary-border/50 pt-3 text-[12.5px] text-ink/55">
                      {it.origin ? <span>{cat.originLabel}: {it.origin}</span> : <span />}
                      {it.moq && <span>MOQ {it.moq}</span>}
                    </div>
                  )}
                  <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-primary">
                    {cat.viewDetails}
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="mt-12 text-center text-[15px] text-ink/50">{cat.tryClearFilters}</p>
          )}

          {filtered.length > PAGE_SIZE && (
            <Pagination page={safePage} totalPages={totalPages} onPage={setPage} />
          )}
        </div>
      </section>

      {advancedOpen && (
        <AdvancedSearchModal
          facets={facets}
          counts={counts}
          draft={advancedDraft}
          onChange={setAdvancedDraft}
          onClose={() => setAdvancedOpen(false)}
          onApply={applyAdvanced}
          onReset={clearAll}
        />
      )}

      {cloudOpen && (
        <TagCloudModal items={items} applied={advancedApplied} onToggle={toggleCloud} onClose={() => setCloudOpen(false)} />
      )}
    </>
  )
}

/** Select gọn kiểu pill cho bộ lọc nhanh (xuất xứ, nhóm). value=null → hiện label mặc định. */
function SelectFilter({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string
  value: string | null
  options: string[]
  onChange: (v: string | null) => void
  className?: string
}) {
  const active = value !== null
  return (
    <div className={cn('relative', className)}>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className={cn(
          'h-12 w-full min-w-[9rem] appearance-none rounded-full border bg-white py-2 pl-4 pr-9 text-[14px] outline-none transition-colors focus:border-primary/50',
          active ? 'border-primary font-semibold text-primary-dark' : 'border-primary-border text-ink/65',
        )}
      >
        <option value="">{label}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
    </div>
  )
}

/** Popup "Xem thêm": tag cloud cách điệu (nhiều nguyên liệu = to hơn), bấm để lọc. */
function TagCloudModal({
  items,
  applied,
  onToggle,
  onClose,
}: {
  items: Ingredient[]
  applied: AdvancedFilters
  onToggle: (group: 'primaries' | 'functions', value: string) => void
  onClose: () => void
}) {
  const { t } = useLocale()
  const cat = t.ingredientsCatalog
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button type="button" aria-label={cat.close} className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[min(90vh,640px)] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-primary-border/60 bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-primary-border/50 px-6 py-5">
          <div>
            <h2 className="text-[1.25rem] font-bold text-ink">{cat.cloudTitle}</h2>
            <p className="mt-1 text-[13.5px] text-ink/55">{cat.cloudDesc}</p>
          </div>
          <button
            type="button"
            aria-label={cat.close}
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-primary-border text-ink/45 hover:text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-8">
          {/* Bấm một thẻ = áp dụng lọc và đóng popup luôn (không cần nút Áp dụng). */}
          <TagCloud
            items={items}
            applied={applied}
            onToggle={(g, v) => {
              onToggle(g, v)
              onClose()
            }}
            centered
          />
        </div>
      </div>
    </div>
  )
}

function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number
  totalPages: number
  onPage: (p: number) => void
}) {
  const { t } = useLocale()
  const cat = t.ingredientsCatalog
  const pages = pageWindow(page, totalPages)

  return (
    <nav aria-label={cat.pagination} className="mt-12 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        aria-label={cat.prevPage}
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="grid h-10 w-10 place-items-center rounded-full border border-primary-border bg-white text-ink/45 transition-colors hover:text-primary disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="grid h-10 w-8 place-items-center text-ink/35">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            aria-current={p === page ? 'page' : undefined}
            onClick={() => onPage(p)}
            className={cn(
              'grid h-10 min-w-10 place-items-center rounded-full px-3 text-[14px] font-semibold transition-colors',
              p === page
                ? 'bg-primary text-white'
                : 'border border-primary-border bg-white text-ink/55 hover:text-primary',
            )}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        aria-label={cat.nextPage}
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        className="grid h-10 w-10 place-items-center rounded-full border border-primary-border bg-white text-ink/45 transition-colors hover:text-primary disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}

/**
 * Compact page list: first + last + a window around the current page, with '…'
 * gaps. e.g. page 130/150 → [1, '…', 129, 130, 131, '…', 150].
 */
function pageWindow(page: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const around = new Set<number>([1, total, page - 1, page, page + 1])
  const nums = [...around].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const out: (number | '…')[] = []
  let prev = 0
  for (const p of nums) {
    if (p - prev > 1) out.push('…')
    out.push(p)
    prev = p
  }
  return out
}

type Facets = {
  primaries: string[]
  functions: string[]
  natures: string[]
  properties: string[]
  industries: string[]
  categories: string[]
  origins: string[]
  forms: string[]
  tags: string[]
  certs: string[]
  applications: string[]
}

/**
 * Đám mây thẻ: danh mục chính + công dụng, cỡ chữ theo số lượng nguyên liệu
 * (nhiều = to). Bấm một thẻ để lọc ngay. Đây là cách khách hàng khám phá nhanh
 * catalog theo cái họ quan tâm nhất.
 */
function TagCloud({
  items,
  applied,
  onToggle,
  centered,
}: {
  items: Ingredient[]
  applied: AdvancedFilters
  onToggle: (group: 'primaries' | 'functions', value: string) => void
  centered?: boolean
}) {
  const clouds = useMemo(() => {
    const count = (key: 'primaries' | 'functions') => {
      const m = new Map<string, number>()
      for (const it of items) for (const v of it.facets?.[key] ?? []) m.set(v, (m.get(v) ?? 0) + 1)
      return [...m.entries()].sort((a, b) => b[1] - a[1])
    }
    return { primaries: count('primaries'), functions: count('functions') }
  }, [items])

  const all = [
    ...clouds.primaries.map(([v, n]) => ({ group: 'primaries' as const, value: v, n })),
    ...clouds.functions.map(([v, n]) => ({ group: 'functions' as const, value: v, n })),
  ]
  if (!all.length) return null

  const max = Math.max(...all.map((x) => x.n))
  const min = Math.min(...all.map((x) => x.n))
  // Nội suy theo căn bậc hai để thẻ ít không quá nhỏ; dải cỡ rộng cho ra dáng
  // "đám mây từ khoá" thật.
  const scale = (n: number) => (max === min ? 0.6 : Math.sqrt((n - min) / (max - min)))
  const base = centered ? 15 : 13
  const range = centered ? 34 : 17

  // Thẻ nhiều nguyên liệu nằm GIỮA, ít dần dạt ra hai đầu (giả lập word cloud):
  // xếp giảm dần theo số lượng rồi xen kẽ đẩy vào giữa mảng.
  const sorted = [...all].sort((a, b) => b.n - a.n)
  const ordered: typeof sorted = []
  sorted.forEach((item, i) => (i % 2 === 0 ? ordered.push(item) : ordered.unshift(item)))
  const list = centered ? ordered : sorted

  // Bảng màu đa dạng (đọc rõ trên nền trắng). Gán theo mã băm của tên thẻ nên
  // ổn định qua mỗi lần render, không nhấp nháy đổi màu.
  const PALETTE = [
    '#7c3aed', '#2563eb', '#059669', '#ea580c', '#db2777', '#0d9488',
    '#dc2626', '#4f46e5', '#d97706', '#0891b2', '#16a34a', '#9333ea',
  ]
  const colorOf = (s: string) =>
    PALETTE[[...s].reduce((h, c) => h + c.charCodeAt(0), 0) % PALETTE.length]

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-5 gap-y-2.5',
        centered ? 'justify-center text-center leading-tight' : 'mb-6 items-baseline gap-x-4',
      )}
    >
      {list.map(({ group, value, n }) => {
        const k = scale(n)
        const active = applied[group].includes(value)
        const size = base + k * range
        const weight = k > 0.6 ? 800 : k > 0.35 ? 700 : k > 0.15 ? 600 : 500
        return (
          <button
            key={`${group}:${value}`}
            type="button"
            onClick={() => onToggle(group, value)}
            title={`${value} · ${n} nguyên liệu`}
            className={cn(
              'leading-none transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110',
              active && 'underline decoration-2 underline-offset-4',
            )}
            style={{ fontSize: `${size}px`, fontWeight: weight, color: colorOf(value) }}
          >
            {value}
          </button>
        )
      })}
    </div>
  )
}

function AdvancedSearchModal({
  facets,
  counts,
  draft,
  onChange,
  onClose,
  onApply,
  onReset,
}: {
  facets: Facets
  counts: Record<string, number>
  draft: AdvancedFilters
  onChange: (f: AdvancedFilters) => void
  onClose: () => void
  onApply: () => void
  onReset: () => void
}) {
  const { t } = useLocale()
  const cat = t.ingredientsCatalog
  const f = cat.filters
  const { industries: INDUSTRIES, certs: CERT_FILTERS, tags: INGREDIENT_TAGS, categories: INGREDIENT_CATEGORIES, origins: ORIGINS, forms: PRODUCT_FORMS, applications: APPLICATION_TYPES } = facets
  const { primaries: PRIMARIES, functions: FUNCTIONS, natures: NATURES, properties: PROPERTIES } = facets

  // Trọng số 0..1 của một chip so với chip phổ biến nhất TRONG cùng danh sách.
  const weightIn = (values: string[]) => {
    const max = Math.max(1, ...values.map((v) => counts[v] ?? 0))
    return (v: string) => (counts[v] ?? 0) / max
  }

  const toggle = <K extends keyof AdvancedFilters>(key: K, value: string) => {
    const list = draft[key] as string[]
    if (!Array.isArray(list)) return
    onChange({
      ...draft,
      [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button type="button" aria-label={cat.close} className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[min(90vh,720px)] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-primary-border/60 bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-primary-border/50 px-6 py-5">
          <div>
            <h2 className="text-[1.25rem] font-bold text-ink">{cat.advancedTitle}</h2>
            <p className="mt-1 text-[13.5px] text-ink/55">{cat.advancedDesc}</p>
          </div>
          <button
            type="button"
            aria-label={cat.close}
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full border border-primary-border text-ink/45 hover:text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          {PRIMARIES.length > 0 && (
            <FilterSection title={cat.filters.primary ?? 'Danh mục chính'}>
              {PRIMARIES.map((v) => (
                <Chip key={v} label={v} active={draft.primaries.includes(v)} onClick={() => toggle('primaries', v)} count={counts[v]} weight={weightIn(PRIMARIES)(v)} />
              ))}
            </FilterSection>
          )}

          {FUNCTIONS.length > 0 && (
            <FilterSection title={cat.filters.function ?? 'Công dụng'}>
              {FUNCTIONS.map((v) => (
                <Chip key={v} label={v} active={draft.functions.includes(v)} onClick={() => toggle('functions', v)} count={counts[v]} weight={weightIn(FUNCTIONS)(v)} />
              ))}
            </FilterSection>
          )}

          {NATURES.length > 0 && (
            <FilterSection title={cat.filters.nature ?? 'Bản chất nguyên liệu'}>
              {NATURES.map((v) => (
                <Chip key={v} label={v} active={draft.natures.includes(v)} onClick={() => toggle('natures', v)} count={counts[v]} weight={weightIn(NATURES)(v)} />
              ))}
            </FilterSection>
          )}

          <FilterSection title={f.industry}>
            {INDUSTRIES.map((v) => (
              <Chip key={v} label={v} active={draft.industries.includes(v)} onClick={() => toggle('industries', v)} count={counts[v]} weight={weightIn(INDUSTRIES)(v)} />
            ))}
          </FilterSection>

          <FilterSection title={f.category}>
            {INGREDIENT_CATEGORIES.map((v) => (
              <Chip key={v} label={v} active={draft.categories.includes(v)} onClick={() => toggle('categories', v)} />
            ))}
          </FilterSection>

          <FilterSection title={f.origin}>
            {ORIGINS.map((v) => (
              <Chip key={v} label={v} active={draft.origins.includes(v)} onClick={() => toggle('origins', v)} count={counts[v]} weight={weightIn(ORIGINS)(v)} />
            ))}
          </FilterSection>

          <FilterSection title={f.form}>
            {PRODUCT_FORMS.map((v) => (
              <Chip key={v} label={v} active={draft.forms.includes(v)} onClick={() => toggle('forms', v)} count={counts[v]} weight={weightIn(PRODUCT_FORMS)(v)} />
            ))}
          </FilterSection>

          <FilterSection title={f.application}>
            {APPLICATION_TYPES.map((v) => (
              <Chip key={v} label={v} active={draft.applications.includes(v)} onClick={() => toggle('applications', v)} />
            ))}
          </FilterSection>

          {PROPERTIES.length > 0 && (
            <FilterSection title={cat.filters.property ?? 'Đặc tính kỹ thuật'}>
              {PROPERTIES.map((v) => (
                <Chip key={v} label={v} active={draft.properties.includes(v)} onClick={() => toggle('properties', v)} count={counts[v]} weight={weightIn(PROPERTIES)(v)} />
              ))}
            </FilterSection>
          )}

          <FilterSection title={f.cert}>
            {CERT_FILTERS.map((v) => (
              <Chip key={v} label={v} active={draft.certs.includes(v)} onClick={() => toggle('certs', v)} count={counts[v]} weight={weightIn(CERT_FILTERS)(v)} />
            ))}
          </FilterSection>

          <FilterSection title={f.tag}>
            {INGREDIENT_TAGS.map((v) => (
              <Chip key={v} label={cat.tags[v] ?? v} active={draft.tags.includes(v)} onClick={() => toggle('tags', v)} />
            ))}
          </FilterSection>

          <div>
            <p className="mb-3 text-[13px] font-bold uppercase tracking-wide text-ink/45">{cat.moqMax}</p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['any', cat.moqAny],
                  ['10', '≤ 10 kg'],
                  ['25', '≤ 25 kg'],
                ] as const
              ).map(([value, label]) => (
                <Chip
                  key={value}
                  label={label}
                  active={draft.moq === value}
                  onClick={() => onChange({ ...draft, moq: value })}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-primary-border/50 px-6 py-4">
          <button type="button" onClick={onReset} className="text-[14px] font-medium text-ink/50 hover:text-primary">
            {cat.reset}
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-primary-border px-5 py-2.5 text-[14px] font-semibold text-ink/65 hover:text-primary"
            >
              {cat.cancel}
            </button>
            <button
              type="button"
              onClick={onApply}
              className="rounded-full bg-primary px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-primary-dark"
            >
              {cat.applyFiltersFull}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  // Hide the whole group when the facet has no options for the current dataset.
  if (Children.toArray(children).length === 0) return null
  return (
    <div>
      <p className="mb-3 text-[13px] font-bold uppercase tracking-wide text-ink/45">{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function Chip({
  label,
  active,
  onClick,
  count,
  weight = 0,
}: {
  label: string
  active: boolean
  onClick: () => void
  count?: number
  /** 0..1 độ phổ biến — chip nhiều hàng thì nền xanh + viền đậm dần, nhìn ra ngay. */
  weight?: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors duration-300',
        active ? 'bg-primary text-white' : 'text-ink/70 hover:text-primary',
      )}
      style={
        active
          ? undefined
          : {
              backgroundColor: `rgba(0,142,77,${0.04 + weight * 0.12})`,
              border: `1px solid rgba(0,142,77,${0.18 + weight * 0.4})`,
            }
      }
    >
      {label}
      {count != null && count > 0 && (
        <span className={cn('text-[11px]', active ? 'text-white/70' : 'text-ink/40')}>{count}</span>
      )}
    </button>
  )
}

function Filter({
  label,
  active,
  subtle,
  onClick,
}: {
  label: string
  active: boolean
  subtle?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-4 py-2 text-[13px] font-medium transition-colors duration-300',
        active
          ? 'bg-primary text-white'
          : subtle
            ? 'border border-primary-border bg-white text-ink/55 hover:text-primary'
            : 'bg-white text-ink/65 hover:text-primary',
      )}
    >
      {label}
    </button>
  )
}
