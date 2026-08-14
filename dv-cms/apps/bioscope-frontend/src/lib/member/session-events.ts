/**
 * Sự kiện giữa các thành phần chạy ở trình duyệt (header, widget chat, popup
 * đăng nhập) — tránh phải luồn props qua nhiều tầng hoặc tải lại trang.
 */

/** Phiên đăng nhập vừa đổi → header + widget đọc lại trạng thái. */
export const SESSION_CHANGED = 'bs:session-changed'

/** Mở popup đăng nhập/đăng ký. detail.mode chọn sẵn tab, detail.returnTo cho Google. */
export const OPEN_AUTH = 'bs:open-auth'

export type OpenAuthDetail = {
  mode?: 'login' | 'register'
  /**
   * Mở từ đâu. 'chat' mới lấy lời chào ② admin soạn cho chatbot; mở từ header
   * là việc đăng nhập bình thường của website, không dính nội dung chatbot.
   */
  from?: 'header' | 'chat'
}

export const openAuthModal = (mode?: OpenAuthDetail['mode'], from: OpenAuthDetail['from'] = 'header') =>
  window.dispatchEvent(new CustomEvent<OpenAuthDetail>(OPEN_AUTH, { detail: { mode, from } }))

export const notifySessionChanged = () => window.dispatchEvent(new Event(SESSION_CHANGED))
