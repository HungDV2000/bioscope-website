'use client'

import { useEffect, useState, type ReactNode } from 'react'
import {
  Ban,
  Building2,
  Check,
  ChevronDown,
  ClipboardList,
  Flame,
  Gift,
  Mic,
  PlayCircle,
  Share2,
  ShieldPlus,
  Sparkles,
  Trophy,
  Truck,
  UserPlus,
  type LucideIcon,
} from 'lucide-react'
import clsx from 'clsx'
import { useLp } from './context'
import { JoinForm, SymptomPicker, scrollToId } from './Steps'
import { TopList } from './Hub'
import {
  CtaButton,
  IMG,
  IconTile,
  OrbitText,
  PingDot,
  Reveal,
  Section,
  SectionHead,
  StepDot,
  cardClass,
  giftCardClass,
} from './ui'
import type { LpMe } from '@/lib/landing/types'

/** Ngày giờ theo múi giờ Việt Nam — trang này chỉ phục vụ khách trong nước. */
export function vnDate(iso: string, withTime = false): string {
  const p = new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    ...(withTime ? { hour: '2-digit', minute: '2-digit', hour12: false } : {}),
  })
    .formatToParts(new Date(iso))
    .reduce<Record<string, string>>((a, x) => ({ ...a, [x.type]: x.value }), {})
  const d = `${p.day}/${p.month}`
  return withTime ? `${p.hour}:${p.minute} ngày ${d}` : d
}

export const daysUntil = (iso: string, now: number = Date.now()) => Math.max(0, Math.ceil((new Date(iso).getTime() - now) / 864e5))

/**
 * Giờ hiện tại phía trình duyệt, cập nhật mỗi phút.
 *
 * Render lần đầu trả 0 để HTML của server và của trình duyệt giống hệt nhau
 * (tránh cảnh báo hydrate), sau khi vẽ xong khung hình đầu mới lấy giờ thật.
 */
export function useNow(): number {
  const { campaign } = useLp()
  const [now, setNow] = useState(0)
  useEffect(() => {
    const raf = requestAnimationFrame(() => setNow(Date.now()))
    const t = setInterval(() => setNow(Date.now()), 60_000)
    return () => {
      cancelAnimationFrame(raf)
      clearInterval(t)
    }
  }, [])
  // Chưa hydrate xong thì dùng giờ máy chủ gửi kèm — tránh lệch HTML.
  return now || Date.parse(campaign.serverNow)
}

export type Countdown = { days: number; hours: number; minutes: number; seconds: number; done: boolean }

/**
 * Đếm ngược tới một mốc, tick mỗi GIÂY — dùng cho đồng hồ ở thanh trên.
 *
 * Khác `useNow` (tick mỗi phút, đủ cho hầu hết mọi chỗ hiển thị "còn N ngày"):
 * ở đây con số giây phải nhảy liên tục nên cần nhịp nhanh hơn. Giá trị khởi
 * tạo lấy từ giờ máy chủ để lần render đầu khớp HTML tĩnh, không giật số khi
 * hydrate.
 */
export function useCountdown(targetIso: string | undefined | null): Countdown | null {
  const { campaign } = useLp()
  const [now, setNow] = useState(() => Date.parse(campaign.serverNow))
  useEffect(() => {
    const raf = requestAnimationFrame(() => setNow(Date.now()))
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => {
      cancelAnimationFrame(raf)
      clearInterval(t)
    }
  }, [])
  if (!targetIso) return null
  const diff = Math.max(0, new Date(targetIso).getTime() - now)
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
    done: diff <= 0,
  }
}

/**
 * Một ô số của đồng hồ đếm ngược.
 *
 * Ba ô đầu xanh thương hiệu, riêng ô GIÂY màu cam để mắt bắt được nhịp chạy.
 * Nền chuyển sắc nhẹ cho có chiều sâu, nhưng điểm sáng nhất của mỗi dải vẫn đủ
 * tương phản với chữ trắng ở cỡ chữ này (ô lớn ≥ 25px đậm → ngưỡng 3:1).
 */
