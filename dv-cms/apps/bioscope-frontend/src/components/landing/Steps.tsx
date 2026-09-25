'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Check, ChevronDown, ChevronLeft, Flame, Mic, PencilLine, Play, Pause, Soup, Stethoscope, Utensils, Wind, type LucideIcon } from 'lucide-react'
import clsx from 'clsx'
import { errorText, lpApi, track } from './api'
import { RULE, useLp } from './context'
import { fmtSec, probeDuration, useRecorder } from './recorder'
import { CtaButton, Spinner } from './ui'
import type { LpMe } from '@/lib/landing/types'

export const scrollToId = (id: string, focus?: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  if (focus) setTimeout(() => (document.getElementById(focus) as HTMLElement | null)?.focus({ preventScroll: true }), 700)
}

/* ────────────────────── BẢNG HOẠT ĐỘNG & ĐIỂM SỐ ─────────────────────────── */
type Row = { label: string; pts: number; note?: string }

/** Lấy theo cấu hình chiến dịch, thứ tự đúng bảng marketing đã duyệt. */
function pointRows(campaign: ReturnType<typeof useLp>['campaign']): Row[] {
  const p = campaign.points
  const hasMain = campaign.videos.some((v) => v.isMain)
  return [
    { label: 'Xem video', pts: p.video, note: 'mỗi video' },
    ...(hasMain ? [{ label: 'Video giới thiệu sản phẩm', pts: p.videoMain }] : []),
    { label: 'Chia sẻ câu chuyện về dạ dày', pts: p.record, note: 'sau khi Bioscope nghe bản ghi' },
    { label: 'Mời người thân/bạn bè tham gia', pts: p.order, note: `tối đa ${p.maxReferralOrders} người mỗi tháng` },
    { label: 'Chia sẻ kết quả sau 2 tuần', pts: p.result, note: 'dành cho khách đã nhận quà hoặc đã mua hàng' },
    { label: 'Có người tham gia sau bạn', pts: p.bonusPerJoin, note: `mỗi người, tối đa ${p.bonusMax} lần` },
  ]
}

/**
 * Bảng điểm. `variant="table"` là bảng 2 cột to, quét bằng mắt là hiểu — dạng
 * guideline yêu cầu; `list` là danh sách gọn để nhét trong popup.
 */
