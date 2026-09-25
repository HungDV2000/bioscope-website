'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowRight, ArrowUpRight, Check, CircleCheck, CirclePlay, Mic, Pause, Play, X } from 'lucide-react'
import clsx from 'clsx'
import { errorText, lpApi, track } from './api'
import { useLp } from './context'
import { fmtSec, probeDuration, useRecorder } from './recorder'
import { IMG, Sheet, Spinner, useScrollLock } from './ui'
import { PointTable } from './Steps'
import { InfoBody, INFO_TITLES } from './Info'
import type { LpMe, LpVideo } from '@/lib/landing/types'

/* ───────────────────────────── HƯỚNG DẪN LẦN ĐẦU ─────────────────────────── */
export function Coach() {
  const { modal } = useLp()
  return modal === 'coach' ? <CoachBody /> : null
}

function CoachBody() {
  const { close, campaign, openVideo } = useLp()
  const [step, setStep] = useState(0)
  useScrollLock(true)
  const steps = [
    { icon: '🎁', title: 'Bạn đã tham gia thành công!', text: 'Giờ mình cùng tích điểm nhé.' },
    { icon: '✅', title: 'Ba hoạt động chính', text: 'Xem video, chia sẻ câu chuyện dạ dày, mời người thân. Mỗi hoạt động đều được cộng điểm.' },
    { icon: '🏆', title: `${campaign.slots} khách hàng điểm cao nhất nhận quà`, text: `Chốt ${campaign.round ? new Date(campaign.round.endAt).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : 'cuối tháng'}. Mình bắt đầu từ việc dễ nhất nhé.` },
  ]
  const c = steps[step]
  const last = step === steps.length - 1
  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-labelledby="coachTitle">
      <div className="absolute inset-0 bg-gh-ink/60" />
      <div className="lp-pop absolute inset-x-4 bottom-24 mx-auto max-w-md rounded-[28px] bg-white p-6 text-center shadow-gh-float sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gh-lime-soft text-4xl" aria-hidden="true">
          {c.icon}
        </div>
        <h2 id="coachTitle" className="mt-4 text-2xl font-extrabold">
          {c.title}
        </h2>
        <p className="mt-2 text-[17px] leading-relaxed text-gh-ink-soft">{c.text}</p>
        <div className="mt-5 flex justify-center gap-1.5" aria-hidden="true">
          {steps.map((_, i) => (
            <span key={i} className={clsx('h-2 rounded-full', i === step ? 'w-6 bg-gh-brand' : 'w-2 bg-gh-brand/25')} />
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            if (!last) return setStep(step + 1)
            if (campaign.videos.length) openVideo()
            else close()
          }}
          className="lp-tap mt-5 w-full rounded-full bg-gh-cta px-6 text-lg font-bold text-white shadow-gh-cta active:scale-[.98]"
        >
          {last ? 'Làm việc đầu tiên' : 'Tiếp'}
        </button>
        <button type="button" onClick={close} className="mt-3 w-full py-2 font-semibold text-gh-ink-soft">
          Thôi, để tôi tự xem
        </button>
      </div>
    </div>
  )
}

/* ────────────────────────────────── VIDEO ─────────────────────────────────── */
/**
 * Mở video = xin "phiếu" từ server; xem đủ số giây admin đặt thì nộp phiếu để
 * được cộng. Đồng hồ chỉ chạy khi tab đang hiện — server vẫn tự kiểm lại giờ.
 */
export function VideoModal() {
  const { modal, campaign, videoKey } = useLp()
  const v = campaign.videos.find((x) => x.key === videoKey) ?? campaign.videos[0]
  if (modal !== 'video' || !v) return null
  // key: đổi video là dựng lại từ đầu — đồng hồ, phiếu xem đều mới.
  return <VideoBody key={v.key} v={v} />
}

