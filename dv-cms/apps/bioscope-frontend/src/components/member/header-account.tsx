'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserRound, LogIn, FileText, UserCog, LogOut } from 'lucide-react'
import { useLocale } from '@/lib/i18n/context'
import { cn } from '@/lib/utils'
import { SESSION_CHANGED, openAuthModal } from '@/lib/member/session-events'

type Session = { loggedIn: boolean; name: string; approved: boolean }

/**
 * Nút tài khoản ở header.
 *  - Chưa đăng nhập → icon dẫn tới trang đăng nhập, quay lại đúng trang đang xem.
 *  - Đã đăng nhập  → icon + tên, mở menu: Tài khoản / Tài liệu B2B / Đăng xuất.
 *
 * Trạng thái lấy ở trình duyệt (không phải lúc dựng trang) để header vẫn nằm
 * trong bộ nhớ đệm tĩnh, tránh phải render động toàn site.
 */
export function HeaderAccount({
  className,
  /**
   * Luôn hiện chữ, kể cả màn hẹp. Dùng cho bảng menu mobile — ở đó nút nằm
   * riêng một hàng nên thừa chỗ, còn trên thanh header thì phải nhường chỗ cho
   * logo và nút menu.
   */
  labelAlways = false,
}: {
  className?: string
  labelAlways?: boolean
}) {
  const { t } = useLocale()
  const pathname = usePathname()
  const [session, setSession] = useState<Session | null>(null)
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  // Đọc lại khi đổi trang, và khi widget chat báo vừa đăng nhập xong.
  useEffect(() => {
    let stop = false
    const load = () =>
      fetch('/api/member/session')
        .then((r) => r.json())
        .then((d: Session) => {
          if (!stop) setSession(d)
        })
        .catch(() => {})
    void load()
    window.addEventListener(SESSION_CHANGED, load)
    return () => {
      stop = true
      window.removeEventListener(SESSION_CHANGED, load)
    }
  }, [pathname])

  // Đóng menu khi bấm ra ngoài hoặc nhấn Esc.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Chưa biết trạng thái → giữ chỗ để header không bị giật khi dữ liệu về.
  if (!session) return <span className={cn('h-10 w-10', className)} aria-hidden />

  if (!session.loggedIn) {
    // Mở popup ngay tại trang đang xem, không điều hướng sang /member/login.
    //
    // Có CHỮ "Đăng nhập" chứ không để mỗi icon: mũi tên vào-cửa là quy ước của
    // dân kỹ thuật, khách doanh nghiệp nhìn không đoán ra. Dưới 640px thì ẩn
    // chữ vì header còn nút ngôn ngữ và nút menu — nhưng ở đó popup vẫn mở
    // được từ menu, nơi chữ hiện đầy đủ.
    //
    // Hình dáng cố ý GIỐNG HỆT nút khi đã đăng nhập (cùng chiều cao, cùng viên
    // thuốc, cùng vòng tròn icon) để header không nhảy layout lúc đăng nhập xong.
    return (
      <button
        type="button"
        onClick={() => openAuthModal()}
        // Giữ aria-label cho màn hẹp, lúc đó chữ bị ẩn nên nút không còn tên.
        aria-label={t.header.signIn}
        title={t.header.signIn}
        className={cn(
          'flex h-10 shrink-0 items-center gap-2 rounded-full border border-primary-border bg-white pl-1.5 pr-1.5 text-primary-dark transition-colors hover:bg-primary-tint',
          labelAlways ? 'pr-3.5' : 'sm:pr-3.5',
          className,
        )}
      >
        {/* Khi chữ bị ẩn, bỏ nền tròn bên trong — nếu không nút thành hai vòng
            tròn lồng nhau, nhìn rối và không rõ là nút gì. */}
        <span
          className={cn(
            'grid h-7 w-7 shrink-0 place-items-center rounded-full',
            labelAlways ? 'bg-primary-tint' : 'sm:bg-primary-tint',
          )}
        >
          <LogIn className="h-[15px] w-[15px]" strokeWidth={1.9} />
        </span>
        <span
          className={cn(
            'whitespace-nowrap text-[13.5px] font-semibold',
            labelAlways ? 'inline' : 'hidden sm:inline',
          )}
        >
          {t.header.signIn}
        </span>
      </button>
    )
  }

  const firstName = session.name.trim().split(/\s+/).slice(-1)[0] || session.name

  return (
    <div ref={boxRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t.header.account}
        aria-expanded={open}
        className={cn(
          'flex h-10 items-center gap-2 rounded-full border border-primary-border bg-white pl-1.5 pr-1 text-primary-dark transition-colors hover:bg-primary-tint',
          labelAlways ? 'pr-3' : 'sm:pr-3',
        )}
      >
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary-tint">
          <UserRound className="h-[15px] w-[15px]" strokeWidth={1.9} />
        </span>
        <span
          className={cn(
            'max-w-[110px] truncate text-[13.5px] font-semibold',
            labelAlways ? 'inline' : 'hidden sm:inline',
          )}
        >
          {firstName}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 overflow-hidden rounded-2xl border border-primary-border/60 bg-white py-1.5 shadow-card">
          <p className="truncate px-4 py-2 text-[12px] text-ink/45">{session.name}</p>
          <Link
            href="/member/tai-khoan"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-[13.5px] font-medium text-ink/75 hover:bg-mist/70 hover:text-primary-dark"
          >
            <UserCog className="h-4 w-4" strokeWidth={1.8} />
            {t.header.myAccount}
          </Link>
          {session.approved && (
            <Link
              href="/member/documents"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-[13.5px] font-medium text-ink/75 hover:bg-mist/70 hover:text-primary-dark"
            >
              <FileText className="h-4 w-4" strokeWidth={1.8} />
              {t.header.myDocuments}
            </Link>
          )}
          <form action="/api/member/logout" method="post" className="border-t border-primary-border/40">
            <input type="hidden" name="returnTo" value={pathname} />
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13.5px] font-medium text-ink/60 hover:bg-mist/70 hover:text-ink"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.8} />
              {t.header.signOut}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
