'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, ArrowUpRight, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { ingredientForm, parseMoqKg, type Ingredient } from '@/lib/content'
import { useLocale } from '@/lib/i18n/context'
import { ingredientImg } from '@/lib/images'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 6

const TAG_STYLE: Record<string, string> = {
  NEW: 'bg-accent-soft text-accent',
  TRENDING: 'bg-primary-tint text-primary-dark',
  EXCLUSIVE: 'bg-ink text-white',
}

type MoqFilter = 'any' | '10' | '25'

type AdvancedFilters = {
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

function matchesAdvanced(it: Ingredient, f: AdvancedFilters) {
  if (f.industries.length && !f.industries.includes(it.industry)) return false
  if (f.categories.length && !f.categories.includes(it.category)) return false
  if (f.origins.length && !f.origins.includes(it.origin)) return false
  if (f.certs.length && !f.certs.every((c) => it.badges.some((b) => b.toLowerCase().includes(c.toLowerCase())))) {
    return false
  }
  if (f.tags.length && (!it.tag || !f.tags.includes(it.tag))) return false
  if (f.forms.length && !f.forms.includes(ingredientForm(it))) return false
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

export function Catalog({ items }: { items: Ingredient[] }) {
  const { content, t } = useLocale()
  const cat = t.ingredientsCatalog
  const { INDUSTRIES, CERT_FILTERS, INGREDIENT_TAGS, INGREDIENT_CATEGORIES, ORIGINS, PRODUCT_FORMS, APPLICATION_TYPES } =
    content

  const [q, setQ] = useState('')
  const [industry, setIndustry] = useState<string | null>(null)
  const [cert, setCert] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [advancedDraft, setAdvancedDraft] = useState<AdvancedFilters>(EMPTY_ADVANCED)
  const [advancedApplied, setAdvancedApplied] = useState<AdvancedFilters>(EMPTY_ADVANCED)

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return items.filter((it) => {
      if (industry && it.industry !== industry) return false
      if (cert && !it.badges.some((b) => b.toLowerCase().includes(cert.toLowerCase()))) return false
      if (!matchesAdvanced(it, advancedApplied)) return false
      if (
        term &&
        !`${it.name} ${it.category} ${it.shortDesc} ${it.benefits.join(' ')} ${it.origin}`.toLowerCase().includes(term)
      ) {
        return false
      }
      return true
    })
  }, [items, q, industry, cert, advancedApplied])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const advancedCount = countAdvanced(advancedApplied)

  useEffect(() => {
    setPage(1)
  }, [q, industry, cert, advancedApplied])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const openAdvanced = () => {
    setAdvancedDraft(advancedApplied)
    setAdvancedOpen(true)
  }

  const applyAdvanced = () => {
    setAdvancedApplied(advancedDraft)
    setAdvancedOpen(false)
  }

  const resetAdvanced = () => {
    setAdvancedDraft(EMPTY_ADVANCED)
    setAdvancedApplied(EMPTY_ADVANCED)
  }

  return (
    <>
      <section className="bg-white pb-24 pt-16">
        <div className="container-bs">
          {/* Toolbar */}
          <div className="flex flex-col gap-5 rounded-[2rem] border border-primary-border/60 bg-mist/50 p-6">
            <div className="flex gap-3">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={cat.searchPlaceholder}
                  className="w-full rounded-full border border-primary-border bg-white py-3 pl-11 pr-4 text-[14.5px] outline-none transition-colors focus:border-primary/50"
                />
              </div>
              <button
                type="button"
                onClick={openAdvanced}
                aria-label={cat.advancedSearch}
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

            <div className="flex flex-wrap items-center gap-2">
              <Filter label={cat.allIndustries} active={!industry} onClick={() => setIndustry(null)} />
              {INDUSTRIES.map((ind) => (
                <Filter key={ind} label={ind} active={industry === ind} onClick={() => setIndustry(ind)} />
              ))}
              <span className="mx-1 hidden h-5 w-px bg-primary-border sm:block" />
              {CERT_FILTERS.map((c) => (
                <Filter key={c} label={c} subtle active={cert === c} onClick={() => setCert(cert === c ? null : c)} />
              ))}
              {advancedCount > 0 && (
                <button
                  type="button"
                  onClick={resetAdvanced}
                  className="ml-auto text-[13px] font-medium text-primary hover:underline"
                >
                  {cat.clearAdvanced}
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13.5px] font-medium text-ink/50">
              {filtered.length} {cat.ingredientsUnit}
              {filtered.length > PAGE_SIZE && (
                <span className="text-ink/40">
                  {' '}
                  · {cat.pageOf} {safePage}/{totalPages}
                </span>
              )}
            </p>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {paginated.map((it) => (
              <Link
                key={it.slug}
                href={`/nguyen-lieu/${it.slug}`}
                className="group flex flex-col overflow-hidden rounded-[1.75rem] border border-primary-border/60 bg-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:shadow-card"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={ingredientImg(it, 600)}
                    alt={it.name}
                    fill
                    unoptimized={Boolean(it.imageSrc)}
                    sizes="(max-width: 768px) 100vw, 360px"
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 to-transparent" />
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
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-[18px] font-bold text-ink">{it.name}</h3>
                  <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-ink/60">{it.shortDesc}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-primary-border/50 pt-4 text-[12.5px] text-ink/55">
                    <span>{cat.originLabel}: {it.origin}</span>
                    <span>MOQ {it.moq}</span>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-primary">
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
          draft={advancedDraft}
          onChange={setAdvancedDraft}
          onClose={() => setAdvancedOpen(false)}
          onApply={applyAdvanced}
          onReset={() => setAdvancedDraft(EMPTY_ADVANCED)}
        />
      )}
    </>
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
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav aria-label={cat.pagination} className="mt-12 flex items-center justify-center gap-2">
      <button
        type="button"
        aria-label={cat.prevPage}
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="grid h-10 w-10 place-items-center rounded-full border border-primary-border bg-white text-ink/45 transition-colors hover:text-primary disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p) => (
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
      ))}
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

function AdvancedSearchModal({
  draft,
  onChange,
  onClose,
  onApply,
  onReset,
}: {
  draft: AdvancedFilters
  onChange: (f: AdvancedFilters) => void
  onClose: () => void
  onApply: () => void
  onReset: () => void
}) {
  const { content, t } = useLocale()
  const cat = t.ingredientsCatalog
  const f = cat.filters
  const {
    INDUSTRIES,
    CERT_FILTERS,
    INGREDIENT_TAGS,
    INGREDIENT_CATEGORIES,
    ORIGINS,
    PRODUCT_FORMS,
    APPLICATION_TYPES,
  } = content

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
          <FilterSection title={f.industry}>
            {INDUSTRIES.map((v) => (
              <Chip key={v} label={v} active={draft.industries.includes(v)} onClick={() => toggle('industries', v)} />
            ))}
          </FilterSection>

          <FilterSection title={f.category}>
            {INGREDIENT_CATEGORIES.map((v) => (
              <Chip key={v} label={v} active={draft.categories.includes(v)} onClick={() => toggle('categories', v)} />
            ))}
          </FilterSection>

          <FilterSection title={f.origin}>
            {ORIGINS.map((v) => (
              <Chip key={v} label={v} active={draft.origins.includes(v)} onClick={() => toggle('origins', v)} />
            ))}
          </FilterSection>

          <FilterSection title={f.form}>
            {PRODUCT_FORMS.map((v) => (
              <Chip key={v} label={v} active={draft.forms.includes(v)} onClick={() => toggle('forms', v)} />
            ))}
          </FilterSection>

          <FilterSection title={f.application}>
            {APPLICATION_TYPES.map((v) => (
              <Chip key={v} label={v} active={draft.applications.includes(v)} onClick={() => toggle('applications', v)} />
            ))}
          </FilterSection>

          <FilterSection title={f.cert}>
            {CERT_FILTERS.map((v) => (
              <Chip key={v} label={v} active={draft.certs.includes(v)} onClick={() => toggle('certs', v)} />
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
  return (
    <div>
      <p className="mb-3 text-[13px] font-bold uppercase tracking-wide text-ink/45">{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors duration-300',
        active
          ? 'bg-primary text-white'
          : 'border border-primary-border bg-white text-ink/60 hover:border-primary/40 hover:text-primary',
      )}
    >
      {label}
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
