'use client'

import { useState } from 'react'
import { LogIn, UserPlus, ArrowLeft, AlertCircle } from 'lucide-react'

/**
 * Đăng nhập / đăng ký NGAY TRONG khung chat — khách không bị đá sang trang khác
 * và không mất ngữ cảnh đang xem.
 *
 * Riêng nút Google buộc phải điều hướng (chuẩn OAuth yêu cầu chuyển sang trang
 * của Google), nhưng có returnTo nên quay lại đúng trang cũ.
 */
export type AuthStrings = {
  loginTitle: string
  loginDesc: string
  loginBtn: string
  registerBtn: string
  google: string
  or: string
  back: string
  email: string
  password: string
  company: string
  contactName: string
  phone: string
  passwordHint: string
  submitLogin: string
  submitRegister: string
  errInvalid: string
  errTaken: string
  errNetwork: string
  errShort: string
}

const input =
  'mt-1 w-full rounded-xl border border-primary-border bg-white px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary/50'
const label = 'text-[12px] font-semibold text-ink/55'

export function ChatAuthPanel({
  t,
  greetingHtml,
  googleEnabled,
  returnTo,
  onAuthed,
}: {
  t: AuthStrings
  greetingHtml?: string
  googleEnabled: boolean
  returnTo: string
  onAuthed: () => void
}) {
  const [mode, setMode] = useState<'choose' | 'login' | 'register'>('choose')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent<HTMLFormElement>, action: 'login' | 'register') => {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const password = String(fd.get('password') ?? '')
    if (action === 'register' && password.length < 8) return setError(t.errShort)

    setBusy(true)
    try {
      const r = await fetch('/api/member/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          email: String(fd.get('email') ?? ''),
          password,
          ...(action === 'register'
            ? {
                company: String(fd.get('company') ?? ''),
                contactName: String(fd.get('contactName') ?? ''),
                phone: String(fd.get('phone') ?? ''),
              }
            : {}),
        }),
      }).then((x) => x.json())

      if (r?.ok) {
        onAuthed()
        return
      }
      if (r?.error === 'email_taken') setError(t.errTaken)
      else if (r?.error === 'too_short') setError(t.errShort)
      else if (r?.error === 'network') setError(t.errNetwork)
      else setError(t.errInvalid)
    } catch {
      setError(t.errNetwork)
    } finally {
      setBusy(false)
    }
  }

  const Err = () =>
    error ? (
      <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12.5px] text-red-800">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>{error}</span>
      </div>
    ) : null

  const Back = () => (
    <button
      type="button"
      onClick={() => {
        setMode('choose')
        setError(null)
      }}
      className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink/50 hover:text-primary"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      {t.back}
    </button>
  )

  if (mode === 'choose') {
    return (
      <div className="flex flex-1 flex-col justify-center gap-4 overflow-y-auto bg-mist/30 px-6 py-8 text-center">
        <LogIn className="mx-auto h-9 w-9 text-primary/70" />
        <div>
          <p className="text-[15.5px] font-bold text-ink">{t.loginTitle}</p>
          {greetingHtml ? (
            <div
              className="chat-greeting mt-2 text-[13.5px] leading-relaxed text-ink/65"
              dangerouslySetInnerHTML={{ __html: greetingHtml }}
            />
          ) : (
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink/65">{t.loginDesc}</p>
          )}
        </div>

        <div className="space-y-2.5">
          {googleEnabled && (
            <a
              href={`/api/auth/google/start?returnTo=${encodeURIComponent(returnTo)}`}
              className="flex w-full items-center justify-center gap-2.5 rounded-full border border-primary-border bg-white px-6 py-2.5 text-[14px] font-semibold text-ink hover:bg-mist/60"
            >
              <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
                <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
                <path fill="#FBBC05" d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z" />
                <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
              </svg>
              {t.google}
            </a>
          )}
          <button
            type="button"
            onClick={() => setMode('login')}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-[14px] font-semibold text-white hover:bg-primary-dark"
          >
            <LogIn className="h-4 w-4" />
            {t.loginBtn}
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-primary-border bg-white px-6 py-2.5 text-[14px] font-semibold text-primary hover:bg-primary-tint"
          >
            <UserPlus className="h-4 w-4" />
            {t.registerBtn}
          </button>
        </div>
      </div>
    )
  }

  if (mode === 'login') {
    return (
      <form onSubmit={(e) => void submit(e, 'login')} className="flex-1 space-y-3.5 overflow-y-auto bg-mist/30 px-5 py-5">
        <Back />
        <Err />
        <div>
          <label htmlFor="cw-email" className={label}>
            {t.email}
          </label>
          <input id="cw-email" name="email" type="email" required autoComplete="username" className={input} />
        </div>
        <div>
          <label htmlFor="cw-pass" className={label}>
            {t.password}
          </label>
          <input
            id="cw-pass"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className={input}
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-primary px-6 py-2.5 text-[14px] font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {busy ? '…' : t.submitLogin}
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={(e) => void submit(e, 'register')} className="flex-1 space-y-3 overflow-y-auto bg-mist/30 px-5 py-5">
      <Back />
      <Err />
      <div>
        <label htmlFor="cw-company" className={label}>
          {t.company}
        </label>
        <input id="cw-company" name="company" required maxLength={200} className={input} />
      </div>
      <div>
        <label htmlFor="cw-name" className={label}>
          {t.contactName}
        </label>
        <input id="cw-name" name="contactName" required maxLength={120} className={input} />
      </div>
      <div>
        <label htmlFor="cw-phone" className={label}>
          {t.phone}
        </label>
        <input id="cw-phone" name="phone" type="tel" maxLength={40} autoComplete="tel" className={input} />
      </div>
      <div>
        <label htmlFor="cw-remail" className={label}>
          {t.email}
        </label>
        <input id="cw-remail" name="email" type="email" required autoComplete="email" className={input} />
      </div>
      <div>
        <label htmlFor="cw-rpass" className={label}>
          {t.password}
        </label>
        <input
          id="cw-rpass"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={input}
        />
        <p className="mt-1 text-[11.5px] text-ink/40">{t.passwordHint}</p>
      </div>
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-primary px-6 py-2.5 text-[14px] font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
      >
        {busy ? '…' : t.submitRegister}
      </button>
    </form>
  )
}
