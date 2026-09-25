'use client'

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import {
  ArrowRight,
  ChevronRight,
  ScrollText,
  ShieldCheck,
  FlaskConical,
  Gift,
  Leaf,
  MessageCircle,
  Pill,
  Trophy,
  type LucideIcon,
} from 'lucide-react'
import clsx from 'clsx'
import { errorText, lpApi, track } from './api'
import { LandingProvider, RULE, TOAST_ICONS, isClosed, useLp } from './context'
import { Hub, taskState } from './Hub'
import { CompanySheet, Coach, InfoSheet, PolicySheet, RecSheet, RulesSheet, ShareSheet, VideoModal, WinnersSheet } from './Modals'
import { JoinForm, scrollToId } from './Steps'
import { Activities, DeadlineStrip, FlowStepper, Hero, HowItWorks, JoinSection, LastResultBanner, Timeline, WinnersExplainer, vnDate } from './Guest'
import { CtaButton, IMG, IconTile, Reveal, Section, SectionHead, Spinner } from './ui'
import type { LpCampaign, LpLeader, LpMe } from '@/lib/landing/types'

export default function LandingApp(props: { slug: string; campaign: LpCampaign; leaderboard: LpLeader[]; initialMe: LpMe | null }) {
  return (
    <LandingProvider {...props}>
      <App />
    </LandingProvider>
  )
}

const REF_RE = /^[A-Z]{1,5}\d{5,7}$/

