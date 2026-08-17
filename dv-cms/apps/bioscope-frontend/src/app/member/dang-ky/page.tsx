import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getMemberSession } from '@/lib/member/auth'
import { getLocale } from '@/lib/i18n/server'
import { getMemberMessages } from '@/lib/i18n/member-messages'
import { MemberRegisterForm } from '@/components/member/register-form'
import { getPublicAuthConfig } from '@/lib/member/public-config'
import { safeReturnTo } from '@/lib/member/google'

export const metadata: Metadata = {
  title: 'Đăng ký tài khoản đối tác',
  robots: { index: false, follow: false },
}

export default async function MemberRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>
}) {
  const sp = await searchParams
  if (await getMemberSession()) redirect(safeReturnTo(sp.returnTo))

  const [locale, cfg] = await Promise.all([getLocale(), getPublicAuthConfig()])
  const m = getMemberMessages(locale)
  const returnTo = sp.returnTo ? safeReturnTo(sp.returnTo) : undefined

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-mist/60 to-white">
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block">
              <Image src="/logo.avif" alt="Bioscope" width={150} height={42} className="mx-auto h-10 w-auto" />
            </Link>
            <h1 className="mt-6 text-[1.65rem] font-bold tracking-tight text-ink">{m.register.title}</h1>
            <p className="mt-2 text-[14.5px] leading-relaxed text-ink/60">{m.register.subtitle}</p>
          </div>

          <div className="rounded-[1.75rem] border border-primary-border/60 bg-white p-8 shadow-card">
            {cfg.allowRegistration ? (
              <MemberRegisterForm
                m={m.register}
                loginM={m.login}
                googleEnabled={cfg.googleEnabled}
                returnTo={returnTo}
                locale={locale}
              />
            ) : (
              <p className="text-center text-[14.5px] text-ink/70">{m.register.errors.off}</p>
            )}
          </div>

          <p className="mt-6 text-center text-[13.5px] text-ink/60">
            {m.register.haveAccount}{' '}
            <Link
              href={`/member/login${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
              className="font-semibold text-primary hover:text-primary-dark"
            >
              {m.register.signIn}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
