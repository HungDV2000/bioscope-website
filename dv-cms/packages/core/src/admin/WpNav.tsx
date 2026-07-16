'use client'

/**
 * WpNav — WordPress-style admin sidebar. Replaces Payload's default Nav with a
 * consolidated, ordered set of parent groups. Parents show icon + label only;
 * hovering a collapsed parent reveals its children in a flyout, and clicking a
 * parent toggles the children inline (expanded state persisted). Icons + access
 * filtering are handled here so we no longer depend on DOM-injected icons.
 */

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useConfig, useAuth, useNav } from '@payloadcms/ui'
import { NavIconGraphic } from './nav-icons/NavIconGraphic.js'
import { getNavIconName } from './nav-icons/registry.js'
import type { NavIconName } from './nav-icons/types.js'
import { NavBrand } from './NavBrand.js'

type Lang = 'en' | 'vi'
type Entity = { slug: string; type: 'collection' | 'global'; label: string; icon: NavIconName }

// Consolidated groups (order = sidebar order). Any entity not listed lands in
// the trailing "Khác / Other" group so nothing is ever hidden by accident.
const GROUPS: { key: string; icon: NavIconName; label: Record<Lang, string>; slugs: string[] }[] = [
  { key: 'content', icon: 'file', label: { en: 'Content', vi: 'Nội dung' }, slugs: ['pages', 'posts', 'categories', 'tags', 'forms', 'form-submissions'] },
  { key: 'bioscope', icon: 'flask', label: { en: 'Bioscope', vi: 'Bioscope' }, slugs: ['ingredients', 'ingredient-categories', 'technologies', 'services', 'certifications', 'case-studies', 'faqs', 'partners', 'product-categories', 'products'] },
  { key: 'b2b', icon: 'user-circle', label: { en: 'B2B portal', vi: 'Cổng B2B' }, slugs: ['members', 'gated-documents'] },
  { key: 'seo', icon: 'newspaper', label: { en: 'SEO & Marketing', vi: 'SEO & Marketing' }, slugs: ['seo-settings', 'redirects', 'image-settings', 'bioscope-ai'] },
  { key: 'security', icon: 'shield', label: { en: 'Security', vi: 'Bảo mật' }, slugs: ['security-settings', 'blocked-ips', 'security-events', 'consent-settings', 'consent-log'] },
  { key: 'custom', icon: 'layers', label: { en: 'Custom types', vi: 'Loại tùy chỉnh' }, slugs: ['ct-definitions', 'tax-definitions', 'field-groups'] },
  { key: 'ops', icon: 'cpu', label: { en: 'Operations', vi: 'Vận hành' }, slugs: ['ai-generate-jobs', 'drive-sync-jobs', 'cms-sync-runs'] },
  { key: 'system', icon: 'settings', label: { en: 'System', vi: 'Hệ thống' }, slugs: ['users', 'staff-roles', 'media', 'site-settings', 'navigation', 'branding', 'languages', 'better-editor-settings'] },
]

function labelOf(entity: { slug: string; labels?: unknown; label?: unknown }, lang: Lang): string {
  const pick = (v: unknown): string | undefined => {
    if (!v) return undefined
    if (typeof v === 'string') return v
    if (typeof v === 'object') {
      const o = v as Record<string, unknown>
      if (typeof o[lang] === 'string') return o[lang] as string
      if (typeof o.en === 'string') return o.en as string
    }
    return undefined
  }
  const plural = (entity.labels as { plural?: unknown })?.plural
  return pick(plural) ?? pick(entity.label) ?? pick(entity.labels) ?? entity.slug
}

const LS_KEY = 'dv-wpnav-open'

// Internal Payload collections + legacy globals that must never show in the nav.
const HIDDEN = new Set(['home'])
const isHidden = (slug: string) => slug.startsWith('payload-') || HIDDEN.has(slug)

