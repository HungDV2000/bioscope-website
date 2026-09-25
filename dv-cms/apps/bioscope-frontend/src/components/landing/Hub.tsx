'use client'

import { CircleCheck, CirclePlay, Flame, Hourglass, Info, Lock, Mic, Share2, type LucideIcon } from 'lucide-react'
import clsx from 'clsx'
import { daysLeft, useLp } from './context'
import { scrollToId } from './Steps'
import { GiftBar, GiftSvg, GiftTag, giftCardClass } from './ui'
import type { LpMe } from '@/lib/landing/types'

/** Tình trạng từng việc — dùng chung cho sổ việc, nút dưới đáy và coach. */
export function taskState(me: LpMe, videoCount: number) {
  const videosDone = videoCount > 0 && me.videosWatched.length >= videoCount
  const recDone = me.recording === 'approved'
  const recPending = me.recording === 'pending'
  const shareDone = me.invited > 0
  const shareSent = !!me.sharedAt
  return { videosDone, recDone, recPending, shareDone, shareSent }
}

function Task({
  Icon,
  title,
  sub,
  pts,
  done,
  waiting,
  onClick,
  tone = 'bg-gh-brand-soft text-gh-brand',
  id,
}: {
  Icon: LucideIcon
  title: string
  sub: string
  pts: number
  done?: boolean
  waiting?: string
  onClick: () => void
  tone?: string
  id?: string
}) {
  return (
    <li>
      <button
        id={id}
        type="button"
        onClick={onClick}
        className={clsx(
          'lp-tap flex w-full items-center gap-4 rounded-3xl p-4 text-left shadow-gh-soft transition duration-300 ease-gh-spring active:scale-[.99]',
          done ? 'bg-gh-brand-mist' : 'bg-white',
        )}
      >
        <span className={clsx('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl', done ? 'bg-gh-brand text-white' : tone)} aria-hidden="true">
          {done ? <CircleCheck className="h-8 w-8" strokeWidth={2} /> : <Icon className="h-8 w-8" strokeWidth={1.4} />}
        </span>
        <span className="flex-1">
          <span className="block text-[17px] font-bold">{title}</span>
          <span className="block text-gh-ink-soft">{sub}</span>
        </span>
        {done ? (
          <span className="shrink-0 rounded-full bg-gh-brand px-3 py-1.5 font-bold text-white">Xong</span>
        ) : waiting ? (
          <span className="shrink-0 rounded-full bg-gh-canvas px-3 py-1.5 text-sm font-bold text-gh-ink-soft">{waiting}</span>
        ) : (
          <span className="shrink-0 rounded-full bg-gh-lime-soft px-3 py-1.5 font-bold text-gh-cta-deep">+{pts}</span>
        )}
      </button>
    </li>
  )
}

