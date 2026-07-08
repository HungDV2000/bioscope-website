import type { Config, Plugin } from 'payload'
import { SeoSettings } from './globals/SeoSettings.js'

export type SeoPluginOptions = {
  /** Register the site-wide SEO settings global (default true). */
  settings?: boolean
}

/**
 * Yoast-style SEO module. Registers the `seo-settings` global that the frontend
 * consumes for metadata, robots.txt, sitemap.xml and JSON-LD. Depends on
 * `@dv/cms-core` (access control) being registered first.
 */
export const seoPlugin =
  (options: SeoPluginOptions = {}): Plugin =>
  (incoming: Config): Config => {
    const config = { ...incoming }
    if (options.settings !== false) {
      config.globals = [...(config.globals ?? []), SeoSettings]
    }
    return config
  }
