'use client'

import { useNav, useWindowInfo } from '@payloadcms/ui'
import React, { useEffect } from 'react'

/**
 * Mobile/tablet drawer: backdrop click + khóa scroll body.
 */
export const NavMobileDrawer: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { navOpen, setNavOpen } = useNav()
  const {
    breakpoints: { l: largeBreak },
  } = useWindowInfo()

  const isDrawer = largeBreak === true

  useEffect(() => {
    if (!isDrawer || !navOpen) return

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setNavOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isDrawer, navOpen, setNavOpen])

  return (
    <>
      {children}
      {isDrawer && navOpen ? (
        <button
          type="button"
          className="dv-nav-backdrop"
          aria-label="Đóng menu"
          onClick={() => setNavOpen(false)}
        />
      ) : null}
    </>
  )
}

export default NavMobileDrawer