const WPNAV_CSS = `
.dv-wpnav { display: flex; flex-direction: column; gap: 2px; padding: 8px 10px 24px; }
.dv-wpnav__group { position: relative; }
.dv-wpnav__parent {
  display: flex; align-items: center; gap: 10px; width: 100%;
  padding: 9px 10px; border: 0; background: transparent; cursor: pointer;
  border-radius: 8px; color: var(--theme-elevation-800); font-size: 13.5px; font-weight: 600;
  text-align: left; transition: background .12s;
}
.dv-wpnav__parent:hover { background: var(--theme-elevation-100); }
.dv-wpnav__parent.is-active { color: var(--theme-success-500, #008e4d); }
.dv-wpnav__icon, .dv-wpnav__cicon { display: inline-flex; width: 18px; height: 18px; flex-shrink: 0; }
.dv-wpnav__icon svg, .dv-wpnav__cicon svg { width: 100%; height: 100%; }
.dv-wpnav__label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dv-wpnav__chev { transition: transform .15s; opacity: .5; font-size: 16px; line-height: 1; }
.dv-wpnav__chev.is-open { transform: rotate(90deg); }
.dv-wpnav__children { display: flex; flex-direction: column; gap: 1px; padding: 2px 0 6px 4px; }
.dv-wpnav__child {
  display: flex; align-items: center; gap: 9px; padding: 7px 10px 7px 22px;
  border-radius: 7px; color: var(--theme-elevation-650); font-size: 13px; text-decoration: none;
  transition: background .12s, color .12s;
}
.dv-wpnav__child:hover { background: var(--theme-elevation-100); color: var(--theme-elevation-900); }
.dv-wpnav__child.is-active { background: var(--theme-elevation-150); color: var(--theme-success-500, #008e4d); font-weight: 600; }
.dv-wpnav__child .dv-wpnav__cicon { width: 15px; height: 15px; opacity: .8; }
/* Hover flyout (collapsed parents) */
.dv-wpnav__flyout {
  position: absolute; left: calc(100% - 2px); top: 0; z-index: 60; min-width: 220px;
  background: var(--theme-elevation-0); border: 1px solid var(--theme-elevation-150);
  border-radius: 10px; box-shadow: 0 12px 32px rgba(0,0,0,.18); padding: 6px; margin-left: 6px;
}
.dv-wpnav__flyout-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: var(--theme-elevation-500); padding: 6px 10px 4px; }
.dv-wpnav__flyout .dv-wpnav__child { padding-left: 12px; }
`