function VideoBody({ v }: { v: LpVideo }) {
  const { close, campaign, openVideo, me, setMe, slug, toast, fly } = useLp()
  const watched = !!me?.videosWatched.includes(v.key)
  const canEarn = !watched && campaign.status === 'active' && !!me
  const [need, setNeed] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'counting' | 'sending' | 'error'>(canEarn ? 'counting' : 'idle')
  const token = useRef<string | null>(null)
  const statusRef = useRef<HTMLParagraphElement>(null)
  useScrollLock(true)

  // Mở video → xin phiếu
  useEffect(() => {
    track('video_open', { video: v.key })
    if (!canEarn) return
    let cancelled = false
    lpApi<{ token: string; minWatchSeconds: number }>(slug, 'video/start', { json: { videoKey: v.key } }).then((r) => {
      if (cancelled) return
      if (!r.ok) {
        setPhase('error')
        return
      }
      token.current = r.data.token
      setNeed(r.data.minWatchSeconds)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const complete = useCallback(async () => {
    if (!v || !token.current) return
    setPhase('sending')
    const r = await lpApi<{ granted: boolean; points: number; me: LpMe; remainingSec?: number }>(slug, 'video/complete', {
      json: { videoKey: v.key, token: token.current },
    })
    if (r.ok) {
      setMe(r.data.me)
      setPhase('idle')
      if (r.data.granted) {
        fly(`+${r.data.points}`, statusRef.current)
        toast(`Cộng ${r.data.points} điểm cho bạn`, 'gift')
        track('video_done', { video: v.key })
      }
    } else if (r.data.error === 'too_short' && r.data.remainingSec) {
      setElapsed(Math.max(0, need - r.data.remainingSec))
      setPhase('counting')
    } else {
      setPhase('error')
    }
  }, [v, slug, setMe, fly, toast, need])

  // Đồng hồ xem
  useEffect(() => {
    if (phase !== 'counting' || !need) return
    const t = setInterval(() => {
      if (document.visibilityState !== 'visible') return
      setElapsed((e) => e + 1)
    }, 1000)
    return () => clearInterval(t)
  }, [phase, need])
  useEffect(() => {
    if (phase === 'counting' && need && elapsed >= need) void complete()
  }, [elapsed, need, phase, complete])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  const left = Math.max(0, need - elapsed)
  const status = watched
    ? 'Đã cộng điểm'
    : phase === 'sending'
      ? 'Đang cộng điểm…'
      : phase === 'error'
        ? 'Chưa cộng được, mở lại nhé'
        : need
          ? `Xem thêm ${left}s: +${v.points}`
          : `Xem hết: +${v.points}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gh-ink/85 p-4" role="dialog" aria-modal="true" aria-label="Video">
      <button type="button" onClick={close} className="lp-tap absolute right-3 top-3 flex w-14 items-center justify-center rounded-full bg-white/20 text-white" aria-label="Đóng video">
        <X className="h-6 w-6" strokeWidth={2.6} />
      </button>
      <div className="max-h-full w-full max-w-md overflow-y-auto">
        <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-black">
          {v.embedUrl ? (
            <iframe
              key={v.key}
              src={v.embedUrl}
              title={v.title}
              className="absolute inset-0 h-full w-full"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_40%,#1C5E63,#0E2A2D)] p-6 text-center text-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${IMG}/gastroheal.png`} alt="" className="h-24 w-auto" />
              <p className="mt-3 font-bold">Video đang được cập nhật</p>
              <p className="mt-1 text-sm text-white/70">Bạn giữ màn hình này một chút là được cộng điểm nhé.</p>
            </div>
          )}
        </div>
        {!watched && need > 0 && (
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-gh-lime transition-[width] duration-1000 ease-linear" style={{ width: `${Math.min(100, (elapsed / need) * 100)}%` }} />
          </div>
        )}
        <div className="mt-3 flex items-center justify-between gap-3 text-white">
          <p className="font-semibold">{v.title}</p>
          <p ref={statusRef} className="shrink-0 font-bold text-gh-lime">
            {status}
          </p>
        </div>
        <div className="mt-4 space-y-2">
          {campaign.videos.map((x) => {
            const seen = me?.videosWatched.includes(x.key)
            return (
              <button
                key={x.key}
                type="button"
                onClick={() => openVideo(x.key)}
                className={clsx('lp-tap flex w-full items-center gap-3 rounded-2xl px-4 text-left text-white', x.key === v.key ? 'bg-white/20' : 'bg-white/10')}
              >
                {seen ? <CircleCheck className="h-6 w-6 text-gh-lime" aria-hidden="true" /> : <CirclePlay className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />}
                <span className="flex-1 truncate">{x.title}</span>
                <span className="shrink-0 text-sm text-white/70">{seen ? 'Đã xem' : `+${x.points}`}</span>
              </button>
            )
          })}
        </div>
        <button type="button" onClick={close} className="lp-tap mt-4 w-full rounded-full bg-white/15 text-[17px] font-bold text-white">
          Đóng video
        </button>
      </div>
    </div>
  )
}

