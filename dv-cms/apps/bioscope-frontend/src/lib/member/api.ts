import 'server-only'
import { B2B_API_URL, INTERNAL_API_SECRET } from './config'
import { getMemberSession, getMemberToken } from './auth'

/**
 * Gọi API B2B thay mặt thành viên đang đăng nhập: kèm khoá nội bộ + id thành
 * viên (và JWT nếu có) — xem resolveMember ở module-b2b.
 *
 * KHÔNG được để hàm này trong file 'use server': như vậy nó thành server action
 * gọi được từ trình duyệt, khách truyền `path` tuỳ ý là bắt server gửi request
 * kèm khoá nội bộ đi bất cứ đâu.
 */
export async function b2bFetch(
  path: string,
  init: { method?: 'GET' | 'POST'; body?: unknown } = {},
): Promise<Response> {
  const session = await getMemberSession()
  const token = await getMemberToken()
  return fetch(`${B2B_API_URL}${path}`, {
    method: init.method ?? 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `JWT ${token}` } : {}),
      ...(INTERNAL_API_SECRET && session ? { 'x-internal-secret': INTERNAL_API_SECRET } : {}),
      ...(session ? { 'x-member-id': String(session.id) } : {}),
    },
    ...(init.body !== undefined ? { body: JSON.stringify(init.body) } : {}),
    cache: 'no-store',
  })
}