export function PointTable({ className, variant = 'list' }: { className?: string; variant?: 'list' | 'table' }) {
  const { campaign } = useLp()
  const rows = pointRows(campaign)

  if (variant === 'table') {
    return (
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-gh-brand-mist text-sm font-extrabold uppercase tracking-wider text-gh-brand-deep">
            <th scope="col" className="px-4 py-3 sm:px-5">Hoạt động</th>
            <th scope="col" className="px-4 py-3 text-right sm:px-5">Điểm</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-t border-black/5">
              <td className="px-4 py-3.5 sm:px-5">
                <span className="block text-[17px] font-semibold leading-snug">{r.label}</span>
                {r.note && <span className="block text-sm text-gh-ink-soft">{r.note}</span>}
              </td>
              <td className="whitespace-nowrap px-4 py-3.5 text-right text-xl font-extrabold text-gh-cta-deep sm:px-5">+{r.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  return (
    <ul className={className}>
      {rows.map((r, i) => (
        <li key={r.label} className={clsx('flex items-center justify-between gap-3', i < rows.length - 1 && 'border-b border-black/5 pb-2')}>
          <span>
            {r.label}
            {r.note && <span className="text-sm text-gh-ink-soft"> ({r.note})</span>}
          </span>
          <b className="shrink-0 text-gh-ink">+{r.pts}</b>
        </li>
      ))}
    </ul>
  )
}

/* ─────────────── CHỌN VẤN ĐỀ DẠ DÀY (gộp vào khối tham gia) ──────────────── */
const SYMPTOMS: { id: string; text: string; Icon: LucideIcon; tone: string }[] = [
  { id: 's1', text: 'Đau, nóng rát vùng trên rốn — lúc đói cồn cào, ăn no lại tức.', Icon: Flame, tone: 'bg-gh-brand-soft text-gh-brand' },
  { id: 's2', text: 'Ợ hơi, ợ chua, trào ngược lên ngực và cổ họng.', Icon: Wind, tone: 'bg-gh-cta-soft text-gh-cta-deep' },
  { id: 's3', text: 'Đầy bụng, chậm tiêu, ăn ít cũng thấy nặng bụng.', Icon: Soup, tone: 'bg-gh-lime-soft text-gh-cta-deep' },
  { id: 's4', text: 'Buồn nôn, ăn không ngon miệng, người uể oải.', Icon: Utensils, tone: 'bg-gh-brand-soft text-gh-brand' },
  { id: 's5', text: 'Đã khám ra viêm loét dạ dày – tá tràng hoặc nhiễm HP, uống thuốc đỡ rồi lại tái.', Icon: Stethoscope, tone: 'bg-gh-cta-soft text-gh-cta-deep' },
]

export function symCount(s: { picked: string[]; other: string; voice: unknown }) {
  return s.picked.length + (s.other.trim() ? 1 : 0) + (s.voice ? 1 : 0)
}

function CheckRow({ on, onClick, Icon, tone, children }: { on: boolean; onClick: () => void; Icon: LucideIcon; tone: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={clsx(
        'lp-tap flex w-full items-center gap-4 rounded-2xl p-3 text-left transition duration-300 ease-gh-spring active:scale-[.99]',
        on ? 'bg-gh-brand-mist ring-2 ring-gh-brand' : 'bg-gh-canvas',
      )}
    >
      <span className={clsx('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', tone)} aria-hidden="true">
        <Icon className="h-5 w-5" strokeWidth={1.5} />
      </span>
      <span className="flex-1 leading-snug">{children}</span>
      <span className={clsx('flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-white', on ? 'border-gh-brand bg-gh-brand' : 'border-gh-ink/15')} aria-hidden="true">
        <Check className="h-4 w-4" strokeWidth={3} />
      </span>
    </button>
  )
}

/**
 * Không bắt buộc, nên mặc định gấp lại: guideline yêu cầu phần chính chỉ hỏi
 * tên và số điện thoại. Ai muốn kể thêm thì mở ra, gõ chữ hoặc nói.
 */
export function SymptomPicker() {
  const { sym, setSym, toast } = useLp()
  const [open, setOpen] = useState(false)
  const otherInput = useRef<HTMLInputElement>(null)
  const n = symCount(sym)
  const toggle = (id: string) =>
    setSym((s) => ({ ...s, picked: s.picked.includes(id) ? s.picked.filter((x) => x !== id) : [...s.picked, id] }))

  return (
    <div className="mt-4 rounded-2xl bg-gh-canvas p-4">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-center gap-3 text-left">
        <span className="flex-1">
          <span className="block font-semibold">Bạn đang gặp vấn đề gì ở dạ dày?</span>
          <span className="block text-sm text-gh-ink-soft">{n > 0 ? `Đã chọn ${n} ý` : 'Không bắt buộc — giúp Bioscope tư vấn đúng hơn'}</span>
        </span>
        <ChevronDown className={clsx('h-5 w-5 shrink-0 text-gh-ink-faint transition', open && 'rotate-180')} aria-hidden="true" />
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          {SYMPTOMS.map((s) => (
            <CheckRow key={s.id} on={sym.picked.includes(s.id)} onClick={() => toggle(s.id)} Icon={s.Icon} tone={s.tone}>
              {s.text}
            </CheckRow>
          ))}
          <CheckRow
            on={sym.otherOpen || !!sym.other.trim() || !!sym.voice}
            Icon={PencilLine}
            tone="bg-white text-gh-ink-soft"
            onClick={() => {
              const on = !sym.otherOpen
              setSym((s) => (on ? { ...s, otherOpen: true } : { ...s, otherOpen: false, other: '', voice: null }))
              if (on) setTimeout(() => otherInput.current?.focus(), 80)
            }}
          >
            Tôi gặp vấn đề khác, để tôi kể bạn nghe.
          </CheckRow>

          {sym.otherOpen && (
            <div id="otherWrap" className="rounded-2xl bg-white p-4">
              <label htmlFor="symOther" className="mb-1.5 block font-semibold">
                Bạn kể ngắn giúp mình nhé
              </label>
              <input
                id="symOther"
                ref={otherInput}
                type="text"
                maxLength={120}
                value={sym.other}
                onChange={(e) => setSym((s) => ({ ...s, other: e.target.value }))}
                placeholder="Ví dụ: hay đau về đêm, uống thuốc mãi chưa đỡ"
                className="lp-field"
              />
              <p className="my-3 flex items-center gap-3 text-sm text-gh-ink-faint">
                <span className="h-px flex-1 bg-black/10" />
                hoặc
                <span className="h-px flex-1 bg-black/10" />
              </p>
              <SymptomVoice onChange={(voice) => setSym((s) => ({ ...s, voice }))} toast={toast} />
            </div>
          )}
          {n > 0 && <p className="pt-1 text-sm text-gh-ink-soft">Mình sẽ lưu lại khi bạn bấm tham gia.</p>}
        </div>
      )}
    </div>
  )
}

/** Ghi âm nhanh thay cho đánh máy (tối đa 30 giây). Gửi lên sau khi tham gia. */
function SymptomVoice({ onChange, toast }: { onChange: (v: { blob: Blob; duration: number } | null) => void; toast: (t: string, i?: 'mic' | 'check') => void }) {
  const r = useRecorder(30, 5)
  const audio = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const { sym } = useLp()

  useEffect(() => {
    if (r.clip) onChange({ blob: r.clip.blob, duration: r.clip.duration })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r.clip])

  const startRec = async () => {
    const ok = await r.start()
    if (!ok) toast('Máy chưa cho ghi âm, bạn gõ chữ hoặc tải file lên nhé', 'mic')
  }

  // "Sửa lại" ở bước 4 bấm "Nói thay vì gõ" → tự bật ghi âm.
  useEffect(() => {
    const go = () => {
      if (r.state === 'idle' && !sym.voice) void startRec()
    }
    window.addEventListener('lp:sym-record', go)
    return () => window.removeEventListener('lp:sym-record', go)
  })

  const deniedMsg =
    r.denied === 'inapp'
      ? 'Trình duyệt trong Zalo/Facebook thường chặn ghi âm. Hãy mở bằng Safari hoặc Chrome, hoặc tải lên file ghi âm có sẵn.'
      : r.denied === 'permission'
        ? 'Bạn chưa cho phép dùng micro. Bạn gõ vài chữ ở trên, hoặc tải lên file ghi âm có sẵn.'
        : 'Máy chưa cho ghi âm. Bạn gõ vài chữ ở trên, hoặc tải lên một file ghi âm có sẵn.'

  return (
    <>
      {r.state === 'idle' && (
        <button type="button" onClick={startRec} className="lp-tap flex w-full items-center justify-center gap-3 rounded-full bg-gh-brand-soft text-[17px] font-bold text-gh-brand-deep active:scale-[.98]">
          <Mic className="h-6 w-6" fill="currentColor" aria-hidden="true" /> Bấm để nói, mình nghe
        </button>
      )}
      {r.state === 'live' && (
        <div className={clsx('lp-rec-on mt-3 flex items-center gap-3 rounded-2xl bg-gh-cta-soft p-3', r.levels && 'lp-live')}>
          <span className="lp-wave flex h-8 items-center gap-1" aria-hidden="true">
            {Array.from({ length: 5 }, (_, i) => (
              <i key={i} style={r.levels ? { transform: `scaleY(${r.levels[i]})` } : undefined} />
            ))}
          </span>
          <span className="flex-1 font-bold tabular-nums text-gh-cta-deep">{fmtSec(r.sec)} / 0:30</span>
          <button type="button" onClick={() => r.stop(false)} className="shrink-0 rounded-full bg-gh-cta px-5 py-2.5 font-bold text-white">
            Dừng
          </button>
        </div>
      )}
      {r.state === 'done' && r.clip && (
        <div className="mt-3 flex items-center gap-3 rounded-2xl bg-gh-brand-mist p-3">
          <button
            type="button"
            onClick={() => (audio.current?.paused ? audio.current.play() : audio.current?.pause())}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gh-brand text-white"
            aria-label={playing ? 'Tạm dừng' : 'Nghe lại'}
          >
            {playing ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="h-5 w-5" fill="currentColor" />}
          </button>
          <span className="min-w-0 flex-1 leading-snug">
            <b className="block">Đã ghi {r.clip.duration ? fmtSec(r.clip.duration) : 'từ file'}</b>
            <span className="text-sm text-gh-ink-soft">Bạn nghe lại thử xem được chưa</span>
          </span>
          <button
            type="button"
            onClick={() => {
              r.clear()
              onChange(null)
              void startRec()
            }}
            className="shrink-0 rounded-full bg-white px-4 py-2.5 font-semibold text-gh-brand-deep"
          >
            Ghi lại
          </button>
          <audio ref={audio} src={r.clip.url} className="hidden" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
        </div>
      )}
      {r.denied && r.state !== 'done' && (
        <div className="mt-3 rounded-2xl bg-gh-cta-soft p-3">
          <p className="leading-snug text-gh-ink-soft">{deniedMsg}</p>
          <label className="mt-2 flex cursor-pointer items-center justify-center rounded-full bg-white py-2.5 font-semibold text-gh-brand-deep">
            Tải file ghi âm lên
            <input
              type="file"
              accept="audio/*"
              className="sr-only"
              onChange={async (e) => {
                const f = e.target.files?.[0]
                if (!f) return
                r.setFromBlob(f, await probeDuration(f))
                toast('Đã nhận file ghi âm', 'check')
              }}
            />
          </label>
        </div>
      )}
    </>
  )
}

/* ──────────────────────────── FORM THAM GIA ──────────────────────────────── */
function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-semibold">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-err`} className="mt-1.5 font-medium text-gh-danger">
          {error}
        </p>
      )}
    </div>
  )
}