export function Hub({ ended }: { ended?: boolean }) {
  const { me, campaign, leaderboard, open, openVideo } = useLp()
  if (!me) return null
  const p = campaign.points
  const vids = campaign.videos
  const t = taskState(me, vids.length)
  const videoPts = vids.reduce((a, v) => a + v.points, 0)
  const pct = me.pct

  const inGroup = me.rank != null && me.rank <= campaign.slots
  const rankLine = ended
    ? `Điểm chung cuộc: ${me.total}`
    : me.rank == null
      ? 'Làm một hoạt động để có tên trên bảng xếp hạng'
      : inGroup
        ? `Bạn đang hạng ${me.rank} — trong nhóm ${campaign.slots} khách hàng nhận quà`
        : `Bạn đang hạng ${me.rank}/${me.rankOf}`
  const youLine = ended
    ? me.winner
      ? `Chúc mừng! Bạn có trong danh sách nhận quà (hạng ${me.winnerRank ?? me.rank}).`
      : 'Đợt này bạn chưa vào nhóm nhận quà. Cảm ơn bạn đã tham gia!'
    : me.rank == null
      ? 'Làm một hoạt động để có tên trên bảng xếp hạng'
      : inGroup
        ? `Giữ vững nhé — bạn đang trong nhóm ${campaign.slots} khách hàng có tổng điểm cao nhất`
        : `Còn ${Math.max(1, (me.rank ?? 0) - campaign.slots)} bậc nữa là vào nhóm ${campaign.slots} khách hàng nhận quà`

  return (
    <section id="hub" className="scroll-mt-24 py-4">
      {/* Thẻ điểm */}
      <div id="giftCard" className={clsx(giftCardClass, 'p-5 text-center sm:p-7')}>
        <span className="pointer-events-none absolute -right-11 top-3.5 z-10 rotate-45 bg-gh-cta px-11 py-1 text-center text-[11px] font-extrabold uppercase tracking-[0.12em] text-white shadow-gh-cta">
          Quà tặng
        </span>
        <span className="lp-twinkle pointer-events-none absolute left-6 top-6 text-lg text-gh-lime" aria-hidden="true">
          ✦
        </span>
        <span className="lp-twinkle pointer-events-none absolute bottom-16 right-8 text-sm text-gh-cta" style={{ animationDelay: '.9s' }} aria-hidden="true">
          ✦
        </span>
        <p className="relative pr-16 text-left">
          <GiftTag />
        </p>
        <p className="relative mt-2 text-left text-gh-ink-soft">
          Chào <b className="text-gh-ink">{me.name}</b> · {campaign.round?.label ?? ''}
        </p>
        <div className="lp-bob relative mx-auto mt-3 h-40 w-40 drop-shadow-[0_12px_18px_rgba(236,138,44,.3)]">
          <GiftSvg pct={pct} label={`Bạn đang có ${me.total} điểm`} />
          <p className="absolute inset-x-0 bottom-[-10px] flex items-baseline justify-center gap-1 leading-none text-gh-brand-deep">
            <span className="text-[2.5rem] font-extrabold tabular-nums">{me.total}</span>
            <span className="text-lg font-bold">điểm</span>
          </p>
        </div>
        <GiftBar pct={pct} className="relative mx-auto mt-5 max-w-xs" />
        <p className="relative mt-3 text-[17px] font-semibold">{rankLine}</p>
        <p className="relative mt-2 inline-flex items-center gap-2 rounded-2xl bg-white/80 px-3 py-2 leading-snug text-gh-ink-soft">
          <Flame className="h-[18px] w-[18px] shrink-0 text-gh-cta" fill="currentColor" aria-hidden="true" />
          <span>
            <b className="text-gh-ink">{campaign.slots} khách hàng có tổng điểm cao nhất</b> nhận quà tận nhà
          </span>
        </p>
        <br />
        <button type="button" onClick={() => open('rules')} className="relative mt-1 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-gh-brand-deep underline underline-offset-2">
          <Info className="h-4 w-4" aria-hidden="true" />
          Xem thể lệ chương trình
        </button>
      </div>

      {/* Việc cần làm */}
      {!ended && (
        <>
          <h2 className="mt-8 text-[1.6rem] font-extrabold">Hoạt động tích điểm</h2>
          <p className="mt-1 text-gh-ink-soft">Làm hoạt động nào trước cũng được. Điểm tính lại từ đầu mỗi tháng.</p>
          <ul className="mt-4 space-y-3">
            {vids.length > 0 && (
              <Task
                Icon={CirclePlay}
                title={`Xem ${vids.length} video ngắn`}
                sub={`Mới xem ${me.videosWatched.length}/${vids.length}, mỗi video vài phút`}
                pts={videoPts}
                done={t.videosDone}
                onClick={() => openVideo()}
              />
            )}
            <Task
              Icon={Mic}
              tone="bg-gh-cta-soft text-gh-cta-deep"
              title="Chia sẻ câu chuyện về dạ dày"
              sub={
                t.recPending
                  ? 'Đã gửi, Bioscope đang nghe. Nghe xong là cộng điểm.'
                  : me.recording === 'rejected'
                    ? 'Bản trước chưa nghe rõ, bạn kể lại giúp mình nhé.'
                    : 'Nói 45 giây, màn hình hỏi từng câu'
              }
              pts={p.record}
              done={t.recDone}
              waiting={t.recPending ? 'Chờ duyệt' : undefined}
              onClick={() => open('rec')}
            />
            <Task
              Icon={Share2}
              title="Mời người thân/bạn bè tham gia"
              sub={
                t.shareDone
                  ? `${me.invited}/${me.invitedMax} người bạn mời đã tham gia`
                  : t.shareSent
                    ? 'Đã gửi — chờ người thân tham gia'
                    : `Gửi lời mời kèm mã giảm ${campaign.discountPercent}%`
              }
              pts={p.order}
              done={t.shareDone}
              waiting={t.shareSent && !t.shareDone ? 'Đã gửi' : undefined}
              onClick={() => open('share')}
            />
            {me.resultUnlocked ? (
              <Task
                Icon={Mic}
                tone="bg-gh-cta-soft text-gh-cta-deep"
                title="Chia sẻ kết quả sau 2 tuần"
                sub={me.result === 'pending' ? 'Đã gửi, Bioscope đang nghe.' : 'Nói vài câu: dùng xong bạn thấy thế nào.'}
                pts={p.result}
                done={me.result === 'approved'}
                waiting={me.result === 'pending' ? 'Chờ duyệt' : undefined}
                onClick={() => open('rec')}
              />
            ) : (
              <li>
                <div className="flex items-center gap-4 rounded-3xl border-2 border-dashed border-gh-ink/10 p-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gh-canvas text-gh-ink-faint" aria-hidden="true">
                    <Lock className="h-8 w-8" strokeWidth={1.4} />
                  </span>
                  <span className="flex-1">
                    <span className="block text-[17px] font-bold text-gh-ink/60">Chia sẻ kết quả sau 2 tuần</span>
                    <span className="block text-gh-ink-soft">Mở khi bạn đã nhận quà hoặc đã mua hàng được hai tuần.</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-gh-canvas px-3 py-1.5 font-bold text-gh-ink-faint">+{p.result}</span>
                </div>
              </li>
            )}
          </ul>

          <div id="bonusCard" className="mt-4 flex items-center gap-3 rounded-3xl bg-gh-lime-soft p-4">
            <Hourglass className="h-6 w-6 shrink-0 text-gh-cta-deep" strokeWidth={1.5} aria-hidden="true" />
            <p className="flex-1 leading-snug">
              Bạn tham gia sớm nên mỗi người vào sau đều cộng thêm <b className="font-semibold">+{p.bonusPerJoin} điểm</b> cho bạn.{' '}
              <span className="text-gh-ink-soft">
                Đã cộng {me.bonusCount}/{p.bonusMax} lần trong {campaign.round?.label ?? 'đợt này'}.
              </span>
            </p>
          </div>
        </>
      )}

      {ended && me.winner && <ResultTask />}

      {/* Xếp hạng gọn */}
      <div className="mt-8 rounded-[28px] bg-white p-5 shadow-gh-soft">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[1.3rem] font-extrabold">{ended ? 'Bảng xếp hạng chung cuộc' : 'Ai đang dẫn đầu'}</h3>
          {!ended && <span className="rounded-full bg-gh-cta-soft px-3 py-1.5 text-sm font-bold text-gh-cta-deep">Còn {daysLeft(campaign.deadline)} ngày</span>}
        </div>
        <TopList rows={leaderboard.slice(0, 3)} />
        <p className="mt-4 rounded-2xl bg-gh-brand-mist p-3 text-center font-semibold text-gh-brand-deep">{youLine}</p>
      </div>

      {/* Mua ngay */}
      <div className="mt-4 rounded-[28px] bg-[linear-gradient(135deg,#FFF3E6,#FFFFFF)] p-5 shadow-gh-soft">
        <p className="text-[17px] font-bold">{ended ? 'Muốn dùng Gastroheal ngay?' : 'Không muốn chờ tới ngày chốt?'}</p>
        <p className="mt-1 text-gh-ink-soft">Mua ngay với mã riêng của bạn, giảm {campaign.discountPercent}%.</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="rounded-2xl bg-white px-4 py-3 font-mono text-lg font-bold tracking-widest text-gh-cta-deep shadow-gh-soft">{me.referralCode}</span>
          <button type="button" onClick={() => scrollToId('order')} className="lp-tap flex flex-1 items-center justify-center gap-2 rounded-full bg-gh-cta px-5 font-bold text-white shadow-gh-cta active:scale-[.98]">
            Mua giảm giá {campaign.discountPercent}%
          </button>
        </div>
      </div>
    </section>
  )
}

