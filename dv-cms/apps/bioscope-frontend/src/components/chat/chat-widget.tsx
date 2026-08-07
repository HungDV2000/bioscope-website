'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

type Msg = { id?: number; sender: 'visitor' | 'agent' | 'system'; text: string; agentName?: string | null }

const LS_TOKEN = 'bsChatToken'
const LS_CONV = 'bsChatConvId'

/**
 * Widget Live Chat (Web ↔ Telegram). Gọi qua proxy /api/chat/*. Chỉ hiện khi
 * admin bật chat. Poll mỗi 4s để nhận trả lời của sales.
 */
export function ChatWidget() {
  const [enabled, setEnabled] = useState(false)
  const [title, setTitle] = useState('Bioscope hỗ trợ')
  const [open, setOpen] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [online, setOnline] = useState(true)
  const [offlineMsg, setOfflineMsg] = useState('')
  const [starting, setStarting] = useState(false)
  const [consented, setConsented] = useState(false)
  const [contact, setContact] = useState({ name: '', email: '' })
  const [contactSent, setContactSent] = useState(false)
  const lastId = useRef(0)
  const listRef = useRef<HTMLDivElement>(null)

  // Kiểm tra chat có bật không.
  useEffect(() => {
    fetch('/api/chat/config')
      .then((r) => r.json())
      .then((d) => {
        if (d?.enabled) {
          setEnabled(true)
          if (d.widgetTitle) setTitle(d.widgetTitle)
        }
      })
      .catch(() => {})
    setToken(localStorage.getItem(LS_TOKEN))
    setConsented(localStorage.getItem('bsChatConsent') === '1')
  }, [])

  const scrollDown = useCallback(() => {
    requestAnimationFrame(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }))
  }, [])

  const start = useCallback(async () => {
    if (token || starting) return
    setStarting(true)
    try {
      const r = await fetch('/api/chat/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startPage: location.pathname, userAgent: navigator.userAgent }),
      }).then((x) => x.json())
      if (r?.token) {
        setToken(r.token)
        localStorage.setItem(LS_TOKEN, r.token)
        localStorage.setItem(LS_CONV, String(r.conversationId))
        setOnline(r.online !== false)
        setOfflineMsg(r.offlineMessage ?? '')
        setMessages([{ sender: 'system', text: r.welcomeMessage ?? 'Chào bạn 👋' }])
        if (r.online === false && r.offlineMessage) {
          setMessages((m) => [...m, { sender: 'system', text: r.offlineMessage }])
        }
      }
    } finally {
      setStarting(false)
    }
  }, [token, starting])

  // Mở lần đầu (đã đồng ý) → bắt đầu hội thoại.
  useEffect(() => {
    if (open && consented && !token) void start()
  }, [open, consented, token, start])

  const agree = () => {
    localStorage.setItem('bsChatConsent', '1')
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
      setMessages((m) => [...m, { sender: 'system', text: 'Cảm ơn bạn — chúng tôi sẽ liên hệ qua email sớm nhất.' }])
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
        const r = await fetch(`/api/chat/poll?token=${encodeURIComponent(token)}&since=${lastId.current}`).then((x) => x.json())
        if (!stop && r?.messages?.length) {
          for (const m of r.messages as Msg[]) if (m.id && m.id > lastId.current) lastId.current = m.id
          setMessages((prev) => [...prev, ...(r.messages as Msg[])])
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
    setMessages((m) => [...m, { sender: 'visitor', text }])
    scrollDown()
    try {
      await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, text }),
      })
    } catch {
      setMessages((m) => [...m, { sender: 'system', text: '⚠️ Gửi lỗi, thử lại giúp nhé.' }])
    }
  }

  if (!enabled) return null

  return (
    <div className="fixed bottom-5 right-5 z-[90] flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[min(70vh,540px)] w-[min(92vw,380px)] flex-col overflow-hidden rounded-[1.5rem] border border-primary-border/60 bg-white shadow-card">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 bg-primary px-4 py-3.5 text-white">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20">
                <MessageCircle className="h-4 w-4" />
              </span>
              <div className="leading-tight">
                <div className="text-[14.5px] font-bold">{title}</div>
                <div className="flex items-center gap-1.5 text-[11.5px] text-white/80">
                  <span className={cn('h-2 w-2 rounded-full', online ? 'bg-green-300' : 'bg-white/50')} />
                  {online ? 'Đang trực tuyến' : 'Ngoài giờ'}
                </div>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Đóng" className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/15">
              <X className="h-4 w-4" />
            </button>
          </div>

          {!consented ? (
            /* Màn hình đồng ý (GDPR) trước khi bắt đầu chat */
            <div className="flex flex-1 flex-col justify-center gap-4 bg-mist/30 px-6 py-8 text-center">
              <MessageCircle className="mx-auto h-9 w-9 text-primary/70" />
              <p className="text-[13.5px] leading-relaxed text-ink/70">
                Bằng việc bắt đầu trò chuyện, bạn đồng ý để Bioscope lưu nội dung tin nhắn nhằm hỗ trợ bạn, theo{' '}
                <a href="/chinh-sach-bao-mat" className="font-semibold text-primary underline">
                  Chính sách bảo mật
                </a>
                .
              </p>
              <button
                type="button"
                onClick={agree}
                className="mx-auto rounded-full bg-primary px-6 py-2.5 text-[14px] font-semibold text-white hover:bg-primary-dark"
              >
                Đồng ý &amp; bắt đầu
              </button>
            </div>
          ) : (
            <>
          {/* Messages */}
          <div ref={listRef} className="flex-1 space-y-2.5 overflow-y-auto bg-mist/40 px-3.5 py-4">
            {messages.map((m, i) => (
              <div key={m.id ?? `l${i}`} className={cn('flex', m.sender === 'visitor' ? 'justify-end' : 'justify-start')}>
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
                </div>
              </div>
            ))}
            {starting && <p className="text-center text-[12.5px] text-ink/40">Đang kết nối…</p>}
          </div>

          {/* Form để lại email khi ngoài giờ */}
          {!online && !contactSent && (
            <div className="border-t border-primary-border/50 bg-accent-soft/60 px-3.5 py-3">
              <p className="mb-2 text-[12.5px] font-medium text-ink/70">Để lại email, chúng tôi sẽ liên hệ lại:</p>
              <div className="flex gap-2">
                <input
                  value={contact.email}
                  onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                  placeholder="email@congty.com"
                  className="min-w-0 flex-1 rounded-full border border-primary-border bg-white px-3.5 py-2 text-[13px] outline-none focus:border-primary/50"
                />
                <button
                  type="button"
                  onClick={() => void sendContact()}
                  disabled={!/.+@.+\..+/.test(contact.email)}
                  className="shrink-0 rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-white hover:bg-primary-dark disabled:opacity-40"
                >
                  Gửi
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
              placeholder="Nhập tin nhắn…"
              className="min-w-0 flex-1 rounded-full border border-primary-border bg-mist/40 px-4 py-2.5 text-[14px] outline-none focus:border-primary/50"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Gửi"
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
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Đóng chat' : 'Mở chat hỗ trợ'}
        className="grid h-14 w-14 place-items-center rounded-full bg-primary text-white shadow-card transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  )
}
