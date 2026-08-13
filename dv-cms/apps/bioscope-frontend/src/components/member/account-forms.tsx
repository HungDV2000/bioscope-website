'use client'

import { useState, useTransition } from 'react'
import { Save, KeyRound, AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { updateMemberProfile, changeMemberPassword } from '@/lib/member/actions'
import type { MemberMessages } from '@/lib/i18n/member-messages'
import type { MemberSession } from '@/lib/member/types'

const field =
  'mt-1.5 w-full rounded-xl border border-primary-border bg-white px-4 py-3 text-[15px] outline-none transition-colors focus:border-primary/50 disabled:bg-mist/50 disabled:text-ink/50'
const label = 'text-[13px] font-semibold text-ink/60'
const card = 'rounded-[1.5rem] border border-primary-border/60 bg-white p-6 sm:p-7'

function Note({ tone, children }: { tone: 'ok' | 'err' | 'info'; children: React.ReactNode }) {
  const Icon = tone === 'ok' ? CheckCircle2 : tone === 'err' ? AlertCircle : Info
  const cls =
    tone === 'ok'
      ? 'border-primary/25 bg-primary-tint/50 text-primary-dark'
      : tone === 'err'
        ? 'border-red-200 bg-red-50 text-red-800'
        : 'border-accent/30 bg-accent-soft text-ink/75'
  return (
    <div className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-[13.5px] ${cls}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  )
}

export function AccountForms({ m, session }: { m: MemberMessages['account']; session: MemberSession }) {
  // ── Hồ sơ ──
  const [pMsg, setPMsg] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null)
  const [savingProfile, startProfile] = useTransition()

  const submitProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPMsg(null)
    const fd = new FormData(e.currentTarget)
    startProfile(async () => {
      const r = await updateMemberProfile({
        company: String(fd.get('company') ?? '').trim(),
        contactName: String(fd.get('contactName') ?? '').trim(),
        phone: String(fd.get('phone') ?? '').trim() || undefined,
      })
      setPMsg(r.ok ? { tone: 'ok', text: m.saved } : { tone: 'err', text: m.errors.failed })
    })
  }

  // ── Mật khẩu ──
  // Tài khoản Google chưa từng đặt mật khẩu → "Đặt mật khẩu", không hỏi mật khẩu cũ.
  const isGoogleOnly = session.authProvider === 'google'
  const [wMsg, setWMsg] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null)
  const [savingPw, startPw] = useTransition()

  const submitPassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setWMsg(null)
    const form = e.currentTarget
    const fd = new FormData(form)
    const next = String(fd.get('newPassword') ?? '')
    const confirm = String(fd.get('confirmPassword') ?? '')
    if (next.length < 8) return setWMsg({ tone: 'err', text: m.errors.tooShort })
    if (next !== confirm) return setWMsg({ tone: 'err', text: m.errors.mismatch })

    startPw(async () => {
      const r = await changeMemberPassword({
        currentPassword: String(fd.get('currentPassword') ?? '') || undefined,
        newPassword: next,
      })
      if (r.ok) {
        setWMsg({ tone: 'ok', text: m.changed })
        form.reset()
      } else if (r.error === 'too_short') setWMsg({ tone: 'err', text: m.errors.tooShort })
      else setWMsg({ tone: 'err', text: m.errors.wrongCurrent })
    })
  }

  return (
    <div className="space-y-6">
      {session.status !== 'approved' && <Note tone="info">{m.statusPendingNote}</Note>}

      <form onSubmit={submitProfile} className={card}>
        <h2 className="text-[16px] font-bold text-ink">{m.profileTitle}</h2>
        <div className="mt-5 space-y-4">
          {pMsg && <Note tone={pMsg.tone}>{pMsg.text}</Note>}
          <div>
            <label htmlFor="ac-email" className={label}>
              {m.email}
            </label>
            <input id="ac-email" value={session.email} disabled className={field} />
            <p className="mt-1.5 text-[12.5px] text-ink/45">{m.emailNote}</p>
          </div>
          <div>
            <label htmlFor="ac-company" className={label}>
              {m.company}
            </label>
            <input
              id="ac-company"
              name="company"
              required
              maxLength={200}
              defaultValue={session.company}
              className={field}
            />
          </div>
          <div>
            <label htmlFor="ac-contact" className={label}>
              {m.contactName}
            </label>
            <input
              id="ac-contact"
              name="contactName"
              required
              maxLength={120}
              defaultValue={session.contactName}
              className={field}
            />
          </div>
          <div>
            <label htmlFor="ac-phone" className={label}>
              {m.phone}
            </label>
            <input
              id="ac-phone"
              name="phone"
              type="tel"
              maxLength={40}
              defaultValue={session.phone ?? ''}
              className={field}
            />
          </div>
          <button
            type="submit"
            disabled={savingProfile}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {savingProfile ? '…' : m.save}
          </button>
        </div>
      </form>

      <form onSubmit={submitPassword} className={card}>
        <h2 className="text-[16px] font-bold text-ink">
          {isGoogleOnly ? m.passwordSetTitle : m.passwordTitle}
        </h2>
        <div className="mt-5 space-y-4">
          {isGoogleOnly && <Note tone="info">{m.googleNote}</Note>}
          {wMsg && <Note tone={wMsg.tone}>{wMsg.text}</Note>}
          {!isGoogleOnly && (
            <div>
              <label htmlFor="ac-current" className={label}>
                {m.currentPassword}
              </label>
              <input
                id="ac-current"
                name="currentPassword"
                type="password"
                required
                autoComplete="current-password"
                className={field}
              />
            </div>
          )}
          <div>
            <label htmlFor="ac-new" className={label}>
              {m.newPassword}
            </label>
            <input
              id="ac-new"
              name="newPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className={field}
            />
          </div>
          <div>
            <label htmlFor="ac-confirm" className={label}>
              {m.confirmPassword}
            </label>
            <input
              id="ac-confirm"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className={field}
            />
          </div>
          <button
            type="submit"
            disabled={savingPw}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            <KeyRound className="h-4 w-4" />
            {savingPw ? '…' : m.changeSubmit}
          </button>
        </div>
      </form>
    </div>
  )
}
