/**
 * RenderBlocks — renders a CMS Page `layout` (module-blocks) as real sections.
 * Every block is wrapped with `data-better-editor-id={block.id}` so the Better
 * Editor's click-to-edit / hover outlines work on any block-composed page.
 *
 * Server component. Uploads are expected populated (fetch with depth>=1).
 */

import Image from 'next/image'
import { mediaUrl } from '@/lib/payload'

type Media = { url?: string; alt?: string } | null | undefined
type Link = { label?: string; href?: string; style?: 'primary' | 'outline' | 'ghost' }
export type Block = { blockType?: string; id?: string } & Record<string, unknown>

const img = (m: Media): string | null => mediaUrl((m as { url?: string })?.url) ?? null

function LinkButtons({ links }: { links?: Link[] }) {
  if (!links?.length) return null
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {links.map((l, i) => (
        <a
          key={i}
          href={l.href || '#'}
          className={
            l.style === 'outline'
              ? 'rounded-full border border-primary px-5 py-2.5 text-[14px] font-semibold text-primary transition-colors hover:bg-primary hover:text-white'
              : l.style === 'ghost'
                ? 'rounded-full px-5 py-2.5 text-[14px] font-semibold text-ink/70 hover:text-primary'
                : 'rounded-full bg-primary px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-primary-dark'
          }
        >
          {l.label}
        </a>
      ))}
    </div>
  )
}

/** Minimal Lexical → JSX (paragraphs, headings, lists, bold/italic, links). */
function RichText({ value }: { value: unknown }) {
  const root = (value as { root?: { children?: unknown[] } } | undefined)?.root
  if (!root?.children) return null
  const renderInline = (nodes: unknown[]): React.ReactNode =>
    nodes.map((n, i) => {
      const node = n as { type?: string; text?: string; format?: number; url?: string; fields?: { url?: string }; children?: unknown[] }
      if (typeof node.text === 'string') {
        let el: React.ReactNode = node.text
        if (node.format && node.format & 1) el = <strong key={i}>{el}</strong>
        if (node.format && node.format & 2) el = <em key={i}>{el}</em>
        return <span key={i}>{el}</span>
      }
      if (node.type === 'link' || node.type === 'autolink') {
        const href = node.fields?.url || node.url || '#'
        return (
          <a key={i} href={href} className="text-primary underline">
            {node.children ? renderInline(node.children) : null}
          </a>
        )
      }
      return node.children ? <span key={i}>{renderInline(node.children)}</span> : null
    })
  return (
    <div className="prose prose-neutral max-w-none text-ink/80">
      {root.children.map((c, i) => {
        const node = c as { type?: string; tag?: string; children?: unknown[]; listType?: string }
        const kids = node.children ? renderInline(node.children) : null
        if (node.type === 'heading') {
          const Tag = (node.tag as 'h2') || 'h2'
          return <Tag key={i}>{kids}</Tag>
        }
        if (node.type === 'list') {
          const Tag = node.listType === 'number' ? 'ol' : 'ul'
          return (
            <Tag key={i}>
              {(node.children ?? []).map((li, j) => (
                <li key={j}>{renderInline((li as { children?: unknown[] }).children ?? [])}</li>
              ))}
            </Tag>
          )
        }
        return <p key={i}>{kids}</p>
      })}
    </div>
  )
}

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`py-16 lg:py-24 ${className}`}>{children}</section>
}

// ── Block renderers ────────────────────────────────────────────────────────

function HeroB(b: Block) {
  const media = img(b.media as Media)
  return (
    <Section className="pt-28">
      <div className="container-bs grid items-center gap-10 lg:grid-cols-2">
        <div>
          {typeof b.eyebrow === 'string' && (
            <span className="text-[13px] font-semibold uppercase tracking-wide text-primary">{b.eyebrow}</span>
          )}
          <h1 className="mt-2 text-[34px] font-bold leading-tight text-ink lg:text-[48px]">{b.heading as string}</h1>
          {typeof b.subheading === 'string' && <p className="mt-4 text-[16px] leading-relaxed text-ink/65">{b.subheading}</p>}
          <LinkButtons links={b.links as Link[]} />
        </div>
        {media && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image src={media} alt={(b.heading as string) ?? ''} fill unoptimized className="object-cover" />
          </div>
        )}
      </div>
    </Section>
  )
}

