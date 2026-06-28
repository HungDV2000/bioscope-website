import type { Config, Field, Plugin } from 'payload'
import { pickBlocks, type BlockSlug } from './blocks.js'

export type BlocksPluginOptions = {
  /** Which blocks this site may use (undefined = all). */
  enabled?: BlockSlug[]
  /** Collection that gets a block-based layout field (default 'pages'). */
  collection?: string
  /** Field name for the layout (default 'layout'). */
  fieldName?: string
}

/**
 * Adds a block-based `layout` field to a collection (default: pages) using only
 * the enabled blocks. Installing this plugin is what gives a site page layouts;
 * each site picks its own block set. Register AFTER the collection exists
 * (i.e. after corePlugin).
 */
export const blocksPlugin =
  (options: BlocksPluginOptions = {}): Plugin =>
  (incoming: Config): Config => {
    const config = { ...incoming }
    const targetSlug = options.collection ?? 'pages'
    const fieldName = options.fieldName ?? 'layout'
    const blocks = pickBlocks(options.enabled)

    const layoutField: Field = {
      name: fieldName,
      type: 'blocks',
      blocks,
      admin: { description: 'Bố cục trang ghép từ các block tái dùng.' },
    }

    config.collections = (config.collections ?? []).map((col) => {
      if (col.slug !== targetSlug) return col

      const fields = [...(col.fields ?? [])]
      const existingIdx = fields.findIndex((f) => 'name' in f && f.name === fieldName)
      if (existingIdx >= 0) {
        fields[existingIdx] = layoutField
      } else {
        // Insert before the SEO group if present, else append.
        const seoIdx = fields.findIndex((f) => 'name' in f && f.name === 'seo')
        if (seoIdx >= 0) fields.splice(seoIdx, 0, layoutField)
        else fields.push(layoutField)
      }
      return { ...col, fields }
    })

    return config
  }