function App() {
  const { me, setMe, campaign, slug, sym, setSym, open, toast, setRefCode } = useLp()
  const ended = isClosed(campaign)

  // Người được giới thiệu mở link ?ref=MÃ
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref')?.toUpperCase()
    if (ref && REF_RE.test(ref)) {
      setRefCode(ref)
      setTimeout(() => {
        toast(`Bạn được giới thiệu, giảm ${campaign.discountPercent}% nhé`, 'gift')
        scrollToId('order')
      }, 600)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Cập nhật điểm định kỳ: bản ghi được duyệt, đơn được xác nhận, người vào sau…
  const lastTotal = useRef(me?.total ?? 0)
  useEffect(() => {
    if (!me) return
    lastTotal.current = me.total
  }, [me])
  useEffect(() => {
    if (!me) return
    const tick = async () => {
      if (document.visibilityState !== 'visible') return
      const r = await lpApi<{ me: LpMe }>(slug, 'me')
      if (r.ok) {
        const gained = r.data.me.total - lastTotal.current
        setMe(r.data.me)
        if (gained > 0) toast(`Bạn vừa được cộng ${gained} điểm`, 'gift')
      } else if (r.status === 401) setMe(null)
    }
    const t = setInterval(tick, 60_000)
    const onVis = () => document.visibilityState === 'visible' && void tick()
    document.addEventListener('visibilitychange', onVis)
    return () => {
      clearInterval(t)
      document.removeEventListener('visibilitychange', onVis)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!me, slug])

  const onJoined = useCallback(
    async (m: LpMe, created: boolean) => {
      setMe(m)
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
      if (created && !ended) setTimeout(() => open('coach'), 350)
      else toast(`Chào mừng ${m.name} quay lại`, 'check')
      // Bản ghi âm "vấn đề khác" ở bước 2 — gửi sau khi đã có phiên.
      if (sym.voice) {
        const fd = new FormData()
        const ext = sym.voice.blob.type.includes('mp4') ? 'm4a' : sym.voice.blob.type.includes('mpeg') ? 'mp3' : 'webm'
        fd.append('file', sym.voice.blob, `trieu-chung.${ext}`)
        fd.append('kind', 'symptom')
        fd.append('durationSec', String(sym.voice.duration))
        const r = await lpApi(slug, 'recordings', { form: fd })
        if (r.ok) setSym((s) => ({ ...s, voice: null }))
        else toast(`Chưa gửi được ghi âm: ${errorText(r.data.error)}`, 'warn')
      }
    },
    [setMe, ended, open, toast, sym.voice, slug, setSym],
  )

  return (
    <div className="lp-root antialiased">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[80] focus:rounded-full focus:bg-gh-ink focus:px-5 focus:py-3 focus:text-white">
        Bỏ qua, tới nội dung chính
      </a>
      <Header />
      <main id="main" className="mx-auto max-w-3xl px-4 pb-40 pt-28">
        {/* Người đã tham gia / đợt đã chốt: dải kết quả lên trên cùng. Khách mới:
            đầu trang phải là quà + CTA (guideline), dải kết quả xuống dưới hero. */}
        {(me || ended) && <LastResultBanner />}
        {me ? (
          <Hub ended={ended} />
        ) : ended ? (
          <EndedPanel onJoined={onJoined} />
        ) : (
          <>
            {/* Thứ tự theo guideline: quà → 3 bước → điểm → 43 khách hàng → CTA */}
            <Hero />
            <LastResultBanner />
            <HowItWorks />
            <DeadlineStrip />
            <Activities />
            <WinnersExplainer />
            <JoinSection onJoined={onJoined} />
          </>
        )}
        <Timeline />
        <More />
        <OrderSection />
        <RulesFooterLinks />
        <Footer />
      </main>
      <Dock />
      <Coach />
      <VideoModal />
      <RecSheet />
      <ShareSheet />
      <CompanySheet />
      <RulesSheet />
      <PolicySheet />
      <WinnersSheet />
      <InfoSheet />
      <ToastLayer />
    </div>
  )
}

/* ───────────────────────────────── THANH TRÊN ─────────────────────────────── */
function Header() {
  const { me } = useLp()
  return (
    <header className="lp-glass fixed inset-x-0 top-0 z-40 border-b border-black/5">
      <div className="mx-auto flex h-[72px] max-w-3xl items-center justify-between gap-3 px-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${IMG}/bioscope-logo.png`} alt="Bioscope" className="h-11 w-auto" width={151} height={44} />
        {me ? (
          <a href="#hub" className="flex items-center gap-2 rounded-full bg-gh-lime-soft px-3 py-2 text-sm font-bold text-gh-cta-deep">
            <Gift className="h-4 w-4" fill="currentColor" aria-hidden="true" />
            {me.total} điểm
          </a>
        ) : (
          // Khách chưa tham gia: chỉ báo đang ở bước mấy (như bản v2). Đồng hồ
          // đếm ngược đã chuyển xuống đầu trang, chỗ đó rộng nên để được cỡ lớn.
          <FlowStepper />
        )}
      </div>
    </header>
  )
}

/* ───────────────────── ĐỢT ĐÃ CHỐT — CHỜ ĐỢT MỚI ─────────────────────────── */
function EndedPanel({ onJoined }: { onJoined: (me: LpMe, created: boolean) => void }) {
  const { campaign } = useLp()
  const r = campaign.lastResult
  return (
    <section className="py-6">
      <p className="inline-flex items-center gap-2 rounded-full bg-gh-brand-soft px-4 py-2 text-sm font-semibold text-gh-brand-deep">
        <Trophy className="h-4 w-4" aria-hidden="true" /> {campaign.programName} đã chốt
      </p>
      <h1 className="mt-4 text-[2rem] font-extrabold leading-[1.12] tracking-tight sm:text-5xl">Cảm ơn bạn đã cùng Bioscope!</h1>
      <p className="mt-3 text-lg leading-relaxed text-gh-ink-soft">
        {r?.announced
          ? `${r.winners.length} khách hàng có tổng điểm cao nhất ${r.label} đã được chọn. Bioscope sẽ gọi điện trước khi gửi quà.`
          : 'Bioscope đang đối chiếu điểm để chọn khách hàng nhận quà.'}
        {campaign.cycle === 'monthly' && ' Đợt mới mở lại vào ngày 1 tháng sau.'}
      </p>

      {r?.announced && r.winners.length > 0 && (
        <div className="mt-6 rounded-[28px] bg-white p-5 shadow-gh-soft">
          <h2 className="text-[1.3rem] font-extrabold">Khách hàng nhận quà {r.label}</h2>
          <ol className="mt-4 grid gap-2 sm:grid-cols-2">
            {r.winners.map((w) => (
              <li key={w.rank} className="flex items-center gap-3 rounded-2xl bg-gh-canvas p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gh-brand text-sm font-bold text-white">{w.rank}</span>
                <b className="min-w-0 flex-1 truncate">{w.name}</b>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="mt-6 rounded-[28px] bg-white p-5 shadow-gh-soft sm:p-7">
        <h2 className="text-xl font-extrabold">Bạn đã tham gia? Xem kết quả của bạn</h2>
        <p className="mt-1 text-gh-ink-soft">Nhập số điện thoại đã dùng khi tham gia.</p>
        <div className="mt-4">
          <JoinForm mode="login" onJoined={onJoined} />
        </div>
      </div>
    </section>
  )
}

/* ──────────────── THỂ LỆ & CHÍNH SÁCH (cuối trang) ───────────────────────── */
function RulesFooterLinks() {
  const { open } = useLp()
  return (
    <Section>
      <Reveal>
        <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => open('rules')}
          className="lp-tap flex w-full items-center gap-3 rounded-3xl bg-white p-4 text-left font-bold shadow-gh-soft active:scale-[.99]"
        >
          <ScrollText className="h-6 w-6 shrink-0 text-gh-brand" strokeWidth={1.5} aria-hidden="true" />
          Xem thể lệ chương trình
          <ChevronRight className="ml-auto h-5 w-5 shrink-0 text-gh-ink-faint" strokeWidth={2.6} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => open('policy')}
          className="lp-tap flex w-full items-center gap-3 rounded-3xl bg-white p-4 text-left font-bold shadow-gh-soft active:scale-[.99]"
        >
          <ShieldCheck className="h-6 w-6 shrink-0 text-gh-brand" strokeWidth={1.5} aria-hidden="true" />
          Xem chính sách bảo mật
          <ChevronRight className="ml-auto h-5 w-5 shrink-0 text-gh-ink-faint" strokeWidth={2.6} aria-hidden="true" />
        </button>
      </div>
      </Reveal>
    </Section>
  )
}

/* ───────────────────────────── TÌM HIỂU THÊM ─────────────────────────────── */
function More() {
  const { open, campaign } = useLp()
  const cards: { key: string; Icon: LucideIcon; tone: string; title: string; sub: string; wide?: boolean }[] = [
    { key: 'product', Icon: Pill, tone: 'bg-gh-brand-soft text-gh-brand', title: 'Gastroheal là gì?', sub: 'Thành phần, công dụng, cách dùng' },
    { key: 'ingredients', Icon: Leaf, tone: 'bg-gh-lime-soft text-gh-cta-deep', title: 'Trong đó có gì?', sub: 'Nghệ, màng nhầy và tiêu đen' },
    ...(campaign.testimonials.length
      ? [{ key: 'reviews', Icon: MessageCircle, tone: 'bg-gh-cta-soft text-gh-cta-deep', title: 'Người dùng kể gì?', sub: 'Phản hồi sau hai tuần dùng' }]
      : []),
    { key: 'science', Icon: FlaskConical, tone: 'bg-gh-brand-soft text-gh-brand', title: 'Có gì đáng tin?', sub: 'Nghiên cứu và hồ sơ công ty' },
    { key: 'points', Icon: Trophy, tone: 'bg-gh-lime-soft text-gh-cta-deep', title: 'Điểm tính thế nào?', sub: 'Bảng điểm và cách xếp hạng' },
  ]
  // Số thẻ lẻ thì thẻ cuối trải hết hàng.
  if (cards.length % 2 === 1) cards[cards.length - 1].wide = true
  return (
    <Section id="more">
      <Reveal>
        <SectionHead title="Bạn muốn tìm hiểu thêm?" sub="Bấm vào mục bạn quan tâm để xem chi tiết." />
      </Reveal>
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((c, i) => (
          <Reveal key={c.key} delay={i * 60} className={clsx(c.wide && 'sm:col-span-2')}>
            <button
              type="button"
              onClick={() => {
                open(`info:${c.key}`)
                track('info_open', { topic: c.key })
              }}
              className="lp-tap flex w-full items-center gap-4 rounded-3xl bg-white p-4 text-left shadow-gh-soft transition duration-300 ease-gh-spring active:scale-[.99]"
            >
              <IconTile Icon={c.Icon} tone={c.tone} size="lg" />
              <span className="min-w-0 flex-1">
                <span className="block text-[17px] font-bold leading-snug">{c.title}</span>
                <span className="block leading-snug text-gh-ink-soft">{c.sub}</span>
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-gh-ink-faint" strokeWidth={2.6} aria-hidden="true" />
            </button>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

/* ───────────────────────────────── ĐẶT HÀNG ──────────────────────────────── */
function OrderSection() {
  const { slug, campaign, me, refCode, toast } = useLp()
  const [f, setF] = useState({ name: '', phone: '', addr: '', code: '' })
  const [err, setErr] = useState<{ name?: string; phone?: string; addr?: string; form?: string }>({})
  const [codeOk, setCodeOk] = useState(false)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<{ id: string | number; discount: number } | null>(null)

  // Điền sẵn: người đã tham gia dùng mã của chính mình; người được giới thiệu dùng mã trong link.
  useEffect(() => {
    if (me) setF((x) => ({ ...x, name: x.name || me.name, code: x.code || me.referralCode }))
  }, [me])
  useEffect(() => {
    if (refCode) setF((x) => ({ ...x, code: refCode }))
  }, [refCode])

  // Kiểm mã với server (trễ 400 ms sau khi ngừng gõ)
  useEffect(() => {
    const code = f.code.trim().toUpperCase()
    if (!REF_RE.test(code)) {
      setCodeOk(false)
      return
    }
    const t = setTimeout(async () => {
      const r = await lpApi<{ valid: boolean }>(slug, `code/${encodeURIComponent(code)}`)
      setCodeOk(r.ok && r.data.valid)
    }, 400)
    return () => clearTimeout(t)
  }, [f.code, slug])

  if (campaign.status === 'draft' || campaign.status === 'off') return null

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const next: typeof err = {}
    const n = RULE.name(f.name)
    const p = RULE.phone(f.phone)
    const a = RULE.addr(f.addr)
    if (n !== true) next.name = n
    if (p !== true) next.phone = p
    if (a !== true) next.addr = a
    setErr(next)
    if (Object.keys(next).length) return
    setBusy(true)
    const r = await lpApi<{ orderId: string | number; discountPercent: number }>(slug, 'orders', {
      json: { name: f.name.trim(), phone: f.phone.replace(/[\s.-]/g, ''), address: f.addr.trim(), code: f.code.trim().toUpperCase() || undefined, quantity: 1 },
    })
    setBusy(false)
    if (!r.ok) {
      setErr({ form: errorText(r.data.error) })
      return
    }
    setDone({ id: r.data.orderId, discount: r.data.discountPercent })
    toast('Đã nhận đơn, Bioscope sẽ gọi xác nhận', 'package')
    track('order', { discount: r.data.discountPercent })
  }

  const input = (k: 'name' | 'phone' | 'addr', label: string, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label htmlFor={`o-${k}`} className="mb-1.5 block font-semibold">
        {label}
      </label>
      <input
        id={`o-${k}`}
        value={f[k]}
        onChange={(e) => setF((x) => ({ ...x, [k]: e.target.value }))}
        aria-invalid={!!err[k]}
        className={clsx('lp-field', err[k] && 'lp-field-error')}
        {...props}
      />
      {err[k] && <p className="mt-1.5 font-medium text-gh-danger">{err[k]}</p>}
    </div>
  )

  return (
    <Section id="order">
      <Reveal>
        <SectionHead title="Đặt mua Gastroheal" sub={`Có mã thì giảm ${campaign.discountPercent}%. Nhận hàng, xem kỹ rồi mới trả tiền.`} />
      </Reveal>
      {done ? (
        <div className="lp-pop rounded-[28px] bg-white p-6 text-center shadow-gh-soft">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gh-lime-soft text-4xl" aria-hidden="true">
            📦
          </div>
          <p className="mt-3 text-2xl font-extrabold">Bioscope đã nhận đơn của bạn</p>
          <p className="mt-1 text-gh-ink-soft">
            Mã đơn <b className="text-gh-ink">#{done.id}</b>
            {done.discount > 0 && <> · đã áp dụng giảm {done.discount}%</>}. Bioscope sẽ gọi xác nhận trước khi gửi hàng.
          </p>
          <button type="button" onClick={() => setDone(null)} className="mt-4 font-semibold text-gh-brand-deep underline underline-offset-2">
            Đặt thêm đơn khác
          </button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4 rounded-[28px] bg-white p-5 shadow-gh-soft sm:p-7">
          {input('name', 'Người nhận', { type: 'text', autoComplete: 'name', placeholder: 'Họ và tên' })}
          {input('phone', 'Số điện thoại', { type: 'tel', inputMode: 'numeric', autoComplete: 'tel', placeholder: '09xx xxx xxx' })}
          {input('addr', 'Địa chỉ nhận hàng', { type: 'text', autoComplete: 'street-address', placeholder: 'Số nhà, đường, phường/xã, tỉnh/TP' })}
          <div>
            <label htmlFor="o-code" className="mb-1.5 block font-semibold">
              Mã giảm giá
            </label>
            <div className="relative">
              <input
                id="o-code"
                type="text"
                autoCapitalize="characters"
                placeholder="Nhập mã nếu có"
                value={f.code}
                onChange={(e) => setF((x) => ({ ...x, code: e.target.value.toUpperCase() }))}
                className="lp-field pr-24 font-mono font-bold uppercase tracking-wider"
              />
              {codeOk && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-gh-lime-soft px-3 py-1 text-sm font-bold text-gh-cta-deep">
                  ✓ -{campaign.discountPercent}%
                </span>
              )}
            </div>
          </div>
          {err.form && <p className="rounded-2xl bg-[#FFF7F7] p-3 font-medium text-gh-danger">{err.form}</p>}
          <CtaButton type="submit" disabled={busy}>
            <span>Đặt hàng</span>
            {busy && <Spinner />}
          </CtaButton>
          <p className="text-center text-sm text-gh-ink-faint">Bioscope gọi xác nhận trước khi gửi hàng.</p>
        </form>
      )}
    </Section>
  )
}

/* ──────────────────────────────── CHÂN TRANG ─────────────────────────────── */
function Footer() {
  const { open, campaign } = useLp()
  return (
    <footer className="py-10">
      <p className="rounded-3xl bg-white p-4 text-center leading-relaxed text-gh-ink-soft shadow-gh-soft">
        Thực phẩm này không phải là thuốc và không có tác dụng thay thế thuốc chữa bệnh. Không dùng cho người mẫn cảm với bất kỳ thành phần nào của sản phẩm.
        <br />
        Hiệu quả tuỳ cơ địa từng người.
      </p>
      <div className="mt-5 flex flex-col items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${IMG}/bioscope-logo.png`} alt="Bioscope" className="h-8 w-auto opacity-80" />
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-sm text-gh-ink-soft">
          <button type="button" onClick={() => open('company')} className="inline-flex min-h-[44px] items-center underline underline-offset-2">
            Thông tin công ty &amp; chứng nhận
          </button>
          {campaign.hotline && (
            <a href={`tel:${campaign.hotline.replace(/[^\d+]/g, '')}`} className="inline-flex min-h-[44px] items-center underline underline-offset-2">
              Hotline {campaign.hotline}
            </a>
          )}
          {campaign.zaloUrl && /^https:\/\//.test(campaign.zaloUrl) && (
            <a href={campaign.zaloUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center underline underline-offset-2">
              Nhắn Zalo
            </a>
          )}
        </div>
        <p className="text-center text-sm text-gh-ink-faint">© {new Date().getFullYear()} Bioscope Việt Nam</p>
      </div>
    </footer>
  )
}

/* ─────────────────────────── NÚT CHÍNH DƯỚI ĐÁY ──────────────────────────── */
function Dock() {
  const { me, campaign, open, openVideo } = useLp()
  const pct = me?.pct ?? 0
  const ended = isClosed(campaign)
  let title: React.ReactNode
  let sub: string
  let label: string
  let action: () => void

  if (!me) {
    if (ended) {
      title = `${campaign.round?.label ?? 'Đợt này'} đã chốt`
      sub = 'Xem kết quả của bạn'
      label = 'Xem'
      action = () => scrollToId('main')
    } else {
      title = (
        <>
          <b className="text-gh-cta-deep">{campaign.slots}</b> phần quà {campaign.round?.label ?? ''}
        </>
      )
      sub = 'Miễn phí · mất 2 phút'
      label = 'Tham gia'
      action = () => scrollToId('join', 'fName')
    }
  } else {
    const t = taskState(me, campaign.videos.length)
    title = (
      <>
        <b className="text-gh-cta-deep">{me.total}</b> điểm · hạng {me.rank ?? '—'}
      </>
    )
    if (ended) {
      sub = me.winner ? 'Bạn có trong danh sách nhận quà' : 'Cảm ơn bạn đã tham gia'
      label = `Mua giảm giá ${campaign.discountPercent}%`
      action = () => scrollToId('order')
    } else if (campaign.videos.length && !t.videosDone) {
      sub = `Còn ${campaign.videos.length - me.videosWatched.length} video nữa`
      label = 'Xem video'
      action = () => openVideo()
    } else if (me.recording === 'none' || me.recording === 'rejected') {
      sub = 'Chia sẻ câu chuyện dạ dày'
      label = 'Chia sẻ'
      action = () => open('rec')
    } else if (!t.shareSent && !t.shareDone) {
      sub = 'Mời người thân tham gia'
      label = 'Gửi lời mời'
      action = () => open('share')
    } else {
      sub = t.recPending ? 'Chờ Bioscope nghe bản ghi' : campaign.round ? `Chốt ${vnDate(campaign.round.endAt)}` : 'Chờ ngày chốt'
      label = `Mua giảm giá ${campaign.discountPercent}%`
      action = () => scrollToId('order')
    }
  }

  const C = 119.4
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(10px,env(safe-area-inset-bottom))]">
      <div className="lp-glass mx-auto flex max-w-3xl items-center gap-2 rounded-full py-2 pl-2.5 pr-2 shadow-gh-float ring-1 ring-black/5">
        <div className="relative h-11 w-11 shrink-0 max-[359px]:hidden">
          <svg viewBox="0 0 44 44" className="h-full w-full -rotate-90" aria-hidden="true">
            <circle cx="22" cy="22" r="19" fill="#FFF" stroke="#E1F1F1" strokeWidth="4" />
            <circle
              cx="22"
              cy="22"
              r="19"
              fill="none"
              stroke="#EC8A2C"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - pct / 100)}
              style={{ transition: 'stroke-dashoffset .7s cubic-bezier(.32,.72,0,1)' }}
            />
          </svg>
          <Gift className="absolute inset-0 m-auto h-[18px] w-[18px] text-gh-cta-deep" fill="currentColor" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-bold min-[375px]:text-[15px] sm:text-base">{title}</p>
          <p className="truncate text-[13px] text-gh-ink-soft sm:text-sm">{sub}</p>
        </div>
        <button
          type="button"
          onClick={action}
          className="lp-tap flex shrink-0 items-center gap-1.5 rounded-full bg-gh-cta px-3.5 font-bold text-white shadow-gh-cta active:scale-[.97] sm:gap-2 sm:px-5"
        >
          <span>{label}</span>
          <ArrowRight className="h-5 w-5" strokeWidth={2.6} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────── THÔNG BÁO + ĐIỂM BAY ────────────────────────── */
function ToastLayer() {
  const { toastState, flies } = useLp()
  const Icon = TOAST_ICONS[toastState.icon]
  return (
    <>
      <div
        className={clsx('pointer-events-none fixed inset-x-0 top-20 z-[70] flex justify-center px-4 transition duration-300', toastState.on ? 'opacity-100' : 'opacity-0')}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-2 rounded-full bg-gh-ink px-5 py-3 font-semibold text-white shadow-gh-float">
          <Icon className="h-5 w-5 shrink-0" strokeWidth={2.6} aria-hidden="true" />
          <span>{toastState.text}</span>
        </div>
      </div>
      <div className="pointer-events-none fixed inset-0 z-[75]" aria-hidden="true">
        {flies.map((f) => (
          <span key={f.id} className="lp-fly absolute rounded-full bg-gh-cta px-3 py-1 font-bold text-white shadow-gh-cta" style={{ left: f.x, top: f.y }}>
            {f.text}
          </span>
        ))}
      </div>
    </>
  )
}
