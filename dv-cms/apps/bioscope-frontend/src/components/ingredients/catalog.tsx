'use client'

import { Children, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Search, ArrowUpRight, SlidersHorizontal, X, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import { useLocale } from '@/lib/i18n/context'
import { pickDefaultImages, seededRandom } from '@/lib/default-images'
import { cn } from '@/lib/utils'
import type { CatalogSummary, CatalogCard, CatalogPage, FacetOption } from '@/lib/cms/catalog'

const TAG_STYLE: Record<string, string> = {
  NEW: 'bg-accent-soft text-accent',
  TRENDING: 'bg-primary-tint text-primary-dark',
  EXCLUSIVE: 'bg-ink text-white',
}

// Thứ tự tab danh mục chính theo slug (khớp `order` khi seed).
const PRIMARY_ORDER = ['chiet-xuat-thuc-vat', 'omega-dau-ca', 'loi-khuan', 'hoat-chat-cong-nghe-cao', 'nguyen-lieu-moi']

type Filters = {
  primaries: string[]
  functions: string[]
  natures: string[]
  forms: string[]
  properties: string[]
  industries: string[]
  origins: string[]
}
const EMPTY: Filters = { primaries: [], functions: [], natures: [], forms: [], properties: [], industries: [], origins: [] }
const countFilters = (f: Filters) => Object.values(f).reduce((n, a) => n + a.length, 0)

function toQuery(f: Filters, q: string, page: number): string {
  const p = new URLSearchParams()
  if (q.trim()) p.set('q', q.trim())
  for (const [k, list] of Object.entries(f)) for (const v of list as string[]) p.append(k, v)
  if (page > 1) p.set('page', String(page))
  return p.toString()
}

export function Catalog({
  summary,
  initial,
  imageSeed,
}: {
  summary: CatalogSummary
  initial: CatalogPage
  imageSeed: number
}) {
  const { t } = useLocale()
  const cat = t.ingredientsCatalog

  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [filters, setFilters] = useState<Filters>(EMPTY)
  const [page, setPage] = useState(1)
  const [data, setData] = useState<CatalogPage>(initial)
  const [loading, setLoading] = useState(false)
  const [cloudOpen, setCloudOpen] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [advancedDraft, setAdvancedDraft] = useState<Filters>(EMPTY)

  // Debounce ô tìm kiếm để không gọi API mỗi phím.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 350)
    return () => clearTimeout(t)
  }, [q])

  // Card danh mục ở trang chủ link sang /nguyen-lieu?primary=<tên hoặc slug>.
  // Áp ngay khi mount để mở trang đã lọc đúng danh mục vừa bấm.
  const searchParams = useSearchParams()
  useEffect(() => {
    const p = searchParams.get('primary')
    if (!p) return
    const key = decodeURIComponent(p).toLowerCase()
    const match = summary.primaries.find((x) => x.slug === p || x.name.toLowerCase() === key)
    if (match) setFilters((f) => ({ ...f, primaries: [match.slug] }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const filterKey = `${debouncedQ}|${JSON.stringify(filters)}`
  const isFirst = useRef(true)

  // Đổi bộ lọc → về trang 1.
  const [prevKey, setPrevKey] = useState(filterKey)
  if (filterKey !== prevKey) {
    setPrevKey(filterKey)
    if (page !== 1) setPage(1)
  }

  // Lấy trang từ server mỗi khi bộ lọc / trang đổi (bỏ lần đầu — đã có `initial`).
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false
      return
    }
    let cancelled = false
    setLoading(true)
    const query = toQuery(filters, debouncedQ, page)
    fetch(`/api/catalog?${query}`)
      .then((r) => r.json())
      .then((res) => {
        if (cancelled) return
        if (res?.cards) setData({ cards: res.cards, total: res.total, totalPages: res.totalPages, page: res.page })
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [filterKey, page, filters, debouncedQ])

  const advancedCount = countFilters(filters)
  const hasAnyFilter = q.trim().length > 0 || advancedCount > 0

  const orderedPrimaries = useMemo(
    () =>
      [...summary.primaries].sort((a, b) => {
        const ia = PRIMARY_ORDER.indexOf(a.slug)
        const ib = PRIMARY_ORDER.indexOf(b.slug)
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
      }),
    [summary.primaries],
  )
  const cloudHasData = summary.primaries.length > 0 || summary.functions.length > 0

  const activePrimary = filters.primaries.length === 1 ? filters.primaries[0] : null
  const activeOrigin = filters.origins.length === 1 ? filters.origins[0] : null
  const activeGroup = filters.functions.length === 1 ? filters.functions[0] : null

  const setSingle = (key: keyof Filters, value: string | null) =>
    setFilters((p) => ({ ...p, [key]: value ? [value] : [] }))
  const toggleCloud = (group: 'primaries' | 'functions', slug: string) =>
    setFilters((p) => ({ ...p, [group]: p[group].includes(slug) ? p[group].filter((s) => s !== slug) : [...p[group], slug] }))
  const clearAll = () => {
    setQ('')
    setDebouncedQ('')
    setFilters(EMPTY)
    setAdvancedDraft(EMPTY)
  }

  const totalPages = Math.max(1, data.totalPages)
  const safePage = Math.min(page, totalPages)

  // Ảnh mặc định cho thẻ không có ảnh — theo trang để ổn định khi lật.
  const defaultImageBySlug = useMemo(() => {
    const needs = data.cards.filter((c) => !c.imageSrc)
    const pool = pickDefaultImages(needs.length, seededRandom(imageSeed + safePage))
    return new Map<string, string>(needs.map((c, i) => [c.slug, pool[i].src]))
  }, [data.cards, imageSeed, safePage])

  return (
    <>
      <section className="bg-white pb-24 pt-16">
        <div className="container-bs">
          {/* Toolbar */}
          <div className="flex flex-col gap-4 rounded-[2rem] border border-primary-border/60 bg-mist/50 p-5 sm:p-6">
            {/* Hàng 1: tab danh mục chính + Xoá bộ lọc + Xem thêm */}
            <div className="flex flex-wrap items-center gap-2">
              <Filter label={cat.allPrimaries} active={activePrimary === null} onClick={() => setSingle('primaries', null)} />
              {orderedPrimaries.map((p) => (
                <Filter
                  key={p.slug}
                  label={p.name}
                  active={activePrimary === p.slug}
                  onClick={() => setSingle('primaries', activePrimary === p.slug ? null : p.slug)}
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
                options={summary.origins.map((o) => ({ value: o.code, label: o.label }))}
                onChange={(v) => setSingle('origins', v)}
              />
              <div className="flex gap-2">
                <SelectFilter
                  label={cat.allGroups}
                  value={activeGroup}
                  options={summary.functions.map((fn) => ({ value: fn.slug, label: fn.name }))}
                  onChange={(v) => setSingle('functions', v)}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => {
                    setAdvancedDraft(filters)
                    setAdvancedOpen(true)
                  }}
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

          {/* Đếm (trái) + chỉ số trang (phải) */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-baseline gap-1 rounded-full bg-primary-tint px-3.5 py-1 text-[13.5px] font-semibold text-primary-dark">
                <span className="text-[15px] font-bold">{data.total.toLocaleString('vi-VN')}</span>
                {cat.ingredientsUnit}
              </span>
              {loading && (
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
              )}
            </div>
            {totalPages > 1 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-border/60 bg-white px-3.5 py-1.5 text-[12.5px] font-medium text-ink/50">
                {cat.pageOf}
                <span className="grid h-6 min-w-6 place-items-center rounded-full bg-primary px-1.5 text-[12px] font-bold text-white">
                  {safePage}
                </span>
                <span className="text-ink/30">/</span>
                <span className="font-semibold text-ink/70">{totalPages}</span>
              </span>
            )}
          </div>

          {/* Lưới thẻ */}
          <div className={cn('mt-5 grid gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3', loading && 'opacity-50')}>
            {data.cards.map((it) => (
              <Link
                key={it.slug}
                href={`/nguyen-lieu/${it.slug}`}
                className="group flex flex-col overflow-hidden rounded-[1.75rem] border border-primary-border/60 bg-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:shadow-card"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-mist">
                  <Image
                    src={it.imageSrc ?? defaultImageBySlug.get(it.slug)!}
                    alt={it.name}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 360px"
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-primary-dark backdrop-blur-sm">
                    {it.category}
                  </span>
                  {it.tag && (
                    <span className={cn('absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide', TAG_STYLE[it.tag])}>
                      {cat.tags[it.tag] ?? it.tag}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="line-clamp-2 text-[16.5px] font-bold leading-snug text-ink">{it.name}</h3>
                  {it.shortDesc && <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-ink/60">{it.shortDesc}</p>}
                  <div className="flex-1" />
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

          {!loading && data.cards.length === 0 && <p className="mt-12 text-center text-[15px] text-ink/50">{cat.tryClearFilters}</p>}

          {totalPages > 1 && <Pagination page={safePage} totalPages={totalPages} onPage={setPage} />}
        </div>
      </section>

      {advancedOpen && (
        <AdvancedSearchModal
          summary={summary}
          draft={advancedDraft}
          onChange={setAdvancedDraft}
          onClose={() => setAdvancedOpen(false)}
          onApply={() => {
            setFilters(advancedDraft)
            setAdvancedOpen(false)
          }}
          onReset={clearAll}
        />
      )}

      {cloudOpen && (
        <TagCloudModal
          primaries={summary.primaries}
          functions={summary.functions}
          applied={filters}
          onToggle={(g, v) => {
            toggleCloud(g, v)
            setCloudOpen(false)
          }}
          onClose={() => setCloudOpen(false)}
        />
      )}
    </>
  )
}

// ── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
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
          <span key={`gap-${i}`} className="grid h-10 w-8 place-items-center text-ink/35">…</span>
        ) : (
          <button
            key={p}
            type="button"
            aria-current={p === page ? 'page' : undefined}
            onClick={() => onPage(p)}
            className={cn(
              'grid h-10 min-w-10 place-items-center rounded-full px-3 text-[14px] font-semibold transition-colors',
              p === page ? 'bg-primary text-white' : 'border border-primary-border bg-white text-ink/55 hover:text-primary',
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

// ── Tag cloud ─────────────────────────────────────────────────────────────────

const CLOUD_PALETTE = ['#7c3aed', '#2563eb', '#059669', '#ea580c', '#db2777', '#0d9488', '#dc2626', '#4f46e5', '#d97706', '#0891b2', '#16a34a', '#9333ea']

function TagCloud({
  primaries,
  functions,
  applied,
  onToggle,
}: {
  primaries: FacetOption[]
  functions: FacetOption[]
  applied: Filters
  onToggle: (group: 'primaries' | 'functions', slug: string) => void
}) {
  const all = [
    ...primaries.map((p) => ({ group: 'primaries' as const, ...p })),
    ...functions.map((f) => ({ group: 'functions' as const, ...f })),
  ]
  if (!all.length) return null

  const max = Math.max(...all.map((x) => x.count))
  const min = Math.min(...all.map((x) => x.count))
  const scale = (n: number) => (max === min ? 0.6 : Math.sqrt((n - min) / (max - min)))

  // Thẻ nhiều nằm giữa, ít dạt ra hai đầu.
  const sorted = [...all].sort((a, b) => b.count - a.count)
  const ordered: typeof sorted = []
  sorted.forEach((item, i) => (i % 2 === 0 ? ordered.push(item) : ordered.unshift(item)))
  const colorOf = (s: string) => CLOUD_PALETTE[[...s].reduce((h, c) => h + c.charCodeAt(0), 0) % CLOUD_PALETTE.length]

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 text-center leading-tight">
      {ordered.map(({ group, slug, name, count }) => {
        const k = scale(count)
        const active = applied[group].includes(slug)
        const size = 16 + k * 18
        const weight = k > 0.6 ? 800 : k > 0.35 ? 700 : k > 0.15 ? 600 : 500
        return (
          <button
            key={`${group}:${slug}`}
            type="button"
            onClick={() => onToggle(group, slug)}
            title={`${name} · ${count} nguyên liệu`}
            className={cn('leading-none transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110', active && 'underline decoration-2 underline-offset-4')}
            style={{ fontSize: `${size}px`, fontWeight: weight, color: colorOf(name) }}
          >
            {name}
          </button>
        )
      })}
    </div>
  )
}

function TagCloudModal({
  primaries,
  functions,
  applied,
  onToggle,
  onClose,
}: {
  primaries: FacetOption[]
  functions: FacetOption[]
  applied: Filters
  onToggle: (group: 'primaries' | 'functions', slug: string) => void
  onClose: () => void
}) {
  const { t } = useLocale()
  const cat = t.ingredientsCatalog
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button type="button" aria-label={cat.close} className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[min(90vh,640px)] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-primary-border/60 bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-primary-border/50 px-6 py-5">
          <div>
            <h2 className="text-[1.25rem] font-bold text-ink">{cat.cloudTitle}</h2>
            <p className="mt-1 text-[13.5px] text-ink/55">{cat.cloudDesc}</p>
          </div>
          <button type="button" aria-label={cat.close} onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-primary-border text-ink/45 hover:text-primary">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <TagCloud primaries={primaries} functions={functions} applied={applied} onToggle={onToggle} />
        </div>
      </div>
    </div>
  )
}

// ── Controls ──────────────────────────────────────────────────────────────────

function SelectFilter({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string
  value: string | null
  options: { value: string; label: string }[]
  onChange: (v: string | null) => void
  className?: string
}) {
  return (
    <div className={cn('relative', className)}>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className={cn(
          'h-12 w-full min-w-[9rem] appearance-none rounded-full border bg-white py-2 pl-4 pr-9 text-[14px] outline-none transition-colors focus:border-primary/50',
          value !== null ? 'border-primary font-semibold text-primary-dark' : 'border-primary-border text-ink/65',
        )}
      >
        <option value="">{label}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
    </div>
  )
}

function Filter({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-4 py-2 text-[13px] font-medium transition-colors duration-300',
        active ? 'bg-primary text-white' : 'bg-white text-ink/65 hover:text-primary',
      )}
    >
      {label}
    </button>
  )
}

// ── Advanced modal ────────────────────────────────────────────────────────────

function AdvancedSearchModal({
  summary,
  draft,
  onChange,
  onClose,
  onApply,
  onReset,
}: {
  summary: CatalogSummary
  draft: Filters
  onChange: (f: Filters) => void
  onClose: () => void
  onApply: () => void
  onReset: () => void
}) {
  const { t } = useLocale()
  const cat = t.ingredientsCatalog
  const f = cat.filters

  const toggle = (key: keyof Filters, value: string) =>
    onChange({ ...draft, [key]: draft[key].includes(value) ? draft[key].filter((v) => v !== value) : [...draft[key], value] })

  const section = (key: keyof Filters, title: string, opts: { value: string; label: string; count?: number }[]) =>
    opts.length ? (
      <FilterSection title={title}>
        {opts.map((o) => (
          <Chip key={o.value} label={o.label} count={o.count} active={draft[key].includes(o.value)} onClick={() => toggle(key, o.value)} />
        ))}
      </FilterSection>
    ) : null

  const facetOpts = (list: FacetOption[]) => list.map((x) => ({ value: x.slug, label: x.name, count: x.count }))

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button type="button" aria-label={cat.close} className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[min(90vh,720px)] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-primary-border/60 bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-primary-border/50 px-6 py-5">
          <div>
            <h2 className="text-[1.25rem] font-bold text-ink">{cat.advancedTitle}</h2>
            <p className="mt-1 text-[13.5px] text-ink/55">{cat.advancedDesc}</p>
          </div>
          <button type="button" aria-label={cat.close} onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border border-primary-border text-ink/45 hover:text-primary">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          {section('primaries', f.primary ?? 'Danh mục chính', facetOpts(summary.primaries))}
          {section('functions', f.function ?? 'Công dụng', facetOpts(summary.functions))}
          {section('natures', f.nature ?? 'Bản chất nguyên liệu', facetOpts(summary.natures))}
          {section('forms', f.form ?? 'Dạng bào chế', facetOpts(summary.forms))}
          {section('properties', f.property ?? 'Đặc tính kỹ thuật', facetOpts(summary.properties))}
          {section('industries', f.industry ?? 'Ngành hàng', summary.industries.map((x) => ({ value: x.value, label: x.label, count: x.count })))}
          {section('origins', f.origin ?? 'Xuất xứ', summary.origins.map((x) => ({ value: x.code, label: x.label, count: x.count })))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-primary-border/50 px-6 py-4">
          <button type="button" onClick={onReset} className="text-[14px] font-medium text-ink/50 hover:text-primary">{cat.reset}</button>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-full border border-primary-border px-5 py-2.5 text-[14px] font-semibold text-ink/65 hover:text-primary">{cat.cancel}</button>
            <button type="button" onClick={onApply} className="rounded-full bg-primary px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-primary-dark">{cat.applyFiltersFull}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  if (Children.toArray(children).length === 0) return null
  return (
    <div>
      <p className="mb-3 text-[13px] font-bold uppercase tracking-wide text-ink/45">{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function Chip({ label, active, onClick, count }: { label: string; active: boolean; onClick: () => void; count?: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-medium transition-colors duration-300',
        active ? 'border-primary bg-primary text-white' : 'border-primary-border/60 bg-white text-ink/70 hover:text-primary',
      )}
    >
      {label}
      {count != null && count > 0 && <span className={cn('text-[11px]', active ? 'text-white/70' : 'text-ink/40')}>{count}</span>}
    </button>
  )
}
