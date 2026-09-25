'use client'

/**
 * Gọi cổng `/lp-api/<slug>/…` cùng tên miền. Không bao giờ ném lỗi: mạng rớt
 * cũng trả `{ ok:false, error:'network' }` để giao diện hiện câu dễ hiểu.
 */
export type ApiResult<T = Record<string, unknown>> = { ok: boolean; status: number; data: T & { error?: string } }

export async function lpApi<T = Record<string, unknown>>(
  slug: string,
  path: string,
  init: { method?: 'GET' | 'POST'; json?: unknown; form?: FormData } = {},
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`/lp-api/${slug}/${path}`, {
      method: init.method ?? (init.json !== undefined || init.form ? 'POST' : 'GET'),
      credentials: 'same-origin',
      cache: 'no-store',
      ...(init.form
        ? { body: init.form }
        : init.json !== undefined
          ? { body: JSON.stringify(init.json), headers: { 'content-type': 'application/json' } }
          : {}),
    })
    const data = (await res.json().catch(() => ({}))) as T & { error?: string }
    return { ok: res.ok, status: res.status, data }
  } catch {
    return { ok: false, status: 0, data: { error: 'network' } as T & { error?: string } }
  }
}

/** Mã lỗi của CMS → câu nói với người lớn tuổi. */
const MESSAGES: Record<string, string> = {
  network: 'Mạng đang chập chờn, bạn thử lại giúp mình nhé.',
  rate_limited: 'Bạn thao tác hơi nhanh, chờ một chút rồi thử lại nhé.',
  invalid_phone: 'Số này chưa đúng, bạn xem lại nhé. Ví dụ: 0912345678',
  invalid_name: 'Bạn ghi cả họ và tên nhé',
  invalid_address: 'Bạn ghi địa chỉ đầy đủ để shipper dễ tìm nhé',
  consent_required: 'Bạn tick vào ô đồng ý giúp mình nhé',
  campaign_closed: 'Chương trình đã khép lại, không nhận thêm người mới.',
  otp_wrong: 'Mã chưa đúng, bạn xem lại tin nhắn nhé.',
  otp_expired: 'Mã đã hết hạn, bạn bấm "Gửi lại mã" nhé.',
  otp_too_many: 'Nhập sai nhiều lần quá, bạn bấm "Gửi lại mã" nhé.',
  too_soon: 'Mã vừa được gửi, bạn chờ chút rồi hãy gửi lại.',
  phone_limit: 'Số này đã nhận nhiều mã quá, bạn thử lại sau một giờ nhé.',
  ip_limit: 'Mạng này đã xin nhiều mã quá, bạn thử lại sau nhé.',
  send_failed: 'Chưa gửi được tin nhắn, bạn thử lại sau ít phút nhé.',
  blocked: 'Số này đang tạm khoá, bạn gọi hotline giúp mình nhé.',
  no_session: 'Phiên đã hết, bạn điền lại số điện thoại nhé.',
  too_short: 'Bạn xem thêm chút nữa là được cộng điểm nhé.',
  bad_token: 'Bạn mở lại video giúp mình nhé.',
  too_large: 'File ghi âm lớn quá (tối đa 15 MB).',
  not_audio: 'File này không phải ghi âm, bạn chọn file khác nhé.',
  no_file: 'Chưa có bản ghi âm nào.',
  result_locked: 'Việc này mở khi bạn đã dùng sản phẩm được hai tuần.',
  too_many_orders: 'Số này vừa đặt nhiều đơn rồi, Bioscope sẽ gọi bạn sớm.',
}

export function errorText(error: string | undefined, fallback = 'Có trục trặc nhỏ, bạn thử lại giúp mình nhé.'): string {
  return (error && MESSAGES[error]) || fallback
}

/** Đẩy sự kiện cho GTM (nếu chiến dịch có gắn). */
export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return
  const w = window as unknown as { dataLayer?: unknown[] }
  ;(w.dataLayer ??= []).push({ event: `lp_${event}`, ...params })
}
