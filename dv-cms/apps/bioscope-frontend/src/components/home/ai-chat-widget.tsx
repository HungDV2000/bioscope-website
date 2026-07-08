'use client'

import { useEffect, useRef, useState } from 'react'
import { Bot, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Messages } from '@/lib/i18n/messages'

type AiChatCopy = Messages['home']['aiChat']

function Bubble({ text, ai }: { text: string; ai?: boolean }) {
  return (
    <div className={cn('flex', ai ? 'justify-start' : 'justify-end')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed',
          ai ? 'rounded-bl-md bg-primary-tint text-ink/85' : 'rounded-br-md bg-primary-dark text-white',
        )}
      >
        {text}
      </div>
    </div>
  )
}

/**
 * Static, view-only chat widget pinned to the bottom-right corner. Appears once
 * the AI promo section is scrolled past; shows the full sample conversation at a
 * fixed size (no typing animation, not interactive) — purely a demo.
 */
export function AiChatFloatingWidget({ copy }: { copy: AiChatCopy }) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const el = sentinelRef.current
      if (!el) return
      // Show once the section's end has scrolled up past 60% of the viewport
      // (works even when the content below is too short to push it fully off-screen).
      setShow(el.getBoundingClientRect().bottom < window.innerHeight * 0.6)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <>
      <div ref={sentinelRef} aria-hidden className="h-0" />

      {show && (
        <div className="pointer-events-none fixed bottom-5 right-5 z-40 w-[min(92vw,360px)] animate-bs-dock-in">
          <div className="overflow-hidden rounded-[1.5rem] border border-black/5 bg-white shadow-2xl">
            {/* header */}
            <div className="flex items-center gap-3 bg-primary-dark px-4 py-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/15 text-white">
                <Bot className="h-5 w-5" strokeWidth={1.6} />
              </span>
              <div className="min-w-0">
                <p className="text-[14px] font-bold text-white">{copy.chatName}</p>
                <p className="flex items-center gap-1.5 text-[11.5px] text-white/70">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-bs-blink rounded-full bg-[#6ee7a0] opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#6ee7a0]" />
                  </span>
                  {copy.chatStatus}
                </p>
              </div>
            </div>

            {/* body — full sample conversation, static */}
            <div className="space-y-2.5 bg-white px-4 py-4">
              <Bubble ai text={copy.demoAi1} />
              <Bubble text={copy.demoUser} />
              <Bubble ai text={copy.demoAi2} />
            </div>

            {/* suggestions (decorative) */}
            <div className="flex flex-wrap items-center gap-2 border-t border-primary-border/40 bg-mist/30 px-4 py-3">
              {copy.suggestions.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-primary-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink/70"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* floating chat button (decorative) */}
          <div className="mt-3 flex justify-end">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-primary-dark text-white shadow-lg">
              <MessageCircle className="h-6 w-6" strokeWidth={1.8} />
            </span>
          </div>
        </div>
      )}
    </>
  )
}
