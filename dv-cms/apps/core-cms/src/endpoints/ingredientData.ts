/**
 * Ingredient content Import / Export (editorial fields, bilingual VI + EN).
 *
 * Different from `csv-import` (Drive-crawler format: name + file links only).
 * This moves the *content* of an ingredient — subtitle, description, benefits,
 * specs, technical/regulatory/research groups — in and out as CSV or JSON so a
 * whole product can be authored offline (e.g. in a spreadsheet) and re-imported.
 *
 *   GET  /api/ingredients-content-export?format=csv|json[&slug=<slug>]
 *   POST /api/ingredients-content-import   Body: { format:'csv'|'json', content:'<base64>' }
 *                                          or   { rows: FlatRow[] }
 *
 * The CSV and JSON share ONE flat column schema (COLUMNS) so an export always
 * re-imports cleanly. Localized fields carry two columns: `<field>_vi` / `_en`.
 * Multi-value fields (benefits, applications, badges, status) are pipe-joined.
 * `specs_json` is a JSON array cell. RichText is stored as plain text and
 * rebuilt into a minimal Lexical value on import.
 *
 * Upsert key = `slug`. Admin only.
 */

import type { Endpoint, PayloadRequest, Payload, Where } from 'payload'
import { parseCsv } from '../drive-sync/CsvImportManager.js'

// ---------------------------------------------------------------------------
// Column schema (order matters for CSV)
// ---------------------------------------------------------------------------

const COLUMNS = [
  'slug', 'name', 'type', 'tag', 'featured',
  'categorySlug', 'originCountry', 'brandName', 'partnerName', 'moq',
  'subtitle_vi', 'subtitle_en', 'inci_vi', 'inci_en',
  'suggestedDosage_vi', 'suggestedDosage_en',
  'description_vi', 'description_en',
  'benefits_vi', 'benefits_en', 'applications_vi', 'applications_en', 'badges',
  'specs_json',
  'tech_casNumber', 'tech_hsCode', 'tech_eNumber',
  'tech_assay_vi', 'tech_assay_en', 'tech_standardization_vi', 'tech_standardization_en',
  'tech_appearance_vi', 'tech_appearance_en', 'tech_solubility_vi', 'tech_solubility_en',
  'tech_particleSize', 'tech_shelfLife_vi', 'tech_shelfLife_en',
  'tech_storage_vi', 'tech_storage_en', 'tech_packaging_vi', 'tech_packaging_en',
  'tech_leadTime_vi', 'tech_leadTime_en', 'tech_incompatibility_vi', 'tech_incompatibility_en',
  'reg_status', 'reg_registrationNo', 'reg_usageLimit_vi', 'reg_usageLimit_en',
  'research_mechanism_vi', 'research_mechanism_en',
] as const

type Col = (typeof COLUMNS)[number]
type FlatRow = Partial<Record<Col, string>>

const MULTI_SEP = ' | '

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isAdmin(req: PayloadRequest): boolean {
  const user = req.user as { role?: string } | undefined
  return Boolean(user?.role === 'admin' || user?.role === 'editor')
}

/** Flatten a Lexical richText value into plain text (paragraphs = \n\n). */
function lexicalToText(value: unknown): string {
  const root = (value as { root?: { children?: unknown[] } } | undefined)?.root
  if (!root?.children) return ''
  const read = (node: unknown): string => {
    const n = node as { text?: string; children?: unknown[] }
    if (typeof n.text === 'string') return n.text
    if (Array.isArray(n.children)) return n.children.map(read).join('')
    return ''
  }
  return root.children.map(read).filter((s) => s.trim()).join('\n\n')
}

/** Plain text → minimal valid Lexical state (one paragraph per blank-line block). */
function textToLexical(text: string): unknown {
  const blocks = (text || '').split(/\n{2,}/).map((s) => s.trim()).filter(Boolean)
  const children = (blocks.length ? blocks : ['']).map((para) => ({
    type: 'paragraph', version: 1, format: '', indent: 0, direction: 'ltr',
    children: para ? [{ type: 'text', text: para, version: 1, detail: 0, format: 0, mode: 'normal', style: '' }] : [],
  }))
  return { root: { type: 'root', version: 1, format: '', indent: 0, direction: 'ltr', children } }
}

const splitMulti = (v?: string): string[] => (v ? v.split('|').map((s) => s.trim()).filter(Boolean) : [])
const joinMulti = (a?: unknown[]): string => (Array.isArray(a) ? a.map(String).join(MULTI_SEP) : '')

// ---------------------------------------------------------------------------
// Serialize: ingredient doc (vi + en) → flat row
// ---------------------------------------------------------------------------

type Doc = Record<string, any>

