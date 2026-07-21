'use client'

import { useState } from 'react'
import { Send, Check, Loader2 } from 'lucide-react'
import { useLocale } from '@/lib/i18n/context'

const isEmail = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)

/**
 * Footer newsletter signup. Posts to the shared /api/forms/submit endpoint with
 * the "Newsletter" form title (resolved to a Payload form on the CMS side). Falls
 * back to a friendly error if the form isn't configured yet.
 */
export function FooterNewsletter() {
  const { t } = useLocale()
  const n = t.footer.newsletter
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('') // honeypot
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isEmail(email) || status === 'sending') return
    setStatus('sending')
    try {
      const res = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formTitle: 'Newsletter', data: { email }, website }),
      })
      setStatus(res.ok ? 'done' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <p className="flex items-center gap-2.5 rounded-full bg-primary-tint px-5 py-3 text-[14px] font-medium text-primary-dark">
        <Check className="h-4 w-4 shrink-0" strokeWidth={2.4} />
        {n.success}
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="w-full">
      <div className="flex flex-col gap-2.5">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (status === 'error') setStatus('idle')
          }}
          placeholder={n.placeholder}
          aria-label={n.placeholder}
          className="w-full rounded-xl border border-primary-border bg-white px-4 py-3 text-[14px] text-ink shadow-sm transition-colors placeholder:text-ink/40 focus:border-primary focus:outline-none"
        />
        {/* Honeypot: hidden from real users. */}
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="hidden"
          aria-hidden
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-[14px] font-semibold text-white shadow-soft transition-all duration-300 hover:bg-primary-dark disabled:opacity-70"
        >
          {status === 'sending' ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.2} />
          ) : (
            <Send className="h-4 w-4" strokeWidth={2} />
          )}
          {n.cta}
        </button>
      </div>
      {status === 'error' && <p className="mt-2 text-[12.5px] text-red-500">{n.error}</p>}
    </form>
  )
}
