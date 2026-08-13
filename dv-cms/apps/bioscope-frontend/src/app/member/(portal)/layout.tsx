import { redirect } from 'next/navigation'
import { getMemberSession } from '@/lib/member/auth'

/**
 * Chỉ cần ĐĂNG NHẬP là vào được cổng đối tác (xem tổng quan, sửa hồ sơ, chat).
 * Riêng khu tài liệu B2B mới đòi tài khoản đã được duyệt — kiểm ở trang đó và
 * ở API, không chặn ngay từ đây, để tài khoản chờ duyệt vẫn dùng được phần còn lại.
 */
export default async function MemberPortalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getMemberSession()
  if (!session) redirect('/member/login')
  if (session.status === 'rejected') redirect('/member/login?error=rejected')
  return children
}
