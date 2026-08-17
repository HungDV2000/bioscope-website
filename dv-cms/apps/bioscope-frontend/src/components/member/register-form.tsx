'use client'

import { useState, useTransition } from 'react'
import { UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { memberRegister } from '@/lib/member/actions'
import type { MemberMessages } from '@/lib/i18n/member-messages'
import { GoogleButton } from './google-button'
import { CustomerTypePicker } from './customer-type-picker'
import { PasswordField, passwordStringsVi, passwordStringsEn } from './password-field'
import type { CustomerType } from '@/lib/member/types'

const field =
  'mt-1.5 w-full rounded-xl border border-primary-border bg-white px-4 py-3 text-[15px] outline-none transition-colors focus:border-primary/50'
const label = 'text-[13px] font-semibold text-ink/60'

export function MemberRegisterForm({
  m,
  loginM,
  googleEnabled,
  returnTo,
  locale = 'vi',
}: {
  m: MemberMessages['register']
  loginM: MemberMessages['login']
  googleEnabled: boolean
  returnTo?: string
  locale?: 'vi' | 'en'
}) {
  const pw = locale === 'en' ? passwordStringsEn : passwordStringsVi
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  // Mặc định doanh nghiệp: đây là cổng đối tác B2B.
  const [customerType, setCustomerType] = useState<CustomerType>('business')
  const isBusiness = customerType === 'business'
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const password = String(fd.get('password') ?? '')
    if (password.length < 8) {
      setError(m.passwordHint)
      return
    }
    // Chốt chặn cuối: cảnh báo dưới ô nhập chỉ là gợi ý lúc gõ.
    if (String(fd.get('passwordConfirm') ?? '') !== password) {
      setError(pw.mismatch)
      return
    }
    startTransition(async () => {
      const r = await memberRegister({
        email: String(fd.get('email') ?? '').trim(),
        password,
        customerType,
        // Khách cá nhân không gửi thông tin doanh nghiệp.
        company: isBusiness ? String(fd.get('company') ?? '').trim() : undefined,
        taxCode: isBusiness ? String(fd.get('taxCode') ?? '').trim() || undefined : undefined,
        position: isBusiness ? String(fd.get('position') ?? '').trim() || undefined : undefined,
        contactName: String(fd.get('contactName') ?? '').trim(),
        phone: String(fd.get('phone') ?? '').trim() || undefined,
      })
      if (r.ok) {
        setDone(true)
        return
      }
      if (r.error === 'email_taken') setError(m.errors.emailTaken)
      else if (r.error === 'network') setError(m.errors.network)
      else setError(m.errors.invalid)
    })
  }

  if (done) {
    return (
      <div className="space-y-5 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
        <div>
          <p className="text-[16px] font-bold text-ink">{m.doneTitle}</p>
          <p className="mt-2 text-[14px] leading-relaxed text-ink/65">{m.doneDesc}</p>
        </div>
        <Link
          href={`/member/login${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
          className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3.5 text-[15px] font-semibold text-white hover:bg-primary-dark"
        >
          {m.signIn}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {googleEnabled && (
        <>
          <GoogleButton label={loginM.google} returnTo={returnTo} />
          <div className="flex items-center gap-3 text-[12.5px] uppercase tracking-wide text-ink/35">
            <span className="h-px flex-1 bg-primary-border/60" />
            {loginM.or}
            <span className="h-px flex-1 bg-primary-border/60" />
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <CustomerTypePicker
          t={{
            legend: m.typeLegend,
            business: m.typeBusiness,
            businessHint: m.typeBusinessHint,
            individual: m.typeIndividual,
            individualHint: m.typeIndividualHint,
          }}
          value={customerType}
          onChange={setCustomerType}
        />
        {isBusiness && (
          <>
            <div>
              <label htmlFor="reg-company" className={label}>
                {m.company}
              </label>
              <input id="reg-company" name="company" required maxLength={200} className={field} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="reg-tax" className={label}>
                  {m.taxCode}
                </label>
                <input id="reg-tax" name="taxCode" maxLength={40} inputMode="numeric" className={field} />
              </div>
              <div>
                <label htmlFor="reg-pos" className={label}>
                  {m.position}
                </label>
                <input id="reg-pos" name="position" maxLength={120} className={field} />
              </div>
            </div>
          </>
        )}
        <div>
          <label htmlFor="reg-contact" className={label}>
            {isBusiness ? m.contactName : m.contactNameIndividual}
          </label>
          <input id="reg-contact" name="contactName" required maxLength={120} className={field} />
        </div>
        <div>
          <label htmlFor="reg-phone" className={label}>
            {m.phone}
          </label>
          <input id="reg-phone" name="phone" type="tel" maxLength={40} autoComplete="tel" className={field} />
        </div>
        <div>
          <label htmlFor="reg-email" className={label}>
            {m.email}
          </label>
          <input id="reg-email" name="email" type="email" required autoComplete="email" className={field} />
        </div>
        <PasswordField
          t={pw}
          id="reg-password"
          label={m.password}
          hint={m.passwordHint}
          inputClass={field}
          labelClass={label}
          minLength={8}
          strength
          confirm
        />

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
        >
          <UserPlus className="h-4 w-4" />
          {isPending ? '…' : m.submit}
        </button>
      </form>
    </div>
  )
}