/* ──────────────────────────── GHI ÂM (hỏi từng câu) ───────────────────────── */
const Q_INTRO = [
  { q: 'Bạn tên là gì?', hint: 'Cứ nói: “Tôi tên Nguyễn Văn An”' },
  { q: 'Bạn ở phường, xã nào?', hint: 'Cứ nói: “Tôi ở phường Long Trường, TP.HCM”' },
  { q: '5 số cuối điện thoại của bạn?', hint: 'Bạn đọc chậm từng số nhé' },
  { q: 'Dạ dày bạn đang bị sao?', hint: 'Cứ kể: “Tôi hay đầy bụng, ợ chua buổi tối”' },
  { q: 'Hai tuần nữa bạn kể lại nhé?', hint: 'Cứ nói: “Hai tuần nữa tôi kể lại”' },
]
const Q_RESULT = [
  { q: 'Bạn tên là gì?', hint: 'Cứ nói: “Tôi tên Nguyễn Văn An”' },
  { q: '5 số cuối điện thoại của bạn?', hint: 'Bạn đọc chậm từng số nhé' },
  { q: 'Bạn dùng Gastroheal bao lâu rồi?', hint: 'Ví dụ: “Tôi dùng được hai tuần”' },
  { q: 'Dạ dày bạn giờ thấy thế nào?', hint: 'Cứ kể thật lòng, đỡ hay chưa đỡ đều được' },
]
const MAX_SEC = 60

export function RecSheet() {
  const { modal, close, me } = useLp()
  const kind: 'intro' | 'result' = me?.resultUnlocked ? 'result' : 'intro'
  return (
    <Sheet open={modal === 'rec'} onClose={close} title={kind === 'result' ? 'Kể lại kết quả của bạn' : 'Kể chuyện dạ dày của bạn'} tall>
      {/* Chỉ dựng khi mở: đóng là tắt micro, mở lại bắt đầu từ đầu. */}
      <RecBody kind={kind} />
    </Sheet>
  )
}

