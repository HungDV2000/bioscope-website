/**
 * So khớp GẦN ĐÚNG bằng hệ số Dice trên tập trigram.
 *
 * Chuẩn hoá (normalize.ts) chỉ bắt được các biến thể có quy luật. Phần còn lại
 * — gõ sai, thiếu/thừa một từ, đảo thứ tự — cần đo độ giống. Dice trên trigram
 * hợp với tên sản phẩm hơn Levenshtein vì nó ít nhạy với việc chèn/xoá cả một
 * cụm từ, và rẻ hơn nhiều.
 *
 * Chi phí: so tất cả các cặp là O(n²) — với 1600 bản ghi là 1,28 triệu phép.
 * Thay vào đó dùng chỉ mục ngược trigram để chỉ so những cặp có chung ít nhất
 * một trigram, nên thực tế chỉ duyệt một phần rất nhỏ.
 */

/** Tập trigram của một chuỗi đã chuẩn hoá. Đệm 2 khoảng trắng đầu để trọng số đầu từ cao hơn. */
export function trigrams(s: string): Set<string> {
  const padded = `  ${s} `
  const out = new Set<string>()
  for (let i = 0; i < padded.length - 2; i++) out.add(padded.slice(i, i + 3))
  return out
}

/** Dice = 2|A∩B| / (|A|+|B|). Trả về 0..1. */
export function diceFromSets(a: Set<string>, b: Set<string>, shared?: number): number {
  if (!a.size || !b.size) return 0
  let inter = shared
  if (inter === undefined) {
    inter = 0
    const [small, large] = a.size <= b.size ? [a, b] : [b, a]
    for (const t of small) if (large.has(t)) inter++
  }
  return (2 * inter) / (a.size + b.size)
}

export type SimilarPair = { a: number; b: number; score: number }

/**
 * Tìm mọi cặp có độ giống >= threshold.
 *
 * @param keys      Chuỗi đã chuẩn hoá, chỉ số trong mảng chính là id nội bộ.
 * @param threshold 0..1 (0.85 = giống 85%).
 * @param maxPairs  Trần an toàn — vượt thì dừng và báo về, tránh treo server khi
 *                  dữ liệu quá lớn hoặc ngưỡng đặt quá thấp.
 */
export function findSimilarPairs(
  keys: string[],
  threshold: number,
  maxPairs = 50_000,
): { pairs: SimilarPair[]; truncated: boolean } {
  const sets = keys.map(trigrams)

  // Chỉ mục ngược: trigram -> các bản ghi chứa nó.
  const index = new Map<string, number[]>()
  for (let i = 0; i < sets.length; i++) {
    for (const t of sets[i]) {
      const arr = index.get(t)
      if (arr) arr.push(i)
      else index.set(t, [i])
    }
  }

  const pairs: SimilarPair[] = []
  let truncated = false

  for (let i = 0; i < sets.length && !truncated; i++) {
    // Đếm số trigram chung với từng ứng viên j > i (j < i đã xét ở vòng trước).
    const shared = new Map<number, number>()
    for (const t of sets[i]) {
      const bucket = index.get(t)
      if (!bucket) continue
      // Trigram quá phổ biến không giúp thu hẹp mà lại rất tốn — bỏ qua.
      if (bucket.length > 500) continue
      for (const j of bucket) {
        if (j <= i) continue
        shared.set(j, (shared.get(j) ?? 0) + 1)
      }
    }

    for (const [j, inter] of shared) {
      // Chặn sớm: Dice tối đa có thể đạt được với số trigram chung này.
      const upper = (2 * inter) / (sets[i].size + sets[j].size)
      if (upper < threshold) continue

      const score = diceFromSets(sets[i], sets[j], inter)
      if (score >= threshold) {
        pairs.push({ a: i, b: j, score })
        if (pairs.length >= maxPairs) {
          truncated = true
          break
        }
      }
    }
  }

  return { pairs, truncated }
}

/**
 * Gộp các cặp thành nhóm bằng union-find.
 *
 * Lưu ý về ngữ nghĩa: đây là gộp BẮC CẦU — A giống B, B giống C thì A, B, C vào
 * chung một nhóm dù A và C có thể dưới ngưỡng. Với mục đích "gợi ý cho người rà
 * soát" thì đúng hơn là chia nhỏ, vì cả cụm thường xoay quanh cùng một sản phẩm.
 */
export function groupPairs(size: number, pairs: SimilarPair[]): number[][] {
  const parent = Array.from({ length: size }, (_, i) => i)
  const find = (x: number): number => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]]
      x = parent[x]
    }
    return x
  }
  const union = (x: number, y: number) => {
    const rx = find(x)
    const ry = find(y)
    if (rx !== ry) parent[ry] = rx
  }

  for (const p of pairs) union(p.a, p.b)

  const byRoot = new Map<number, number[]>()
  for (let i = 0; i < size; i++) {
    const r = find(i)
    const arr = byRoot.get(r)
    if (arr) arr.push(i)
    else byRoot.set(r, [i])
  }
  return [...byRoot.values()].filter((g) => g.length > 1)
}
