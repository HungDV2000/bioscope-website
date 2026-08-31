import { NextResponse } from 'next/server'
import { CMS_URL } from '@/lib/payload'

/**
 * Chuyển tiếp bình luận của khách sang CMS.
 *
 * Vì sao đi vòng qua đây thay vì gọi thẳng CMS từ trình duyệt:
 *  - Địa chỉ CMS nội bộ không lộ ra phía khách.
 *  - Chính sách bảo mật nội dung (CSP) của site chỉ cho gọi cùng nguồn.
 *  - Chuyển tiếp IP thật để CMS đếm đúng giới hạn tần suất — gọi từ máy chủ mà
 *    không gửi header này thì MỌI khách chung một IP và cùng chạm ngưỡng.
 *
 * KHÔNG kiểm tra dữ liệu ở đây. Toàn bộ ràng buộc nằm ở CMS — nơi duy nhất
 * không bỏ qua được.
 */
const INTERNAL = process.env.CMS_INTERNAL_URL || CMS_URL

export async function POST(req: Request) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    ''

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Dữ liệu không hợp lệ.' }, { status: 400 })
  }

  try {
    const res = await fetch(`${INTERNAL}/api/blog-comments/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(ip ? { 'x-forwarded-for': ip } : {}),
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    })
    return NextResponse.json(await res.json(), { status: res.status })
  } catch {
    return NextResponse.json({ ok: false, error: 'Không gửi được, thử lại sau.' }, { status: 502 })
  }
}
