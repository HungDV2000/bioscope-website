'use client'

/**
 * WpNav — WordPress/Hugeicons-style admin sidebar.
 *
 * Expanded: brand + quick actions (add ingredient/post/page) + a Dashboard link
 * + consolidated parent groups whose children expand inline (click) or appear in
 * a hover flyout.
 *
 * Collapsed (icon rail): brand badge + the CHILD icons of every group, stacked
 * and separated by dividers; hovering a group's icons opens a flyout with labels.
 *
 * Icons are rendered directly and access is filtered via permissions.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useConfig, useAuth, useNav, useWindowInfo } from '@payloadcms/ui'
import { NavIconGraphic } from './nav-icons/NavIconGraphic.js'
import { getNavIconName } from './nav-icons/registry.js'
import type { NavIconName } from './nav-icons/types.js'
import { NavBrand } from './NavBrand.js'

type Lang = 'en' | 'vi'
type Entity = { slug: string; type: 'collection' | 'global'; label: string; icon: NavIconName }
type Group = { key: string; icon: NavIconName; label: Record<Lang, string>; items: Entity[] }

const GROUP_DEFS: { key: string; icon: NavIconName; label: Record<Lang, string>; slugs: string[] }[] = [
  { key: 'content', icon: 'file', label: { en: 'Content', vi: 'Nội dung' }, slugs: ['pages', 'posts', 'categories', 'tags', 'forms', 'form-submissions'] },
  { key: 'bioscope', icon: 'flask', label: { en: 'Bioscope', vi: 'Bioscope' }, slugs: ['ingredients', 'ingredient-categories', 'technologies', 'services', 'certifications', 'case-studies', 'faqs', 'partners', 'product-categories', 'products'] },
  { key: 'b2b', icon: 'user-circle', label: { en: 'B2B portal', vi: 'Cổng B2B' }, slugs: ['members', 'gated-documents'] },
  { key: 'seo', icon: 'newspaper', label: { en: 'SEO & Marketing', vi: 'SEO & Marketing' }, slugs: ['seo-settings', 'redirects', 'image-settings', 'bioscope-ai'] },
  { key: 'security', icon: 'shield', label: { en: 'Security', vi: 'Bảo mật' }, slugs: ['security-settings', 'blocked-ips', 'security-events', 'consent-settings', 'consent-log'] },
  { key: 'custom', icon: 'layers', label: { en: 'Custom types', vi: 'Loại tùy chỉnh' }, slugs: ['ct-definitions', 'tax-definitions', 'field-groups'] },
  { key: 'ops', icon: 'cpu', label: { en: 'Operations', vi: 'Vận hành' }, slugs: ['ai-generate-jobs', 'drive-sync-jobs', 'cms-sync-runs'] },
  { key: 'system', icon: 'settings', label: { en: 'System', vi: 'Hệ thống' }, slugs: ['users', 'staff-roles', 'media', 'site-settings', 'navigation', 'branding', 'languages', 'better-editor-settings'] },
]

const HIDDEN = new Set(['home'])
const isHidden = (slug: string) => slug.startsWith('payload-') || HIDDEN.has(slug)
const LS_KEY = 'dv-wpnav-open'

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

export const WpNav: React.FC = () => {
  const { config } = useConfig()
  const auth = useAuth() as unknown as { permissions?: { collections?: Record<string, { read?: { permission?: boolean } | boolean }>; globals?: Record<string, { read?: { permission?: boolean } | boolean }> } }
  const pathname = usePathname()
  const { navOpen, setNavOpen } = useNav() as unknown as { navOpen: boolean; setNavOpen?: (v: boolean) => void }
  const { breakpoints } = useWindowInfo() as unknown as { breakpoints: { l?: boolean } }

  const adminRoute = (config as { routes?: { admin?: string } })?.routes?.admin ?? '/admin'
  const lang: Lang = 'vi'
  const isDesktop = breakpoints?.l === false
  const rail = isDesktop && !navOpen

  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [flyout, setFlyout] = useState<{ key: string; top: number; left: number } | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) setOpen(JSON.parse(raw))
    } catch {
      /* ignore */
    }
  }, [])
  const toggle = (key: string) =>
    setOpen((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })

  // Narrow the actual aside width when in rail mode.
  useEffect(() => {
    const tpl = document.querySelector<HTMLElement>('.template-default')
    if (!tpl) return
    if (rail) tpl.style.setProperty('--nav-width', '4.25rem')
    else tpl.style.removeProperty('--nav-width')
    return () => {
      tpl.style.removeProperty('--nav-width')
    }
  }, [rail])

  const bySlug = useMemo(() => {
    const canRead = (kind: 'collections' | 'globals', slug: string): boolean => {
      const p = auth.permissions?.[kind]?.[slug]?.read
      if (p === undefined) return true
      return typeof p === 'boolean' ? p : Boolean(p?.permission)
    }
    const map = new Map<string, Entity>()
    for (const c of (config.collections ?? []) as Array<{ slug: string; labels?: unknown; admin?: { hidden?: unknown } }>) {
      if (c.admin?.hidden === true || isHidden(c.slug) || !canRead('collections', c.slug)) continue
      map.set(c.slug, { slug: c.slug, type: 'collection', label: labelOf(c, lang), icon: getNavIconName(c.slug) })
    }
    for (const g of (config.globals ?? []) as Array<{ slug: string; label?: unknown; admin?: { hidden?: unknown } }>) {
      if (g.admin?.hidden === true || isHidden(g.slug) || !canRead('globals', g.slug)) continue
      map.set(g.slug, { slug: g.slug, type: 'global', label: labelOf(g, lang), icon: getNavIconName(g.slug) })
    }
    return map
  }, [config, auth.permissions])

  const groups: Group[] = useMemo(() => {
    const used = new Set<string>()
    const res = GROUP_DEFS.map((g) => {
      const items = g.slugs.map((s) => bySlug.get(s)).filter(Boolean) as Entity[]
      items.forEach((it) => used.add(it.slug))
      return { key: g.key, icon: g.icon, label: g.label, items }
    }).filter((g) => g.items.length)
    const others = [...bySlug.values()].filter((e) => !used.has(e.slug))
    if (others.length) res.push({ key: 'other', icon: 'default', label: { en: 'Other', vi: 'Khác' }, items: others })
    return res
  }, [bySlug])

  const hrefOf = (e: Entity) => `${adminRoute}/${e.type === 'global' ? 'globals' : 'collections'}/${e.slug}`
  const isActive = (e: Entity) => pathname?.includes(`/${e.type === 'global' ? 'globals' : 'collections'}/${e.slug}`)
  const groupActive = (items: Entity[]) => items.some(isActive)
  const onDashboard = pathname === adminRoute || pathname === `${adminRoute}/`

  const openFlyout = useCallback((key: string, el: HTMLElement) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    const r = el.getBoundingClientRect()
    setFlyout({ key, top: Math.max(8, r.top), left: r.right + 6 })
  }, [])
  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setFlyout(null), 140)
  }, [])
  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }, [])

  const closeMobile = () => {
    if (!isDesktop) setNavOpen?.(false)
  }

  const flyoutGroup = flyout ? groups.find((g) => g.key === flyout.key) : null

  const quickActions = [
    { slug: 'ingredients', label: lang === 'vi' ? 'Nguyên liệu' : 'Ingredient', icon: 'flask' as NavIconName },
    { slug: 'posts', label: lang === 'vi' ? 'Bài viết' : 'Post', icon: 'newspaper' as NavIconName },
    { slug: 'pages', label: lang === 'vi' ? 'Trang' : 'Page', icon: 'file' as NavIconName },
  ].filter((a) => bySlug.has(a.slug))

  return (
    <nav className={`dv-wpnav${rail ? ' dv-wpnav--rail' : ''}`} aria-label="Admin">
      <style>{WPNAV_CSS}</style>
      {/* Hide the brand logo in rail mode — it overlaps the top nav toggle. */}
      {!rail && <NavBrand />}

      <div className="dv-wpnav__scroll">
        <Link href={adminRoute} className={`dv-wpnav__dash${onDashboard ? ' is-active' : ''}`} onClick={closeMobile} title="Bảng điều khiển">
          <span className="dv-wpnav__icon" aria-hidden>
            <NavIconGraphic name="grid" />
          </span>
          {!rail && <span className="dv-wpnav__label">Bảng điều khiển</span>}
        </Link>

        {!rail && quickActions.length > 0 && (
          <div className="dv-wpnav__actions">
            <div className="dv-wpnav__actions-title">{lang === 'vi' ? 'Thêm nhanh' : 'Quick add'}</div>
            <div className="dv-wpnav__actions-row">
              {quickActions.map((a) => (
                <Link key={a.slug} href={`${adminRoute}/collections/${a.slug}/create`} className="dv-wpnav__action" onClick={closeMobile} title={a.label}>
                  <span className="dv-wpnav__aicon" aria-hidden>
                    <NavIconGraphic name={a.icon} />
                  </span>
                  <span className="dv-wpnav__aplus" aria-hidden>+</span>
                  {a.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="dv-wpnav__groups">
          {groups.map((grp) => {
            const expanded = !rail && (Boolean(open[grp.key]) || groupActive(grp.items))
            if (rail) {
              // Rail: one PARENT icon per group; hover/click opens its flyout.
              return (
                <button
                  key={grp.key}
                  type="button"
                  className={`dv-wpnav__railicon${groupActive(grp.items) ? ' is-active' : ''}`}
                  onMouseEnter={(e) => openFlyout(grp.key, e.currentTarget)}
                  onMouseLeave={scheduleClose}
                  onClick={(e) => openFlyout(grp.key, e.currentTarget)}
                  title={grp.label[lang]}
                  aria-label={grp.label[lang]}
                >
                  <NavIconGraphic name={grp.icon} />
                </button>
              )
            }
            return (
              <div key={grp.key} className="dv-wpnav__group" onMouseEnter={(e) => !expanded && openFlyout(grp.key, e.currentTarget)} onMouseLeave={scheduleClose}>
                <button type="button" className={`dv-wpnav__parent${groupActive(grp.items) ? ' is-active' : ''}`} onClick={() => toggle(grp.key)} aria-expanded={expanded}>
                  <span className="dv-wpnav__icon" aria-hidden>
                    <NavIconGraphic name={grp.icon} />
                  </span>
                  <span className="dv-wpnav__label">{grp.label[lang]}</span>
                  <span className={`dv-wpnav__chev${expanded ? ' is-open' : ''}`} aria-hidden>›</span>
                </button>
                {expanded && (
                  <div className="dv-wpnav__children">
                    {grp.items.map((e) => (
                      <Link key={e.slug} href={hrefOf(e)} className={`dv-wpnav__child${isActive(e) ? ' is-active' : ''}`} onClick={closeMobile}>
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
        </div>
      </div>

      {flyout && flyoutGroup && createPortal(
        <div className="dv-wpnav__flyout" role="menu" style={{ top: flyout.top, left: flyout.left }} onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
          <div className="dv-wpnav__flyout-title">{flyoutGroup.label[lang]}</div>
          {flyoutGroup.items.map((e) => (
            <Link key={e.slug} href={hrefOf(e)} className={`dv-wpnav__child${isActive(e) ? ' is-active' : ''}`} role="menuitem" onClick={closeMobile}>
              <span className="dv-wpnav__cicon" aria-hidden>
                <NavIconGraphic name={e.icon} />
              </span>
              {e.label}
            </Link>
          ))}
        </div>,
        document.body
      )}
    </nav>
  )
}

const WPNAV_CSS = `
.dv-wpnav { display: flex; flex-direction: column; padding: 0; height: 100vh; position: sticky; top: 0; flex-shrink: 0; align-self: flex-start; background: var(--dv-sidebar-bg, #f5f8f6); }
.dv-wpnav .dv-nav-brand { margin-inline: 0 !important; padding: 12px 16px !important; background: transparent !important; }
.dv-wpnav .dv-nav-brand__logo { max-width: 150px; }
.dv-wpnav__scroll { flex: 1; overflow-y: auto; padding: 8px 12px 28px; display: flex; flex-direction: column; gap: 4px; }
.dv-wpnav__icon, .dv-wpnav__cicon, .dv-wpnav__aicon { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
.dv-wpnav__icon { width: 18px; height: 18px; }
.dv-wpnav__icon svg, .dv-wpnav__cicon svg, .dv-wpnav__aicon svg { width: 100%; height: 100%; }
.dv-wpnav__label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.dv-wpnav__dash {
  display: flex; align-items: center; gap: 10px; padding: 9px 11px; border-radius: 9px;
  color: var(--theme-elevation-800); font-size: 13.5px; font-weight: 600; text-decoration: none; transition: background .12s;
}
.dv-wpnav__dash:hover { background: color-mix(in srgb, var(--dv-primary, #008e4d) 10%, transparent); }
.dv-wpnav__dash.is-active { background: color-mix(in srgb, var(--dv-primary, #008e4d) 14%, transparent); color: var(--dv-primary, #008e4d); }

.dv-wpnav__actions { margin: 6px 0 4px; padding-bottom: 8px; border-bottom: 1px solid var(--theme-elevation-100, #e8eaed); }
.dv-wpnav__actions-title { font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--theme-elevation-500); padding: 6px 8px 4px; }
.dv-wpnav__actions-row { display: flex; flex-direction: column; gap: 4px; }
.dv-wpnav__action {
  display: flex; align-items: center; gap: 8px; padding: 7px 10px; border-radius: 8px; text-decoration: none;
  font-size: 12.5px; font-weight: 600; color: var(--dv-primary, #008e4d);
  background: color-mix(in srgb, var(--dv-primary, #008e4d) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--dv-primary, #008e4d) 18%, transparent); transition: background .12s;
}
.dv-wpnav__action:hover { background: color-mix(in srgb, var(--dv-primary, #008e4d) 15%, transparent); }
.dv-wpnav__aicon { width: 15px; height: 15px; }
.dv-wpnav__aplus { font-weight: 800; margin-left: -2px; opacity: .85; }

.dv-wpnav__groups { display: flex; flex-direction: column; gap: 1px; margin-top: 6px; }
.dv-wpnav__group { position: relative; }
.dv-wpnav__parent {
  display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 11px; border: 0; background: transparent;
  cursor: pointer; border-radius: 9px; color: var(--theme-elevation-800); font-size: 13.5px; font-weight: 600; text-align: left; transition: background .12s;
}
.dv-wpnav__parent:hover { background: color-mix(in srgb, var(--dv-primary, #008e4d) 10%, transparent); }
.dv-wpnav__parent.is-active { color: var(--dv-primary, #008e4d); }
.dv-wpnav__chev { transition: transform .15s; opacity: .45; font-size: 16px; line-height: 1; }
.dv-wpnav__chev.is-open { transform: rotate(90deg); }
.dv-wpnav__children { display: flex; flex-direction: column; gap: 1px; padding: 1px 0 6px 8px; }
.dv-wpnav__child {
  display: flex; align-items: center; gap: 9px; padding: 7px 10px 7px 20px; border-radius: 8px;
  color: var(--theme-elevation-650); font-size: 13px; text-decoration: none; transition: background .12s, color .12s;
}
.dv-wpnav__child:hover { background: color-mix(in srgb, var(--dv-primary, #008e4d) 8%, transparent); color: var(--theme-elevation-900); }
.dv-wpnav__child.is-active { background: color-mix(in srgb, var(--dv-primary, #008e4d) 14%, transparent); color: var(--dv-primary, #008e4d); font-weight: 600; }
.dv-wpnav__child .dv-wpnav__cicon { width: 15px; height: 15px; opacity: .85; }

/* Rail: parent icons only. Top padding clears the fixed nav toggle. */
.dv-wpnav--rail .dv-wpnav__scroll { padding: calc(var(--app-header-height, 3.5rem) + 4px) 0 20px; align-items: center; }
.dv-wpnav--rail .dv-wpnav__groups { align-items: center; gap: 4px; margin-top: 4px; }
.dv-wpnav__railicon {
  display: grid; place-items: center; width: 42px; height: 42px; border: 0; background: transparent; cursor: pointer;
  border-radius: 11px; color: var(--theme-elevation-700); transition: background .12s, color .12s;
}
.dv-wpnav__railicon svg { width: 19px; height: 19px; }
.dv-wpnav__railicon:hover { background: color-mix(in srgb, var(--dv-primary, #008e4d) 12%, transparent); color: var(--dv-primary, #008e4d); }
.dv-wpnav__railicon.is-active { background: color-mix(in srgb, var(--dv-primary, #008e4d) 16%, transparent); color: var(--dv-primary, #008e4d); }
.dv-wpnav--rail .dv-wpnav__dash { justify-content: center; padding: 0; width: 42px; height: 42px; border-radius: 11px; margin: 0 auto 4px; }

.dv-wpnav__flyout {
  position: fixed; z-index: 9999; min-width: 224px; max-height: 80vh; overflow-y: auto;
  background: var(--theme-elevation-0, #fff); border: 1px solid var(--theme-elevation-150); border-radius: 12px;
  box-shadow: 0 14px 38px rgba(0,0,0,.18); padding: 6px;
}
.dv-wpnav__flyout-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: var(--theme-elevation-500); padding: 6px 10px 4px; }
.dv-wpnav__flyout .dv-wpnav__child { padding-left: 12px; }
`

export default WpNav
