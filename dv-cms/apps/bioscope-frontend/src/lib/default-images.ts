/**
 * Default ingredient imagery — shown ONLY for ingredients with no featured
 * image in the CMS. Once a real photo is uploaded it always wins.
 *
 * Files live in `public/images/default/`.
 */
/**
 * Intrinsic dimensions are kept alongside each file because the detail page
 * sizes its frame to the picked image's own ratio — these images are not a
 * uniform shape (3:2, 16:9 and 1.83:1 are all present) and each carries a
 * contact strip burned into the bottom edge, so any mismatched frame would crop
 * that text. Re-measure if the files are ever replaced.
 */
export type DefaultImage = { src: string; width: number; height: number }

export const DEFAULT_INGREDIENT_IMAGES: readonly DefaultImage[] = [
  { src: '/images/default/i1.jpg', width: 1536, height: 1024 },
  { src: '/images/default/i2.jpg', width: 1672, height: 941 },
  { src: '/images/default/i3.jpg', width: 1672, height: 941 },
  { src: '/images/default/i4.jpg', width: 1535, height: 1024 },
  { src: '/images/default/i5.jpg', width: 1367, height: 768 },
  { src: '/images/default/i6.jpg', width: 1024, height: 559 },
  { src: '/images/default/i7.jpg', width: 1024, height: 559 },
] as const

/**
 * Seeded PRNG (mulberry32). Deterministic for a given seed, which is what lets
 * one shuffle be reproduced across renders within a page view — React re-renders
 * on every filter/pagination change and an unseeded Math.random() would reassign
 * every card each time. The seed itself is generated per request on the server,
 * so the assignment still changes on every refresh.
 */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Fisher–Yates, on a copy. */
function shuffled<T>(input: readonly T[], rand: () => number): T[] {
  const out = [...input]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Pick `count` default images.
 *
 * Every image is used before any repeats: for a page needing 9 defaults that
 * means all 7 appear once and the last 2 are random repeats — then the whole
 * list is shuffled so the repeats aren't stuck at the end. Needing fewer than 7
 * simply yields that many distinct images.
 *
 * @param count How many cards on this page need a default image.
 * @param rand  Seeded generator, so the same seed reproduces the same layout.
 */
export function pickDefaultImages(count: number, rand: () => number): DefaultImage[] {
  if (count <= 0) return []
  const all = DEFAULT_INGREDIENT_IMAGES
  const out: DefaultImage[] = []

  // Full passes first — guarantees each image is used before anything repeats.
  while (out.length + all.length <= count) out.push(...shuffled(all, rand))

  // Remainder: random, without repeating within the remainder itself.
  const remaining = count - out.length
  if (remaining > 0) out.push(...shuffled(all, rand).slice(0, remaining))

  return shuffled(out, rand)
}
