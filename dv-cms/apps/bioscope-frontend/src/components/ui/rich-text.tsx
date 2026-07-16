import React from 'react'

/**
 * Minimal Lexical → JSX renderer for CMS richText fields (paragraphs, headings,
 * lists, bold/italic, links). Shared by the block renderer and section blocks.
 */

type Node = {
  type?: string
  tag?: string
  text?: string
  format?: number
  url?: string
  fields?: { url?: string }
  listType?: string
  children?: unknown[]
}

/** True when the lexical value has any real text content (not empty/undefined). */
export function hasRichText(value: unknown): boolean {
  const root = (value as { root?: { children?: unknown[] } } | undefined)?.root
  if (!root?.children?.length) return false
  const anyText = (nodes: unknown[]): boolean =>
    nodes.some((n) => {
      const node = n as Node
      if (typeof node.text === 'string' && node.text.trim()) return true
      return Array.isArray(node.children) ? anyText(node.children) : false
    })
  return anyText(root.children)
}

function renderInline(nodes: unknown[]): React.ReactNode {
  return nodes.map((n, i) => {
    const node = n as Node
    if (typeof node.text === 'string') {
      let el: React.ReactNode = node.text
      if (node.format && node.format & 1) el = <strong key={i}>{el}</strong>
      if (node.format && node.format & 2) el = <em key={i}>{el}</em>
      if (node.format && node.format & 8) el = <u key={i}>{el}</u>
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
}

export function RichText({ value, className }: { value: unknown; className?: string }) {
  const root = (value as { root?: { children?: unknown[] } } | undefined)?.root
  if (!root?.children) return null
  return (
    <div className={className ?? 'prose prose-neutral max-w-none'}>
      {root.children.map((c, i) => {
        const node = c as Node
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

/**
 * Render `value` as styled richText when present, otherwise the plain-text
 * `fallback` wrapped in a <p>. Lets CMS-edited rich descriptions override the
 * static i18n string without breaking the fallback.
 */
export function RichOrText({
  value,
  fallback,
  className,
}: {
  value?: unknown
  fallback?: string
  className?: string
}) {
  if (hasRichText(value)) return <RichText value={value} className={className} />
  return fallback ? <p className={className}>{fallback}</p> : null
}
