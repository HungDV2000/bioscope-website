/**
 * Chạy một lần quét trùng lặp và ghi kết quả vào record `duplicate-scans`.
 *
 * Đọc toàn bộ collection đích theo trang, chuẩn hoá trường tên (normalize.ts),
 * gộp các bản ghi trùng khít, rồi — nếu bật — chạy thêm so khớp gần đúng
 * (similarity.ts) để bắt các biến thể không có quy luật.
 */

import type { Payload } from 'payload'
import { normalizeName, digitSignature, type NormalizeOptions } from './normalize.js'
import { findSimilarPairs, groupPairs } from './similarity.js'
import { findScannable, readPath, type ScannableField } from './scannable.js'

export type ScanConfig = {
  targetCollection: string
  locale: 'vi' | 'en'
  normalize: NormalizeOptions
  /** Đường dẫn các trường phụ được bật (ngoài trường tên). */
  extraFields: string[]
  fuzzy: boolean
  /** 0..1 — chỉ dùng khi fuzzy bật. */
  threshold: number
  /** Chặn ghép hai tên khác "chữ ký số" (B1 vs B12). Chỉ dùng khi fuzzy bật. */
  digitGuard: boolean
  /** Bao gồm cả bản nháp chưa publish. */
  includeDrafts: boolean
  /** Trần số nhóm trả về, tránh trả JSON khổng lồ. */
  maxGroups: number
}

export const DEFAULT_SCAN_CONFIG: Omit<ScanConfig, 'targetCollection'> = {
  locale: 'vi',
  normalize: {
    stripNumericPrefix: true,
    stripOriginSuffix: true,
    stripTrademark: true,
    removeDiacritics: true,
    stripPunctuation: true,
  },
  extraFields: [],
  fuzzy: false,
  threshold: 0.9,
  digitGuard: true,
  includeDrafts: true,
  maxGroups: 300,
}

type Log = { ts: string; level: 'info' | 'warn' | 'error'; message: string }

type DupGroup = {
  /** 'exact' = trùng khít sau chuẩn hoá; 'fuzzy' = gần giống; 'field' = trùng một trường định danh. */
  kind: 'exact' | 'fuzzy' | 'field'
  /** Trường đã khớp — 'name' hoặc đường dẫn trường phụ. */
  field: string
  /** Khoá gộp (giá trị đã chuẩn hoá), để admin hiểu vì sao nhóm lại với nhau. */
  key: string
  /** Điểm giống thấp nhất trong nhóm; chỉ có với fuzzy. */
  score?: number
  items: { id: string | number; name: string; slug?: string | null }[]
}

type Doc = { id: string | number; name: string; slug?: string | null; extras: Record<string, string> }

const addLog = (logs: Log[], level: Log['level'], message: string) =>
  logs.push({ ts: new Date().toISOString(), level, message })

async function update(payload: Payload, id: string, data: Record<string, unknown>): Promise<void> {
  try {
    await payload.update({ collection: 'duplicate-scans', id, data, overrideAccess: true })
  } catch {
    // Không để lỗi ghi tiến trình làm hỏng cả lần quét.
  }
}