function StatsB(b: Block) {
  const items = (b.items as Array<{ value?: string; suffix?: string; label?: string }>) ?? []
  return (
    <Section>
      <div className="container-bs">
        {typeof b.heading === 'string' && <h2 className="mb-10 text-center text-[28px] font-bold text-ink">{b.heading}</h2>}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <div key={i} className="text-center">
              <div className="text-[40px] font-bold text-primary">
                {it.value}
                {it.suffix}
              </div>
              <div className="mt-1 text-[14px] text-ink/60">{it.label}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

function FeatureGridB(b: Block) {
  const items = (b.items as Array<{ icon?: string; image?: Media; title?: string; description?: string }>) ?? []
  const cols = b.columns === '2' ? 'sm:grid-cols-2' : b.columns === '4' ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3'
  return (
    <Section className="bg-primary-tint/40">
      <div className="container-bs">
        {typeof b.heading === 'string' && <h2 className="mb-10 text-center text-[28px] font-bold text-ink">{b.heading}</h2>}
        <div className={`grid gap-6 ${cols}`}>
          {items.map((it, i) => {
            const image = img(it.image)
            return (
              <div key={i} className="rounded-2xl bg-white p-6 shadow-sm">
                {image ? (
                  <div className="relative mb-4 aspect-video overflow-hidden rounded-xl">
                    <Image src={image} alt={it.title ?? ''} fill unoptimized className="object-cover" />
                  </div>
                ) : (
                  it.icon && <div className="mb-3 text-3xl">{it.icon}</div>
                )}
                <h3 className="text-[17px] font-bold text-ink">{it.title}</h3>
                {it.description && <p className="mt-1.5 text-[14px] text-ink/60">{it.description}</p>}
              </div>
            )
          })}
        </div>
      </div>
    </Section>
  )
}

function GalleryB(b: Block) {
  const images = (b.images as Array<{ image?: Media; caption?: string }>) ?? []
  return (
    <Section>
      <div className="container-bs grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((it, i) => {
          const src = img(it.image)
          if (!src) return null
          return (
            <figure key={i} className="overflow-hidden rounded-2xl">
              <div className="relative aspect-[4/3]">
                <Image src={src} alt={it.caption ?? ''} fill unoptimized className="object-cover" />
              </div>
              {it.caption && <figcaption className="mt-2 text-[13px] text-ink/55">{it.caption}</figcaption>}
            </figure>
          )
        })}
      </div>
    </Section>
  )
}

function CtaB(b: Block) {
  const image = img(b.image as Media)
  const solid = b.background === 'solid'
  return (
    <Section>
      <div
        className={`container-bs rounded-3xl px-8 py-14 text-center ${solid ? 'bg-primary text-white' : 'bg-primary-tint'}`}
        style={b.background === 'image' && image ? { backgroundImage: `url(${image})`, backgroundSize: 'cover' } : undefined}
      >
        <h2 className={`text-[30px] font-bold ${solid ? 'text-white' : 'text-ink'}`}>{b.heading as string}</h2>
        {typeof b.text === 'string' && <p className={`mx-auto mt-3 max-w-2xl ${solid ? 'text-white/85' : 'text-ink/65'}`}>{b.text}</p>}
        <div className="flex justify-center">
          <LinkButtons links={b.links as Link[]} />
        </div>
      </div>
    </Section>
  )
}

function VideoB(b: Block) {
  const url = String(b.url ?? '')
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/)?.[1]
  const vimeo = url.match(/vimeo\.com\/(\d+)/)?.[1]
  const embed = yt ? `https://www.youtube.com/embed/${yt}` : vimeo ? `https://player.vimeo.com/video/${vimeo}` : null
  return (
    <Section>
      <div className="container-bs">
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
          {embed ? (
            <iframe src={embed} className="absolute inset-0 h-full w-full" allowFullScreen title={(b.caption as string) ?? 'video'} />
          ) : (
            <video src={url} controls className="absolute inset-0 h-full w-full" />
          )}
        </div>
        {typeof b.caption === 'string' && <p className="mt-2 text-center text-[13px] text-ink/55">{b.caption}</p>}
      </div>
    </Section>
  )
}

function LogoCloudB(b: Block) {
  const logos = (b.logos as Array<{ logo?: Media; name?: string; url?: string }>) ?? []
  return (
    <Section className="bg-white">
      <div className="container-bs">
        {typeof b.heading === 'string' && <h2 className="mb-8 text-center text-[22px] font-bold text-ink/70">{b.heading}</h2>}
        <div className="flex flex-wrap items-center justify-center gap-10">
          {logos.map((it, i) => {
            const src = img(it.logo)
            if (!src) return null
            const el = (
              <div key={i} className="relative h-12 w-32 opacity-70 transition-opacity hover:opacity-100">
                <Image src={src} alt={it.name ?? ''} fill unoptimized className="object-contain" />
              </div>
            )
            return it.url ? (
              <a key={i} href={it.url}>
                {el}
              </a>
            ) : (
              el
            )
          })}
        </div>
      </div>
    </Section>
  )
}

function RichTextB(b: Block) {
  return (
    <Section>
      <div className="container-bs max-w-3xl">
        <RichText value={b.content} />
      </div>
    </Section>
  )
}

const RENDERERS: Record<string, (b: Block) => React.ReactNode> = {
  hero: HeroB,
  stats: StatsB,
  featureGrid: FeatureGridB,
  gallery: GalleryB,
  cta: CtaB,
  videoEmbed: VideoB,
  logoCloud: LogoCloudB,
  richText: RichTextB,
}

export function RenderBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        const render = b.blockType ? RENDERERS[b.blockType] : undefined
        if (!render) return null
        return (
          <div key={b.id ?? i} data-better-editor-id={b.id}>
            {render(b)}
          </div>
        )
      })}
    </>
  )
}
