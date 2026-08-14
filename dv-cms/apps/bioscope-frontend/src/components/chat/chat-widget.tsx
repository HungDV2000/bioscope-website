'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { MessageCircle, X, Send, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocale } from '@/lib/i18n/context'
import { collectTracking, trackPageView } from '@/lib/chat/tracking'
import { ChatAuthPanel, type AuthStrings } from './chat-auth-panel'
import { Attachment } from './chat-attachment'
import { SESSION_CHANGED } from '@/lib/member/session-events'

type Msg = {
  id?: number
  sender: 'visitor' | 'agent' | 'system'
  text: string
  /** Tin do admin soạn bằng rich text → render HTML thay vì văn bản thuần. */
  html?: string
  agentName?: string | null
  createdAt?: string | null
  /** Ảnh/tệp sales gửi từ Telegram — tải qua /api/chat/file (kiểm phiên). */
  attachmentKind?: 'photo' | 'document' | 'voice' | 'video' | null
  attachmentName?: string | null
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
    download: 'Tải tệp', imageAlt: 'Ảnh sales gửi',
    clearHistory: 'Xoá lịch sử trò chuyện',
    clearConfirm: 'Ẩn toàn bộ tin nhắn khỏi máy bạn và bắt đầu cuộc trò chuyện mới?',
    cleared: 'Đã ẩn lịch sử khỏi thiết bị của bạn.',
    loginTitle: 'Đăng nhập để trò chuyện',
    loginDesc: 'Để đội ngũ Bioscope hỗ trợ chính xác và lưu lại lịch sử trao đổi, bạn vui lòng đăng nhập hoặc tạo tài khoản đối tác.',
    loginBtn: 'Đăng nhập', registerBtn: 'Đăng ký tài khoản',
    loginRequired: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
    google: 'Đăng nhập bằng Google', or: 'hoặc', back: 'Quay lại',
    fEmail: 'Email công việc', fPassword: 'Mật khẩu', fCompany: 'Tên công ty',
    fContact: 'Người liên hệ', fPhone: 'Số điện thoại',
    passwordHint: 'Tối thiểu 8 ký tự.',
    submitLogin: 'Đăng nhập', submitRegister: 'Đăng ký & bắt đầu chat',
    errInvalid: 'Sai email hoặc mật khẩu.', errTaken: 'Email này đã được đăng ký.',
    errNetwork: 'Không kết nối được máy chủ. Thử lại sau.',
    errShort: 'Mật khẩu phải từ 8 ký tự.',
  },
  en: {
    online: 'Online', offline: 'Away', close: 'Close', connecting: 'Connecting…',
    consentBefore: 'By starting a chat, you agree that Bioscope stores your messages to assist you, per our',
    privacy: 'Privacy Policy', agree: 'Agree & start',
    leaveEmail: "Leave your email and we'll get back to you:", emailPh: 'email@company.com', send: 'Send',
    thanks: "Thanks — we'll email you soon.", inputPh: 'Type a message…',
    openChat: 'Open support chat', closeChat: 'Close chat', dismiss: 'Dismiss greeting',
    download: 'Download file', imageAlt: 'Image from sales',
    clearHistory: 'Clear chat history',
    clearConfirm: 'Hide all messages from this device and start a new conversation?',
    cleared: 'History hidden from your device.',
    loginTitle: 'Sign in to chat',
    loginDesc: 'So the Bioscope team can help you accurately and keep your conversation history, please sign in or create a partner account.',
    loginBtn: 'Sign in', registerBtn: 'Create account',
    loginRequired: 'Your session expired. Please sign in again.',
    google: 'Continue with Google', or: 'or', back: 'Back',
    fEmail: 'Work email', fPassword: 'Password', fCompany: 'Company name',
    fContact: 'Contact person', fPhone: 'Phone number',
    passwordHint: 'At least 8 characters.',
    submitLogin: 'Sign in', submitRegister: 'Sign up & start chat',
    errInvalid: 'Invalid email or password.', errTaken: 'This email is already registered.',
    errNetwork: 'Could not reach server. Try again later.',
    errShort: 'Password must be at least 8 characters.',
  },
}

const LS_TOKEN = 'bsChatToken'
const LS_CONV = 'bsChatConvId'
const SS_BUBBLE = 'bsChatBubbleSeen'
/** Token chat đang lưu thuộc về tài khoản nào — đổi người là phải xoá. */
const LS_MEMBER = 'bsChatMember'

