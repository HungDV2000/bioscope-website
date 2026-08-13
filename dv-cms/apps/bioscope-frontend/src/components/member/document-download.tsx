import { Download } from 'lucide-react'

/**
 * Tải tài liệu gated. Đi qua proxy nội bộ để CMS kiểm quyền theo phiên đăng
 * nhập rồi mới chuyển hướng tới file thật.
 */
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
    <a
      href={`/api/member/documents/${encodeURIComponent(docId)}`}
      title={demoHint}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full border border-primary-border px-3.5 py-1.5 text-[13px] font-semibold text-primary transition-colors hover:bg-primary-tint"
    >
      <Download className="h-3.5 w-3.5" />
      {label}
    </a>
  )
}
