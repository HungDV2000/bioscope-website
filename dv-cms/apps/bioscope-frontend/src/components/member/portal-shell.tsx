'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, LogOut, ExternalLink } from 'lucide-react'
import { memberLogout } from '@/lib/member/actions'
import type { MemberMessages } from '@/lib/i18n/member-messages'
import type { MemberSession } from '@/lib/member/types'
import { cn } from '@/lib/utils'

export function MemberPortalShell({
  session,
  m,
  portalName,
  demoBanner,
  children,
}: {
  session: MemberSession
  m: MemberMessages
  portalName: string
  demoBanner: string
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const links = [
    { href: '/member', label: m.nav.dashboard, icon: LayoutDashboard, exact: true },
    { href: '/member/documents', label: m.nav.documents, icon: FileText, exact: false },
  ]

  return (
    <div className="min-h-screen bg-mist/40">
      <div className="border-b border-primary-border/50 bg-accent-soft/60 px-4 py-2 text-center text-[12.5px] font-medium text-ink/70">
        {demoBanner}
      </div>

      <header className="border-b border-primary-border/50 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link href="/member">
              <Image src="/logo.avif" alt="Bioscope" width={120} height={34} className="h-8 w-auto" />
            </Link>
            <span className="hidden text-[13px] font-semibold text-ink/45 sm:inline">{portalName}</span>
          </div>
          <div className="flex items-center gap-3 text-[13px]">
            <span className="hidden text-ink/55 md:inline">{session.company}</span>
            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded-full border border-primary-border px-3 py-1.5 font-medium text-primary hover:bg-primary-tint"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {m.nav.backToSite}
            </Link>
            <form action={memberLogout}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-full bg-ink/5 px-3 py-1.5 font-medium text-ink/70 hover:bg-ink/10"
              >
                <LogOut className="h-3.5 w-3.5" />
                {m.nav.logout}
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="self-start lg:sticky lg:top-8">
          <nav className="space-y-1 rounded-[1.25rem] border border-primary-border/60 bg-white p-2">
            {links.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[14px] font-medium transition-colors',
                    active ? 'bg-primary text-white' : 'text-ink/65 hover:bg-mist/80 hover:text-primary-dark',
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.8} />
                  {label}
                </Link>
              )
            })}
          </nav>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  )
}
