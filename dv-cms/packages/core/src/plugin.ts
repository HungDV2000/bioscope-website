import type { CollectionConfig, Config, Plugin } from 'payload'

import { Users } from './collections/Users.js'
import { Media } from './collections/Media.js'
import { Pages } from './collections/Pages.js'
import { Posts } from './collections/Posts.js'
import { Categories } from './collections/Categories.js'
import { Tags } from './collections/Tags.js'
import { Forms } from './collections/Forms.js'
import { FormSubmissions } from './collections/FormSubmissions.js'
import { Redirects } from './collections/Redirects.js'
import { SiteSettings } from './globals/SiteSettings.js'
import { Navigation } from './globals/Navigation.js'
import { buildRevalidateHooks, type RevalidateOptions } from './hooks/revalidate.js'

export type CorePluginOptions = {
  /** Frontend ISR revalidation (no-op until a frontendUrl is provided). */
  revalidate?: RevalidateOptions
}

/**
 * Tier-1 reusable CMS core. Adds the generic collections/globals every site needs
 * and wires ISR revalidation onto content collections. Always register FIRST so
 * downstream modules can rely on `users` and `media` existing.
 */
export const corePlugin =
  (options: CorePluginOptions = {}): Plugin =>
  (incoming: Config): Config => {
    const config = { ...incoming }
    const rev = buildRevalidateHooks(options.revalidate ?? {})

    const withRevalidate = (col: CollectionConfig): CollectionConfig => ({
      ...col,
      hooks: {
        ...col.hooks,
        afterChange: [...(col.hooks?.afterChange ?? []), ...rev.afterChange],
        afterDelete: [...(col.hooks?.afterDelete ?? []), ...rev.afterDelete],
      },
    })

    config.collections = [
      ...(config.collections ?? []),
      Users,
      Media,
      withRevalidate(Pages),
      withRevalidate(Posts),
      Categories,
      Tags,
      Forms,
      FormSubmissions,
      Redirects,
    ]

    config.globals = [...(config.globals ?? []), SiteSettings, Navigation]

    return config
  }
