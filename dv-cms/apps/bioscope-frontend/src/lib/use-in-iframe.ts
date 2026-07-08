'use client'

import { useEffect, useState } from 'react'

/**
 * True when the app runs inside an iframe (e.g. the CMS Better Editor preview),
 * where scroll-driven animations don't fire so content must render immediately.
 * Starts false (matches SSR) then flips after mount — no hydration mismatch.
 */
export function useInIframe() {
  const [inIframe, setInIframe] = useState(false)
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      if (window.self !== window.top) setInIframe(true)
    } catch {
      setInIframe(true) // cross-origin embed → treat as iframe
    }
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */
  return inIframe
}
