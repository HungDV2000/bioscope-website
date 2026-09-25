/**
 * Số điện thoại Việt Nam.
 *
 * Chuẩn hoá về dạng `0xxxxxxxxx` trước khi lưu hay so sánh: cùng một người có
 * thể gõ `+84 912…`, `0912…` hay `84912…`. Không chuẩn hoá thì họ đăng ký được
 * nhiều lần bằng cùng một số, và bảng xếp hạng bị bơm.
 */
const VN_MOBILE = /^0(3|5|7|8|9)\d{8}$/

export function normalizePhone(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  let s = raw.replace(/[\s.\-()]/g, '')
  if (s.startsWith('+84')) s = '0' + s.slice(3)
  else if (s.startsWith('84') && s.length === 11) s = '0' + s.slice(2)
  return VN_MOBILE.test(s) ? s : null
}

/** `0912345678` → `09•• ••• 678` — hiển thị cho chính chủ, không lộ đủ số. */
export function maskPhone(phone: string): string {
  return `${phone.slice(0, 2)}•• ••• ${phone.slice(-3)}`
}

/**
 * Rút gọn tên cho bảng xếp hạng công khai: `Nguyễn Văn An` → `Nguyễn V. A`.
 *
 * Bảng xếp hạng ai cũng xem được, nên không đưa tên đầy đủ — người tham gia
 * đã khai triệu chứng dạ dày, gắn tên thật lên bảng công khai là lộ thông tin
 * sức khoẻ.
 */
export function maskName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'Ẩn danh'
  if (parts.length === 1) return parts[0]
  const [first, ...rest] = parts
  return `${first} ${rest.map((p) => `${p[0].toUpperCase()}.`).join(' ').replace(/\.$/, '')}`
}

/** Bỏ dấu tiếng Việt — dùng để dựng mã giới thiệu. */
export function stripAccents(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}