function RecBody({ kind }: { kind: 'intro' | 'result' }) {
  const { close, setMe, slug, campaign, toast, fly } = useLp()
  const QS = kind === 'result' ? Q_RESULT : Q_INTRO
  const r = useRecorder(MAX_SEC, 12)
  const [rawStage, setStage] = useState<'intro' | 'stage' | 'review' | 'sending' | 'done'>('intro')
  // Ghi xong (tự dừng ở 60s hoặc bấm dừng) → sang bước nghe lại.
  const stage = rawStage === 'stage' && r.state === 'done' ? 'review' : rawStage
  const [consent, setConsent] = useState(false)
  const [qi, setQi] = useState(0)
  const [result, setResult] = useState<'approved' | 'pending'>('pending')
  const [sendErr, setSendErr] = useState('')
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const audio = useRef<HTMLAudioElement>(null)
  const doneRef = useRef<HTMLDivElement>(null)

  const shut = () => {
    r.stop(true)
    audio.current?.pause()
    close()
  }

  const begin = async () => {
    if (!consent) {
      toast('Bạn tick vào ô đồng ý giúp mình nhé', 'warn')
      return
    }
    r.clear()
    setQi(0)
    setProgress(0)
    const ok = await r.start()
    if (ok) setStage('stage')
  }

  const send = async () => {
    if (!r.clip) return
    setStage('sending')
    setSendErr('')
    const fd = new FormData()
    const ext = r.clip.blob.type.includes('mp4') ? 'm4a' : r.clip.blob.type.includes('mpeg') ? 'mp3' : 'webm'
    fd.append('file', r.clip.blob, `ghi-am.${ext}`)
    fd.append('kind', kind)
    fd.append('durationSec', String(r.clip.duration))
    const res = await lpApi<{ status: 'approved' | 'pending'; me: LpMe }>(slug, 'recordings', { form: fd })
    if (!res.ok) {
      setSendErr(errorText(res.data.error))
      setStage('review')
      return
    }
    setMe(res.data.me)
    setResult(res.data.status)
    setStage('done')
    track('recording_sent', { kind })
    if (res.data.status === 'approved') {
      const pts = kind === 'result' ? campaign.points.result : campaign.points.record
      setTimeout(() => fly(`+${pts}`, doneRef.current), 200)
    }
  }

  const pts = kind === 'result' ? campaign.points.result : campaign.points.record
  const q = QS[Math.min(qi, QS.length - 1)]
  const deniedMsg =
    r.denied === 'inapp'
      ? 'Trình duyệt trong Zalo/Facebook thường chặn ghi âm. Hãy mở bằng Safari hoặc Chrome, hoặc tải lên file ghi âm có sẵn.'
      : r.denied === 'permission'
        ? 'Bạn chưa cho phép dùng micro. Hãy bật quyền micro trong cài đặt trình duyệt, hoặc tải lên file ghi âm có sẵn.'
        : 'Bạn mở trang bằng Safari hoặc Chrome giúp mình, hoặc tải lên một file ghi âm có sẵn cũng được.'

  return (
    <>
      {stage === 'intro' && (
        <div>
          <p className="mt-3 leading-relaxed text-gh-ink-soft">
            Bạn nói chừng 45 giây. Màn hình hỏi tới đâu, bạn trả lời tới đó, cứ tự nhiên thôi.
          </p>
          <ol className="mt-4 space-y-2 rounded-2xl bg-gh-canvas p-4 text-gh-ink-soft">
            {QS.map((x, i) => (
              <li key={x.q}>
                {i + 1}. {x.q.replace(/\?$/, '')}
              </li>
            ))}
          </ol>
          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-black/5 p-3 leading-snug text-gh-ink-soft">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-6 w-6 shrink-0 accent-[#14939A]" />
            <span>Tôi đồng ý để Bioscope lưu lại bản ghi âm này.</span>
          </label>
          <button type="button" onClick={begin} className="lp-tap mt-4 flex w-full items-center justify-center gap-3 rounded-full bg-gh-cta px-6 text-lg font-bold text-white shadow-gh-cta active:scale-[.98]">
            <Mic className="h-5 w-5" fill="currentColor" aria-hidden="true" />
            Bắt đầu ghi âm
          </button>
          {r.denied && (
            <div className="mt-4 rounded-2xl bg-gh-cta-soft p-4">
              <p className="font-bold text-gh-cta-deep">Máy chưa cho ghi âm rồi</p>
              <p className="mt-1 leading-snug text-gh-ink-soft">{deniedMsg}</p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard?.writeText(window.location.href)
                    toast('Chép link rồi nhé', 'link')
                  }}
                  className="lp-tap flex-1 rounded-full bg-white text-sm font-bold text-gh-brand-deep"
                >
                  Chép link
                </button>
                <label className="lp-tap flex flex-1 cursor-pointer items-center justify-center rounded-full bg-gh-cta text-sm font-bold text-white">
                  Tải file lên
                  <input
                    type="file"
                    accept="audio/*"
                    className="sr-only"
                    onChange={async (e) => {
                      const f = e.target.files?.[0]
                      e.target.value = ''
                      if (!f) return
                      if (!consent) {
                        toast('Bạn tick vào ô đồng ý giúp mình nhé', 'warn')
                        return
                      }
                      r.setFromBlob(f, await probeDuration(f))
                      setStage('review')
                    }}
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {stage === 'stage' && (
        <div className={clsx('lp-rec-on', r.levels && 'lp-live')}>
          <div className="mt-4 rounded-3xl bg-gh-brand-mist p-5 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-gh-brand-deep">
              Câu {Math.min(qi, QS.length - 1) + 1}/{QS.length}
            </p>
            <p className="mt-2 text-2xl font-extrabold leading-snug">{q.q}</p>
            <p className="mt-2 text-gh-ink-soft">{q.hint}</p>
          </div>
          <div className="mt-5 flex flex-col items-center">
            <div className="lp-wave flex h-10 items-center gap-1" aria-hidden="true">
              {Array.from({ length: 12 }, (_, i) => (
                <i key={i} style={r.levels ? { transform: `scaleY(${r.levels[i]})` } : undefined} />
              ))}
            </div>
            <p className="mt-2 font-bold tabular-nums text-gh-ink-soft">
              {fmtSec(r.sec)} / {fmtSec(MAX_SEC)}
            </p>
            <div className="relative mt-4 flex h-24 w-24 items-center justify-center">
              <span className="lp-ring absolute inset-0 rounded-full bg-gh-cta/30" />
              <span className="lp-ring absolute inset-0 rounded-full bg-gh-cta/30" />
              <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gh-cta text-white shadow-gh-cta" aria-hidden="true">
                <Mic className="h-10 w-10" fill="currentColor" />
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => (qi < QS.length - 1 ? setQi(qi + 1) : r.stop(false))}
            className="lp-tap mt-5 flex w-full items-center justify-center gap-3 rounded-full bg-gh-ink px-6 text-lg font-bold text-white active:scale-[.98]"
          >
            {qi < QS.length - 1 ? (
              <>
                Nói xong câu này <ArrowRight className="h-5 w-5" strokeWidth={2.6} aria-hidden="true" />
              </>
            ) : (
              <>
                Xong, nghe lại <Check className="h-5 w-5" strokeWidth={2.6} aria-hidden="true" />
              </>
            )}
          </button>
          <button type="button" onClick={() => r.stop(false)} className="mt-3 w-full py-2 font-semibold text-gh-ink-soft">
            Dừng lại
          </button>
        </div>
      )}

      {stage === 'review' && r.clip && (
        <div>
          <p className="mt-3 text-gh-ink-soft">Nghe thử xem đã ưng chưa, chưa ưng thì ghi lại.</p>
          <div className="mt-4 flex items-center gap-3 rounded-3xl bg-gh-canvas p-3">
            <button
              type="button"
              onClick={() => (audio.current?.paused ? audio.current.play() : audio.current?.pause())}
              className="lp-tap flex w-14 shrink-0 items-center justify-center rounded-full bg-gh-brand text-white"
              aria-label={playing ? 'Tạm dừng' : 'Nghe lại'}
            >
              {playing ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="h-5 w-5" fill="currentColor" />}
            </button>
            <div className="flex-1">
              <div className="h-2 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-gh-brand" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-1.5 text-sm text-gh-ink-soft">Bản ghi · {r.clip.duration ? fmtSec(r.clip.duration) : 'từ file'}</p>
            </div>
          </div>
          <audio
            ref={audio}
            src={r.clip.url}
            className="hidden"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            onTimeUpdate={(e) => {
              const a = e.currentTarget
              const d = r.clip?.duration || a.duration
              if (d && Number.isFinite(d)) setProgress(Math.min(100, (a.currentTime / d) * 100))
            }}
          />
          {sendErr && <p className="mt-3 rounded-2xl bg-[#FFF7F7] p-3 font-medium text-gh-danger">{sendErr}</p>}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                r.clear()
                setStage('intro')
              }}
              className="lp-tap rounded-full bg-gh-canvas font-bold text-gh-ink-soft active:scale-[.98]"
            >
              Nói lại
            </button>
            <button type="button" onClick={send} className="lp-tap rounded-full bg-gh-cta font-bold text-white shadow-gh-cta active:scale-[.98]">
              Gửi đi
            </button>
          </div>
        </div>
      )}

      {stage === 'sending' && (
        <div className="py-6 text-center">
          <Spinner className="mx-auto h-12 w-12 text-gh-brand" />
          <p className="mt-4 text-lg font-bold">Chờ chút, mình đang gửi…</p>
          <p className="mt-1 text-gh-ink-soft">Mạng chậm thì mất vài giây.</p>
        </div>
      )}

      {stage === 'done' && (
        <div ref={doneRef} className="py-4 text-center">
          <div className="lp-pop mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gh-lime-soft text-5xl" aria-hidden="true">
            🎉
          </div>
          {result === 'approved' ? (
            <>
              <p className="mt-4 text-2xl font-extrabold">Bạn kể hay lắm! Vừa cộng {pts} điểm</p>
              <p className="mt-1 text-gh-ink-soft">Bản ghi đã gửi tới Bioscope.</p>
            </>
          ) : (
            <>
              <p className="mt-4 text-2xl font-extrabold">Bạn kể hay lắm! Bản ghi đã tới Bioscope</p>
              <p className="mt-1 text-gh-ink-soft">
                Bioscope nghe xong sẽ cộng <b className="text-gh-ink">+{pts} điểm</b> cho bạn, thường trong một ngày.
              </p>
            </>
          )}
          <button type="button" onClick={shut} className="lp-tap mt-5 w-full rounded-full bg-gh-brand px-6 text-lg font-bold text-white active:scale-[.98]">
            Về chỗ làm việc
          </button>
        </div>
      )}
    </>
  )
}

