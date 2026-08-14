'use client'

import { LogIn, UserPlus } from 'lucide-react'
import { openAuthModal } from '@/lib/member/session-events'

/**
 * Màn hình mời đăng nhập trong khung chat: hiện lời chào ② (admin soạn) kèm hai
 * nút. Form thật nằm ở POPUP dùng chung toàn site — bấm nút là mở popup, không
 * điều hướng và cũng không nhét form vào khung chat chật hẹp.
 */
export type AuthStrings = {
  loginTitle: string
  loginDesc: string
  loginBtn: string
  registerBtn: string
}

export function ChatAuthPanel({
  t,
  greetingHtml,
}: {
  t: AuthStrings
  greetingHtml?: string
}) {
  return (
    <div className="flex flex-1 flex-col justify-center gap-4 overflow-y-auto bg-mist/30 px-6 py-8 text-center">
      <LogIn className="mx-auto h-9 w-9 text-primary/70" />
      <div>
        <p className="text-[15.5px] font-bold text-ink">{t.loginTitle}</p>
        {greetingHtml ? (
          <div
            className="chat-greeting mt-2 text-[13.5px] leading-relaxed text-ink/65"
            dangerouslySetInnerHTML={{ __html: greetingHtml }}
          />
        ) : (
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink/65">{t.loginDesc}</p>
        )}
      </div>

      <div className="space-y-2.5">
        <button
          type="button"
          onClick={() => openAuthModal('login')}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-[14px] font-semibold text-white hover:bg-primary-dark"
        >
          <LogIn className="h-4 w-4" />
          {t.loginBtn}
        </button>
        <button
          type="button"
          onClick={() => openAuthModal('register')}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-primary-border bg-white px-6 py-2.5 text-[14px] font-semibold text-primary hover:bg-primary-tint"
        >
          <UserPlus className="h-4 w-4" />
          {t.registerBtn}
        </button>
      </div>
    </div>
  )
}
