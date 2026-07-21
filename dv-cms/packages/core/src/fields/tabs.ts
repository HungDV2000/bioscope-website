import type { Field, TabsField } from 'payload'
import { seoField } from './seo.js'

/**
 * Build the tabbed edit form used by every content type.
 *
 * Why UNNAMED tabs: a named tab wraps its fields in a group and therefore
 * RENAMES the underlying columns (`title` → `content_title`), which would mean a
 * data migration. Unnamed tabs are purely visual — the stored shape is identical
 * to a flat field list, so this is a zero-risk change.
 *
 * Sidebar fields (`admin.position === 'sidebar'`) are deliberately kept OUT of
 * the tabs: Payload renders them in the right-hand column regardless, and nesting
 * them inside a tab makes them disappear when another tab is active.
 *
 * SEO is always appended as the LAST tab so editors find it in the same place on
 * every collection.
 *
 * @param tabs   Ordered content tabs (label + fields). Empty tabs are dropped.
 * @param opts   `seo: false` to omit the SEO tab (e.g. taxonomies).
 */
export function contentTabs(
  tabs: { label: string | Record<string, string>; description?: string; fields: Field[] }[],
  opts: { seo?: boolean } = {},
): Field[] {
  const isSidebar = (f: Field): boolean =>
    typeof f === 'object' && 'admin' in f && (f as { admin?: { position?: string } }).admin?.position === 'sidebar'

  const sidebarFields: Field[] = []
  const contentTabList: TabsField['tabs'] = []

  for (const tab of tabs) {
    const inTab: Field[] = []
    for (const field of tab.fields) {
      if (isSidebar(field)) sidebarFields.push(field)
      else inTab.push(field)
    }
    if (inTab.length > 0) {
      contentTabList.push({
        label: tab.label,
        ...(tab.description ? { description: tab.description } : {}),
        fields: inTab,
      })
    }
  }

  if (opts.seo !== false) {
    contentTabList.push({ label: 'SEO', fields: [seoField()] })
  }

  return [{ type: 'tabs', tabs: contentTabList }, ...sidebarFields]
}
