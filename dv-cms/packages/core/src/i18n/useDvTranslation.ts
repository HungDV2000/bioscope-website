'use client'

import { useCallback, useEffect, useState } from 'react'

import { dvTranslations } from './dv-translations.js'

type AdminLang = keyof typeof dvTranslations

const readLang = (): AdminLang => {
  if (typeof document === 'undefined') return 'en'
  const code = document.documentElement.lang?.slice(0, 2)
  return code === 'vi' ? 'vi' : 'en'
}

const lookup = (lang: AdminLang, key: string): string => {
  const path = key.replace(/^dv:/, '').split('.')
  let node: unknown = dvTranslations[lang].dv
  for (const part of path) {
    if (!node || typeof node !== 'object') return key
    node = (node as Record<string, unknown>)[part]
  }
  return typeof node === 'string' ? node : key
}

/** Resolves `dv:*` strings from the active Payload admin UI language (`<html lang>`). */
export const useDvTranslation = () => {
  const [lang, setLang] = useState<AdminLang>('en')

  useEffect(() => {
    setLang(readLang())
    const el = document.documentElement
    const observer = new MutationObserver(() => setLang(readLang()))
    observer.observe(el, { attributes: true, attributeFilter: ['lang'] })
    return () => observer.disconnect()
  }, [])

  const t = useCallback((key: string) => lookup(lang, key), [lang])
  return { t, lang }
}

/** Non-hook helper when only `t` from `useTranslation` is available. */
export const dvT = (translate: (key: string) => string, key: string): string => translate(key)
