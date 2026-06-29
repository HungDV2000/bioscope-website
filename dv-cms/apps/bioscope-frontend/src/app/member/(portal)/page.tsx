import Link from 'next/link'
import { FileDown, Mail, ArrowRight } from 'lucide-react'
import { getMemberSession } from '@/lib/member/auth'
import { getLocale } from '@/lib/i18n/server'
import { getMemberMessages } from '@/lib/i18n/member-messages'
import { MemberPortalShell } from '@/components/member/portal-shell'
import { MOCK_GATED_DOCUMENTS } from '@/lib/member/mock-data'

export default async function MemberDashboardPage() {
  const session = await getMemberSession()
  if (!session) return null

  const locale = await getLocale()
  const m = getMemberMessages(locale)
  const recent = MOCK_GATED_DOCUMENTS.slice(0, 3)

  return (
    <MemberPortalShell session={session} m={m} portalName={m.portalName} demoBanner={m.demoBanner}>
      <div className="space-y-8">
        <div>
          <h1 className="text-[1.75rem] font-bold tracking-tight text-ink">
            {m.dashboard.welcome}, {session.contactName}
          </h1>
          <p className="mt-2 text-[14.5px] text-ink/55">{session.email}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: m.dashboard.company, value: session.company },
            { label: m.dashboard.contact, value: session.contactName },
            { label: m.dashboard.status, value: m.dashboard.statusApproved },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-[1.25rem] border border-primary-border/60 bg-white p-5"
            >
              <p className="text-[11px] font-bold uppercase tracking-wide text-ink/40">{card.label}</p>
              <p className="mt-2 text-[16px] font-semibold text-ink">{card.value}</p>
            </div>
          ))}
        </div>

        <section className="rounded-[1.5rem] border border-primary-border/60 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[1.15rem] font-bold text-ink">{m.dashboard.recentDocs}</h2>
            <Link
              href="/member/documents"
              className="inline-flex items-center gap-1 text-[13px] font-semibold text-primary"
            >
              {m.dashboard.viewAll}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-primary-border/40">
            {recent.map((doc) => (
              <li key={doc.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                <div>
                  <p className="font-medium text-ink">{doc.title}</p>
                  <p className="text-[12.5px] text-ink/45">
                    {doc.docType}
                    {doc.ingredient ? ` · ${doc.ingredient}` : ''}
                  </p>
                </div>
                <span className="rounded-full bg-primary-tint px-3 py-1 text-[11px] font-bold text-primary-dark">
                  {doc.docType}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-[1.5rem] border border-primary-border/60 bg-mist/50 p-6">
          <h2 className="text-[1.15rem] font-bold text-ink">{m.dashboard.quickActions}</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/member/documents"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-primary-dark"
            >
              <FileDown className="h-4 w-4" />
              {m.dashboard.downloadCoa}
            </Link>
            <Link
              href="/lien-he"
              className="inline-flex items-center gap-2 rounded-full border border-primary-border bg-white px-5 py-2.5 text-[14px] font-semibold text-primary hover:bg-primary-tint"
            >
              <Mail className="h-4 w-4" />
              {m.dashboard.contactSupport}
            </Link>
          </div>
        </section>
      </div>
    </MemberPortalShell>
  )
}
