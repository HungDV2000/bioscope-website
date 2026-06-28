/**
 * Curated placeholder imagery (Unsplash) — PLACEHOLDERS ONLY.
 * Replace with Bioscope's real photography (team, lab, factory, ingredients)
 * before go-live. All URLs verified reachable and visually checked.
 */
const U = (id: string) => `https://images.unsplash.com/photo-${id}`

export const IMG = {
  heroTeam: U('1579154204601-01588f351e67'), // R&D laboratory interior
  labWork: U('1532187863486-abf9dbad1b69'), // pipetting into well-plate
  glassware: U('1554475901-4538ddfbccc2'), // erlenmeyer flask + reagents
  microscope: U('1567427018141-0584cfcbf1b8'), // microscope close-up
  botanical: U('1471193945509-9ad0617afabf'), // herbs / botanical produce
  leaf: U('1466692476868-aef1dfb1e735'), // seedlings / green sprouts
  capsules: U('1584308666744-24d5c474f2ae'), // capsule blister packs
  powder: U('1607619056574-7b8d3ee536b2'), // supplement capsules
  oil: U('1628771065518-0d82f1938462'), // supplements from bottle
  field: U('1564890369478-c89ca6d9cde9'), // herbal infusion / extract
  nature: U('1466692476868-aef1dfb1e735'), // green sprouts
} as const

export type ImgKey = keyof typeof IMG

/** Build an optimized Unsplash URL (next/image re-optimizes too). */
export function img(key: ImgKey, w = 1200, q = 75) {
  return `${IMG[key]}?auto=format&fit=crop&w=${w}&q=${q}`
}

export function ingredientImg(it: { image: ImgKey; imageSrc?: string }, w = 600) {
  return it.imageSrc ?? img(it.image, w)
}
