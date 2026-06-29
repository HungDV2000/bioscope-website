'use client'

import React, { useEffect, useRef } from 'react'
import { useLocale, useTranslation } from '@payloadcms/ui'

const ADMIN_LANGS = new Set(['en', 'vi'])

/**
 * Đồng bộ ngôn ngữ giao diện admin (i18n) với locale nội dung đang chọn trên header.
 * Payload tách hai khái niệm: locale nội dung ≠ ngôn ngữ UI — người dùng thường chỉ đổi
 * dropdown "Ngôn ngữ" trên header và kỳ vọng toàn bộ admin chuyển theo.
 */
export const AdminLocaleSync: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const locale = useLocale()
  const { i18n, switchLanguage } = useTranslation()
  const syncing = useRef(false)

  useEffect(() => {
    const code = locale?.code
    if (!code || !ADMIN_LANGS.has(code) || !switchLanguage) return
    if (i18n.language === code || syncing.current) return

    // Đợi hydration xong — tránh router.refresh() trong lúc React hydrate (Next 16.2+).
    const timer = window.setTimeout(() => {
      if (syncing.current || i18n.language === code) return
      syncing.current = true
      void switchLanguage(code).finally(() => {
        syncing.current = false
      })
    }, 0)

    return () => window.clearTimeout(timer)
  }, [locale?.code, i18n.language, switchLanguage])

  return <>{children}</>
}

export default AdminLocaleSync
