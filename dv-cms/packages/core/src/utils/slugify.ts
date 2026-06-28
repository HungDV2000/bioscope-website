/** Lightweight, dependency-free slugifier (handles Vietnamese diacritics). */
export function slugify(input: unknown): string {
  if (typeof input !== 'string') return ''
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip combining marks
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
