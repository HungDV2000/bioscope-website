import type { Config, Field, Plugin } from 'payload'
import { HOME_BLOCKS } from './blocks/home.js'
import { PAGE_BLOCKS } from './blocks/pages.js'
import { IngredientCategories } from './collections/IngredientCategories.js'
import { DriveSyncJobs } from './collections/DriveSyncJobs.js'
import { CmsSyncRuns } from './collections/CmsSyncRuns.js'
import { AiGenerateJobs } from './collections/AiGenerateJobs.js'
import { Technologies } from './collections/Technologies.js'
import { Ingredients } from './collections/Ingredients.js'
import { Services } from './collections/Services.js'
import { Certifications } from './collections/Certifications.js'
import { CaseStudies } from './collections/CaseStudies.js'
import { Faqs } from './collections/Faqs.js'
import { Home } from './globals/Home.js'
import { BioscopeAi } from './globals/BioscopeAi.js'

export type BioscopePluginOptions = {
  /** Override which collections to register (all by default). */
  collections?: {
    technologies?: boolean
    ingredients?: boolean
    services?: boolean
    certifications?: boolean
    caseStudies?: boolean
    faqs?: boolean
    cmsSyncRuns?: boolean
    driveSyncJobs?: boolean
    aiGenerateJobs?: boolean
  }
  /** Register the Home page global (default true). */
  home?: boolean
  /** Append home-section blocks to the Pages layout field (default true). */
  homeBlocks?: boolean
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
    if (c.driveSyncJobs !== false) add.push(DriveSyncJobs)
    if (c.aiGenerateJobs !== false) add.push(AiGenerateJobs)
    if (c.cmsSyncRuns !== false) add.push(CmsSyncRuns)
    if (c.technologies !== false) add.push(Technologies)
    if (c.services !== false) add.push(Services)
    if (c.certifications !== false) add.push(Certifications)
    if (c.caseStudies !== false) add.push(CaseStudies)
    if (c.faqs !== false) add.push(Faqs)

    config.collections = [...(config.collections ?? []), ...add]

    // Append home-section blocks to the Pages `layout` field so the home page
    // can be composed in the Pages collection. Requires blocksPlugin to have
    // run first (it creates the layout field).
    if (options.homeBlocks !== false) {
      config.collections = config.collections.map((col) => {
        if (col.slug !== 'pages') return col
        // `layout` may sit at the top level OR inside a tab (see `contentTabs`),
        // so recurse. Missing it would silently drop every home* block from the
        // schema — and `push` would then DELETE those block tables and their data.
        const addBlocks = (fields: Field[]): Field[] =>
          fields.map((f) => {
            if ('name' in f && f.name === 'layout' && f.type === 'blocks') {
              return { ...f, blocks: [...f.blocks, ...HOME_BLOCKS, ...PAGE_BLOCKS] }
            }
            if (f.type === 'tabs') {
              return { ...f, tabs: f.tabs.map((t) => ({ ...t, fields: addBlocks(t.fields) })) }
            }
            return f
          })
        return { ...col, fields: addBlocks(col.fields ?? []) }
      })
    }

    if (options.home !== false) {
      config.globals = [...(config.globals ?? []), Home]
    }
    config.globals = [...(config.globals ?? []), BioscopeAi]
    return config
  }
