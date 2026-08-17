import type { Metadata } from 'next'
import { getMemberSession } from '@/lib/member/auth'
import { getLocale } from '@/lib/i18n/server'
import { getMemberMessages } from '@/lib/i18n/member-messages'
import { MemberPortalShell } from '@/components/member/portal-shell'
import { AccountForms } from '@/components/member/account-forms'

export const metadata: Metadata = {
  title: 'Tài khoản của tôi',
  robots: { index: false, follow: false },
}

export default async function MemberAccountPage() {
  const session = await getMemberSession()
  if (!session) return null

  const locale = await getLocale()
  const m = getMemberMessages(locale)

  return (
    <MemberPortalShell session={session} m={m} portalName={m.portalName} demoBanner={m.demoBanner}>
      <div className="space-y-6">
        <div>
          <h1 className="text-[1.75rem] font-bold tracking-tight text-ink">{m.account.title}</h1>
          <p className="mt-2 max-w-2xl text-[14.5px] text-ink/60">{m.account.desc}</p>
        </div>
        <AccountForms m={m.account} session={session} locale={locale} />
      </div>
    </MemberPortalShell>
  )
}
