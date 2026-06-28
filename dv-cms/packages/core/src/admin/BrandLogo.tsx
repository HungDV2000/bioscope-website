'use client'

import React, { useEffect, useState } from 'react'

type Branding = { brandName?: string; logo?: { url?: string } | null }

/** Logo on the login screen + nav. Reads the Branding global at runtime. */
export const BrandLogo: React.FC = () => {
  const [b, setB] = useState<Branding | null>(null)

  useEffect(() => {
    fetch('/api/globals/branding?depth=1')
      .then((r) => r.json())
      .then(setB)
      .catch(() => {})
  }, [])

  if (b?.logo?.url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={b.logo.url} alt={b.brandName ?? 'Logo'} style={{ maxHeight: 42, width: 'auto' }} />
    )
  }
  return (
    <span style={{ fontWeight: 800, fontSize: 24, color: 'var(--dv-primary, #0E6147)' }}>
      {b?.brandName ?? 'Bioscope'}
    </span>
  )
}

export default BrandLogo
