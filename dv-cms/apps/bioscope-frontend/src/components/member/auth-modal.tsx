'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { useLocale } from '@/lib/i18n/context'
import { cn } from '@/lib/utils'
import { MemberAuthForm, type AuthFormStrings } from './member-auth-form'
import { OPEN_AUTH, type OpenAuthDetail } from '@/lib/member/session-events'

const STRINGS: Record<'vi' | 'en', AuthFormStrings & { close: string; tabLogin: string; tabRegister: string; benefit: string }> = {
  vi: {
    close: 'Đóng',
    tabLogin: 'Đăng nhập',
    tabRegister: 'Đăng ký',
    titleChoose: 'Chào mừng đến Bioscope',
    titleLogin: 'Đăng nhập tài khoản đối tác',
    titleRegister: 'Tạo tài khoản đối tác',
    desc: 'Đăng nhập để trao đổi trực tiếp với đội ngũ Bioscope và truy cập tài liệu kỹ thuật dành riêng cho đối tác.',
    benefit: 'Miễn phí · Duyệt nhanh · Bảo mật thông tin doanh nghiệp',
    loginBtn: 'Đăng nhập',
    registerBtn: 'Đăng ký tài khoản',
    google: 'Tiếp tục với Google',
    or: 'hoặc',
    back: 'Quay lại',
    email: 'Email công việc',
    password: 'Mật khẩu',
    company: 'Tên công ty',
    contactName: 'Người liên hệ',
    phone: 'Số điện thoại',
    passwordHint: 'Tối thiểu 8 ký tự.',
    submitLogin: 'Đăng nhập',
    submitRegister: 'Tạo tài khoản',
    errInvalid: 'Sai email hoặc mật khẩu.',
    errTaken: 'Email này đã được đăng ký.',
    errNetwork: 'Không kết nối được máy chủ. Thử lại sau.',
    errShort: 'Mật khẩu phải từ 8 ký tự.',
  },
  en: {
    close: 'Close',
    tabLogin: 'Sign in',
    tabRegister: 'Sign up',
    titleChoose: 'Welcome to Bioscope',
    titleLogin: 'Sign in to your partner account',
    titleRegister: 'Create a partner account',
    desc: 'Sign in to talk directly with the Bioscope team and access technical documents reserved for partners.',
    benefit: 'Free · Fast approval · Your company data stays private',
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
    submitRegister: 'Create account',
    errInvalid: 'Invalid email or password.',
    errTaken: 'This email is already registered.',
    errNetwork: 'Could not reach server. Try again later.',
    errShort: 'Password must be at least 8 characters.',
  },
}

/**
 * Popup đăng nhập/đăng ký dùng chung toàn site. Gắn một lần ở layout; header và
 * widget chat chỉ cần phát sự kiện OPEN_AUTH để mở.
 *
 * Lời chào của chatbot CHỈ hiện khi mở từ khung chat — mở từ header là việc
 * đăng nhập bình thường của website, không dính nội dung chatbot.
 */
export function AuthModal() {
  const { locale } = useLocale()
  const t = STRINGS[locale] ?? STRINGS.vi
  const pathname = usePathname()

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'choose' | 'login' | 'register'>('choose')
  const [fromChat, setFromChat] = useState(false)
  const [googleEnabled, setGoogleEnabled] = useState(false)
  const [chatGreeting, setChatGreeting] = useState<string | undefined>()
  const panelRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    const onOpen = (e: Event) => {
      const d = (e as CustomEvent<OpenAuthDetail>).detail
      setMode(d?.mode ?? 'choose')
      setFromChat(d?.from === 'chat')
      setOpen(true)
    }
    window.addEventListener(OPEN_AUTH, onOpen)
    return () => window.removeEventListener(OPEN_AUTH, onOpen)
  }, [])

  // Có bật Google không (luôn cần) + lời chào chatbot (chỉ khi mở từ chat).
  useEffect(() => {
    if (!open) return
    void fetch('/api/member/session')
      .then((r) => r.json())
      .then((s: { googleEnabled?: boolean }) => setGoogleEnabled(Boolean(s.googleEnabled)))
      .catch(() => {})
    if (!fromChat) return
    void fetch(`/api/chat/config?locale=${locale}`)
      .then((r) => r.json())
      .then((c: { loginGreeting?: string }) => setChatGreeting(c.loginGreeting || undefined))
      .catch(() => {})
  }, [open, locale, fromChat])

  // Khoá cuộn nền + đóng bằng Esc khi popup đang mở.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    document.addEventListener('keydown', onKey)
    panelRef.current?.focus()
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  if (!open) return null

  const tab = (target: 'login' | 'register', labelText: string) => (
    <button
      type="button"
      onClick={() => setMode(target)}
      className={cn(
        'relative flex-1 rounded-full px-4 py-2 text-[13.5px] font-semibold transition-colors',
        mode === target ? 'bg-white text-primary-dark shadow-sm' : 'text-ink/50 hover:text-primary-dark',
      )}
      aria-pressed={mode === target}
    >
      {labelText}
    </button>
  )

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-ink/50 p-4 backdrop-blur-sm"
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
        className="relative my-auto w-full max-w-[440px] overflow-hidden rounded-[1.75rem] border border-primary-border/50 bg-white shadow-card outline-none"
      >
        {/* Dải đầu: logo + tiêu đề, tạo cảm giác một trang đăng nhập thực thụ */}
        <div className="relative bg-gradient-to-b from-primary-tint/70 to-white px-7 pb-5 pt-7 text-center sm:px-8">
          <button
            type="button"
            onClick={close}
            aria-label={t.close}
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-ink/40 transition-colors hover:bg-white/80 hover:text-ink"
          >
            <X className="h-[18px] w-[18px]" />
          </button>

          <Image
            src="/logo.avif"
            alt="Bioscope"
            width={150}
            height={42}
            className="mx-auto h-9 w-auto"
          />
          <h2 className="mt-4 text-[19px] font-bold tracking-tight text-ink">
            {mode === 'register' ? t.titleRegister : mode === 'login' ? t.titleLogin : t.titleChoose}
          </h2>

          {/* Lời chào chatbot chỉ dùng khi khách bấm từ khung chat */}
          {mode === 'choose' &&
            (fromChat && chatGreeting ? (
              <div
                className="chat-greeting mx-auto mt-2.5 max-w-[330px] text-[13.5px] leading-relaxed text-ink/65"
                dangerouslySetInnerHTML={{ __html: chatGreeting }}
              />
            ) : (
              <p className="mx-auto mt-2.5 max-w-[330px] text-[13.5px] leading-relaxed text-ink/65">
                {t.desc}
              </p>
            ))}
        </div>

        <div className="px-7 pb-7 sm:px-8 sm:pb-8">
          {/* Chuyển nhanh giữa đăng nhập / đăng ký */}
          {mode !== 'choose' && (
            <div className="mb-5 flex gap-1 rounded-full bg-mist/70 p-1">
              {tab('login', t.tabLogin)}
              {tab('register', t.tabRegister)}
            </div>
          )}

          <MemberAuthForm
            t={t}
            mode={mode}
            setMode={setMode}
            googleEnabled={googleEnabled}
            returnTo={pathname}
            onDone={close}
            hideHeading
          />

          {mode === 'choose' && (
            <p className="mt-5 text-center text-[12px] text-ink/40">{t.benefit}</p>
          )}
        </div>
      </div>
    </div>
  )
}
