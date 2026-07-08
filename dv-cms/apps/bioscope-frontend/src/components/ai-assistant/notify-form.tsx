'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'

export function AiNotifyForm({
  placeholder,
  buttonLabel,
}: {
  placeholder: string
  buttonLabel: string
}) {
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('') // honeypot
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || busy) return
    setBusy(true)
    try {
      const res = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formTitle: 'Đăng ký sớm Bioscope AI', website, data: { email } }),
      })
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean }
      if (res.ok && json.ok) setSent(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="flex flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        disabled={sent}
        className="min-w-0 flex-1 rounded-xl border border-primary-border bg-white px-4 py-3 text-[14px] text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-primary/50 disabled:opacity-60"
      />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />
      <button
        type="submit"
        disabled={sent || busy}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-default disabled:bg-primary/70"
      >
        <Bell className="h-4 w-4" strokeWidth={2} />
        {sent ? '✓' : buttonLabel}
      </button>
    </form>
  )
}
