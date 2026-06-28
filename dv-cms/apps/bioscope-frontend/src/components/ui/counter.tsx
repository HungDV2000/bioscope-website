'use client'

import { animate, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

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

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, to, {
      duration: reduce ? 0 : duration,
      ease: [0.32, 0.72, 0, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, to, duration, reduce])

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  )
}
