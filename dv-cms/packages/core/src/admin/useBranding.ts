'use client'

import { useEffect, useState } from 'react'
import type { BrandingData } from './brand-assets.js'

export function useBranding(locale = 'vi') {
  const [branding, setBranding] = useState<BrandingData | null>(null)

  useEffect(() => {
    fetch(`/api/globals/branding?depth=1&locale=${locale}`)
      .then((r) => r.json())
      .then(setBranding)
      .catch(() => {})
  }, [locale])

  return branding
}