type Config = {
  enabled: boolean
  widgetTitle?: string
  loginGreeting?: string
  welcomeMessage?: string
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
  const historyLoaded = useRef(false)
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
          fetch('/api/member/session').then((r) => r.json()),
        ])
        if (stop) return
        setCfg(c as Config)
        const ses = s as { loggedIn?: boolean; id?: string }
        setLoggedIn(Boolean(ses.loggedIn))
        // Token chat còn sót của tài khoản KHÁC (máy dùng chung, vừa đổi người
        // đăng nhập) → bỏ đi, không để người sau đọc hội thoại của người trước.
        try {
          const owner = localStorage.getItem(LS_MEMBER)
          if (!ses.loggedIn || (owner && owner !== String(ses.id ?? ''))) {
            localStorage.removeItem(LS_TOKEN)
            localStorage.removeItem(LS_CONV)
            localStorage.removeItem(LS_MEMBER)
            setToken(null)
            setMessages([])
            lastId.current = 0
          }
        } catch {
          /* bỏ qua */
        }
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

  // Đăng nhập xong ở popup → widget tự chuyển sang khung chat, không cần tải lại.
  useEffect(() => {
    const onChanged = () => {
      void fetch('/api/member/session')
        .then((r) => r.json())
        .then((s: { loggedIn?: boolean }) => {
          if (s.loggedIn) {
            setLoggedIn(true)
            setMessages([])
          }
        })
        .catch(() => {})
    }
    window.addEventListener(SESSION_CHANGED, onChanged)
    return () => window.removeEventListener(SESSION_CHANGED, onChanged)
  }, [])

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

  /**
   * Bỏ phiên chat đang lưu TRÊN MÁY KHÁCH. Dữ liệu trên máy chủ giữ nguyên để
   * admin còn theo dõi — đây chỉ là ẩn khỏi thiết bị của khách.
   */
  const forgetLocalSession = useCallback(() => {
    try {
      localStorage.removeItem(LS_TOKEN)
      localStorage.removeItem(LS_CONV)
      localStorage.removeItem(LS_MEMBER)
    } catch {
      /* bỏ qua */
    }
    lastId.current = 0
    historyLoaded.current = false
    setToken(null)
    setMessages([])
    setContactSent(false)
  }, [])

  const clearHistory = () => {
    if (!window.confirm(T.clearConfirm)) return
    forgetLocalSession()
    setMessages([{ sender: 'system', text: T.cleared, createdAt: new Date().toISOString() }])
  }

  const dismissBubble = () => {
    setBubble(false)
    try {
      sessionStorage.setItem(SS_BUBBLE, '1')
    } catch {
      /* bỏ qua */
    }
  }

  // Panel trong khung chat giờ chỉ cần lời chào + 2 nút (form nằm ở popup).
  const authStrings: AuthStrings = {
    loginTitle: T.loginTitle,
    loginDesc: T.loginDesc,
    loginBtn: T.loginBtn,
    registerBtn: T.registerBtn,
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
        forgetLocalSession()
        return
      }
      if (r?.token) {
        setToken(r.token)
        try {
          localStorage.setItem(LS_TOKEN, r.token)
          localStorage.setItem(LS_CONV, String(r.conversationId))
          if (r.memberId) localStorage.setItem(LS_MEMBER, String(r.memberId))
        } catch {
          /* bỏ qua */
        }
        setOnline(r.online !== false)
        // Mở khung chat thì chào tiếp (bóng chào chỉ là lời mời ngoài nút).
        setMessages([{ sender: 'system', text: '', html: r.welcomeMessage ?? '<p>Chào bạn 👋</p>', createdAt: now() }])
        if (r.online === false && r.offlineMessage) {
          setMessages((m) => [...m, { sender: 'system', text: r.offlineMessage, createdAt: now() }])
        }
      }
    } finally {
      setStarting(false)
    }
  }, [token, starting, locale])

  /**
   * Mở lại khung chat với token cũ (khách tải lại trang) → nạp lại toàn bộ hội
   * thoại. `poll` chỉ trả tin của sales nên nếu chỉ dựa vào nó thì khách không
   * còn thấy chính những gì mình đã gửi.
   */
  useEffect(() => {
    if (!open || !token || historyLoaded.current) return
    historyLoaded.current = true
    void fetch(`/api/chat/history?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((r: { ok?: boolean; messages?: Msg[] }) => {
        if (!r.ok || !r.messages?.length) return
        for (const m of r.messages) if (m.id && m.id > lastId.current) lastId.current = m.id
        setMessages((prev) =>
          // Vừa bắt đầu hội thoại xong thì giữ nguyên, tránh lặp lời chào.
          prev.length
            ? prev
            : [
                { sender: 'system', text: '', html: cfg?.welcomeMessage, createdAt: r.messages![0]?.createdAt },
                ...r.messages!,
              ],
        )
        scrollDown()
      })
      .catch(() => {})
  }, [open, token, cfg?.welcomeMessage, scrollDown])

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
            className="chat-greeting block rounded-2xl rounded-br-md border border-primary-border/60 bg-white px-4 py-3 pr-8 text-left text-[13.5px] leading-relaxed text-ink shadow-card transition-transform hover:scale-[1.02]"
            dangerouslySetInnerHTML={{ __html: cfg.bubbleMessage }}
          />
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
            <div className="flex items-center gap-1">
              {token && (
                <button
                  type="button"
                  onClick={clearHistory}
                  aria-label={T.clearHistory}
                  title={T.clearHistory}
                  className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/15"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={T.close}
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/15"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {loggedIn === false ? (
            /* Bắt buộc đăng nhập mới được chat — làm NGAY trong khung chat */
            <ChatAuthPanel t={authStrings} greetingHtml={cfg.loginGreeting} />
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
                      {m.html ? (
                        <div className="chat-greeting" dangerouslySetInnerHTML={{ __html: m.html }} />
                      ) : (
                        m.text
                      )}
                      {m.attachmentKind && m.id && token && (
                        <Attachment
                          kind={m.attachmentKind}
                          name={m.attachmentName}
                          href={`/api/chat/file?token=${encodeURIComponent(token)}&id=${m.id}`}
                          t={{ download: T.download, imageAlt: T.imageAlt }}
                        />
                      )}
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
