export { languagesPlugin, type LanguagesPluginOptions } from './plugin.js'
export { Languages } from './collections/Languages.js'
export { ADMIN_GROUP_LANGUAGES } from './i18n/admin-groups.js'
export { resolveLocalizationConfig, resolveLocalizationConfigAsync } from './config/resolveLocalization.js'
export {
  buildManifestFromPayload,
  buildPublicLocales,
  getDefaultLocalesManifest,
  readManifest,
  writeManifest,
} from './hooks/syncManifest.js'
export { seedDefaultLanguages } from './hooks/languageHooks.js'
export { getManifestPath, setManifestPath } from './lib/manifestPath.js'
export type { LanguageDoc, LocalesManifest, PublicLocale } from './types.js'