function docToRow(vi: Doc, en: Doc | undefined): FlatRow {
  const e = en ?? vi
  const g = (o: Doc | undefined, k: string) => (o ? o[k] : undefined)
  const tvi = (vi.technical ?? {}) as Doc
  const ten = (e.technical ?? {}) as Doc
  const rvi = (vi.regulatory ?? {}) as Doc
  const ren = (e.regulatory ?? {}) as Doc
  const catSlug = (vi.category && typeof vi.category === 'object') ? (vi.category.slug ?? '') : ''
  const partnerName = (vi.partner && typeof vi.partner === 'object') ? (vi.partner.name ?? '') : ''

  return {
    slug: vi.slug ?? '',
    name: vi.name ?? '',
    type: vi.type ?? 'supplement',
    tag: vi.tag ?? '',
    featured: vi.featured ? 'true' : '',
    categorySlug: catSlug,
    originCountry: vi.originCountry ?? '',
    brandName: vi.brandName ?? '',
    partnerName,
    moq: vi.moq ?? '',
    subtitle_vi: vi.subtitle ?? '', subtitle_en: e.subtitle ?? '',
    inci_vi: vi.inci ?? '', inci_en: e.inci ?? '',
    suggestedDosage_vi: vi.suggestedDosage ?? '', suggestedDosage_en: e.suggestedDosage ?? '',
    description_vi: lexicalToText(vi.description), description_en: lexicalToText(e.description),
    benefits_vi: joinMulti(vi.benefits), benefits_en: joinMulti(e.benefits),
    applications_vi: joinMulti(vi.applications), applications_en: joinMulti(e.applications),
    badges: joinMulti(vi.badges),
    specs_json: JSON.stringify(
      (vi.specs ?? []).map((s: Doc) => ({
        label: s.label ?? '', value: s.value ?? '', unit: s.unit ?? '',
        display: s.display ?? 'text', percent: s.percent ?? undefined,
      })),
    ),
    tech_casNumber: g(tvi, 'casNumber') ?? '', tech_hsCode: g(tvi, 'hsCode') ?? '', tech_eNumber: g(tvi, 'eNumber') ?? '',
    tech_assay_vi: g(tvi, 'assay') ?? '', tech_assay_en: g(ten, 'assay') ?? '',
    tech_standardization_vi: g(tvi, 'standardization') ?? '', tech_standardization_en: g(ten, 'standardization') ?? '',
    tech_appearance_vi: g(tvi, 'appearance') ?? '', tech_appearance_en: g(ten, 'appearance') ?? '',
    tech_solubility_vi: g(tvi, 'solubility') ?? '', tech_solubility_en: g(ten, 'solubility') ?? '',
    tech_particleSize: g(tvi, 'particleSize') ?? '',
    tech_shelfLife_vi: g(tvi, 'shelfLife') ?? '', tech_shelfLife_en: g(ten, 'shelfLife') ?? '',
    tech_storage_vi: g(tvi, 'storage') ?? '', tech_storage_en: g(ten, 'storage') ?? '',
    tech_packaging_vi: g(tvi, 'packaging') ?? '', tech_packaging_en: g(ten, 'packaging') ?? '',
    tech_leadTime_vi: g(tvi, 'leadTime') ?? '', tech_leadTime_en: g(ten, 'leadTime') ?? '',
    tech_incompatibility_vi: g(tvi, 'incompatibility') ?? '', tech_incompatibility_en: g(ten, 'incompatibility') ?? '',
    reg_status: joinMulti(rvi.status), reg_registrationNo: rvi.registrationNo ?? '',
    reg_usageLimit_vi: rvi.usageLimit ?? '', reg_usageLimit_en: ren.usageLimit ?? '',
    research_mechanism_vi: lexicalToText((vi.research ?? {}).mechanism),
    research_mechanism_en: lexicalToText((e.research ?? {}).mechanism),
  }
}

// ---------------------------------------------------------------------------
// Apply: flat row → payload upsert (two locale passes)
// ---------------------------------------------------------------------------

async function resolveRelId(
  payload: Payload, collection: 'ingredient-categories' | 'partners', field: 'slug' | 'name', value?: string,
): Promise<string | number | undefined> {
  if (!value) return undefined
  const res = await payload.find({ collection, where: { [field]: { equals: value } }, limit: 1, depth: 0, overrideAccess: true })
  return (res.docs[0] as { id?: string | number } | undefined)?.id
}