export function TopList({ rows }: { rows: { rank: number; name: string; total?: number }[] }) {
  if (!rows.length) return <p className="mt-4 rounded-2xl bg-gh-canvas p-3 text-center text-gh-ink-soft">Chưa có ai trên bảng, bạn vào đầu tiên nhé!</p>
  return (
    <ol className="mt-4 space-y-2">
      {rows.map((u, i) => (
        <li key={`${u.rank}-${u.name}`} className="flex items-center gap-3 rounded-2xl bg-gh-canvas p-3">
          <span
            className={clsx(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold',
              ['bg-gh-cta text-white', 'bg-gh-brand text-white', 'bg-gh-lime text-gh-ink'][i] ?? 'bg-white text-gh-ink-soft',
            )}
          >
            {u.rank}
          </span>
          <b className="min-w-0 flex-1 truncate">{u.name}</b>
          {u.total != null && (
            <span className="shrink-0 font-bold text-gh-brand-deep">
              {u.total} <span className="text-sm font-semibold">điểm</span>
            </span>
          )}
        </li>
      ))}
    </ol>
  )
}

/** Người nhận quà, sau 14 ngày: kể lại kết quả (+điểm tặng người khác). */
function ResultTask() {
  const { me, campaign, open } = useLp()
  if (!me) return null
  const unlocked = me.resultUnlocked
  const state = me.result
  return (
    <ul className="mt-6 space-y-3">
      <Task
        Icon={unlocked ? Mic : Lock}
        tone={unlocked ? 'bg-gh-cta-soft text-gh-cta-deep' : 'bg-gh-canvas text-gh-ink-faint'}
        title="Kể lại kết quả sau hai tuần"
        sub={
          !unlocked
            ? 'Mở khi bạn dùng sản phẩm được hai tuần.'
            : state === 'pending'
              ? 'Đã gửi, Bioscope đang nghe.'
              : 'Nói vài câu: dùng xong bạn thấy thế nào.'
        }
        pts={campaign.points.result}
        done={state === 'approved'}
        waiting={state === 'pending' ? 'Chờ duyệt' : undefined}
        onClick={() => unlocked && open('rec')}
      />
    </ul>
  )
}
