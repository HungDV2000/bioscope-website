'use client'

import React from 'react'
import { resolveLogoUrl } from './brand-assets.js'
import { useBranding } from './useBranding.js'

/** Compact icon used in the admin nav header. */
export const BrandIcon: React.FC = () => {
  const branding = useBranding()
  const logoUrl = resolveLogoUrl(branding)
  const name = branding?.brandName ?? 'Bioscope'

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={logoUrl} alt={name} style={{ height: 28, width: 'auto' }} />
  )
}

export default BrandIcon