async function applyRow(
  payload: Payload,
  row: FlatRow,
  targetId?: string | number,
): Promise<'created' | 'updated'> {
  const slug = (row.slug ?? '').trim()
  const name = (row.name ?? '').trim()
  // targetId = importing INTO a specific ingredient (from its own edit page): only
  // `name` is required, and we must NOT touch that record's slug.
  if (!name) throw new Error('Thiếu name.')
  if (!targetId && !slug) throw new Error('Thiếu slug.')

  const [categoryId, partnerId] = await Promise.all([
    resolveRelId(payload, 'ingredient-categories', 'slug', row.categorySlug?.trim()),
    resolveRelId(payload, 'partners', 'name', row.partnerName?.trim()),
  ])

  const specs = (() => {
    try {
      const arr = JSON.parse(row.specs_json || '[]')
      return Array.isArray(arr) ? arr.map((s: Doc) => ({
        label: s.label ?? '', value: String(s.value ?? ''), unit: s.unit ?? '',
        display: s.display ?? 'text', percent: typeof s.percent === 'number' ? s.percent : undefined,
      })) : []
    } catch { return [] }
  })()

  // Shared (non-localized) + VI-locale values. Keep the target record's own slug
  // when importing into a specific ingredient (don't rewrite its URL).
  const viData: Doc = {
    name,
    ...(targetId ? {} : { slug }),
    type: (row.type || 'supplement').trim(),
    tag: row.tag?.trim() || null,
    featured: String(row.featured).toLowerCase() === 'true',
    originCountry: row.originCountry?.trim() || null,
    brandName: row.brandName?.trim() || null,
    moq: row.moq?.trim() || null,
    ...(categoryId !== undefined ? { category: categoryId } : {}),
    ...(partnerId !== undefined ? { partner: partnerId } : {}),
    subtitle: row.subtitle_vi || null,
    inci: row.inci_vi || null,
    suggestedDosage: row.suggestedDosage_vi || null,
    description: textToLexical(row.description_vi || ''),
    benefits: splitMulti(row.benefits_vi),
    applications: splitMulti(row.applications_vi),
    badges: splitMulti(row.badges),
    specs,
    technical: {
      casNumber: row.tech_casNumber || null, hsCode: row.tech_hsCode || null, eNumber: row.tech_eNumber || null,
      assay: row.tech_assay_vi || null, standardization: row.tech_standardization_vi || null,
      appearance: row.tech_appearance_vi || null, solubility: row.tech_solubility_vi || null,
      particleSize: row.tech_particleSize || null,
      shelfLife: row.tech_shelfLife_vi || null, storage: row.tech_storage_vi || null,
      packaging: row.tech_packaging_vi || null, leadTime: row.tech_leadTime_vi || null,
      incompatibility: row.tech_incompatibility_vi || null,
    },
    regulatory: {
      status: splitMulti(row.reg_status), registrationNo: row.reg_registrationNo || null,
      usageLimit: row.reg_usageLimit_vi || null,
    },
    research: { mechanism: textToLexical(row.research_mechanism_vi || '') },
  }

  // EN-locale localized values only (send full groups so nested localized subfields stick).
  // `name` is localized+required — set it explicitly in both passes (don't lean on fallback).
  const enData: Doc = {
    name,
    subtitle: row.subtitle_en || null,
    inci: row.inci_en || null,
    suggestedDosage: row.suggestedDosage_en || null,
    description: textToLexical(row.description_en || ''),
    benefits: splitMulti(row.benefits_en),
    applications: splitMulti(row.applications_en),
    technical: {
      assay: row.tech_assay_en || null, standardization: row.tech_standardization_en || null,
      appearance: row.tech_appearance_en || null, solubility: row.tech_solubility_en || null,
      shelfLife: row.tech_shelfLife_en || null, storage: row.tech_storage_en || null,
      packaging: row.tech_packaging_en || null, leadTime: row.tech_leadTime_en || null,
      incompatibility: row.tech_incompatibility_en || null,
    },
    regulatory: { usageLimit: row.reg_usageLimit_en || null },
    research: { mechanism: textToLexical(row.research_mechanism_en || '') },
  }

  const found = targetId
    ? ({ id: targetId } as { id: string | number })
    : ((await payload.find({ collection: 'ingredients', where: { slug: { equals: slug } }, limit: 1, depth: 0, overrideAccess: true })).docs[0] as { id: string | number } | undefined)

  let id: string | number
  let outcome: 'created' | 'updated'
  if (found) {
    await payload.update({ collection: 'ingredients', id: found.id, data: viData as any, locale: 'vi', overrideAccess: true })
    id = found.id
    outcome = 'updated'
  } else {
    const created = await payload.create({ collection: 'ingredients', data: viData as any, locale: 'vi', overrideAccess: true })
    id = (created as { id: string | number }).id
    outcome = 'created'
  }
  await payload.update({ collection: 'ingredients', id, data: enData as any, locale: 'en', overrideAccess: true })
  return outcome
}

// ---------------------------------------------------------------------------
// CSV (de)serialize
// ---------------------------------------------------------------------------

