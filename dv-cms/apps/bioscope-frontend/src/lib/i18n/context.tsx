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

// Deep overlay: override values win when present; walks the base shape so the
// result always matches it (arrays overlaid item-by-item).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function overlay(base: any, over: any): any {
  if (over == null) return base
  if (Array.isArray(base)) {
    if (!Array.isArray(over) || over.length === 0) return base
    return over.map((o, i) => overlay(base[i] ?? base[0], o))
  }
  if (base && typeof base === 'object') {
    const out: Record<string, unknown> = { ...base }
    for (const k of Object.keys(base)) {
      if (over && typeof over === 'object' && k in over) out[k] = overlay(base[k], over[k])
    }
    return out
  }
  return over ?? base
}

export function LocaleProvider({
  locale,
  messages,
  contentOverride,
  children,
}: {
  locale: Locale
  messages: Messages
  /** Deep-merge onto the static content (e.g. CMS-edited ABOUT_* arrays). */
  contentOverride?: Partial<ContentModule>
  children: ReactNode
}) {
  const content = useMemo(() => {
    const base = getContent(locale)
    return contentOverride ? (overlay(base, contentOverride) as ContentModule) : base
  }, [locale, contentOverride])
  return <LocaleContext.Provider value={{ locale, t: messages, content }}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}
