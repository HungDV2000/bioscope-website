import { notFound } from 'next/navigation'
import { getLocale } from '@/lib/i18n/server'
import { getMessages } from '@/lib/i18n/messages'
import { getPageContent } from '@/lib/cms/page'
import { RenderBlocks, type Block } from '@/components/blocks/render-blocks'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'

/**
 * Generic CMS Page route — renders any block-composed Page by slug. Hardcoded
 * routes (giai-phap, lien-he, …) take precedence in the App Router, so this only
 * serves pages that don't have a bespoke design. Blocks are wrapped with
 * data-better-editor-id so the Better Editor can edit every block here.
 */

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const locale = await getLocale()
  const { metadata } = await getPageContent(slug, locale)
  return metadata
}

export default async function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const locale = await getLocale()
  const { hero, blocks } = await getPageContent(slug, locale)

  // Only render block-composed CMS pages here; anything else 404s.
  const renderable = (blocks as Block[]).filter((b) => b.blockType)
  if (!renderable.length) notFound()

  const m = getMessages(locale)
  const crumbs = [
    { name: m.nav.home, path: '/' },
    { name: hero.title || slug, path: `/${slug}` },
  ]

  return (
    <article className="bg-white pt-28">
      <div className="container-bs">
        <Breadcrumbs crumbs={crumbs} />
      </div>
      <RenderBlocks blocks={renderable} />
    </article>
  )
}
