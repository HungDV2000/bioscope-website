/**
 * Breadcrumbs — visible breadcrumb trail + matching BreadcrumbList JSON-LD.
 * Server component. Pass the ordered crumbs (last item = current page).
 */

import Link from 'next/link'
import { JsonLd } from '@/components/seo/json-ld'
import { breadcrumbSchema, type Crumb } from '@/lib/seo/schema'

export function Breadcrumbs({ crumbs, className }: { crumbs: Crumb[]; className?: string }) {
  if (!crumbs.length) return null
  return (
    <>
      <nav aria-label="Breadcrumb" className={className}>
        <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-ink/55">
          {crumbs.map((c, i) => {
            const last = i === crumbs.length - 1
            return (
              <li key={c.path} className="flex items-center gap-1.5">
                {last ? (
                  <span aria-current="page" className="text-ink/80 font-medium">
                    {c.name}
                  </span>
                ) : (
                  <>
                    <Link href={c.path} className="transition-colors hover:text-primary">
                      {c.name}
                    </Link>
                    <span className="text-ink/30">/</span>
                  </>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbSchema(crumbs)} />
    </>
  )
}
