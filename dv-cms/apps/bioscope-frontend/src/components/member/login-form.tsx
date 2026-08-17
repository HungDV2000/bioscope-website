'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { LogIn, AlertCircle } from 'lucide-react'
import { memberLogin } from '@/lib/member/actions'
import type { MemberMessages } from '@/lib/i18n/member-messages'
import { GoogleButton } from './google-button'
import { PasswordField, passwordStringsVi, passwordStringsEn } from './password-field'

export function MemberLoginForm({
  m,
  googleEnabled,
  returnTo,
  initialError,
  locale = 'vi',
}: {
  m: MemberMessages['login']
  googleEnabled: boolean
  returnTo?: string
  initialError?: string | null
  locale?: 'vi' | 'en'
}) {
  const mapError = (code?: string | null) => {
    switch (code) {
      case 'google_off':
        return m.errors.googleOff
      case 'google_cancelled':
      case 'google_state':
      case 'google_code':
      case 'google_exchange':
        return m.errors.googleFailed
      case 'server':
        return m.errors.server
      case 'network':
        return m.errors.network
      default:
        return code ? m.errors.invalid : null
    }
  }

  const [error, setError] = useState<string | null>(mapError(initialError))
  const [pending, setPending] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setPending(false)
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get('email') ?? '')
    const password = String(fd.get('password') ?? '')

    startTransition(async () => {
      const result = await memberLogin(email, password)
      if (result.error === 'invalid_credentials') setError(m.errors.invalid)
      else if (result.error === 'rejected') setError(m.errors.rejected)
      else if (result.error === 'network') setError(m.errors.network)
      else if (result.error === 'server_misconfigured') setError(m.errors.server)
      else if (result.error) setError(m.errors.invalid)
    })
  }

  return (
    <div className="space-y-5">
      {error && (
        <div
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-[14px] ${
            pending ? 'border-accent/30 bg-accent-soft text-ink/80' : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {googleEnabled && (
        <>
          <GoogleButton label={m.google} returnTo={returnTo} />
          <div className="flex items-center gap-3 text-[12.5px] uppercase tracking-wide text-ink/35">
            <span className="h-px flex-1 bg-primary-border/60" />
            {m.or}
            <span className="h-px flex-1 bg-primary-border/60" />
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="member-email" className="text-[13px] font-semibold text-ink/60">
            {m.email}
          </label>
          <input
            id="member-email"
            name="email"
            type="email"
            required
            autoComplete="username"
            className="mt-1.5 w-full rounded-xl border border-primary-border bg-white px-4 py-3 text-[15px] outline-none transition-colors focus:border-primary/50"
          />
        </div>

        <PasswordField
          t={locale === 'en' ? passwordStringsEn : passwordStringsVi}
          id="member-password"
          label={m.password}
          inputClass="mt-1.5 w-full rounded-xl border border-primary-border bg-white px-4 py-3 text-[15px] outline-none transition-colors focus:border-primary/50"
          labelClass="text-[13px] font-semibold text-ink/60"
          autoComplete="current-password"
        />

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
        >
          <LogIn className="h-4 w-4" />
          {isPending ? '…' : m.submit}
        </button>
      </form>

      <p className="text-center text-[13.5px] text-ink/60">
        {m.noAccount}{' '}
        <Link
          href={`/member/dang-ky${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
          className="font-semibold text-primary hover:text-primary-dark"
        >
          {m.signUp}
        </Link>
      </p>
      <p className="text-center text-[13px]">
        <Link href="/" className="font-medium text-ink/50 hover:text-primary">
          {m.backToSite}
        </Link>
      </p>
    </div>
  )
}
