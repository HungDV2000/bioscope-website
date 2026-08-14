/**
 * Sự kiện giữa các thành phần chạy ở trình duyệt (header, widget chat, popup
 * đăng nhập) — tránh phải luồn props qua nhiều tầng hoặc tải lại trang.
 */

/** Phiên đăng nhập vừa đổi → header + widget đọc lại trạng thái. */
export const SESSION_CHANGED = 'bs:session-changed'

/** Mở popup đăng nhập/đăng ký. detail.mode chọn sẵn tab, detail.returnTo cho Google. */
export const OPEN_AUTH = 'bs:open-auth'

export type OpenAuthDetail = { mode?: 'login' | 'register' }

export const openAuthModal = (mode?: OpenAuthDetail['mode']) =>
  window.dispatchEvent(new CustomEvent<OpenAuthDetail>(OPEN_AUTH, { detail: { mode } }))

export const notifySessionChanged = () => window.dispatchEvent(new Event(SESSION_CHANGED))
