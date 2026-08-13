/** Cookie phiên đăng nhập thành viên (đã ký HMAC — xem auth.ts). */
export const MEMBER_SESSION_COOKIE = 'bioscope_member'

/** Cookie giữ JWT của Payload để gọi API B2B thay mặt thành viên. */
export const MEMBER_TOKEN_COOKIE = 'bioscope_member_token'

/** 7 ngày. */
export const MEMBER_SESSION_MAX_AGE = 60 * 60 * 24 * 7

/**
 * CMS gọi từ phía server: ưu tiên mạng nội bộ Docker (không hair-pin qua domain
 * công khai). Chỉ dùng trong Server Action / Route Handler.
 */
export const B2B_API_URL = (
  process.env.CMS_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_CMS_URL ||
  'http://localhost:3001'
).replace(/\/$/, '')

/**
 * Khoá ký cookie phiên. Bắt buộc có ở production — thiếu thì fail-closed
 * (không cấp/không nhận phiên) thay vì chấp nhận cookie giả mạo.
 */
export const SESSION_SECRET = process.env.MEMBER_SESSION_SECRET || process.env.PAYLOAD_SECRET || ''

/**
 * Khoá tin cậy server-to-server với CMS. Frontend đã tự xác thực người dùng
 * bằng cookie phiên có ký, nên gọi sang CMS kèm khoá này + id thành viên.
 * Cần vì tài khoản Google không có mật khẩu → không cấp được JWT của Payload.
 */
export const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET || process.env.PAYLOAD_SECRET || ''
