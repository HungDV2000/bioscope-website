'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { MessageCircle, X, Send, LogIn, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocale } from '@/lib/i18n/context'
import { collectTracking, trackPageView } from '@/lib/chat/tracking'

type Msg = {
  id?: number
  sender: 'visitor' | 'agent' | 'system'
  text: string
  agentName?: string | null
  createdAt?: string | null
}

/** Giờ:phút của tin nhắn (dùng giờ máy khách). */
const fmtTime = (iso?: string | null) => {
  const d = iso ? new Date(iso) : new Date()
  return isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const STRINGS = {
  vi: {
    online: 'Đang trực tuyến', offline: 'Ngoài giờ', close: 'Đóng', connecting: 'Đang kết nối…',
    consentBefore: 'Bằng việc bắt đầu trò chuyện, bạn đồng ý để Bioscope lưu nội dung tin nhắn nhằm hỗ trợ bạn, theo',
    privacy: 'Chính sách bảo mật', agree: 'Đồng ý & bắt đầu',
    leaveEmail: 'Để lại email, chúng tôi sẽ liên hệ lại:', emailPh: 'email@congty.com', send: 'Gửi',
    thanks: 'Cảm ơn bạn — chúng tôi sẽ liên hệ qua email sớm nhất.', inputPh: 'Nhập tin nhắn…',
    openChat: 'Mở chat hỗ trợ', closeChat: 'Đóng chat', dismiss: 'Đóng lời chào',
    loginTitle: 'Đăng nhập để trò chuyện',
    loginDesc: 'Để đội ngũ Bioscope hỗ trợ chính xác và lưu lại lịch sử trao đổi, bạn vui lòng đăng nhập hoặc tạo tài khoản đối tác.',
    loginBtn: 'Đăng nhập', registerBtn: 'Đăng ký tài khoản',
    loginRequired: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  },
  en: {
    online: 'Online', offline: 'Away', close: 'Close', connecting: 'Connecting…',
    consentBefore: 'By starting a chat, you agree that Bioscope stores your messages to assist you, per our',
    privacy: 'Privacy Policy', agree: 'Agree & start',
    leaveEmail: "Leave your email and we'll get back to you:", emailPh: 'email@company.com', send: 'Send',
    thanks: "Thanks — we'll email you soon.", inputPh: 'Type a message…',
    openChat: 'Open support chat', closeChat: 'Close chat', dismiss: 'Dismiss greeting',
    loginTitle: 'Sign in to chat',
    loginDesc: 'So the Bioscope team can help you accurately and keep your conversation history, please sign in or create a partner account.',
    loginBtn: 'Sign in', registerBtn: 'Create account',
    loginRequired: 'Your session expired. Please sign in again.',
  },
}

const LS_TOKEN = 'bsChatToken'
const LS_CONV = 'bsChatConvId'
const SS_BUBBLE = 'bsChatBubbleSeen'

type Config = {
  enabled: boolean
  widgetTitle?: string
  bubbleEnabled?: boolean
  bubbleMessage?: string
  bubbleDelay?: number
  bubbleOncePerSession?: boolean
}

/**
 * Widget Live Chat (Web ↔ Telegram). Gọi qua proxy /api/chat/*. Chỉ hiện khi
 * admin bật chat. Bắt buộc đăng nhập mới chat được — chưa đăng nhập thì hiện
 * popup mời đăng nhập/đăng ký.
 */
export function ChatWidget() {
  const { locale } = useLocale()
  const T = STRINGS[locale] ?? STRINGS.vi
  const pathname = usePathname()

  const [cfg, setCfg] = useState<Config | null>(null)
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  const [open, setOpen] = useState(false)
  const [bubble, setBubble] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [online, setOnline] = useState(true)
  const [starting, setStarting] = useState(false)
  const [consented, setConsented] = useState(false)
  const [contact, setContact] = useState({ name: '', email: '' })
  const [contactSent, setContactSent] = useState(false)
  const [unread, setUnread] = useState(0)
  const lastId = useRef(0)
  const openRef = useRef(false)
  const listRef = useRef<HTMLDivElement>(null)

  const now = () => new Date().toISOString()
  const say = (text: string, sender: Msg['sender'] = 'system') =>
    setMessages((m) => [...m, { sender, text, createdAt: now() }])

  // Đếm số trang khách đã xem (phục vụ tracking).
  useEffect(() => {
    trackPageView(pathname)
  }, [pathname])

  useEffect(() => {
    openRef.current = open
    if (open) {
      setUnread(0)
      setBubble(false)
    }
  }, [open])

  // Cấu hình chat + trạng thái đăng nhập.
  useEffect(() => {
    let stop = false
    void (async () => {
      try {
        const [c, s] = await Promise.all([
          fetch(`/api/chat/config?locale=${locale}`).then((r) => r.json()),
          fetch('/api/chat/session').then((r) => r.json()),
        ])
        if (stop) return
        setCfg(c as Config)
        setLoggedIn(Boolean((s as { loggedIn?: boolean }).loggedIn))
      } catch {
        /* im lặng — không hiện widget */
      }
    })()
    try {
      setToken(localStorage.getItem(LS_TOKEN))
      setConsented(localStorage.getItem('bsChatConsent') === '1')
    } catch {
      /* storage bị chặn */
    }
    return () => {
      stop = true
    }
  }, [locale])

  // Bóng câu chào: hiện sau N giây, tôn trọng "chỉ một lần mỗi lượt".
  useEffect(() => {
    if (!cfg?.enabled || !cfg.bubbleEnabled || open) return
    let seen = false
    try {
      seen = cfg.bubbleOncePerSession !== false && sessionStorage.getItem(SS_BUBBLE) === '1'
    } catch {
      /* bỏ qua */
    }
    if (seen) return
    const t = setTimeout(() => setBubble(true), Math.max(0, cfg.bubbleDelay ?? 5) * 1000)
    return () => clearTimeout(t)
  }, [cfg, open])

  const dismissBubble = () => {
    setBubble(false)
    try {
      sessionStorage.setItem(SS_BUBBLE, '1')
    } catch {
      /* bỏ qua */
    }
  }

  const scrollDown = useCallback(() => {
    requestAnimationFrame(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }))
  }, [])

  const start = useCallback(async () => {
    if (token || starting) return
    setStarting(true)
    try {
      const r = await fetch(`/api/chat/start?locale=${locale}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collectTracking()),
      }).then((x) => x.json())

      if (r?.error === 'login_required') {
        setLoggedIn(false)
        return
      }
      if (r?.token) {
        setToken(r.token)
        try {
          localStorage.setItem(LS_TOKEN, r.token)
          localStorage.setItem(LS_CONV, String(r.conversationId))
        } catch {
          /* bỏ qua */
        }
        setOnline(r.online !== false)
        // Mở khung chat thì chào tiếp (bóng chào chỉ là lời mời ngoài nút).
        setMessages([{ sender: 'system', text: r.welcomeMessage ?? 'Chào bạn 👋', createdAt: now() }])
        if (r.online === false && r.offlineMessage) {
          setMessages((m) => [...m, { sender: 'system', text: r.offlineMessage, createdAt: now() }])
        }
      }
    } finally {
      setStarting(false)
    }
  }, [token, starting, locale])

  // Mở lần đầu (đã đăng nhập + đã đồng ý) → bắt đầu hội thoại.
  useEffect(() => {
    if (open && loggedIn && consented && !token) void start()
  }, [open, loggedIn, consented, token, start])

  const agree = () => {
    try {
      localStorage.setItem('bsChatConsent', '1')
    } catch {
      /* bỏ qua */
    }
    setConsented(true)
  }

  const sendContact = async () => {
    if (!token || !/.+@.+\..+/.test(contact.email)) return
    try {
      await fetch('/api/chat/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, name: contact.name, email: contact.email }),
      })
      setContactSent(true)
      say(T.thanks)
    } catch {
      /* im lặng */
    }
  }

  // Poll tin trả lời khi có token.
  useEffect(() => {
    if (!token) return
    let stop = false
    const tick = async () => {
      try {
        const r = await fetch(
          `/api/chat/poll?token=${encodeURIComponent(token)}&since=${lastId.current}`,
        ).then((x) => x.json())
        if (!stop && r?.messages?.length) {
          for (const m of r.messages as Msg[]) if (m.id && m.id > lastId.current) lastId.current = m.id
          setMessages((prev) => [...prev, ...(r.messages as Msg[])])
          if (!openRef.current) setUnread((n) => n + (r.messages as Msg[]).length)
          scrollDown()
        }
      } catch {
        /* im lặng */
      }
    }
    const iv = setInterval(tick, 4000)
    void tick()
    return () => {
      stop = true
      clearInterval(iv)
    }
  }, [token, scrollDown])

  const send = async () => {
    const text = input.trim()
    if (!text || !token) return
    setInput('')
    setMessages((m) => [...m, { sender: 'visitor', text, createdAt: now() }])
    scrollDown()
    try {
      const r = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, text }),
      }).then((x) => x.json())
      if (r?.error === 'login_required') {
        setLoggedIn(false)
        say(T.loginRequired)
      }
    } catch {
      say('⚠️ Gửi lỗi, thử lại giúp nhé.')
    }
  }

  if (!cfg?.enabled) return null

  const loginHref = (path: string) => `${path}?returnTo=${encodeURIComponent(pathname)}`

  return (
    <div className="fixed bottom-5 right-5 z-[90] flex flex-col items-end gap-3">
      {/* Bóng câu chào cạnh nút — mời khách mở chat */}
      {bubble && !open && cfg.bubbleMessage && (
        <div className="relative max-w-[min(80vw,300px)] animate-in fade-in slide-in-from-bottom-2">
          <button
            type="button"
            onClick={() => {
              dismissBubble()
              setOpen(true)
            }}
            className="block rounded-2xl rounded-br-md border border-primary-border/60 bg-white px-4 py-3 pr-8 text-left text-[13.5px] leading-relaxed text-ink shadow-card transition-transform hover:scale-[1.02]"
          >
            {cfg.bubbleMessage}
          </button>
          <button
            type="button"
            onClick={dismissBubble}
            aria-label={T.dismiss}
            className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full text-ink/35 hover:bg-mist hover:text-ink/70"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {open && (
        <div className="flex h-[min(70vh,540px)] w-[min(92vw,380px)] flex-col overflow-hidden rounded-[1.5rem] border border-primary-border/60 bg-white shadow-card">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 bg-primary px-4 py-3.5 text-white">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20">
                <MessageCircle className="h-4 w-4" />
              </span>
              <div className="leading-tight">
                <div className="text-[14.5px] font-bold">{cfg.widgetTitle ?? 'Bioscope'}</div>
                <div className="flex items-center gap-1.5 text-[11.5px] text-white/80">
                  <span className={cn('h-2 w-2 rounded-full', online ? 'bg-green-300' : 'bg-white/50')} />
                  {online ? T.online : T.offline}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={T.close}
              className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/15"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {loggedIn === false ? (
            /* Bắt buộc đăng nhập mới được chat */
            <div className="flex flex-1 flex-col justify-center gap-4 bg-mist/30 px-6 py-8 text-center">
              <LogIn className="mx-auto h-9 w-9 text-primary/70" />
              <div>
                <p className="text-[15.5px] font-bold text-ink">{T.loginTitle}</p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink/65">{T.loginDesc}</p>
              </div>
              <div className="space-y-2.5">
                <a
                  href={loginHref('/member/login')}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-[14px] font-semibold text-white hover:bg-primary-dark"
                >
                  <LogIn className="h-4 w-4" />
                  {T.loginBtn}
                </a>
                <a
                  href={loginHref('/member/dang-ky')}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-primary-border bg-white px-6 py-2.5 text-[14px] font-semibold text-primary hover:bg-primary-tint"
                >
                  <UserPlus className="h-4 w-4" />
                  {T.registerBtn}
                </a>
              </div>
            </div>
          ) : !consented ? (
            /* Màn hình đồng ý (GDPR) trước khi bắt đầu chat */
            <div className="flex flex-1 flex-col justify-center gap-4 bg-mist/30 px-6 py-8 text-center">
              <MessageCircle className="mx-auto h-9 w-9 text-primary/70" />
              <p className="text-[13.5px] leading-relaxed text-ink/70">
                {T.consentBefore}{' '}
                <a href="/chinh-sach-bao-mat" className="font-semibold text-primary underline">
                  {T.privacy}
                </a>
                .
              </p>
              <button
                type="button"
                onClick={agree}
                className="mx-auto rounded-full bg-primary px-6 py-2.5 text-[14px] font-semibold text-white hover:bg-primary-dark"
              >
                {T.agree}
              </button>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div ref={listRef} className="flex-1 space-y-2.5 overflow-y-auto bg-mist/40 px-3.5 py-4">
                {messages.map((m, i) => (
                  <div
                    key={m.id ?? `l${i}`}
                    className={cn('flex', m.sender === 'visitor' ? 'justify-end' : 'justify-start')}
                  >
                    <div
                      className={cn(
                        'max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-[13.5px] leading-relaxed',
                        m.sender === 'visitor'
                          ? 'rounded-br-md bg-primary text-white'
                          : m.sender === 'system'
                            ? 'border border-primary-border/50 bg-white text-ink/70'
                            : 'rounded-bl-md bg-white text-ink shadow-sm',
                      )}
                    >
                      {m.sender === 'agent' && m.agentName && (
                        <div className="mb-0.5 text-[11px] font-semibold text-primary-dark">{m.agentName}</div>
                      )}
                      {m.text}
                      <div
                        className={cn(
                          'mt-1 text-[10.5px] tabular-nums',
                          m.sender === 'visitor' ? 'text-right text-white/70' : 'text-ink/40',
                        )}
                      >
                        {fmtTime(m.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
                {starting && <p className="text-center text-[12.5px] text-ink/40">{T.connecting}</p>}
              </div>

              {/* Form để lại email khi ngoài giờ */}
              {!online && !contactSent && (
                <div className="border-t border-primary-border/50 bg-accent-soft/60 px-3.5 py-3">
                  <p className="mb-2 text-[12.5px] font-medium text-ink/70">{T.leaveEmail}</p>
                  <div className="flex gap-2">
                    <input
                      value={contact.email}
                      onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                      placeholder={T.emailPh}
                      className="min-w-0 flex-1 rounded-full border border-primary-border bg-white px-3.5 py-2 text-[13px] outline-none focus:border-primary/50"
                    />
                    <button
                      type="button"
                      onClick={() => void sendContact()}
                      disabled={!/.+@.+\..+/.test(contact.email)}
                      className="shrink-0 rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-white hover:bg-primary-dark disabled:opacity-40"
                    >
                      {T.send}
                    </button>
                  </div>
                </div>
              )}

              {/* Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  void send()
                }}
                className="flex items-center gap-2 border-t border-primary-border/50 bg-white px-3 py-2.5"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={T.inputPh}
                  className="min-w-0 flex-1 rounded-full border border-primary-border bg-mist/40 px-4 py-2.5 text-[14px] outline-none focus:border-primary/50"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  aria-label={T.send}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-white transition-opacity hover:bg-primary-dark disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Nút nổi */}
      <button
        type="button"
        onClick={() => {
          if (bubble) dismissBubble()
          setOpen((o) => !o)
        }}
        aria-label={open ? T.closeChat : T.openChat}
        className="relative grid h-14 w-14 place-items-center rounded-full bg-primary text-white shadow-card transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-6 min-w-6 place-items-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-white ring-2 ring-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
    </div>
  )
}
