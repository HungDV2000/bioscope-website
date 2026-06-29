'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { LogIn, AlertCircle } from 'lucide-react'
import { memberLogin } from '@/lib/member/actions'
import type { MemberMessages } from '@/lib/i18n/member-messages'

export function MemberLoginForm({ m }: { m: MemberMessages['login'] }) {
  const [error, setError] = useState<string | null>(null)
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
      if (result.pending) {
        setPending(true)
        setError(m.errors.pending)
        return
      }
      if (result.error === 'invalid_credentials') setError(m.errors.invalid)
      else if (result.error === 'rejected') setError(m.errors.rejected)
      else if (result.error === 'network') setError(m.errors.network)
      else if (result.error) setError(m.errors.invalid)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-[14px] ${
            pending
              ? 'border-accent/30 bg-accent-soft text-ink/80'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

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
          defaultValue="member@acme.com"
          className="mt-1.5 w-full rounded-xl border border-primary-border bg-white px-4 py-3 text-[15px] outline-none transition-colors focus:border-primary/50"
        />
      </div>

      <div>
        <label htmlFor="member-password" className="text-[13px] font-semibold text-ink/60">
          {m.password}
        </label>
        <input
          id="member-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          defaultValue="Member@123"
          className="mt-1.5 w-full rounded-xl border border-primary-border bg-white px-4 py-3 text-[15px] outline-none transition-colors focus:border-primary/50"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
      >
        <LogIn className="h-4 w-4" />
        {isPending ? '…' : m.submit}
      </button>

      <p className="text-center text-[13px]">
        <Link href="/" className="font-medium text-primary hover:text-primary-dark">
          {m.backToSite}
        </Link>
      </p>
    </form>
  )
}