/* ────────────────────────────────── CHIA SẺ ───────────────────────────────── */
export function ShareSheet() {
  const { modal, close, me, setMe, slug, campaign, toast } = useLp()
  const open = modal === 'share'
  if (!me) return null
  const code = me.referralCode
  const shareUrl = () => `${window.location.origin}${window.location.pathname}?ref=${encodeURIComponent(code)}#order`

  const markShared = async () => {
    track('share', { code })
    if (me.sharedAt) return
    const r = await lpApi<{ me: LpMe }>(slug, 'share', { json: {} })
    if (r.ok) setMe(r.data.me)
  }

  return (
    <Sheet open={open} onClose={close} title="Rủ người thân cùng dùng">
      <p className="mt-3 leading-relaxed text-gh-ink-soft">
        Người thân mở link sẽ tham gia chương trình và được <b className="text-gh-ink">giảm {campaign.discountPercent}%</b> khi mua hàng. Mỗi người
        bạn mời tham gia và xem xong một video, bạn được <b className="text-gh-ink">+{campaign.points.order} điểm</b>
        {campaign.points.maxReferralOrders > 0 && <> (tối đa {campaign.points.maxReferralOrders} người mỗi tháng)</>}.
      </p>
      <div className="mt-4 rounded-2xl bg-gh-canvas p-4 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-gh-ink-faint">Mã của bạn</p>
        <p className="mt-1 font-mono text-3xl font-extrabold tracking-widest">{code}</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard?.writeText(shareUrl())
            toast('Chép link rồi nhé', 'link')
            void markShared()
          }}
          className="lp-tap rounded-full bg-gh-canvas font-bold text-gh-brand-deep active:scale-[.98]"
        >
          Chép link
        </button>
        <button
          type="button"
          onClick={async () => {
            const data = {
              title: `Gastroheal giảm ${campaign.discountPercent}%`,
              text: `Dùng mã ${code} để được giảm ${campaign.discountPercent}% Gastroheal nhé!`,
              url: shareUrl(),
            }
            if (navigator.share) {
              try {
                await navigator.share(data)
                void markShared()
              } catch {
                /* người dùng huỷ */
              }
            } else {
              void navigator.clipboard?.writeText(`${data.text} ${data.url}`)
              toast('Chép lời mời rồi nhé', 'link')
              void markShared()
            }
          }}
          className="lp-tap rounded-full bg-gh-cta px-3 font-bold leading-tight text-white shadow-gh-cta active:scale-[.98]"
        >
          Gửi cho người thân
        </button>
      </div>
      <p className="mt-3 text-center text-sm text-gh-ink-faint">Bấm gửi, máy sẽ mở Zalo, Messenger hoặc tin nhắn.</p>
      {me.sharedAt && me.invited === 0 && (
        <p className="mt-3 rounded-2xl bg-gh-brand-mist p-3 text-center text-gh-brand-deep">Đã gửi — điểm cộng khi người được mời tham gia và xem xong một video.</p>
      )}
    </Sheet>
  )
}

