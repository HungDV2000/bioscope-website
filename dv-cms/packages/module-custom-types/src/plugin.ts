import type { Config, Plugin } from 'payload'

import { ContentTypeDefinitions } from './collections/ContentTypeDefinitions.js'
import { TaxonomyDefinitions } from './collections/TaxonomyDefinitions.js'
import { FieldGroups } from './collections/FieldGroups.js'
import { generatedCustomTypeCollections } from './generated/index.js'
import { createCustomTypesEndpoints } from './endpoints/index.js'

export type CustomTypesPluginOptions = {
  /** Include codegen materialized collections (default: true). */
  enableGeneratedCollections?: boolean
}

/**
 * Hybrid custom content types (ACF-like):
 * - Meta collections: ct-definitions, tax-definitions, field-groups
 * - Codegen materializes published definitions → real Payload collections + REST CRUD
 * - `trash: false` + cascade hooks → hard delete from PostgreSQL
 */
export const customTypesPlugin =
  (options: CustomTypesPluginOptions = {}): Plugin =>
  (incoming: Config): Config => {
    const config = { ...incoming }
    const includeGenerated = options.enableGeneratedCollections !== false

    config.collections = [
      ...(config.collections ?? []),
      ContentTypeDefinitions,
      TaxonomyDefinitions,
      FieldGroups,
      ...(includeGenerated ? generatedCustomTypeCollections : []),
    ]

    config.endpoints = [...(config.endpoints ?? []), ...createCustomTypesEndpoints()]

    return config
  }
