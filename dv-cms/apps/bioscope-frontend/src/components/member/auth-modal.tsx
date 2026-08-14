'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { useLocale } from '@/lib/i18n/context'
import { MemberAuthForm, type AuthFormStrings } from './member-auth-form'
import { OPEN_AUTH, type OpenAuthDetail } from '@/lib/member/session-events'

const STRINGS: Record<'vi' | 'en', AuthFormStrings & { close: string }> = {
  vi: {
    close: 'Đóng',
    titleChoose: 'Đăng nhập để tiếp tục',
    titleLogin: 'Đăng nhập',
    titleRegister: 'Đăng ký tài khoản đối tác',
    desc: 'Đăng nhập hoặc tạo tài khoản đối tác để nhắn tin với đội ngũ Bioscope và theo dõi tài liệu kỹ thuật.',
    loginBtn: 'Đăng nhập',
    registerBtn: 'Đăng ký tài khoản',
    google: 'Đăng nhập bằng Google',
    or: 'hoặc',
    back: 'Quay lại',
    email: 'Email công việc',
    password: 'Mật khẩu',
    company: 'Tên công ty',
    contactName: 'Người liên hệ',
    phone: 'Số điện thoại',
    passwordHint: 'Tối thiểu 8 ký tự.',
    submitLogin: 'Đăng nhập',
    submitRegister: 'Đăng ký & bắt đầu',
    errInvalid: 'Sai email hoặc mật khẩu.',
    errTaken: 'Email này đã được đăng ký.',
    errNetwork: 'Không kết nối được máy chủ. Thử lại sau.',
    errShort: 'Mật khẩu phải từ 8 ký tự.',
  },
  en: {
    close: 'Close',
    titleChoose: 'Sign in to continue',
    titleLogin: 'Sign in',
    titleRegister: 'Create a partner account',
    desc: 'Sign in or create a partner account to message the Bioscope team and follow technical documents.',
    loginBtn: 'Sign in',
    registerBtn: 'Create account',
    google: 'Continue with Google',
    or: 'or',
    back: 'Back',
    email: 'Work email',
    password: 'Password',
    company: 'Company name',
    contactName: 'Contact person',
    phone: 'Phone number',
    passwordHint: 'At least 8 characters.',
    submitLogin: 'Sign in',
    submitRegister: 'Sign up & start',
    errInvalid: 'Invalid email or password.',
    errTaken: 'This email is already registered.',
    errNetwork: 'Could not reach server. Try again later.',
    errShort: 'Password must be at least 8 characters.',
  },
}

/**
 * Popup đăng nhập/đăng ký dùng chung toàn site. Gắn một lần ở layout; header và
 * widget chat chỉ cần phát sự kiện OPEN_AUTH để mở.
 */
export function AuthModal() {
  const { locale } = useLocale()
  const t = STRINGS[locale] ?? STRINGS.vi
  const pathname = usePathname()

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'choose' | 'login' | 'register'>('choose')
  const [googleEnabled, setGoogleEnabled] = useState(false)
  const [greetingHtml, setGreetingHtml] = useState<string | undefined>()
  const panelRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setOpen(false), [])

  // Mở theo sự kiện từ header / widget chat.
  useEffect(() => {
    const onOpen = (e: Event) => {
      setMode((e as CustomEvent<OpenAuthDetail>).detail?.mode ?? 'choose')
      setOpen(true)
    }
    window.addEventListener(OPEN_AUTH, onOpen)
    return () => window.removeEventListener(OPEN_AUTH, onOpen)
  }, [])

  // Nạp khi mở lần đầu: có bật Google không + lời chào admin soạn cho màn này.
  useEffect(() => {
    if (!open) return
    void Promise.all([
      fetch('/api/member/session').then((r) => r.json()),
      fetch(`/api/chat/config?locale=${locale}`).then((r) => r.json()),
    ])
      .then(([s, c]) => {
        setGoogleEnabled(Boolean((s as { googleEnabled?: boolean }).googleEnabled))
        setGreetingHtml((c as { loginGreeting?: string }).loginGreeting || undefined)
      })
      .catch(() => {})
  }, [open, locale])

  // Khoá cuộn nền + đóng bằng Esc khi popup đang mở.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    document.addEventListener('keydown', onKey)
    // Đưa tiêu điểm vào popup cho người dùng bàn phím / trình đọc màn hình.
    panelRef.current?.focus()
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-ink/45 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        // Chỉ đóng khi bấm ra NỀN, không đóng khi kéo chuột từ trong form ra.
        if (e.target === e.currentTarget) close()
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={t.titleChoose}
        className="relative my-auto w-full max-w-[420px] rounded-[1.75rem] border border-primary-border/60 bg-white p-7 shadow-card outline-none sm:p-8"
      >
        <button
          type="button"
          onClick={close}
          aria-label={t.close}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-ink/40 transition-colors hover:bg-mist hover:text-ink"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        <MemberAuthForm
          t={t}
          mode={mode}
          setMode={setMode}
          greetingHtml={mode === 'choose' ? greetingHtml : undefined}
          googleEnabled={googleEnabled}
          returnTo={pathname}
          onDone={close}
        />
      </div>
    </div>
  )
}
