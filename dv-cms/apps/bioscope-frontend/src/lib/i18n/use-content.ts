'use client'

import { useMemo } from 'react'
import { getContent, type ContentModule } from '@/lib/get-content'
import { useLocale } from './context'

export function useContent(): ContentModule {
  const { locale } = useLocale()
  return useMemo(() => getContent(locale), [locale])
}
