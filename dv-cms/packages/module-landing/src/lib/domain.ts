/**
 * Chuẩn hoá tên miền người dùng nhập vào ô cấu hình.
 *
 * Khách hay dán nguyên `https://www.Gastroheal.vn/`, nên bóc scheme, đường
 * dẫn, cổng và chữ hoa trước khi so khớp với header Host — header đó luôn là
 * chữ thường và không có scheme. Giữ nguyên `www.` vì đó là một tên miền khác
 * cần khai riêng (và cần chứng chỉ SSL riêng).
 */
const HOST_RE = /^(localhost|([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,})$/

export function normalizeHost(raw: string): string | null {
  if (!raw) return null
  let s = raw.trim().toLowerCase()
  s = s.replace(/^[a-z]+:\/\//, '')
  s = s.split('/')[0] ?? ''
  s = s.split('?')[0] ?? ''
  s = s.replace(/:\d+$/, '')
  s = s.replace(/\.$/, '')
  return HOST_RE.test(s) ? s : null
}
