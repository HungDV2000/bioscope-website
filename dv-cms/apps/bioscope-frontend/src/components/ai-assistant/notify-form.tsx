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
  const [sent, setSent] = useState(false)

  return (
    <form
      className="flex flex-col gap-3 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault()
        if (!email.trim()) return
        setSent(true)
      }}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        disabled={sent}
        className="min-w-0 flex-1 rounded-xl border border-primary-border bg-white px-4 py-3 text-[14px] text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-primary/50 disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={sent}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-default disabled:bg-primary/70"
      >
        <Bell className="h-4 w-4" strokeWidth={2} />
        {sent ? '✓' : buttonLabel}
      </button>
    </form>
  )
}
