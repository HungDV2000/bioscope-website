'use client'

import { useState } from 'react'
import { FileText, CheckCircle2 } from 'lucide-react'

export function DocGating({ ingredient }: { ingredient: string }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) return
    // Phase 2: POST to Payload FormSubmissions → auto-email TDS/COA/SDS.
    setSent(true)
  }

  return (
    <div className="rounded-[2rem] border border-primary-border/60 bg-primary-tint/60 p-7">
      <div className="flex items-center gap-2 text-primary">
        <FileText className="h-5 w-5" strokeWidth={1.6} />
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">
          Tài liệu kỹ thuật
        </span>
      </div>
      <h3 className="mt-3 text-[18px] font-bold text-ink">Tải trọn bộ TDS · COA · SDS</h3>

      {sent ? (
        <div className="mt-5 flex items-start gap-3 rounded-2xl bg-white p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-[13.5px] leading-relaxed text-ink/70">
            Đã ghi nhận! Hệ thống sẽ gửi trọn bộ tài liệu cho <strong>{ingredient}</strong> tới{' '}
            <strong>{email}</strong> trong ít phút.
          </p>
        </div>
      ) : (
        <>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink/60">
            Để lại email công việc, chúng tôi gửi tài liệu cho bạn ngay lập tức.
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
              Gửi tài liệu
            </button>
          </form>
        </>
      )}
    </div>
  )
}
