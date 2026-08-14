import { NextResponse } from 'next/server'
import { getMemberSession } from '@/lib/member/auth'
import { getPublicAuthConfig } from '@/lib/member/public-config'

/**
 * Trạng thái đăng nhập cho các thành phần chạy ở trình duyệt (nút tài khoản ở
 * header, widget chat). Chỉ trả tên hiển thị + trạng thái duyệt — không lộ
 * thêm dữ liệu tài khoản.
 */
export const dynamic = 'force-dynamic'

export async function GET() {
  const [session, cfg] = await Promise.all([getMemberSession(), getPublicAuthConfig()])
  const ok = Boolean(session) && session?.status !== 'rejected'
  return NextResponse.json(
    {
      loggedIn: ok,
      // Widget dùng để biết token chat đang lưu là của tài khoản nào.
      id: ok ? String(session?.id ?? '') : '',
      name: ok ? (session?.contactName ?? session?.email ?? '') : '',
      email: ok ? (session?.email ?? '') : '',
      // Khu tài liệu B2B chỉ mở khi đã được admin duyệt.
      approved: ok && session?.status === 'approved',
      // Widget cần biết có hiện nút Google trong khung đăng nhập không.
      googleEnabled: cfg.googleEnabled,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