export const WpNav: React.FC = () => {
  const { config } = useConfig()
  const auth = useAuth() as unknown as { permissions?: { collections?: Record<string, { read?: { permission?: boolean } | boolean }>; globals?: Record<string, { read?: { permission?: boolean } | boolean }> } }
  const pathname = usePathname()
  const { setNavOpen } = useNav() as unknown as { setNavOpen?: (v: boolean) => void }

  const adminRoute = (config as { routes?: { admin?: string } })?.routes?.admin ?? '/admin'
  const lang: Lang = (config as { i18n?: { fallbackLanguage?: string } })?.i18n?.fallbackLanguage === 'vi' ? 'vi' : 'vi'

  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [hovered, setHovered] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) setOpen(JSON.parse(raw))
    } catch {
      /* ignore */
    }
  }, [])
  const toggle = (key: string) => {
    setOpen((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }

  // Build the visible entity list (permission-filtered), keyed by slug.
  const bySlug = useMemo(() => {
    const canRead = (kind: 'collections' | 'globals', slug: string): boolean => {
      const p = auth.permissions?.[kind]?.[slug]?.read
      if (p === undefined) return true // no permissions info → don't hide
      return typeof p === 'boolean' ? p : Boolean(p?.permission)
    }
    const map = new Map<string, Entity>()
    for (const c of (config.collections ?? []) as Array<{ slug: string; labels?: unknown; admin?: { hidden?: unknown } }>) {
      if (c.admin?.hidden === true || isHidden(c.slug)) continue
      if (!canRead('collections', c.slug)) continue
      map.set(c.slug, { slug: c.slug, type: 'collection', label: labelOf(c, lang), icon: getNavIconName(c.slug) })
    }
    for (const g of (config.globals ?? []) as Array<{ slug: string; label?: unknown; admin?: { hidden?: unknown } }>) {
      if (g.admin?.hidden === true || isHidden(g.slug)) continue
      if (!canRead('globals', g.slug)) continue
      map.set(g.slug, { slug: g.slug, type: 'global', label: labelOf(g, lang), icon: getNavIconName(g.slug) })
    }
    return map
  }, [config, auth.permissions, lang])

  // Assign entities to groups; leftovers go to a trailing "Other" group.
  const groups = useMemo(() => {
    const used = new Set<string>()
    const result = GROUPS.map((grp) => {
      const items = grp.slugs.map((s) => bySlug.get(s)).filter(Boolean) as Entity[]
      items.forEach((it) => used.add(it.slug))
      return { ...grp, items }
    }).filter((g) => g.items.length)
    const others = [...bySlug.values()].filter((e) => !used.has(e.slug))
    if (others.length) result.push({ key: 'other', icon: 'default' as NavIconName, label: { en: 'Other', vi: 'Khác' }, slugs: [], items: others })
    return result
  }, [bySlug])

  const hrefOf = (e: Entity) => `${adminRoute}/${e.type === 'global' ? 'globals' : 'collections'}/${e.slug}`
  const isActive = (e: Entity) => pathname?.includes(`/${e.type === 'global' ? 'globals' : 'collections'}/${e.slug}`)
  const groupActive = (items: Entity[]) => items.some(isActive)

  return (
    <nav className="dv-wpnav" aria-label="Admin">
      <style>{WPNAV_CSS}</style>
      <NavBrand />
      {groups.map((grp) => {
        const expanded = Boolean(open[grp.key]) || groupActive(grp.items)
        const showFlyout = hovered === grp.key && !expanded
        return (
          <div
            key={grp.key}
            className="dv-wpnav__group"
            onMouseEnter={() => setHovered(grp.key)}
            onMouseLeave={() => setHovered((h) => (h === grp.key ? null : h))}
          >
            <button
              type="button"
              className={`dv-wpnav__parent${groupActive(grp.items) ? ' is-active' : ''}`}
              onClick={() => toggle(grp.key)}
              aria-expanded={expanded}
            >
              <span className="dv-wpnav__icon" aria-hidden>
                <NavIconGraphic name={grp.icon} />
              </span>
              <span className="dv-wpnav__label">{grp.label[lang]}</span>
              <span className={`dv-wpnav__chev${expanded ? ' is-open' : ''}`} aria-hidden>
                ›
              </span>
            </button>

            {/* Inline (expanded) children */}
            {expanded && (
              <div className="dv-wpnav__children">
                {grp.items.map((e) => (
                  <Link
                    key={e.slug}
                    href={hrefOf(e)}
                    className={`dv-wpnav__child${isActive(e) ? ' is-active' : ''}`}
                    onClick={() => setNavOpen?.(false)}
                  >
                    <span className="dv-wpnav__cicon" aria-hidden>
                      <NavIconGraphic name={e.icon} />
                    </span>
                    {e.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Hover flyout when collapsed */}
            {showFlyout && (
              <div className="dv-wpnav__flyout" role="menu">
                <div className="dv-wpnav__flyout-title">{grp.label[lang]}</div>
                {grp.items.map((e) => (
                  <Link
                    key={e.slug}
                    href={hrefOf(e)}
                    className={`dv-wpnav__child${isActive(e) ? ' is-active' : ''}`}
                    role="menuitem"
                    onClick={() => setNavOpen?.(false)}
                  >
                    <span className="dv-wpnav__cicon" aria-hidden>
                      <NavIconGraphic name={e.icon} />
                    </span>
                    {e.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}

export default WpNav
