import type { CollectionConfig, Config, Plugin } from 'payload'
import { Partners } from './collections/Partners.js'
import { ProductCategories } from './collections/ProductCategories.js'
import { createProductCollection, type ProductCollectionOptions } from './factory/createProductCollection.js'

export type CatalogPluginOptions = {
  /** Register the shared Partners collection (default: true). */
  partners?: boolean
  /** Register the generic ProductCategories taxonomy (default: true). */
  productCategories?: boolean
  /** Register a generic Products collection. Pass options or omit to skip. */
  products?: ProductCollectionOptions | false
}

/** Generic catalog module: partners, taxonomy, and an optional product collection. */
export const catalogPlugin =
  (options: CatalogPluginOptions = {}): Plugin =>
  (incoming: Config): Config => {
    const config = { ...incoming }
    const add: CollectionConfig[] = []

    if (options.partners !== false) add.push(Partners)
    if (options.productCategories !== false) add.push(ProductCategories)
    if (options.products) add.push(createProductCollection(options.products))

    config.collections = [...(config.collections ?? []), ...add]
    return config
  }
