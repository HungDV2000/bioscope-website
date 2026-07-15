/**
 * Record optimization savings on a media doc: compares the original uploaded
 * bytes (req.file.size, before sharp) with the stored filesize (after format
 * conversion + compression) and stamps originalSize / savedBytes / savedPct.
 */

import type { CollectionBeforeChangeHook } from 'payload'
import { resolveImageConfig } from '../lib/config.js'

export const trackSavingsHook: CollectionBeforeChangeHook = ({ data, req, operation }) => {
  const file = req.file
  if ((operation !== 'create' && operation !== 'update') || !file) return data

  const original = file.size
  const finalSize = Number((data as { filesize?: number }).filesize ?? 0)
  if (!original || !finalSize) return data

  const saved = Math.max(0, original - finalSize)
  const cfg = resolveImageConfig()
  return {
    ...data,
    originalSize: original,
    savedBytes: saved,
    savedPct: original ? Math.round((saved / original) * 100) : 0,
    optimizedFormat: cfg.format === 'off' ? 'original' : cfg.format,
  }
}