function readUtm(): Record<string, string> {
  const q = new URLSearchParams(window.location.search)
  const out: Record<string, string> = {}
  q.forEach((v, k) => {
    if (/^utm_[a-z]+$/.test(k)) out[k] = v.slice(0, 120)
  })
  return out
}

/**
 * Form tham gia + nhập OTP. Dùng lại cho "đăng nhập lại" khi chương trình đã
 * chốt (mode="login": chỉ cần số điện thoại).
 */
export function JoinForm({ mode = 'join', onJoined }: { mode?: 'join' | 'login'; onJoined: (me: LpMe, created: boolean) => void }) {
  const { slug, campaign, sym, refCode, toast } = useLp()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [consent, setConsent] = useState(false)
  const [err, setErr] = useState<{ name?: string; phone?: string; consent?: string; form?: string }>({})
  const [busy, setBusy] = useState(false)
  const [otpStage, setOtpStage] = useState(false)
  const [devCode, setDevCode] = useState<string | null>(null)

  const check = (k: 'name' | 'phone', v: string) => {
    const r = RULE[k](v)
    setErr((e) => ({ ...e, [k]: r === true ? undefined : r }))
    return r === true
  }

  const join = async (code?: string): Promise<boolean> => {
    const res = await lpApi<{ me: LpMe; created: boolean }>(slug, 'join', {
      json: {
        name: name.trim(),
        phone: phone.replace(/[\s.-]/g, ''),
        code,
        consent: mode === 'join' ? consent : undefined,
        symptoms: sym.picked,
        symptomOther: sym.other.trim(),
        ref: refCode || undefined,
        utm: readUtm(),
      },
    })
    if (!res.ok) {
      const e = res.data.error
      if (e === 'invalid_name') setErr({ name: errorText(e) })
      else setErr({ form: errorText(e, mode === 'login' ? 'Không tìm thấy số này trong chương trình.' : undefined) })
      return false
    }
    track('join', { created: res.data.created })
    onJoined(res.data.me, res.data.created)
    return true
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const okName = mode === 'login' ? true : check('name', name)
    const okPhone = check('phone', phone)
    const okConsent = mode === 'login' || consent
    setErr((x) => ({ ...x, consent: okConsent ? undefined : 'Bạn tick vào ô đồng ý giúp mình nhé', form: undefined }))
    if (!okName || !okPhone || !okConsent) return
    setBusy(true)
    const res = await lpApi<{ otpRequired: boolean; devCode?: string }>(slug, 'otp', { json: { phone: phone.replace(/[\s.-]/g, '') } })
    if (!res.ok) {
      setBusy(false)
      setErr({ form: errorText(res.data.error, mode === 'login' ? 'Không tìm thấy số này trong chương trình.' : undefined) })
      return
    }
    if (!res.data.otpRequired) {
      await join()
      setBusy(false)
      return
    }
    setBusy(false)
    setDevCode(res.data.devCode ?? null)
    setOtpStage(true)
    track('otp_sent')
  }

  const p = phone.replace(/[\s.-]/g, '')
  if (otpStage) {
    return (
      <OtpBox
        target={`${p.slice(0, 2)}•• ••• ${p.slice(-3)}`}
        devCode={devCode}
        onBack={() => setOtpStage(false)}
        onResend={async () => {
          const res = await lpApi<{ devCode?: string }>(slug, 'otp', { json: { phone: p } })
          if (!res.ok) {
            toast(errorText(res.data.error), 'warn')
            return false
          }
          setDevCode(res.data.devCode ?? null)
          toast('Đã gửi lại mã', 'check')
          return true
        }}
        onSubmit={(code) => join(code)}
        formError={err.form}
      />
    )
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {mode === 'join' && (
        <Field id="fName" label="Tên của bạn" error={err.name}>
          <input
            id="fName"
            type="text"
            autoComplete="name"
            placeholder="Nguyễn Văn An"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (err.name) check('name', e.target.value)
            }}
            onBlur={() => name && check('name', name)}
            aria-invalid={!!err.name}
            className={clsx('lp-field', err.name && 'lp-field-error')}
          />
        </Field>
      )}
      <Field id="fPhone" label="Số điện thoại" error={err.phone}>
        <input
          id="fPhone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="09xx xxx xxx"
          maxLength={14}
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value)
            if (err.phone) check('phone', e.target.value)
          }}
          onBlur={() => phone && check('phone', phone)}
          aria-invalid={!!err.phone}
          className={clsx('lp-field tabular-nums', err.phone && 'lp-field-error')}
        />
      </Field>
      {mode === 'join' && (
        <>
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-gh-canvas p-3 leading-snug text-gh-ink-soft">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-6 w-6 shrink-0 accent-[#14939A]" />
            <span>{campaign.consentText}</span>
          </label>
          {err.consent && <p className="font-medium text-gh-danger">{err.consent}</p>}
        </>
      )}
      {err.form && <p className="rounded-2xl bg-[#FFF7F7] p-3 font-medium text-gh-danger">{err.form}</p>}
      <CtaButton type="submit" disabled={busy}>
        <span>{campaign.requireOtp ? 'Gửi mã cho tôi' : mode === 'login' ? 'Xem kết quả của tôi' : 'Tham gia'}</span>
        {busy && <Spinner />}
      </CtaButton>
      {campaign.requireOtp && <p className="text-center text-sm text-gh-ink-faint">Bioscope nhắn mã sáu số để chắc đúng là số của bạn.</p>}
    </form>
  )
}

