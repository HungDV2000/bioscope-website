import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getMemberSession } from '@/lib/member/auth'
import { getLocale } from '@/lib/i18n/server'
import { getMemberMessages } from '@/lib/i18n/member-messages'
import { MemberLoginForm } from '@/components/member/login-form'
import { getPublicAuthConfig } from '@/lib/member/public-config'
import { safeReturnTo } from '@/lib/member/google'

export const metadata: Metadata = {
  title: 'Đăng nhập đối tác',
  robots: { index: false, follow: false },
}

export default async function MemberLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; returnTo?: string }>
}) {
  const sp = await searchParams
  const session = await getMemberSession()
  const returnTo = safeReturnTo(sp.returnTo)
  if (session) redirect(returnTo)

  const [locale, cfg] = await Promise.all([getLocale(), getPublicAuthConfig()])
  const m = getMemberMessages(locale)

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-mist/60 to-white">
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block">
              <Image src="/logo.avif" alt="Bioscope" width={150} height={42} className="mx-auto h-10 w-auto" />
            </Link>
            <h1 className="mt-6 text-[1.65rem] font-bold tracking-tight text-ink">{m.login.title}</h1>
            <p className="mt-2 text-[14.5px] leading-relaxed text-ink/60">{m.login.subtitle}</p>
          </div>

          <div className="rounded-[1.75rem] border border-primary-border/60 bg-white p-8 shadow-card">
            <MemberLoginForm
              m={m.login}
              googleEnabled={cfg.googleEnabled}
              returnTo={sp.returnTo ? returnTo : undefined}
              initialError={sp.error ?? null}
              locale={locale}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
