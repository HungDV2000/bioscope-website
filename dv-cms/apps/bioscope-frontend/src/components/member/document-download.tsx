'use client'

import { Download } from 'lucide-react'

export function MemberDocumentDownload({
  docId,
  label,
  demoHint,
}: {
  docId: string
  label: string
  demoHint: string
}) {
  return (
    <button
      type="button"
      title={demoHint}
      onClick={() => {
        alert(`${demoHint}\n\nDocument ID: ${docId}`)
      }}
      className="inline-flex items-center gap-1.5 rounded-full border border-primary-border px-3.5 py-1.5 text-[13px] font-semibold text-primary transition-colors hover:bg-primary-tint"
    >
      <Download className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}