function OtpBox({
  target,
  devCode,
  onBack,
  onResend,
  onSubmit,
  formError,
}: {
  target: string
  devCode: string | null
  onBack: () => void
  onResend: () => Promise<boolean>
  onSubmit: (code: string) => Promise<boolean>
  formError?: string
}) {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [msg, setMsg] = useState('')
  const [left, setLeft] = useState(60)
  const [busy, setBusy] = useState(false)
  const boxes = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    boxes.current[0]?.focus()
  }, [])
  useEffect(() => {
    if (left <= 0) return
    const t = setTimeout(() => setLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [left])

  const setAt = (i: number, raw: string) => {
    const d = raw.replace(/\D/g, '')
    if (d.length > 1) {
      const next = [...digits]
      d.split('').slice(0, 6 - i).forEach((x, k) => (next[i + k] = x))
      setDigits(next)
      boxes.current[Math.min(5, i + d.length - 1)]?.focus()
      return
    }
    const next = [...digits]
    next[i] = d
    setDigits(next)
    if (d && i < 5) boxes.current[i + 1]?.focus()
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const code = digits.join('')
    if (code.length < 6) {
      setMsg('Bạn nhập đủ sáu số nhé')
      return
    }
    setMsg('')
    setBusy(true)
    const ok = await onSubmit(code)
    setBusy(false)
    if (!ok) {
      setDigits(['', '', '', '', '', ''])
      boxes.current[0]?.focus()
    }
  }

  return (
    <div>
      <button type="button" onClick={onBack} className="-ml-1 inline-flex items-center gap-1 font-semibold text-gh-brand-deep">
        <ChevronLeft className="h-5 w-5" strokeWidth={2.6} aria-hidden="true" /> Sửa số
      </button>
      <h3 className="mt-3 text-2xl font-extrabold">Nhập mã sáu số vừa nhận</h3>
      <p className="mt-1 text-gh-ink-soft">
        Tin nhắn vừa được gửi tới <strong className="text-gh-ink">{target}</strong>
      </p>
      {devCode && (
        <p className="mt-3 rounded-2xl bg-gh-lime-soft p-3 text-sm text-gh-cta-deep">
          Chế độ thử (chưa nối nhà mạng SMS): mã là <b className="font-mono tracking-widest">{devCode}</b>
        </p>
      )}
      <form onSubmit={submit} noValidate className="mt-5">
        <div className="flex justify-between gap-2">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                boxes.current[i] = el
              }}
              aria-label={`Số thứ ${i + 1}`}
              inputMode="numeric"
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              value={d}
              onChange={(e) => setAt(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !digits[i] && i > 0) boxes.current[i - 1]?.focus()
              }}
              className="lp-field !px-0 text-center text-2xl font-extrabold"
            />
          ))}
        </div>
        {(msg || formError) && <p className="mt-2 font-medium text-gh-danger">{msg || formError}</p>}
        <CtaButton type="submit" className="mt-5" disabled={busy}>
          <span>Xác nhận và bắt đầu</span>
          {busy && <Spinner />}
        </CtaButton>
        <p className="mt-3 text-center text-gh-ink-soft">
          Chưa thấy tin nhắn?{' '}
          <button
            type="button"
            disabled={left > 0}
            onClick={async () => {
              if (await onResend()) setLeft(60)
            }}
            className="font-semibold text-gh-brand-deep disabled:text-gh-ink-faint"
          >
            {left > 0 ? `Gửi lại (${left}s)` : 'Gửi lại mã'}
          </button>
        </p>
      </form>
    </div>
  )
}

