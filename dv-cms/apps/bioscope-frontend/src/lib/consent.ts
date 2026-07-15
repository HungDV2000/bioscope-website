'use client'

/**
 * Client-side consent state. Stored in a first-party cookie + mirrored to
 * localStorage. Other code (analytics/marketing loaders) calls `hasConsent(cat)`
 * and listens for the `dv-consent-change` event to react to updates.
 */

export type ConsentState = { categories: string[]; version: string; at: number }

const COOKIE = 'dv_consent'
const MAX_AGE = 180 * 24 * 60 * 60 // 180 days

export function getConsent(): ConsentState | null {
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(new RegExp(`${COOKIE}=([^;]+)`))
  if (!m) return null
  try {
    return JSON.parse(decodeURIComponent(m[1])) as ConsentState
  } catch {
    return null
  }
}

export function setConsent(categories: string[], version = '1'): ConsentState {
  const state: ConsentState = { categories, version, at: Date.now() }
  const value = encodeURIComponent(JSON.stringify(state))
  document.cookie = `${COOKIE}=${value}; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax`
  try {
    localStorage.setItem(COOKIE, JSON.stringify(state))
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent('dv-consent-change', { detail: state }))
  return state
}

/** Whether the user has consented to a given category (necessary is implicit). */
export function hasConsent(category: string): boolean {
  if (category === 'necessary') return true
  const c = getConsent()
  return Boolean(c?.categories?.includes(category))
}

/** Whether the banner still needs to be shown (no prior decision). */
export function needsDecision(): boolean {
  return getConsent() === null
}