function CountUnit({ value, label, tone = 'brand', big }: { value: number; label: string; tone?: 'brand' | 'cta'; big?: boolean }) {
  return (
    <span className="flex flex-col items-center">
      <span
        className={clsx(
          'flex items-center justify-center font-extrabold tabular-nums text-white',
          big
            ? 'h-14 w-14 rounded-[1.35rem] text-[1.6rem] shadow-gh-soft sm:h-[4.25rem] sm:w-[4.25rem] sm:rounded-[1.6rem] sm:text-[2rem]'
            : 'h-7 min-w-[26px] rounded-xl px-1 text-[13px] shadow-sm sm:h-8 sm:min-w-[32px] sm:text-sm',
          tone === 'cta' ? 'bg-gradient-to-br from-gh-cta-deep to-[#c96a16]' : 'bg-gradient-to-br from-gh-brand-deep to-gh-brand',
        )}
      >
        {String(Math.max(0, value)).padStart(2, '0')}
      </span>
      <span
        className={clsx(
          'font-bold uppercase tracking-[0.12em]',
          tone === 'cta' ? 'text-gh-cta-deep/70' : 'text-gh-brand-deep/60',
          big ? 'mt-2 text-[10px] sm:text-[11px]' : 'mt-0.5 hidden text-[9px] sm:block',
        )}
      >
        {label}
      </span>
    </span>
  )
}

/**
 * Bảng đếm ngược ở đầu trang: nhãn ngữ cảnh, 4 ô số chạy từng giây, dưới cùng
 * là mốc chốt và mốc công bố.
 *
 * Nền là dải xanh rất nhạt chứ không phải thẻ trắng — tách khỏi các thẻ thông
 * tin xung quanh mà vẫn có đủ khoảng thở trên dưới.
 */
export function CountdownBoard({ className }: { className?: string }) {
  const { campaign } = useLp()
  const r = campaign.round
  const cd = useCountdown(r && r.status === 'open' ? r.endAt : null)
  if (!r) return null
  if (r.status !== 'open' || !cd || cd.done) {
    return (
      <p className={clsx('text-center text-[15px] leading-snug text-gh-ink-soft', className)}>
        Đợt này đã chốt · công bố kết quả {vnDate(r.announceAt, true)}
      </p>
    )
  }
  const colon = 'flex h-14 items-center text-xl font-extrabold text-gh-brand/25 sm:h-[4.25rem] sm:text-2xl'
  return (
    <div
      className={clsx(
        'rounded-[28px] bg-gradient-to-b from-gh-brand-mist via-gh-brand-mist/50 to-transparent px-4 py-7 text-center sm:py-8',
        className,
      )}
    >
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-gh-brand-deep">Đợt {r.label} kết thúc sau</p>
      <div className="mt-4 flex items-start justify-center gap-2 sm:gap-3">
        <CountUnit value={cd.days} label="Ngày" big />
        <span className={colon}>:</span>
        <CountUnit value={cd.hours} label="Giờ" big />
        <span className={colon}>:</span>
        <CountUnit value={cd.minutes} label="Phút" big />
        <span className={colon}>:</span>
        <CountUnit value={cd.seconds} label="Giây" tone="cta" big />
      </div>
      <p className="mt-5 text-[15px] leading-snug text-gh-ink-soft">
        Chốt <b className="font-semibold text-gh-ink">{vnDate(r.endAt, true)}</b> · Công bố kết quả {vnDate(r.announceAt)}
      </p>
    </div>
  )
}

/** Các phần thuộc luồng chính — căn cứ cho chỉ báo "Bước x/N" ở thanh trên. */
export const FLOW_STEPS = ['hero', 'cach-tham-gia', 'diem', 'nhan-qua', 'join'] as const

/**
 * Chỉ báo bước ở thanh trên (kiểu bản v2): chữ "Bước x/5" kèm dãy vạch, bám
 * theo phần đang nằm giữa màn hình.
 */
