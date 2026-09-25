'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { Check, Gift, Hourglass, Link as LinkIcon, MicOff, Package, TriangleAlert, type LucideIcon } from 'lucide-react'
import type { LpCampaign, LpLeader, LpMe } from '@/lib/landing/types'

export const TOAST_ICONS = { check: Check, gift: Gift, hourglass: Hourglass, link: LinkIcon, mic: MicOff, package: Package, warn: TriangleAlert } satisfies Record<string, LucideIcon>
export type ToastIcon = keyof typeof TOAST_ICONS

export type Modal = null | 'coach' | 'video' | 'rec' | 'share' | 'company' | 'rules' | 'policy' | 'winners' | `info:${string}`

export type Symptoms = {
  picked: string[]
  other: string
  otherOpen: boolean
  voice: { blob: Blob; duration: number } | null
}

type Ctx = {
  slug: string
  campaign: LpCampaign
  leaderboard: LpLeader[]
  me: LpMe | null
  setMe: (me: LpMe | null) => void
  modal: Modal
  open: (m: Modal) => void
  close: () => void
  videoKey: string | null
  openVideo: (key?: string) => void
  toast: (text: string, icon?: ToastIcon) => void
  fly: (text: string, el?: Element | null) => void
  pctOf: (pts: number) => number
  sym: Symptoms
  setSym: (fn: (s: Symptoms) => Symptoms) => void
  refCode: string
  setRefCode: (c: string) => void
  toastState: { text: string; icon: ToastIcon; on: boolean }
  flies: { id: number; text: string; x: number; y: number }[]
}

const LpContext = createContext<Ctx | null>(null)

export function useLp(): Ctx {
  const c = useContext(LpContext)
  if (!c) throw new Error('useLp ngoài LandingProvider')
  return c
}

export function LandingProvider({
  slug,
  campaign,
  leaderboard,
  initialMe,
  children,
}: {
  slug: string
  campaign: LpCampaign
  leaderboard: LpLeader[]
  initialMe: LpMe | null
  children: ReactNode
}) {
  const [me, setMe] = useState<LpMe | null>(initialMe)
  const [modal, setModal] = useState<Modal>(null)
  const [videoKey, setVideoKey] = useState<string | null>(null)
  const [toastState, setToast] = useState<{ text: string; icon: ToastIcon; on: boolean }>({ text: '', icon: 'check', on: false })
  const [flies, setFlies] = useState<{ id: number; text: string; x: number; y: number }[]>([])
  const [sym, setSymState] = useState<Symptoms>({ picked: [], other: '', otherOpen: false, voice: null })
  const [refCode, setRefCode] = useState('')
  const toastT = useRef<ReturnType<typeof setTimeout> | null>(null)

  const toast = useCallback((text: string, icon: ToastIcon = 'check') => {
    setToast({ text, icon, on: true })
    if (toastT.current) clearTimeout(toastT.current)
    toastT.current = setTimeout(() => setToast((t) => ({ ...t, on: false })), 2800)
  }, [])

  const fly = useCallback((text: string, el?: Element | null) => {
    const r = (el ?? document.body).getBoundingClientRect()
    const id = Date.now() + Math.random()
    setFlies((f) => [...f, { id, text, x: r.left + r.width / 2 - 30, y: r.top }])
    setTimeout(() => setFlies((f) => f.filter((x) => x.id !== id)), 1000)
  }, [])

  const close = useCallback(() => setModal(null), [])
  const goal = campaign.points.goal || 29
  const pctOf = useCallback((pts: number) => Math.round((pts / goal) * 100), [goal])

  const value = useMemo<Ctx>(
    () => ({
      slug,
      campaign,
      leaderboard,
      me,
      setMe,
      modal,
      open: setModal,
      close,
      videoKey,
      openVideo: (key) => {
        const vids = campaign.videos
        const pick =
          vids.find((v) => v.key === key) ?? vids.find((v) => !me?.videosWatched.includes(v.key)) ?? vids[0]
        setVideoKey(pick?.key ?? null)
        setModal('video')
      },
      toast,
      fly,
      pctOf,
      sym,
      setSym: setSymState,
      refCode,
      setRefCode,
      toastState,
      flies,
    }),
    [slug, campaign, leaderboard, me, modal, close, videoKey, toast, fly, pctOf, sym, refCode, toastState, flies],
  )

  return <LpContext.Provider value={value}>{children}</LpContext.Provider>
}

/** Nhãn ngắn của 5 triệu chứng — trùng mã s1–s5 phía CMS. */
export const SYM_LABEL: Record<string, string> = {
  s1: 'Đau, nóng rát trên rốn',
  s2: 'Ợ hơi, ợ chua, trào ngược',
  s3: 'Đầy bụng, chậm tiêu',
  s4: 'Buồn nôn, ăn không ngon',
  s5: 'Viêm loét dạ dày – tá tràng / HP',
}

export const RULE = {
  name: (v: string) => v.trim().split(/\s+/).length >= 2 || 'Bạn ghi cả họ và tên nhé',
  phone: (v: string) =>
    /^(0|\+84)(3|5|7|8|9)\d{8}$/.test(v.replace(/[\s.-]/g, '')) || 'Số này chưa đúng, bạn xem lại nhé. Ví dụ: 0912345678',
  addr: (v: string) => v.trim().length >= 10 || 'Bạn ghi địa chỉ đầy đủ để shipper dễ tìm nhé',
}

/** Đợt đã chốt (hoặc chiến dịch dừng) → trang chuyển sang chế độ chờ đợt mới. */
export const isClosed = (c: { status: string; round: { status: string } | null }) =>
  c.status === 'ended' || (c.round ? c.round.status !== 'open' : false)

export const daysLeft = (deadline: string) => Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 864e5))
