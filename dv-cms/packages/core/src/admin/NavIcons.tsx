'use client'

import { useNav } from '@payloadcms/ui'
import { usePathname } from 'next/navigation.js'
import React, { useEffect } from 'react'
import { createRoot, type Root } from 'react-dom/client'

import { NavIconGraphic } from './nav-icons/NavIconGraphic.js'
import { getNavIconName, parseNavLinkId } from './nav-icons/registry.js'

const iconRoots = new WeakMap<Element, Root>()

function mountIcon(link: HTMLElement) {
  if (link.querySelector('.dv-nav-icon')) return

  const slug = parseNavLinkId(link.id)
  if (!slug) return

  const iconName = getNavIconName(slug)
  const span = document.createElement('span')
  span.className = 'dv-nav-icon'
  span.setAttribute('aria-hidden', 'true')

  const label = link.querySelector('.nav__link-label')
  if (label) link.insertBefore(span, label)
  else link.prepend(span)

  const root = createRoot(span)
  iconRoots.set(span, root)
  root.render(<NavIconGraphic name={iconName} />)
}

function decorateNavLinks() {
  document.querySelectorAll<HTMLElement>('.nav__link[id^="nav-"]').forEach(mountIcon)
}

/**
 * Gắn icon SVG vào từng mục sidebar (Payload Nav mặc định chỉ có text).
 */
export const NavIcons: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()
  const { navOpen } = useNav()

  useEffect(() => {
    decorateNavLinks()

    const navWrap = document.querySelector('.nav__wrap')
    if (!navWrap) return

    const observer = new MutationObserver(() => {
      decorateNavLinks()
    })

    observer.observe(navWrap, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [pathname, navOpen])

  useEffect(() => {
    return () => {
      document.querySelectorAll('.dv-nav-icon').forEach((span) => {
        const root = iconRoots.get(span)
        root?.unmount()
        iconRoots.delete(span)
      })
    }
  }, [])

  return <>{children}</>
}

export default NavIcons
