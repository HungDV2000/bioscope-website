'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Bot, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Messages } from '@/lib/i18n/messages'

type ChatMsg = { id: string; role: 'ai' | 'user'; text: string }

type AiChatCopy = Messages['home']['aiChat']

const TYPING_MS = 1100
const PAUSE_MS = 900
const LOOP_MS = 4200
const BODY_H = 'h-[280px]'

function TypingBubble({ label }: { label: string }) {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl rounded-bl-md bg-primary-tint px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="sr-only">{label}</span>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-primary/50"
              style={{ animation: `bs-blink 1.2s ease-in-out ${i * 0.15}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ msg }: { msg: ChatMsg }) {
  const isAi = msg.role === 'ai'
  return (
    <div className={cn('flex', isAi ? 'justify-start' : 'justify-end')}>
      <div
        className={cn(
          'max-w-[88%] rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed sm:max-w-[85%] sm:text-[14px]',
          isAi
            ? 'rounded-bl-md bg-primary-tint text-ink/85'
            : 'rounded-br-md bg-primary-dark text-white',
        )}
      >
        {msg.text}
      </div>
    </div>
  )
}

export type AiChatDemoHandle = {
  replay: () => void
  sendSuggestion: (index: 0 | 1) => void
}

export function AiChatDemo({
  copy,
  onReady,
}: {
  copy: AiChatCopy
  onReady?: (handle: AiChatDemoHandle) => void
}) {
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [typing, setTyping] = useState(true)
  const [fabPulse, setFabPulse] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const loopRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const userInteracted = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    if (loopRef.current) {
      clearTimeout(loopRef.current)
      loopRef.current = null
    }
  }, [])

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms)
    timers.current.push(id)
    return id
  }, [])

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [])

  const pushAi = useCallback(
    (text: string, onDone?: () => void) => {
      setTyping(true)
      schedule(() => {
        setTyping(false)
        setMessages((prev) => [...prev, { id: `ai-${Date.now()}`, role: 'ai', text }])
        onDone?.()
      }, TYPING_MS)
    },
    [schedule],
  )

  const pushUser = useCallback((text: string, onDone?: () => void) => {
    setMessages((prev) => [...prev, { id: `user-${Date.now()}`, role: 'user', text }])
    onDone?.()
  }, [])

  const resetConversation = useCallback(() => {
    setTyping(true)
    setMessages([])
  }, [])

  const runAutoScript = useCallback(() => {
    clearTimers()
    resetConversation()

    pushAi(copy.demoAi1, () => {
      schedule(() => {
        pushUser(copy.demoUser, () => {
          schedule(() => {
            pushAi(copy.demoAi2, () => {
              if (!userInteracted.current) {
                loopRef.current = setTimeout(() => runAutoScript(), LOOP_MS)
              }
            })
          }, PAUSE_MS)
        })
      }, PAUSE_MS)
    })
  }, [clearTimers, copy, pushAi, pushUser, resetConversation, schedule])

  const sendSuggestion = useCallback(
    (index: 0 | 1) => {
      userInteracted.current = true
      clearTimers()
      setFabPulse(true)
      setTimeout(() => setFabPulse(false), 600)

      const userText = copy.suggestions[index]
      const aiText = index === 0 ? copy.replyAntiAging : copy.replyOmega3

      resetConversation()

      pushAi(copy.demoAi1, () => {
        schedule(() => {
          pushUser(userText, () => {
            schedule(() => {
              pushAi(aiText)
            }, PAUSE_MS)
          })
        }, PAUSE_MS)
      })
    },
    [clearTimers, copy, pushAi, pushUser, resetConversation, schedule],
  )

  const replay = useCallback(() => {
    userInteracted.current = false
    runAutoScript()
  }, [runAutoScript])

  useEffect(() => {
    onReady?.({ replay, sendSuggestion })
  }, [onReady, replay, sendSuggestion])

  useEffect(() => {
    runAutoScript()
    return clearTimers
  }, [runAutoScript, clearTimers])

  useEffect(() => {
    scrollToBottom()
  }, [messages, typing, scrollToBottom])

  return (
    <div className="relative h-[456px] w-full">
      <div className="flex h-[408px] w-full flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-white shadow-[0_24px_64px_-16px_rgba(0,0,0,0.35)]">
        <div className="flex h-[60px] shrink-0 items-center gap-3 bg-primary-dark px-4 sm:px-5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15 text-white">
            <Bot className="h-5 w-5" strokeWidth={1.6} />
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-bold text-white">{copy.chatName}</p>
            <p className="flex items-center gap-1.5 text-[12px] text-white/70">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-bs-blink rounded-full bg-[#6ee7a0] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#6ee7a0]" />
              </span>
              {copy.chatStatus}
            </p>
          </div>
        </div>

        <div
          ref={scrollRef}
          className={cn(
            BODY_H,
            'shrink-0 overflow-x-hidden overflow-y-auto bg-white px-4 py-5 sm:px-5',
          )}
        >
          <div className="flex min-h-full flex-col justify-end gap-3">
            {messages.map((m) => (
              <MessageBubble key={m.id} msg={m} />
            ))}
            {typing && <TypingBubble label={copy.typing} />}
          </div>
        </div>

        <div className="flex h-[52px] shrink-0 flex-wrap items-center gap-2 border-t border-primary-border/40 bg-mist/30 px-4 sm:px-5">
          {copy.suggestions.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => sendSuggestion(i as 0 | 1)}
              className="rounded-full border border-primary-border bg-white px-3.5 py-1.5 text-[12.5px] font-medium text-ink/70 transition-colors hover:border-primary/40 hover:text-primary-dark"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Link
        href={copy.ctaHref}
        aria-label={copy.cta}
        className="absolute -bottom-3 -right-2 z-10 grid h-14 w-14 place-items-center rounded-full bg-primary-dark text-white shadow-lg transition-transform hover:scale-105 sm:-bottom-4 sm:-right-3"
      >
        {fabPulse && (
          <span className="pointer-events-none absolute inset-0 rounded-full border-2 border-[#6ee7a0]/60 animate-bs-ripple" />
        )}
        <span className="pointer-events-none absolute inset-0 rounded-full border border-[#6ee7a0]/30 animate-bs-ripple [animation-delay:0.6s]" />
        <MessageCircle className="relative h-6 w-6" strokeWidth={1.8} />
      </Link>
    </div>
  )
}