export async function runDuplicateScan(input: {
  scanId: string
  config: ScanConfig
  payload: Payload
}): Promise<void> {
  const { scanId, config, payload } = input
  const logs: Log[] = []

  try {
    const target = findScannable(config.targetCollection)
    if (!target) throw new Error(`Loại nội dung không hỗ trợ quét: ${config.targetCollection}`)

    addLog(logs, 'info', `Bắt đầu quét "${target.label.vi}" (ngôn ngữ ${config.locale})`)
    await update(payload, scanId, {
      status: 'running',
      phase: 'Đang tải dữ liệu...',
      startedAt: new Date().toISOString(),
      logs,
    })

    // ── 1. Tải toàn bộ bản ghi ────────────────────────────────────────────
    const wanted: ScannableField[] = [
      target.nameField,
      ...target.extraFields.filter((f) => config.extraFields.includes(f.path)),
    ]

    const docs: Doc[] = []
    let page = 1
    let totalPages = 1
    do {
      const res = await payload.find({
        collection: config.targetCollection as 'ingredients',
        limit: 500,
        page,
        depth: 0,
        locale: config.locale,
        draft: config.includeDrafts,
        overrideAccess: true,
      })
      totalPages = res.totalPages
      for (const raw of res.docs as unknown as Record<string, unknown>[]) {
        const name = readPath(raw, target.nameField.path)
        if (!name.trim()) continue
        const extras: Record<string, string> = {}
        for (const f of wanted) {
          if (f.path === target.nameField.path) continue
          const v = readPath(raw, f.path)
          if (v.trim()) extras[f.path] = v.trim()
        }
        docs.push({ id: raw.id as string | number, name, slug: (raw.slug as string) ?? null, extras })
      }
      if (page === 1 || page % 2 === 0) {
        await update(payload, scanId, { phase: `Đang tải dữ liệu... trang ${page}/${totalPages}`, logs })
      }
      page++
    } while (page <= totalPages)

    addLog(logs, 'info', `Đã tải ${docs.length} bản ghi có tên`)
    await update(payload, scanId, { phase: 'Đang chuẩn hoá và so khớp...', docsScanned: docs.length, logs })

    const groups: DupGroup[] = []

    // ── 2. Trùng khít theo TÊN sau chuẩn hoá ─────────────────────────────
    const keys = docs.map((d) => normalizeName(d.name, config.normalize))
    const byKey = new Map<string, number[]>()
    keys.forEach((k, i) => {
      if (!k) return
      const arr = byKey.get(k)
      if (arr) arr.push(i)
      else byKey.set(k, [i])
    })

    const exactMembers = new Set<number>()
    for (const [key, idxs] of byKey) {
      if (idxs.length < 2) continue
      idxs.forEach((i) => exactMembers.add(i))
      groups.push({
        kind: 'exact',
        field: target.nameField.path,
        key,
        items: idxs.map((i) => ({ id: docs[i].id, name: docs[i].name, slug: docs[i].slug })),
      })
    }
    addLog(logs, 'info', `Trùng khít theo tên: ${groups.length} nhóm`)

    // ── 3. Trùng theo TRƯỜNG ĐỊNH DANH (CAS, INCI, số công bố...) ─────────
    for (const f of wanted) {
      if (f.path === target.nameField.path) continue
      const map = new Map<string, number[]>()
      docs.forEach((d, i) => {
        const v = d.extras[f.path]
        if (!v) return
        const k = v.toLowerCase().replace(/\s+/g, '')
        const arr = map.get(k)
        if (arr) arr.push(i)
        else map.set(k, [i])
      })
      let n = 0
      for (const [key, idxs] of map) {
        if (idxs.length < 2) continue
        n++
        groups.push({
          kind: 'field',
          field: f.path,
          key,
          items: idxs.map((i) => ({ id: docs[i].id, name: docs[i].name, slug: docs[i].slug })),
        })
      }
      addLog(logs, 'info', `Trùng theo ${f.label.vi}: ${n} nhóm`)
    }

    // ── 4. Gần đúng (tuỳ chọn) ───────────────────────────────────────────
    if (config.fuzzy) {
      await update(payload, scanId, { phase: 'Đang so khớp gần đúng...', logs })
      const idx = keys.map((k, i) => (k ? i : -1)).filter((i) => i >= 0)
      const subKeys = idx.map((i) => keys[i])
      const { pairs, truncated } = findSimilarPairs(subKeys, config.threshold)

      let usable = pairs
      if (config.digitGuard) {
        const sigs = subKeys.map(digitSignature)
        const before = usable.length
        usable = usable.filter((p) => sigs[p.a] === sigs[p.b])
        addLog(
          logs,
          'info',
          `Chặn theo chữ ký số: bỏ ${before - usable.length}/${before} cặp (B1 vs B12, 30% vs 34%...)`,
        )
      }
      if (truncated) {
        addLog(logs, 'warn', 'Quá nhiều cặp giống nhau — đã cắt bớt. Hãy nâng ngưỡng lên.')
      }

      const scoreOf = new Map<string, number>()
      usable.forEach((p) => scoreOf.set(`${p.a}:${p.b}`, p.score))

      let n = 0
      for (const g of groupPairs(subKeys.length, usable)) {
        // Bỏ nhóm mà mọi thành viên đã trùng khít — đã báo ở bước 2 rồi.
        if (new Set(g.map((i) => subKeys[i])).size <= 1) continue
        n++
        const real = g.map((i) => idx[i])
        const scores = g.flatMap((a, x) => g.slice(x + 1).map((b) => scoreOf.get(`${a}:${b}`) ?? 1))
        groups.push({
          kind: 'fuzzy',
          field: target.nameField.path,
          key: subKeys[g[0]],
          score: scores.length ? Math.min(...scores) : undefined,
          items: real.map((i) => ({ id: docs[i].id, name: docs[i].name, slug: docs[i].slug })),
        })
      }
      addLog(logs, 'info', `Gần đúng (ngưỡng ${Math.round(config.threshold * 100)}%): ${n} nhóm`)
    }

    // ── 5. Kết quả ───────────────────────────────────────────────────────
    groups.sort((a, b) => b.items.length - a.items.length)
    const capped = groups.slice(0, config.maxGroups)
    if (groups.length > capped.length) {
      addLog(logs, 'warn', `Chỉ hiển thị ${capped.length}/${groups.length} nhóm (giới hạn cấu hình).`)
    }

    const docsInGroups = new Set(capped.flatMap((g) => g.items.map((i) => String(i.id)))).size
    addLog(logs, 'info', `✅ Xong: ${capped.length} nhóm, ${docsInGroups} bản ghi liên quan`)

    await update(payload, scanId, {
      status: 'done',
      phase: `Hoàn tất — ${capped.length} nhóm trùng lặp.`,
      groupsFound: capped.length,
      docsInGroups,
      results: capped as unknown as Record<string, unknown>,
      finishedAt: new Date().toISOString(),
      logs,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    addLog(logs, 'error', `Lỗi: ${msg}`)
    await update(payload, scanId, {
      status: 'error',
      phase: 'Đã xảy ra lỗi.',
      errorMessage: msg,
      finishedAt: new Date().toISOString(),
      logs,
    })
  }
}
