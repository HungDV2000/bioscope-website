'use client'

/**
 * CookieBanner — Complianz-style GDPR consent banner. Fetches config from the
 * CMS (/api/consent/config), lets the visitor accept all / reject / customize
 * categories, persists the choice via lib/consent and posts a proof-of-consent
 * record. Renders nothing until a decision is needed (or when disabled).
 */

import React, { useEffect, useState } from 'react'
import { getConsent, setConsent, needsDecision } from '@/lib/consent'

type Category = {
  key: string
  label?: string
  description?: string
  required?: boolean
  defaultOn?: boolean
}
type Config = {
  enabled?: boolean
  mode?: 'optIn' | 'optOut'
  title?: string
  message?: string
  acceptAllLabel?: string
  rejectAllLabel?: string
  customizeLabel?: string
  saveLabel?: string
  policyUrl?: string
  position?: 'bottom' | 'bottom-left' | 'bottom-right'
  categories?: Category[]
  accentColor?: string
}

const CMS = process.env.NEXT_PUBLIC_CMS_URL ?? ''

export function CookieBanner() {
  const [cfg, setCfg] = useState<Config | null>(null)
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [selected, setSelected] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let cancelled = false
    fetch(`${CMS}/api/consent/config`)
      .then((r) => r.json())
      .then((c: Config) => {
        if (cancelled || !c?.enabled) return
        setCfg(c)
        const init: Record<string, boolean> = {}
        const prev = getConsent()
        for (const cat of c.categories ?? []) {
          init[cat.key] = cat.required ? true : prev ? prev.categories.includes(cat.key) : Boolean(cat.defaultOn)
        }
        setSelected(init)
        setVisible(needsDecision())
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  if (!cfg || !visible) return null

  const accent = cfg.accentColor || '#008e4d'
  const cats = cfg.categories ?? []

  const record = (categories: string[], action: string) => {
    setConsent(categories)
    fetch(`${CMS}/api/consent/record`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ categories, action, url: window.location.href }),
      keepalive: true,
    }).catch(() => {})
    setVisible(false)
  }

  const acceptAll = () => record(cats.map((c) => c.key), 'accept_all')
  const rejectAll = () => record(cats.filter((c) => c.required).map((c) => c.key), 'reject_all')
  const saveChoice = () => record(cats.filter((c) => selected[c.key]).map((c) => c.key), 'save')

  const posClass =
    cfg.position === 'bottom-left'
      ? 'left-4 bottom-4 max-w-md'
      : cfg.position === 'bottom-right'
        ? 'right-4 bottom-4 max-w-md'
        : 'inset-x-4 bottom-4 mx-auto max-w-3xl'

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className={`fixed z-[9998] ${posClass} rounded-2xl border border-primary-border/60 bg-white p-5 shadow-2xl`}
    >
      <div className="text-[15px] font-bold text-ink">{cfg.title}</div>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink/70">
        {cfg.message}{' '}
        {cfg.policyUrl && (
          <a href={cfg.policyUrl} className="text-primary underline">
            Chính sách
          </a>
        )}
      </p>

      {expanded && (
        <div className="mt-3 flex flex-col gap-2 border-t border-primary-border/40 pt-3">
          {cats.map((c) => (
            <label key={c.key} className="flex items-start gap-2 text-[13px]">
              <input
                type="checkbox"
                checked={Boolean(selected[c.key])}
                disabled={c.required}
                onChange={(e) => setSelected((s) => ({ ...s, [c.key]: e.target.checked }))}
                className="mt-0.5"
              />
              <span>
                <span className="font-semibold text-ink">
                  {c.label || c.key}
                  {c.required ? ' (bắt buộc)' : ''}
                </span>
                {c.description && <span className="block text-ink/55">{c.description}</span>}
              </span>
            </label>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={acceptAll}
          className="rounded-lg px-4 py-2 text-[13px] font-semibold text-white"
          style={{ background: accent }}
        >
          {cfg.acceptAllLabel || 'Chấp nhận tất cả'}
        </button>
        {expanded ? (
          <button
            type="button"
            onClick={saveChoice}
            className="rounded-lg border border-primary-border px-4 py-2 text-[13px] font-semibold text-ink/80"
          >
            {cfg.saveLabel || 'Lưu lựa chọn'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="rounded-lg border border-primary-border px-4 py-2 text-[13px] font-semibold text-ink/80"
          >
            {cfg.customizeLabel || 'Tùy chỉnh'}
          </button>
        )}
        <button
          type="button"
          onClick={rejectAll}
          className="rounded-lg px-4 py-2 text-[13px] font-semibold text-ink/55 hover:text-ink"
        >
          {cfg.rejectAllLabel || 'Từ chối'}
        </button>
      </div>
    </div>
  )
}
