/**
 * Optimization config resolved from env at boot (Payload upload options are
 * static). Change these + rebuild/restart to re-tune; the ImageSettings global
 * mirrors them for visibility and drives the bulk re-optimize endpoint.
 */

export type ImageFormat = 'webp' | 'avif' | 'off'

export type ResolvedImageConfig = {
  format: ImageFormat
  quality: number
  maxWidth: number
}

export function resolveImageConfig(): ResolvedImageConfig {
  const format = (process.env.OPTIMIZE_IMAGE_FORMAT ?? 'webp').toLowerCase() as ImageFormat
  const quality = Math.min(100, Math.max(30, Number(process.env.OPTIMIZE_IMAGE_QUALITY ?? 80)))
  const maxWidth = Math.max(320, Number(process.env.OPTIMIZE_IMAGE_MAX_WIDTH ?? 2560))
  return { format: ['webp', 'avif', 'off'].includes(format) ? format : 'webp', quality, maxWidth }
}
