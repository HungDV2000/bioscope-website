/**
 * Enhance a media collection's `upload` config with optimization: convert to a
 * modern format (WebP/AVIF) at a set quality, cap the master image dimensions,
 * and generate a full ladder of responsive sizes (each in the modern format) so
 * the frontend can build a proper srcset.
 */

import type { CollectionConfig, ImageSize } from 'payload'
import { resolveImageConfig, type ResolvedImageConfig } from './config.js'

// Responsive width ladder for srcset. Heights omitted → keep aspect ratio.
const RESPONSIVE_WIDTHS = [400, 768, 1080, 1600]

function formatOptions(cfg: ResolvedImageConfig) {
  if (cfg.format === 'off') return undefined
  return { format: cfg.format, options: { quality: cfg.quality } } as const
}

export function enhanceMediaUpload(col: CollectionConfig): CollectionConfig {
  if (!col.upload || col.upload === true) return col
  const cfg = resolveImageConfig()
  const fmt = formatOptions(cfg)

  // Keep any existing named sizes, add the responsive ladder (dedup by name).
  const existing = (col.upload.imageSizes ?? []) as ImageSize[]
  const existingNames = new Set(existing.map((s) => s.name))
  const ladder: ImageSize[] = RESPONSIVE_WIDTHS.filter((w) => !existingNames.has(`w${w}`)).map((w) => ({
    name: `w${w}`,
    width: w,
    ...(fmt ? { formatOptions: fmt } : {}),
  }))

  // Also convert the existing named sizes to the modern format.
  const converted = existing.map((s) => (fmt && !s.formatOptions ? { ...s, formatOptions: fmt } : s))

  return {
    ...col,
    upload: {
      ...col.upload,
      ...(fmt ? { formatOptions: fmt } : {}),
      resizeOptions: {
        width: cfg.maxWidth,
        withoutEnlargement: true,
        ...(col.upload.resizeOptions ?? {}),
      },
      imageSizes: [...converted, ...ladder],
    },
  }
}
