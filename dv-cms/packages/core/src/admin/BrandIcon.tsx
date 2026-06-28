'use client'

import React, { useEffect, useState } from 'react'

type Branding = { brandName?: string; logo?: { url?: string } | null }

/** Compact icon used in the admin nav header. */
export const BrandIcon: React.FC = () => {
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
      <img src={b.logo.url} alt={b.brandName ?? 'Logo'} style={{ height: 28, width: 'auto' }} />
    )
  }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        borderRadius: 8,
        background: 'var(--dv-primary, #0E6147)',
        color: '#fff',
        fontWeight: 800,
        fontSize: 15,
      }}
    >
      {(b?.brandName ?? 'B').charAt(0)}
    </span>
  )
}

export default BrandIcon