export function FlowStepper() {
  const [step, setStep] = useState(1)
  useEffect(() => {
    const els = FLOW_STEPS.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el)
    if (!els.length) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          const i = FLOW_STEPS.indexOf(e.target.id as (typeof FLOW_STEPS)[number])
          if (i >= 0) setStep(i + 1)
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return (
    <div className="flex items-center gap-2" aria-label={`Bước ${step} trên ${FLOW_STEPS.length}`}>
      <span className="text-sm font-bold text-gh-brand-deep">
        Bước {step}/{FLOW_STEPS.length}
      </span>
      <div className="flex gap-1" aria-hidden="true">
        {FLOW_STEPS.map((id, i) => (
          <span
            key={id}
            className={clsx(
              'h-2 rounded-full transition-all duration-300 ease-gh-spring',
              i + 1 === step ? 'w-6 bg-gh-brand' : i + 1 < step ? 'w-2 bg-gh-brand/55' : 'w-2 bg-gh-brand/20',
            )}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Tô màu cam cho con số trong tiêu đề.
 *
 * Bản v2 lấy điểm nhấn thị giác từ chỗ này ("Còn **43 phần quà** Gastroheal…");
 * tiêu đề một màu, viết hoa toàn bộ nhìn nặng và phẳng hẳn.
 */
function highlightNumber(text: string): ReactNode {
  const out: ReactNode[] = []
  // Cụm đặt giữa *dấu sao* là cụm được nhấn — do người viết nội dung quyết
  // định, code không tự đoán nên đổi câu chữ trong admin là màu đi theo.
  text.split(/\*([^*]+)\*/g).forEach((chunk, i) => {
    if (!chunk) return
    if (i % 2 === 1) {
      out.push(
        <span key={`hl${i}`} className="text-gh-brand-deep underline decoration-gh-lime decoration-4 underline-offset-[6px]">
          {chunk}
        </span>,
      )
      return
    }
    // Con số: cam đậm, to hơn một nhịp — vẫn là chữ, không phải khối nền.
    chunk.split(/(\d+)/).forEach((part, j) => {
      if (!part) return
      out.push(
        /^\d+$/.test(part) ? (
          <span key={`n${i}-${j}`} className="text-[1.12em] font-black text-gh-cta-deep">
            {part}
          </span>
        ) : (
          <span key={`t${i}-${j}`}>{part}</span>
        ),
      )
    })
  })
  return out
}

/* ─────────────────────────────── QUÀ TẶNG ────────────────────────────────── */
export function Hero() {
  const { campaign } = useLp()
  return (
    <Section id="hero" step={1} className="pt-6">
      <Reveal>
        <p className="inline-flex items-center gap-2 rounded-full bg-gh-cta-soft px-4 py-2 text-sm font-semibold text-gh-cta-deep">
          <PingDot />
          {campaign.programName}
        </p>
        {/* Tiêu đề vẫn là chữ thuần, chỉ phối màu: số cam đậm, cụm nhấn xanh
            thương hiệu gạch chân vàng, phần còn lại màu mực. */}
        <h1 className="mt-4 text-[2.15rem] font-extrabold leading-[1.16] tracking-tight sm:text-5xl sm:leading-[1.1]">
          {highlightNumber(campaign.heroTitle)}
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-gh-ink-soft">{campaign.heroSubtitle}</p>
      </Reveal>

      <Reveal delay={80} className="mt-6">
        <div className="relative mx-auto aspect-square w-full max-w-[23rem] sm:max-w-[27rem]">
          <div className="lp-pattern-hex absolute inset-0 rounded-full opacity-70" />
          <div className="absolute inset-[6%] rounded-full bg-[radial-gradient(circle_at_40%_30%,#FFFFFF_0%,#EAF4F4_55%,#D3EBEA_100%)] shadow-gh-float" />
          <div className="absolute inset-[2%] rounded-full border border-dashed border-gh-brand/20" />
          <div className="lp-bob absolute inset-[12%] flex items-end justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${IMG}/gastroheal.png`}
              alt="Hộp và lọ Gastroheal"
              fetchPriority="high"
              className="h-full w-full object-contain drop-shadow-[0_24px_28px_rgba(11,98,104,.22)]"
            />
          </div>
          <Ingredient className="left-0 top-[4%] h-[4.5rem] w-[4.5rem] sm:h-24 sm:w-24" img="ing-curcumin.png" alt="Nano Phytosome Curcumin" text="NANO PHYTOSOME CURCUMIN · NANO PHYTOSOME ·" />
          <Ingredient className="right-0 top-[22%] h-[4.5rem] w-[4.5rem] sm:h-24 sm:w-24" img="ing-phosphatidylcholine.png" alt="Phosphatidylcholine" text="PHOSPHATIDYLCHOLINE · PHOSPHATIDYLCHOLINE ·" reverse />
          <Ingredient className="bottom-[10%] left-0 h-16 w-16 sm:h-20 sm:w-20" img="ing-piperine.png" alt="Piperine" text="PIPERINE · PIPERINE · PIPERINE ·" size={9} spacing={2} />
          <span className="absolute left-[30%] top-0 flex h-9 w-9 items-center justify-center rounded-full bg-white text-gh-brand shadow-gh-soft ring-1 ring-gh-brand/10" aria-hidden="true">
            <ShieldPlus className="h-[18px] w-[18px]" strokeWidth={1.6} />
          </span>
          <span className="absolute bottom-[18%] right-[4%] flex h-9 w-9 items-center justify-center rounded-full bg-white text-gh-brand shadow-gh-soft ring-1 ring-gh-brand/10" aria-hidden="true">
            <ShieldPlus className="h-[18px] w-[18px]" strokeWidth={1.6} />
          </span>
        </div>
      </Reveal>

      {/* Quà là gì → nút tham gia → ai được tham gia → khi nào chốt.
          Đặt ngay dưới ảnh: khách nhìn thấy phần quà rồi mới quyết định bấm. */}
      <Reveal delay={60} className="mt-6">
        {campaign.giftNote && (
          <p className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-white px-4 py-3 text-center font-semibold shadow-gh-soft">
            <Gift className="h-5 w-5 shrink-0 text-gh-cta" fill="currentColor" aria-hidden="true" />
            {campaign.giftNote}
          </p>
        )}
        <CtaButton className="mt-4" arrow onClick={() => scrollToId('join', 'fName')}>
          {campaign.ctaLabel}
        </CtaButton>
        {campaign.eligibilityNote && <p className="mt-2.5 text-center text-sm leading-snug text-gh-ink-faint">{campaign.eligibilityNote}</p>}
        <CountdownBoard className="mt-6" />
      </Reveal>

      <Reveal delay={60}>
        <ul className="mt-5 grid grid-cols-3 gap-2 text-center text-[13px] font-medium text-gh-ink-soft">
          {(
            [
              [Building2, 'Bioscope', 'tổ chức'],
              [Ban, 'Không thu', 'phí'],
              [Truck, 'Gửi tận', 'nhà'],
            ] as [LucideIcon, string, string][]
          ).map(([Icon, a, b]) => (
            <li key={a} className="rounded-2xl bg-white p-3 shadow-gh-soft">
              <Icon className="mx-auto mb-1 block h-6 w-6 text-gh-brand" strokeWidth={1.5} aria-hidden="true" />
              {a}
              <br />
              {b}
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  )
}

function Ingredient({ className, img, alt, text, reverse, size, spacing }: { className: string; img: string; alt: string; text: string; reverse?: boolean; size?: number; spacing?: number }) {
  return (
    <div className={clsx('absolute overflow-hidden rounded-full', className)}>
      <OrbitText text={text} reverse={reverse} size={size} spacing={spacing} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${IMG}/${img}`} alt={alt} className="absolute inset-[20%] h-[60%] w-[60%] rounded-full bg-white object-cover shadow-gh-soft ring-4 ring-white" />
    </div>
  )
}

/* ──────────────────────── CÁCH THAM GIA — 3 BƯỚC ─────────────────────────── */
export function HowItWorks() {
  const { campaign } = useLp()
  const steps: { Icon: LucideIcon; title: string; desc: string }[] = [
    { Icon: ClipboardList, title: 'Điền thông tin tham gia', desc: 'Tên và số điện thoại, mất 30 giây.' },
    { Icon: Gift, title: 'Hoàn thành các hoạt động để tích điểm', desc: 'Xem video, chia sẻ câu chuyện, mời người thân.' },
    {
      Icon: Trophy,
      title: `Chờ công bố ${campaign.slots} khách hàng nhận quà`,
      desc: `Công bố ${campaign.round ? vnDate(campaign.round.announceAt) : 'đầu tháng sau'}, quà gửi tận nhà.`,
    },
  ]
  return (
    <Section id="cach-tham-gia" step={2}>
      <Reveal>
        <SectionHead title="Cách tham gia" sub="Chỉ ba bước, ai cũng làm được." />
      </Reveal>
      {/* Điện thoại: xếp dọc cho dễ đọc. Máy tính: ba cột cạnh nhau đúng như
          bản vẽ của marketing. Mỗi bước LUÔN có icon (kể cả trên điện thoại). */}
      <ol className="grid gap-3 sm:grid-cols-3">
        {steps.map((s, i) => (
          <Reveal key={s.title} delay={i * 70} className="h-full">
            <li className="flex h-full items-center gap-4 rounded-3xl bg-white p-4 shadow-gh-soft sm:flex-col sm:items-center sm:p-5 sm:text-center">
              <span className="relative shrink-0">
                <IconTile Icon={s.Icon} tone={i === 2 ? 'bg-gh-cta-soft text-gh-cta-deep' : 'bg-gh-brand-soft text-gh-brand'} size="lg" />
                <span
                  className={clsx(
                    'absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold text-white ring-2 ring-white',
                    i === 2 ? 'bg-gh-cta' : 'bg-gh-brand',
                  )}
                >
                  {i + 1}
                </span>
              </span>
              <div className="min-w-0 flex-1 sm:flex-none">
                <p className="text-sm font-bold uppercase tracking-widest text-gh-brand-deep">Bước {i + 1}</p>
                <p className="mt-0.5 text-[17px] font-bold leading-snug">{s.title}</p>
                <p className="mt-1 leading-snug text-gh-ink-soft">{s.desc}</p>
              </div>
            </li>
          </Reveal>
        ))}
      </ol>
    </Section>
  )
}

/* ───────────────────────── HOẠT ĐỘNG & ĐIỂM SỐ ───────────────────────────── */
export function Activities() {
  const { campaign } = useLp()
  const p = campaign.points
  const hasMain = campaign.videos.some((v) => v.isMain)
  const rows: { Icon: LucideIcon; tone: string; label: string; note?: string; pts: number }[] = [
    { Icon: PlayCircle, tone: 'bg-gh-brand-soft text-gh-brand', label: 'Xem video', note: 'mỗi video', pts: p.video },
    ...(hasMain ? [{ Icon: PlayCircle, tone: 'bg-gh-brand-soft text-gh-brand', label: 'Video giới thiệu sản phẩm', pts: p.videoMain }] : []),
    { Icon: Mic, tone: 'bg-gh-cta-soft text-gh-cta-deep', label: 'Chia sẻ câu chuyện về dạ dày', note: 'sau khi Bioscope nghe bản ghi', pts: p.record },
    {
      Icon: UserPlus,
      tone: 'bg-gh-lime-soft text-gh-cta-deep',
      label: 'Mời người thân/bạn bè tham gia',
      note: `tối đa ${p.maxReferralOrders} người mỗi tháng`,
      pts: p.order,
    },
    { Icon: Share2, tone: 'bg-gh-brand-soft text-gh-brand', label: 'Chia sẻ kết quả sau 2 tuần', note: 'khách đã nhận quà hoặc đã mua hàng', pts: p.result },
  ]
  return (
    <Section id="diem" step={3}>
      <Reveal>
        <SectionHead title="Hoạt động & điểm số" sub="Hoàn thành các hoạt động để tích điểm và tăng cơ hội nhận quà." />
      </Reveal>
      <ul className="space-y-3">
        {rows.map((r, i) => (
          <Reveal key={r.label} delay={i * 60}>
            <li className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-gh-soft">
              <IconTile Icon={r.Icon} tone={r.tone} size="lg" />
              <span className="min-w-0 flex-1">
                <span className="block text-[17px] font-bold leading-snug">{r.label}</span>
                {r.note && <span className="block leading-snug text-gh-ink-soft">{r.note}</span>}
              </span>
              <span className="flex shrink-0 items-baseline gap-1 rounded-full bg-gh-lime-soft px-3.5 py-2 text-gh-cta-deep">
                <b className="text-lg font-extrabold">+{r.pts}</b>
                <span className="text-xs font-bold">điểm</span>
              </span>
            </li>
          </Reveal>
        ))}
      </ul>

      <Reveal delay={80}>
        <div className="mt-3 flex items-center gap-4 rounded-3xl bg-gh-lime-soft p-4">
          <IconTile Icon={Sparkles} tone="bg-white text-gh-cta-deep" size="lg" />
          <p className="min-w-0 flex-1 leading-snug">
            <b className="block text-[17px]">Tham gia sớm được cộng thêm</b>
            Cứ có một người tham gia sau bạn, bạn được <b>+{p.bonusPerJoin} điểm</b> — tối đa {p.bonusMax} lần trong tháng.
          </p>
        </div>
      </Reveal>
    </Section>
  )
}

/* ───────────────── 43 KHÁCH HÀNG CÓ TỔNG ĐIỂM CAO NHẤT ───────────────────── */
export function WinnersExplainer() {
  const { campaign, leaderboard } = useLp()
  const now = useNow()
  const r = campaign.round
  const rules: ReactNode[] = [
    <>
      Càng nhiều điểm, <b className="text-gh-ink">cơ hội nhận quà càng cao</b>.
    </>,
    <>
      Khi chốt {r ? vnDate(r.endAt) : 'cuối tháng'}, <b className="text-gh-ink">{campaign.slots} khách hàng có tổng điểm cao nhất</b> nhận quà tận nhà.
    </>,
    <>
      Nếu <b className="text-gh-ink">bằng điểm</b>, người tham gia sớm hơn được ưu tiên.
    </>,
  ]
  return (
    <Section id="nhan-qua" step={4}>
      {/* Thẻ quà: nền chuyển sắc, nơ góc, sao lấp lánh — điểm nhấn vui mắt của bản v2. */}
      <Reveal>
        <div className={clsx(giftCardClass, 'p-5 sm:p-6')}>
          <span className="pointer-events-none absolute -right-11 top-3.5 z-10 rotate-45 bg-gh-cta px-11 py-1 text-center text-[11px] font-extrabold uppercase tracking-[0.12em] text-white shadow-gh-cta">
            Quà tặng
          </span>
          <span className="lp-twinkle pointer-events-none absolute left-6 top-6 text-lg text-gh-lime" aria-hidden="true">
            ✦
          </span>
          <span className="lp-twinkle pointer-events-none absolute bottom-6 left-[42%] text-sm text-gh-cta" style={{ animationDelay: '.8s' }} aria-hidden="true">
            ✦
          </span>
          <p className="relative pr-16 text-sm font-bold uppercase tracking-widest text-gh-brand-deep">Phần thưởng {r?.label ?? ''}</p>
          <div className="relative mt-3 flex items-center gap-4">
            <div className="lp-bob h-24 w-24 shrink-0 sm:h-28 sm:w-28">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${IMG}/gastroheal.png`} alt="Phần quà Gastroheal" loading="lazy" className="h-full w-full object-contain drop-shadow-[0_12px_16px_rgba(11,98,104,.25)]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-baseline gap-2 font-extrabold leading-none">
                <span className="text-[2.75rem] text-gh-cta-deep">{campaign.slots}</span>
                <span className="text-xl text-gh-ink">phần quà</span>
              </p>
              <p className="mt-2 leading-snug text-gh-ink-soft">Giao tận nhà, không thu phí, không đổi thành tiền.</p>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={70}>
        <div className="mt-3 rounded-[28px] bg-white p-5 shadow-gh-soft">
          <h2 className="flex items-start gap-2 text-[1.35rem] font-extrabold leading-tight sm:text-[1.6rem]">
            <Trophy className="mt-0.5 h-6 w-6 shrink-0 text-gh-brand" strokeWidth={1.6} aria-hidden="true" />
            {campaign.slots} khách hàng có tổng điểm cao nhất
          </h2>
          <ol className="mt-4 space-y-3">
            {rules.map((node, i) => (
              <li key={i} className="flex gap-3">
                <StepDot n={i + 1} tone={i === 2 ? 'lime' : 'brand'} />
                <p className="pt-1 leading-snug">{node}</p>
              </li>
            ))}
          </ol>
          {campaign.numberExplain && (
            <p className="mt-4 rounded-2xl bg-gh-brand-mist p-4 leading-relaxed text-gh-brand-deep">
              <b>Vì sao là {campaign.slots}?</b> {campaign.numberExplain}
            </p>
          )}
        </div>
      </Reveal>

      <Reveal delay={110}>
        <div className="mt-3 rounded-[28px] bg-white p-5 shadow-gh-soft">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[1.2rem] font-extrabold">Đang dẫn đầu {r?.label ?? ''}</h3>
            {r && (
              <span className="shrink-0 rounded-full bg-gh-cta-soft px-3 py-1.5 text-sm font-bold text-gh-cta-deep">
                Còn {daysUntil(r.endAt, now)} ngày
              </span>
            )}
          </div>
          <TopList rows={leaderboard.slice(0, 3)} />
        </div>
      </Reveal>
    </Section>
  )
}

/* ─────────────────────────── CTA — THAM GIA NGAY ─────────────────────────── */
export function JoinSection({ onJoined }: { onJoined: (me: LpMe, created: boolean) => void }) {
  return (
    <Section id="join" step={5}>
      <Reveal>
        <SectionHead eyebrow="Tham gia ngay" title="Chỉ cần tên và số điện thoại" />
        <div className="rounded-[28px] bg-white p-5 shadow-gh-soft sm:p-7">
          <JoinForm onJoined={onJoined} />
          <SymptomPicker />
        </div>
        <p className="mt-3 text-center text-sm leading-relaxed text-gh-ink-faint">
          Thông tin của bạn được bảo mật và chỉ được sử dụng cho mục đích tham gia chương trình.
        </p>
      </Reveal>
    </Section>
  )
}

/* ───────────────────────── INFOGRAPHIC LỘ TRÌNH ──────────────────────────── */
export function Timeline() {
  const { campaign, me } = useLp()
  const now = useNow()
  const r = campaign.round
  if (!r) return null
  const steps: { Icon: LucideIcon; label: string; note: string; done: boolean }[] = [
    { Icon: ClipboardList, label: 'Tham gia', note: 'Điền tên và số điện thoại', done: !!me },
    { Icon: Sparkles, label: 'Tích điểm trong tháng', note: 'Xem video · chia sẻ · mời người thân', done: !!me && me.total > 0 },
    { Icon: Trophy, label: `Chốt ${vnDate(r.endAt)}`, note: `${campaign.slots} khách hàng điểm cao nhất`, done: now >= new Date(r.endAt).getTime() },
    { Icon: Gift, label: `Công bố ${vnDate(r.announceAt)}`, note: 'Gọi điện và gửi quà tận nhà', done: now >= new Date(r.announceAt).getTime() },
  ]
  const current = steps.findIndex((s) => !s.done)
  return (
    <Section id="lo-trinh">
      <Reveal>
        <SectionHead title="Lộ trình chương trình" />
        <ol className="rounded-[28px] bg-white p-5 shadow-gh-soft sm:grid sm:grid-cols-4 sm:gap-3 sm:p-6">
          {steps.map((s, i) => {
            const active = i === current
            return (
              <li key={s.label} className="relative flex gap-4 pb-7 last:pb-0 sm:block sm:pb-0">
                {/* Vạch nối: dọc trên điện thoại, ngang trên máy tính. Đoạn đã
                    qua tô xanh đậm để nhìn là biết đang ở đâu. */}
                {i < steps.length - 1 && (
                  <>
                    <span className={clsx('absolute left-[23px] top-12 h-[calc(100%-2rem)] w-0.5 rounded-full sm:hidden', s.done ? 'bg-gh-brand' : 'bg-gh-brand/15')} aria-hidden="true" />
                    <span
                      className={clsx('absolute left-[calc(50%+1.75rem)] top-6 hidden h-0.5 w-[calc(100%-3.5rem)] rounded-full sm:block', s.done ? 'bg-gh-brand' : 'bg-gh-brand/15')}
                      aria-hidden="true"
                    />
                  </>
                )}
                <span className="relative z-10 shrink-0 sm:mx-auto sm:block sm:w-fit">
                  {active && <span className="absolute inset-0 animate-ping rounded-2xl bg-gh-cta/25" aria-hidden="true" />}
                  <span
                    className={clsx(
                      'relative flex h-12 w-12 items-center justify-center rounded-2xl',
                      s.done ? 'bg-gh-brand text-white' : active ? 'bg-gh-cta text-white shadow-gh-cta' : 'bg-gh-brand-soft text-gh-brand-deep',
                    )}
                  >
                    {s.done ? <Check className="h-6 w-6" strokeWidth={3} aria-hidden="true" /> : <s.Icon className="h-6 w-6" strokeWidth={1.8} aria-hidden="true" />}
                  </span>
                </span>
                <span className="min-w-0 flex-1 sm:mt-3 sm:block sm:text-center">
                  <span className={clsx('block text-[17px] font-bold leading-snug', active ? 'text-gh-cta-deep' : s.done ? 'text-gh-ink' : 'text-gh-ink/70')}>{s.label}</span>
                  <span className="mt-0.5 block leading-snug text-gh-ink-soft">{s.note}</span>
                  {active && (
                    <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-gh-cta-soft px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-gh-cta-deep">
                      <PingDot />
                      Đang ở bước này
                    </span>
                  )}
                </span>
              </li>
            )
          })}
        </ol>
      </Reveal>
    </Section>
  )
}

/* ─────────── Dải kết quả đợt trước (đã chốt / đã công bố) ─────────────────── */
export function LastResultBanner() {
  const { campaign, open: openModal } = useLp()
  // Mặc định gập lại: đây là chuyện của tháng trước, không nên đẩy nội dung
  // tháng này xuống. Ai quan tâm thì bấm mở.
  const [open, setOpen] = useState(false)
  const r = campaign.lastResult
  if (!r) return null
  const shown = r.winners.slice(0, 12)
  return (
    <Reveal className="mt-2">
      <div className={clsx(giftCardClass, 'overflow-hidden')}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="relative flex w-full items-center gap-3 p-5 text-left"
        >
          <IconTile Icon={Trophy} tone="bg-white text-gh-cta-deep" />
          <span className="min-w-0 flex-1">
            <span className="block text-[17px] font-extrabold leading-snug text-gh-cta-deep">
              {r.announced ? `${r.winners.length} khách hàng nhận quà ${r.label}` : `Kết quả ${r.label} đã chốt`}
            </span>
            <span className="block leading-snug text-gh-ink-soft">
              {r.announced ? (open ? 'Bấm để thu gọn' : 'Bấm để xem danh sách') : `Bioscope đang đối chiếu, công bố ${vnDate(r.announceAt, true)}`}
            </span>
          </span>
          {r.announced && (
            <ChevronDown className={clsx('h-5 w-5 shrink-0 text-gh-cta-deep transition-transform duration-300', open && 'rotate-180')} strokeWidth={2.4} aria-hidden="true" />
          )}
        </button>

        {r.announced && open && (
          <div className="relative px-5 pb-5">
            <ol className="grid gap-2 sm:grid-cols-2">
              {shown.map((w) => (
                <li key={w.rank} className="flex items-center gap-3 rounded-2xl bg-white/85 p-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gh-brand text-sm font-bold text-white">{w.rank}</span>
                  <b className="min-w-0 flex-1 truncate">{w.name}</b>
                </li>
              ))}
            </ol>
            {r.winners.length > shown.length && (
              <button type="button" onClick={() => openModal('winners')} className="mt-3 min-h-[44px] font-semibold text-gh-brand-deep underline underline-offset-2">
                Xem cả {r.winners.length} khách hàng
              </button>
            )}
          </div>
        )}
      </div>
    </Reveal>
  )
}

/** Dải nhắc hạn chốt, xen giữa các phần cho trang đỡ đơn điệu. */
export function DeadlineStrip() {
  const { campaign } = useLp()
  const now = useNow()
  if (!campaign.round) return null
  const left = daysUntil(campaign.round.endAt, now)
  return (
    <Reveal>
      <div className={clsx(cardClass, 'flex items-center gap-4 bg-gh-brand-mist shadow-none')}>
        <IconTile Icon={Flame} tone="bg-white text-gh-cta" size="lg" />
        <p className="min-w-0 flex-1 leading-snug">
          <b className="block text-[17px]">Còn {left} ngày để tích điểm</b>
          <span className="text-gh-ink-soft">Tham gia càng sớm, điểm thưởng người vào sau càng nhiều.</span>
        </p>
      </div>
    </Reveal>
  )
}
