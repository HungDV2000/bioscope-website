'use client'

import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

const EASE = [0.32, 0.72, 0, 1] as const

export function Reveal({
  children,
  delay = 0,
  className,
  y = 28,
  immediate = false,
}: {
  children: ReactNode
  delay?: number
  className?: string
  y?: number
  /** Animate on mount (for above-the-fold content) instead of on scroll. */
  immediate?: boolean
}) {
  const reduce = useReducedMotion()
  const hidden = reduce ? { opacity: 0 } : { opacity: 0, y, filter: 'blur(6px)' }
  const shown = reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' }
  const transition = { duration: reduce ? 0.3 : 0.8, ease: EASE, delay: reduce ? 0 : delay }

  if (immediate) {
    return (
      <motion.div className={className} initial={hidden} animate={shown} transition={transition}>
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      className={className}
      initial={hidden}
      whileInView={shown}
      viewport={{ once: true, margin: '-80px' }}
      transition={transition}
    >
      {children}
    </motion.div>
  )
}
