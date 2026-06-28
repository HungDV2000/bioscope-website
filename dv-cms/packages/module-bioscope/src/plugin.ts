import type { Config, Plugin } from 'payload'
import { IngredientCategories } from './collections/IngredientCategories.js'
import { Technologies } from './collections/Technologies.js'
import { Ingredients } from './collections/Ingredients.js'
import { Services } from './collections/Services.js'
import { Certifications } from './collections/Certifications.js'
import { CaseStudies } from './collections/CaseStudies.js'
import { Faqs } from './collections/Faqs.js'

export type BioscopePluginOptions = {
  /** Override which collections to register (all by default). */
  collections?: {
    technologies?: boolean
    ingredients?: boolean
    services?: boolean
    certifications?: boolean
    caseStudies?: boolean
    faqs?: boolean
  }
}

/**
 * Bioscope-specific glue. Depends on `@dv/cms-core` (media/access) and
 * `@dv/module-catalog` (Partners + specsField) being registered first.
 */
export const bioscopePlugin =
  (options: BioscopePluginOptions = {}): Plugin =>
  (incoming: Config): Config => {
    const config = { ...incoming }
    const c = options.collections ?? {}
    const add = []

    if (c.ingredients !== false) add.push(IngredientCategories, Ingredients)
    if (c.technologies !== false) add.push(Technologies)
    if (c.services !== false) add.push(Services)
    if (c.certifications !== false) add.push(Certifications)
    if (c.caseStudies !== false) add.push(CaseStudies)
    if (c.faqs !== false) add.push(Faqs)

    config.collections = [...(config.collections ?? []), ...add]
    return config
  }
