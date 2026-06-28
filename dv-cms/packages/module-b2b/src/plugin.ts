import type { Config, Plugin } from 'payload'
import { Members } from './collections/Members.js'
import { createGatedDocuments } from './collections/GatedDocuments.js'
import { createB2BEndpoints, type B2BEndpointOptions } from './endpoints/index.js'

export type B2BPluginOptions = B2BEndpointOptions & {
  /** Collection slug gated documents may relate to (e.g. 'ingredients'). */
  relatesTo?: string
}

/**
 * Generic B2B portal module: a `members` auth collection, access-gated
 * `gated-documents`, and `/api/b2b/*` endpoints (register/login/logout/me/
 * documents/download). Depends on `@dv/cms-core` (media + access helpers).
 */
export const b2bPlugin =
  (options: B2BPluginOptions = {}): Plugin =>
  (incoming: Config): Config => {
    const config = { ...incoming }

    config.collections = [
      ...(config.collections ?? []),
      Members,
      createGatedDocuments({ relatesTo: options.relatesTo }),
    ]

    config.endpoints = [
      ...(config.endpoints ?? []),
      ...createB2BEndpoints({ cookieMaxAge: options.cookieMaxAge }),
    ]

    return config
  }
