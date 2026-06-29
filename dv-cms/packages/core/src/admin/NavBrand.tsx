'use client'

import NextLink from 'next/link'
import React from 'react'
import { useConfig, useNav, useWindowInfo, XIcon } from '@payloadcms/ui'

import { resolveLogoUrl } from './brand-assets.js'
import { useBranding } from './useBranding.js'

/** Logo sidebar — click về dashboard; nút đóng trên mobile drawer. */
export const NavBrand: React.FC = () => {
  const { config } = useConfig()
  const { navOpen, setNavOpen } = useNav()
  const {
    breakpoints: { l: largeBreak },
  } = useWindowInfo()
  const branding = useBranding()
  const logoUrl = resolveLogoUrl(branding)
  const name = branding?.brandName ?? 'Bioscope'
  const adminHome = config.routes.admin || '/admin'
  const isDrawer = largeBreak === true

  return (
    <div className="dv-nav-brand">
      <NextLink href={adminHome} className="dv-nav-brand__link" aria-label={name} prefetch={false}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt="" className="dv-nav-brand__logo" draggable={false} />
      </NextLink>
      {isDrawer && navOpen ? (
        <button
          type="button"
          className="dv-nav-brand__close"
          aria-label="Đóng menu"
          onClick={() => setNavOpen(false)}
        >
          <XIcon />
        </button>
      ) : null}
    </div>
  )
}

export default NavBrand
