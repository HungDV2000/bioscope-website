'use client'

import { useState } from 'react'
import { FileText, CheckCircle2, Download } from 'lucide-react'
import { useLocale } from '@/lib/i18n/context'

type Doc = { title?: string; url?: string }

export function DocGating({ ingredient, documents = [] }: { ingredient: string; documents?: Doc[] }) {
  const { locale } = useLocale()
  const en = locale === 'en'
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const files = documents.filter((d) => d.url)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) return
    // Phase 2: POST to Payload FormSubmissions → auto-email TDS/COA/SDS.
    setSent(true)
  }

  return (
    <div className="space-y-5">
      {/* Direct-download files uploaded in the CMS (Regulatory → Documents) */}
      {files.length > 0 && (
        <div>
          <h4 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.14em] text-ink/45">
            <FileText className="h-4 w-4 text-primary" strokeWidth={1.8} />
            {en ? 'Download documents' : 'Tài liệu tải về'}
          </h4>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {files.map((d, i) => (
              <a
                key={`${d.url}-${i}`}
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-2xl border border-primary-border/60 bg-white px-4 py-3.5 transition-colors hover:border-primary hover:bg-primary-tint/40"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-tint text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <FileText className="h-5 w-5" strokeWidth={1.7} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold text-ink">
                    {d.title || (en ? 'Document' : 'Tài liệu')}
                  </span>
                  <span className="text-[12px] text-ink/45">PDF</span>
                </span>
                <Download className="h-4 w-4 shrink-0 text-ink/35 transition-colors group-hover:text-primary" strokeWidth={1.8} />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Gated full-pack request */}
      <div className="rounded-[2rem] border border-primary-border/60 bg-primary-tint/60 p-7">
        <div className="flex items-center gap-2 text-primary">
          <FileText className="h-5 w-5" strokeWidth={1.6} />
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">
            {en ? 'Technical documents' : 'Tài liệu kỹ thuật'}
          </span>
        </div>
        <h3 className="mt-3 text-[18px] font-bold text-ink">
          {files.length > 0
            ? en ? 'Need the full pack? (TDS · COA · SDS)' : 'Cần trọn bộ? (TDS · COA · SDS)'
            : en ? 'Get the full pack: TDS · COA · SDS' : 'Tải trọn bộ TDS · COA · SDS'}
        </h3>

        {sent ? (
          <div className="mt-5 flex items-start gap-3 rounded-2xl bg-white p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="text-[13.5px] leading-relaxed text-ink/70">
              {en ? (
                <>We&apos;ll send the full document pack for <strong>{ingredient}</strong> to <strong>{email}</strong> shortly.</>
              ) : (
                <>Đã ghi nhận! Hệ thống sẽ gửi trọn bộ tài liệu cho <strong>{ingredient}</strong> tới <strong>{email}</strong> trong ít phút.</>
              )}
            </p>
          </div>
        ) : (
          <>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink/60">
              {en
                ? "Leave your work email and we'll send the documents right away."
                : 'Để lại email công việc, chúng tôi gửi tài liệu cho bạn ngay lập tức.'}
            </p>
            <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-2.5 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@congty.com"
                className="flex-1 rounded-full border border-primary-border bg-white px-5 py-3 text-[14px] outline-none transition-colors focus:border-primary/50"
              />
              <button
                type="submit"
                className="rounded-full bg-primary px-6 py-3 text-[14px] font-semibold text-white transition-colors duration-300 hover:bg-primary-dark"
              >
                {en ? 'Send documents' : 'Gửi tài liệu'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