/* ─────────────────────── CÔNG TY · LUẬT CHƠI · CHÍNH SÁCH ─────────────────── */
const telHref = (s: string) => `tel:${s.replace(/[^\d+]/g, '')}`

export function CompanySheet() {
  const { modal, close, campaign } = useLp()
  const c = campaign.company
  return (
    <Sheet open={modal === 'company'} onClose={close} title="Thông tin công ty">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${IMG}/bioscope-logo.png`} alt="Bioscope" className="mt-4 h-8 w-auto" />
      <p className="mt-3 leading-relaxed text-gh-ink-soft">
        <b className="text-gh-ink">{c.name || 'Công ty Cổ phần Bioscope Việt Nam'}</b>
        {c.intro && <> · {c.intro}</>}
      </p>
      <ul className="mt-4 space-y-2 text-gh-ink-soft">
        {c.registeredAddress && (
          <li>
            <b className="text-gh-ink">Đăng ký kinh doanh:</b> {c.registeredAddress}
          </li>
        )}
        {c.officeAddress && (
          <li>
            <b className="text-gh-ink">Văn phòng:</b> {c.officeAddress}
          </li>
        )}
        {c.taxCode && (
          <li>
            <b className="text-gh-ink">Mã số thuế:</b> {c.taxCode}
          </li>
        )}
        {campaign.hotline && (
          <li>
            <b className="text-gh-ink">Hotline:</b>{' '}
            <a className="underline" href={telHref(campaign.hotline)}>
              {campaign.hotline}
            </a>
          </li>
        )}
        {campaign.contactEmail && (
          <li>
            <b className="text-gh-ink">Email:</b>{' '}
            <a className="underline" href={`mailto:${campaign.contactEmail}`}>
              {campaign.contactEmail}
            </a>
            {c.invoiceEmail && <> · hoá đơn: {c.invoiceEmail}</>}
          </li>
        )}
      </ul>
      {campaign.certifications.length > 0 && (
        <>
          <p className="mt-5 font-bold">Chứng nhận &amp; hồ sơ</p>
          <ul className="mt-2 space-y-2 text-gh-ink-soft">
            {campaign.certifications.map((x) => (
              <li key={x.name} className="flex items-center justify-between gap-3 rounded-2xl bg-gh-canvas p-3">
                <span>
                  {x.name}
                  {x.number && <span className="block text-sm text-gh-ink-faint">Số {x.number}</span>}
                </span>
                {x.fileUrl ? (
                  <a href={x.fileUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 text-sm font-semibold text-gh-brand-deep underline">
                    Xem bản scan
                  </a>
                ) : (
                  <span className="shrink-0 text-sm text-gh-ink-faint">đang cập nhật</span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
      {c.website && (
        <a href={c.website} target="_blank" rel="noopener noreferrer" className="lp-tap mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gh-canvas font-bold text-gh-brand-deep">
          Xem website Bioscope <ArrowUpRight className="h-5 w-5" strokeWidth={2.4} aria-hidden="true" />
        </a>
      )}
    </Sheet>
  )
}

export function RulesSheet() {
  const { modal, close, campaign } = useLp()
  return (
    <Sheet open={modal === 'rules'} onClose={close} title="Thể lệ chương trình">
      <p className="mt-4 leading-relaxed text-gh-ink-soft">
        Khi chốt, <b className="text-gh-ink">{campaign.slots} khách hàng có tổng điểm cao nhất</b> nhận quà tận nhà. Nếu bằng điểm, người tham gia
        sớm hơn được ưu tiên.
      </p>
      <p className="mt-4 font-bold">Quy định tính điểm</p>
      <PointTable className="mt-2 space-y-2 text-gh-ink-soft" />
      <p className="mt-4 rounded-2xl bg-gh-brand-mist p-3 leading-relaxed text-gh-ink-soft">
        Điểm chia sẻ câu chuyện được cộng sau khi Bioscope nghe bản ghi. Điểm mời người thân được cộng khi người được mời tham gia và xem xong một
        video. Điểm tính lại từ đầu mỗi đợt.
      </p>
      {/* Phần thể lệ đầy đủ do admin soạn (mỗi dòng một ý). */}
      {campaign.rulesText && (
        <div className="mt-4 space-y-2 leading-relaxed text-gh-ink-soft">
          {campaign.rulesText.split('\n').map((line, i) =>
            line.trim() ? (
              <p key={i}>{line}</p>
            ) : (
              <span key={i} className="block h-2" />
            ),
          )}
        </div>
      )}
    </Sheet>
  )
}

/** Danh sách đầy đủ người nhận quà đợt vừa công bố. */
export function WinnersSheet() {
  const { modal, close, campaign } = useLp()
  const r = campaign.lastResult
  return (
    <Sheet open={modal === 'winners'} onClose={close} title={`Khách hàng nhận quà ${r?.label ?? ''}`}>
      <ol className="mt-4 grid gap-2 sm:grid-cols-2">
        {(r?.winners ?? []).map((w) => (
          <li key={w.rank} className="flex items-center gap-3 rounded-2xl bg-gh-canvas p-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gh-brand text-sm font-bold text-white">{w.rank}</span>
            <b className="min-w-0 flex-1 truncate">{w.name}</b>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-sm text-gh-ink-faint">Tên được rút gọn để giữ riêng tư cho khách hàng.</p>
    </Sheet>
  )
}

export function PolicySheet() {
  const { modal, close, campaign } = useLp()
  return (
    <Sheet open={modal === 'policy'} onClose={close} title="Thông tin của bạn">
      <ul className="mt-4 space-y-3 leading-relaxed text-gh-ink-soft">
        <li>
          <b className="text-gh-ink">Mình giữ gì:</b> tên, số điện thoại, vấn đề dạ dày bạn chọn và bản ghi âm bạn gửi.
        </li>
        <li>
          <b className="text-gh-ink">Dùng làm gì:</b> xác nhận người tham gia, tính điểm và gọi báo gửi quà.
        </li>
        <li>
          <b className="text-gh-ink">Không bán, không đưa</b> cho ai khác. Chỉ quản trị viên của Bioscope xem được.
        </li>
        <li>
          <b className="text-gh-ink">Muốn xoá:</b> bạn gọi {campaign.hotline || 'hotline'}
          {campaign.contactEmail && <> hoặc gửi email {campaign.contactEmail}</>}. Hết chương trình, dữ liệu được xoá theo hạn đã công bố.
        </li>
      </ul>
    </Sheet>
  )
}

/* ─────────────────────────────── POPUP THÔNG TIN ──────────────────────────── */
/**
 * Popup "Tìm hiểu thêm". Luôn nằm sẵn trong HTML (ẩn bằng `hidden` khi đóng)
 * để Google đọc được thông tin sản phẩm, thành phần, nghiên cứu — phần nhiều
 * từ khoá nhất của trang. Nội dung đúng như khách thấy khi mở, không phải chữ
 * giấu riêng cho máy tìm kiếm.
 */
export function InfoSheet() {
  const { modal, close, open, campaign } = useLp()
  const key = typeof modal === 'string' && modal.startsWith('info:') ? modal.slice(5) : null
  const isOpen = !!key
  const touchY = useRef<number | null>(null)
  useScrollLock(isOpen)

  const back = () => {
    if ((window.history.state as { lpInfo?: string } | null)?.lpInfo) window.history.back()
    else close()
  }

  // Bấm Back trên điện thoại là đóng popup, không thoát trang.
  useEffect(() => {
    if (!isOpen) return
    window.history.pushState({ lpInfo: key }, '')
    const onPop = () => close()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && back()
    window.addEventListener('popstate', onPop)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('popstate', onPop)
      window.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const topics = Object.keys(INFO_TITLES).filter((k) => k !== 'reviews' || campaign.testimonials.length > 0)
  return (
    <div
      className="fixed inset-0 z-50"
      hidden={!key}
      {...(key ? { role: 'dialog', 'aria-modal': true, 'aria-labelledby': 'infoTitle' } : {})}
    >
      <div className="absolute inset-0 bg-gh-ink/50" onClick={back} />
      <div className="lp-pop absolute inset-x-0 bottom-0 top-8 mx-auto flex max-w-2xl flex-col overflow-hidden rounded-t-[28px] bg-white sm:inset-y-8 sm:rounded-[28px]">
        <div
          className="shrink-0 border-b border-black/5 bg-white px-5 pb-3 pt-3"
          onTouchStart={(e) => (touchY.current = e.touches[0].clientY)}
          onTouchMove={(e) => {
            if (touchY.current !== null && e.touches[0].clientY - touchY.current > 60) {
              touchY.current = null
              back()
            }
          }}
          onTouchEnd={() => (touchY.current = null)}
        >
          <div className="mx-auto h-1.5 w-12 rounded-full bg-gh-ink/15 sm:hidden" />
          <div className="mt-2 flex items-start justify-between gap-3">
            <h2 id="infoTitle" className="text-xl font-extrabold">
              {(key && INFO_TITLES[key]) || 'Thông tin'}
            </h2>
            <button type="button" onClick={back} className="lp-tap flex w-14 shrink-0 items-center justify-center rounded-full bg-gh-canvas" aria-label="Đóng">
              <X className="h-5 w-5" strokeWidth={2.6} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {topics.map((k) => (
            <section key={k} hidden={k !== key} aria-label={INFO_TITLES[k]}>
              <InfoBody
                k={k}
                openCompany={() => {
                  back()
                  setTimeout(() => open('company'), 60)
                }}
              />
            </section>
          ))}
        </div>
        <div className="shrink-0 border-t border-black/5 bg-white px-5 py-3">
          <button type="button" onClick={back} className="lp-tap w-full rounded-full bg-gh-canvas font-bold text-gh-brand-deep">
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

