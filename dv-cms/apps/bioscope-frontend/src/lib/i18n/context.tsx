'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { getContent, type ContentModule } from '@/lib/get-content'
import type { Locale } from './config'
import type { Messages } from './messages'

type LocaleContextValue = {
  locale: Locale
  t: Messages
  content: ContentModule
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale
  messages: Messages
  children: ReactNode
}) {
  const content = useMemo(() => getContent(locale), [locale])
  return <LocaleContext.Provider value={{ locale, t: messages, content }}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}
