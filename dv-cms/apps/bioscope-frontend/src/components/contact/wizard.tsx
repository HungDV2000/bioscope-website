'use client'

import { useState } from 'react'
import { Boxes, FlaskConical, Handshake, Check, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const NEEDS = [
  { key: 'nguyen-lieu', icon: Boxes, label: 'Nguyên liệu', desc: 'Tìm nguồn nguyên liệu chuyên biệt.' },
  { key: 'odm', icon: FlaskConical, label: 'ODM / Phát triển công thức', desc: 'Xây dựng công thức & sản xuất.' },
  { key: 'dong-kien-tao', icon: Handshake, label: 'Tư vấn đồng kiến tạo', desc: 'Đồng hành xây thương hiệu từ đầu.' },
]

type Form = { need: string; name: string; company: string; email: string; phone: string; message: string }

export function ContactWizard() {
  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)
  const [form, setForm] = useState<Form>({ need: '', name: '', company: '', email: '', phone: '', message: '' })

  const set = (k: keyof Form, v: string) => setForm((f) => ({ ...f, [k]: v }))
  const canNext = step === 1 ? !!form.need : step === 2 ? form.name && form.email.includes('@') : true

  const submit = () => {
    // Phase 2: POST → Payload FormSubmissions (email + Zalo/Lark/CRM notify).
    setDone(true)
  }

  if (done) {
    return (
      <div className="rounded-[2rem] border border-primary-border/60 bg-mist/40 p-10 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-primary" strokeWidth={1.4} />
        <h3 className="mt-5 text-[22px] font-bold text-ink">Đã gửi yêu cầu thành công!</h3>
        <p className="mx-auto mt-2 max-w-md text-[14.5px] leading-relaxed text-ink/60">
          Cảm ơn <strong>{form.name}</strong>. Đội ngũ chuyên gia của Bioscope sẽ phản hồi trong vòng
          24 giờ làm việc qua email <strong>{form.email}</strong>.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-[2rem] border border-primary-border/60 bg-white p-7 shadow-soft sm:p-9">
      {/* Progress */}
      <div className="mb-8 flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                'grid h-8 w-8 shrink-0 place-items-center rounded-full text-[13px] font-bold transition-colors duration-300',
                s < step ? 'bg-primary text-white' : s === step ? 'bg-primary text-white' : 'bg-primary-tint text-primary/50',
              )}
            >
              {s < step ? <Check className="h-4 w-4" strokeWidth={2.5} /> : s}
            </span>
            {s < 3 && <span className={cn('h-0.5 flex-1 rounded-full', s < step ? 'bg-primary' : 'bg-primary-border')} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div>
          <h3 className="text-[19px] font-bold text-ink">Bạn cần Bioscope hỗ trợ điều gì?</h3>
          <div className="mt-5 grid gap-3">
            {NEEDS.map(({ key, icon: Icon, label, desc }) => (
              <button
                key={key}
                onClick={() => set('need', key)}
                className={cn(
                  'flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300',
                  form.need === key ? 'border-primary bg-primary-tint/60' : 'border-primary-border bg-white hover:border-primary/40',
                )}
              >
                <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl', form.need === key ? 'bg-primary text-white' : 'bg-primary-tint text-primary')}>
                  <Icon className="h-5 w-5" strokeWidth={1.6} />
                </span>
                <span>
                  <span className="block text-[15px] font-bold text-ink">{label}</span>
                  <span className="block text-[13px] text-ink/55">{desc}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 className="text-[19px] font-bold text-ink">Thông tin liên hệ</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Field label="Họ và tên *" value={form.name} onChange={(v) => set('name', v)} />
            <Field label="Công ty" value={form.company} onChange={(v) => set('company', v)} />
            <Field label="Email công việc *" type="email" value={form.email} onChange={(v) => set('email', v)} />
            <Field label="Số điện thoại" value={form.phone} onChange={(v) => set('phone', v)} />
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h3 className="text-[19px] font-bold text-ink">Mô tả ngắn về dự án</h3>
          <textarea
            value={form.message}
            onChange={(e) => set('message', e.target.value)}
            rows={5}
            placeholder="Chia sẻ ý tưởng, sản phẩm hoặc thách thức bạn đang gặp…"
            className="mt-5 w-full rounded-2xl border border-primary-border bg-white px-5 py-4 text-[14.5px] outline-none transition-colors focus:border-primary/50"
          />
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          className={cn('text-[14px] font-semibold text-ink/50 transition-colors hover:text-ink', step === 1 && 'invisible')}
        >
          ← Quay lại
        </button>
        {step < 3 ? (
          <button
            disabled={!canNext}
            onClick={() => setStep((s) => s + 1)}
            className="rounded-full bg-primary px-7 py-3 text-[14px] font-semibold text-white transition-all duration-300 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            Tiếp tục
          </button>
        ) : (
          <button
            onClick={submit}
            className="rounded-full bg-primary px-7 py-3 text-[14px] font-semibold text-white transition-colors duration-300 hover:bg-primary-dark"
          >
            Gửi yêu cầu
          </button>
        )}
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12.5px] font-medium text-ink/55">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-primary-border bg-white px-4 py-2.5 text-[14.5px] outline-none transition-colors focus:border-primary/50"
      />
    </label>
  )
}
