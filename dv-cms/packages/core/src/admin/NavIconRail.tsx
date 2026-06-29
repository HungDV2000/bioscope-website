'use client'

import { useNav, useWindowInfo } from '@payloadcms/ui'
import React, { useEffect } from 'react'

/**
 * Desktop thu gọn: giữ sidebar dạng icon rail (Payload mặc định ẩn hẳn nav + inert).
 */
export const NavIconRail: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { navOpen } = useNav()
  const {
    breakpoints: { l: largeBreak },
  } = useWindowInfo()

  useEffect(() => {
    const nav = document.querySelector<HTMLElement>('aside.nav')
    const template = document.querySelector<HTMLElement>('.template-default')
    if (!nav) return

    const isDesktopWide = largeBreak === false

    if (isDesktopWide && !navOpen) {
      nav.removeAttribute('inert')
      nav.classList.add('dv-nav--icon-rail')
      template?.classList.add('dv-template--nav-collapsed')

      nav.querySelectorAll<HTMLElement>('.nav__link').forEach((link) => {
        const label = link.querySelector('.nav__link-label')?.textContent?.trim()
        if (label) link.setAttribute('title', label)
      })
    } else {
      nav.classList.remove('dv-nav--icon-rail')
      template?.classList.remove('dv-template--nav-collapsed')
      if (!navOpen) {
        nav.setAttribute('inert', '')
      } else {
        nav.removeAttribute('inert')
      }
    }
  }, [navOpen, largeBreak])

  return <>{children}</>
}

export default NavIconRail
