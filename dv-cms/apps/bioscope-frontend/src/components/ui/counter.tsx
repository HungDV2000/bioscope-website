'use client'

import { animate, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useInIframe } from '@/lib/use-in-iframe'

export function Counter({
  to,
  suffix = '',
  duration = 1.6,
}: {
  to: number
  suffix?: string
  duration?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const reduce = useReducedMotion()
  const [value, setValue] = useState(0)
  // In an iframe (CMS Better Editor preview) scroll detection doesn't fire —
  // count anyway so the number isn't stuck at 0.
  const inIframe = useInIframe()

  useEffect(() => {
    if (!inView && !inIframe) return
    const controls = animate(0, to, {
      duration: reduce ? 0 : duration,
      ease: [0.32, 0.72, 0, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, inIframe, to, duration, reduce])

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  )
}
