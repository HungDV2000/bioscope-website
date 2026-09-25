/**
 * Cấu hình landing page phía frontend.
 *
 * Mọi lời gọi CMS của landing đều đi từ SERVER của frontend (route handler,
 * server component, proxy) — trình duyệt không bao giờ gọi thẳng CMS. Nhờ vậy
 * landing chạy được trên tên miền riêng mà không phải mở CORS, và khoá nội bộ
 * không bao giờ ra tới trình duyệt.
 */
export const LP_CMS_URL = (
  process.env.CMS_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_CMS_URL ||
  'http://localhost:3001'
).replace(/\/$/, '')

/** Cùng khoá tin cậy mà module B2B đang dùng — phải khớp INTERNAL_API_SECRET của CMS. */
export const LP_INTERNAL_SECRET = process.env.INTERNAL_API_SECRET || process.env.PAYLOAD_SECRET || ''

/** Khoá ký cookie phiên người tham gia. Thiếu = không cấp phiên (fail-closed). */
export const LP_SESSION_SECRET =
  process.env.LANDING_SESSION_SECRET || process.env.MEMBER_SESSION_SECRET || process.env.PAYLOAD_SECRET || ''

/** Cookie theo từng chiến dịch, để tham gia chiến dịch này không dính sang chiến dịch khác. */
export const lpCookieName = (slug: string) => `lp_${slug.replace(/[^a-z0-9]/g, '_')}`

/** 60 ngày — chiến dịch kéo dài vài tuần, người tham gia quay lại nhiều lần. */
export const LP_SESSION_MAX_AGE = 60 * 60 * 24 * 60

/** Header proxy gắn vào request của landing — root layout dựa vào đây để bỏ phần khung của web Bioscope. */
export const LP_HEADER = 'x-dv-landing'
