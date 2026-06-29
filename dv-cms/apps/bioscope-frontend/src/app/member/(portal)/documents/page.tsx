import { getMemberSession } from '@/lib/member/auth'
import { getLocale } from '@/lib/i18n/server'
import { getMemberMessages } from '@/lib/i18n/member-messages'
import { MemberPortalShell } from '@/components/member/portal-shell'
import { MOCK_GATED_DOCUMENTS } from '@/lib/member/mock-data'
import { MemberDocumentDownload } from '@/components/member/document-download'

export default async function MemberDocumentsPage() {
  const session = await getMemberSession()
  if (!session) return null

  const locale = await getLocale()
  const m = getMemberMessages(locale)

  return (
    <MemberPortalShell session={session} m={m} portalName={m.portalName} demoBanner={m.demoBanner}>
      <div className="space-y-6">
        <div>
          <h1 className="text-[1.75rem] font-bold tracking-tight text-ink">{m.documents.title}</h1>
          <p className="mt-2 max-w-2xl text-[14.5px] text-ink/60">{m.documents.desc}</p>
        </div>

        <div className="overflow-hidden rounded-[1.5rem] border border-primary-border/60 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[14px]">
              <thead>
                <tr className="border-b border-primary-border/50 bg-mist/40 text-[11px] font-bold uppercase tracking-wide text-ink/45">
                  <th className="px-5 py-3.5">{m.documents.colTitle}</th>
                  <th className="px-5 py-3.5">{m.documents.colType}</th>
                  <th className="px-5 py-3.5">{m.documents.colIngredient}</th>
                  <th className="px-5 py-3.5">{m.documents.colUpdated}</th>
                  <th className="px-5 py-3.5">{m.documents.colAction}</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_GATED_DOCUMENTS.map((doc) => (
                  <tr key={doc.id} className="border-b border-primary-border/30 last:border-0">
                    <td className="px-5 py-4 font-medium text-ink">{doc.title}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-primary-tint px-2.5 py-0.5 text-[11px] font-bold text-primary-dark">
                        {doc.docType}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-ink/55">{doc.ingredient ?? '—'}</td>
                    <td className="px-5 py-4 text-ink/45">{doc.updatedAt}</td>
                    <td className="px-5 py-4">
                      <MemberDocumentDownload
                        docId={doc.id}
                        label={m.documents.download}
                        demoHint={m.documents.demoDownload}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MemberPortalShell>
  )
}
