import type { Config, Plugin, CollectionConfig, Field } from 'payload'
import { ImageSettings } from './globals/ImageSettings.js'
import { enhanceMediaUpload } from './lib/upload.js'
import { trackSavingsHook } from './hooks/trackSavings.js'
import { imageStatsEndpoint } from './endpoints/imageStats.js'

export type ImagePluginOptions = {
  /** Media collection slug to optimize (default 'media'). */
  mediaSlug?: string
  /** Register the image-settings global (default true). */
  settings?: boolean
}

/** Read-only savings fields stamped by the trackSavings hook. */
const SAVINGS_FIELDS: Field[] = [
  { name: 'originalSize', type: 'number', admin: { readOnly: true, description: 'Bytes gốc trước tối ưu.' } },
  { name: 'savedBytes', type: 'number', admin: { readOnly: true, description: 'Bytes tiết kiệm.' } },
  { name: 'savedPct', type: 'number', admin: { readOnly: true, description: '% giảm dung lượng.' } },
  { name: 'optimizedFormat', type: 'text', admin: { readOnly: true } },
]

/**
 * Image optimization module (image-optimization style). Enhances the media
 * collection's upload with WebP/AVIF conversion + compression + a responsive
 * size ladder, tracks per-file savings, and registers the settings global +
 * stats endpoint. Must run after the core plugin (which registers `media`).
 */
export const imagePlugin =
  (options: ImagePluginOptions = {}): Plugin =>
  (incoming: Config): Config => {
    const config = { ...incoming }
    const mediaSlug = options.mediaSlug ?? 'media'

    if (options.settings !== false) {
      config.globals = [...(config.globals ?? []), ImageSettings]
    }
    config.endpoints = [...(config.endpoints ?? []), imageStatsEndpoint]

    config.collections = (config.collections ?? []).map((col: CollectionConfig): CollectionConfig => {
      if (col.slug !== mediaSlug || !col.upload) return col
      const enhanced = enhanceMediaUpload(col)
      return {
        ...enhanced,
        fields: [...(enhanced.fields ?? []), ...SAVINGS_FIELDS],
        hooks: {
          ...enhanced.hooks,
          beforeChange: [...(enhanced.hooks?.beforeChange ?? []), trackSavingsHook],
        },
      }
    })

    return config
  }
