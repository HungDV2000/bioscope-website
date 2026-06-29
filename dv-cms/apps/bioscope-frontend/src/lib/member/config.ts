/** Cookie lưu session demo B2B (chưa gắn API). */
export const MEMBER_SESSION_COOKIE = 'bioscope_member_demo'

/** Khi có `NEXT_PUBLIC_B2B_API_URL` sẽ gọi API thật; hiện tại luôn mock nếu không set. */
export const B2B_API_URL = process.env.NEXT_PUBLIC_B2B_API_URL?.replace(/\/$/, '') ?? ''

export const isMockMemberAuth = () => !B2B_API_URL
