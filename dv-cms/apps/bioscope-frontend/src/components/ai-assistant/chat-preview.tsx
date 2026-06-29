'use client'

import { AiChatDemo } from '@/components/home/ai-chat-demo'
import type { Messages } from '@/lib/i18n/messages'

export function AiChatPreview({ copy }: { copy: Messages['home']['aiChat'] }) {
  return (
    <div className="mx-auto w-full max-w-[420px] lg:max-w-none">
      <AiChatDemo copy={copy} />
    </div>
  )
}
