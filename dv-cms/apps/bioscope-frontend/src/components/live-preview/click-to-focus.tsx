'use client'

/**
 * Click-to-focus for Live Preview. When the site runs inside the admin's Live
 * Preview iframe, clicking a block (any element carrying data-better-editor-id)
 * posts its block id to the parent admin, which scrolls to + highlights the
 * matching block field. Also draws a hover outline so blocks look editable.
 * Inert during normal browsing.
 */

import { useEffect } from 'react'

export function ClickToFocus() {
  useEffect(() => {
    if (typeof window === 'undefined' || window.parent === window) return

    const SEL = '[data-better-editor-id]'
    let last: HTMLElement | null = null

    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement)?.closest?.(SEL) as HTMLElement | null
      const id = el?.getAttribute('data-better-editor-id')
      if (id) window.parent.postMessage({ type: 'dv-focus-block', blockId: id }, '*')
    }
    const onOver = (e: MouseEvent) => {
      const el = (e.target as HTMLElement)?.closest?.(SEL) as HTMLElement | null
      if (el === last) return
      if (last) last.style.outline = ''
      last = el
      if (el) {
        el.style.outline = '2px solid rgba(0,142,77,0.6)'
        el.style.outlineOffset = '-2px'
        el.style.cursor = 'pointer'
      }
    }
    const onOut = () => {
      if (last) last.style.outline = ''
      last = null
    }

    document.addEventListener('click', onClick, true)
    document.addEventListener('mouseover', onOver, true)
    document.addEventListener('mouseleave', onOut, true)
    return () => {
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('mouseover', onOver, true)
      document.removeEventListener('mouseleave', onOut, true)
      if (last) last.style.outline = ''
    }
  }, [])

  return null
}
