'use client'

import React from 'react'
import { resolveLogoUrl } from './brand-assets.js'
import { useBranding } from './useBranding.js'

/** Logo on the login screen + nav. Uses Branding global or default Bioscope logo. */
export const BrandLogo: React.FC = () => {
  const branding = useBranding()
  const logoUrl = resolveLogoUrl(branding)
  const name = branding?.brandName ?? 'Bioscope'

  return (
    <div className="dv-login__logo">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logoUrl} alt={name} className="dv-login__logo-img" />
    </div>
  )
}

export default BrandLogo