function toCsv(rows: FlatRow[]): string {
  const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)
  const head = COLUMNS.join(',')
  const body = rows.map((r) => COLUMNS.map((c) => esc(r[c] ?? '')).join(',')).join('\n')
  return '﻿' + head + '\n' + body + '\n'
}

function fromCsv(content: string): FlatRow[] {
  const table = parseCsv(content.replace(/^﻿/, ''))
  if (table.length < 2) return []
  const head = table[0].map((h) => h.trim())
  return table.slice(1).filter((r) => r.some((c) => c.trim())).map((r) => {
    const row: FlatRow = {}
    head.forEach((h, i) => { if ((COLUMNS as readonly string[]).includes(h)) row[h as Col] = r[i] ?? '' })
    return row
  })
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

async function loadRows(payload: Payload, slug?: string): Promise<FlatRow[]> {
  const where: Where = slug ? { slug: { equals: slug } } : {}
  const base = { collection: 'ingredients' as const, where, limit: 5000, depth: 1, overrideAccess: true, draft: true }
  const [vi, en] = await Promise.all([
    payload.find({ ...base, locale: 'vi' as const }),
    payload.find({ ...base, locale: 'en' as const }),
  ])
  const enById = new Map<string | number, Doc>(en.docs.map((d) => [(d as Doc).id, d as Doc]))
  return (vi.docs as Doc[]).map((d) => docToRow(d, enById.get(d.id)))
}

export const ingredientExportEndpoint: Endpoint = {
  path: '/ingredients-content-export',
  method: 'get',
  handler: async (req: PayloadRequest): Promise<Response> => {
    if (!isAdmin(req)) return Response.json({ ok: false, error: 'Chỉ admin/editor được phép.' }, { status: 403 })
    const url = new URL((req as unknown as Request).url)
    const format = (url.searchParams.get('format') ?? 'csv').toLowerCase()
    const slug = url.searchParams.get('slug') ?? undefined
    const rows = await loadRows(req.payload, slug)
    const stamp = new Date().toISOString().slice(0, 10)
    if (format === 'json') {
      return new Response(JSON.stringify(rows, null, 2), {
        headers: { 'content-type': 'application/json; charset=utf-8', 'content-disposition': `attachment; filename="ingredients-${stamp}.json"` },
      })
    }
    return new Response(toCsv(rows), {
      headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="ingredients-${stamp}.csv"` },
    })
  },
}

export const ingredientImportEndpoint: Endpoint = {
  path: '/ingredients-content-import',
  method: 'post',
  handler: async (req: PayloadRequest): Promise<Response> => {
    if (!isAdmin(req)) return Response.json({ ok: false, error: 'Chỉ admin/editor được phép.' }, { status: 403 })
    let body: { format?: string; content?: string; rows?: FlatRow[]; targetId?: string | number }
    try { body = await (req as unknown as Request).json() } catch {
      return Response.json({ ok: false, error: 'Body phải là JSON.' }, { status: 400 })
    }

    let rows: FlatRow[] = []
    try {
      if (Array.isArray(body.rows)) rows = body.rows
      else if (body.content) {
        const text = Buffer.from(body.content, 'base64').toString('utf-8')
        rows = (body.format ?? 'csv').toLowerCase() === 'json' ? (JSON.parse(text) as FlatRow[]) : fromCsv(text)
      } else return Response.json({ ok: false, error: 'Cần { rows } hoặc { content: "<base64>" }.' }, { status: 400 })
    } catch (err) {
      return Response.json({ ok: false, error: `Lỗi đọc dữ liệu: ${err instanceof Error ? err.message : String(err)}` }, { status: 400 })
    }

    // targetId present = import from a specific ingredient's edit page → update ONLY
    // that record with the first row (never create, never touch other records).
    if (body.targetId != null) {
      const row = rows[0]
      if (!row) return Response.json({ ok: false, error: 'File không có dòng dữ liệu nào.' }, { status: 400 })
      try {
        await applyRow(req.payload, row, body.targetId)
        return Response.json({ ok: true, created: 0, updated: 1, total: 1, errors: [] })
      } catch (err) {
        return Response.json({ ok: false, error: err instanceof Error ? err.message : String(err) }, { status: 400 })
      }
    }

    let created = 0, updated = 0
    const errors: { slug?: string; error: string }[] = []
    for (const row of rows) {
      try {
        const r = await applyRow(req.payload, row)
        if (r === 'created') created++; else updated++
      } catch (err) {
        errors.push({ slug: row.slug, error: err instanceof Error ? err.message : String(err) })
      }
    }
    return Response.json({ ok: errors.length === 0, created, updated, total: rows.length, errors })
  },
}
