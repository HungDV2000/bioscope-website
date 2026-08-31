import React from 'react'
import { mediaUrl } from '@/lib/payload'

/**
 * Lexical → JSX renderer for CMS richText fields. Handles paragraphs, headings,
 * lists (bullet/number/checklist), quotes, horizontal rules, links, uploaded
 * images, tables, text alignment, and inline formatting (bold / italic /
 * underline / strikethrough / code / sub / sup) plus brand text colors.
 *
 * NOTE: the color keys below mirror the TextStateFeature config in
 * apps/core-cms/src/payload.config.ts — keep them in sync.
 */

type Node = {
  type?: string
  tag?: string
  text?: string
  format?: number | string
  style?: string
  url?: string
  fields?: { url?: string; newTab?: boolean; doc?: unknown }
  listType?: string
  checked?: boolean
  value?: { url?: string; alt?: string; filename?: string } | number | string
  relationTo?: string
  headerState?: number
  children?: unknown[]
  $?: Record<string, string>
}

// Lexical inline format bitmask
const F_BOLD = 1
const F_ITALIC = 2
const F_STRIKE = 4
const F_UNDERLINE = 8
const F_CODE = 16
const F_SUBSCRIPT = 32
const F_SUPERSCRIPT = 64

const COLOR_CSS: Record<string, React.CSSProperties> = {
  green: { color: '#008E4D' },
  orange: { color: '#F58E33' },
  red: { color: '#DC2626' },
  muted: { color: '#5B6B62' },
}
const HIGHLIGHT_CSS: Record<string, React.CSSProperties> = {
  greenBg: { backgroundColor: '#EEF6F1', padding: '0 3px', borderRadius: 3 },
  orangeBg: { backgroundColor: '#FFF4E8', padding: '0 3px', borderRadius: 3 },
}

const ALIGN_CLASS: Record<string, string> = {
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
  left: 'text-left',
}

/** True when the lexical value has any real text content (not empty/undefined). */
export function hasRichText(value: unknown): boolean {
  const root = (value as { root?: { children?: unknown[] } } | undefined)?.root
  if (!root?.children?.length) return false
  const anyText = (nodes: unknown[]): boolean =>
    nodes.some((n) => {
      const node = n as Node
      if (typeof node.text === 'string' && node.text.trim()) return true
      if (node.type === 'upload' || node.type === 'horizontalrule' || node.type === 'table') return true
      return Array.isArray(node.children) ? anyText(node.children) : false
    })
  return anyText(root.children)
}

function textStyle(node: Node): React.CSSProperties | undefined {
  const s = node.$
  if (!s) return undefined
  const style = { ...(s.color ? COLOR_CSS[s.color] : {}), ...(s.highlight ? HIGHLIGHT_CSS[s.highlight] : {}) }
  return Object.keys(style).length ? style : undefined
}

function renderInline(nodes: unknown[]): React.ReactNode {
  return nodes.map((n, i) => {
    const node = n as Node
    if (typeof node.text === 'string') {
      const fmt = typeof node.format === 'number' ? node.format : 0
      let el: React.ReactNode = node.text
      if (fmt & F_CODE) el = <code key={i} className="rounded bg-mist px-1.5 py-0.5 text-[0.9em]">{el}</code>
      if (fmt & F_BOLD) el = <strong key={i}>{el}</strong>
      if (fmt & F_ITALIC) el = <em key={i}>{el}</em>
      if (fmt & F_UNDERLINE) el = <u key={i}>{el}</u>
      if (fmt & F_STRIKE) el = <s key={i}>{el}</s>
      if (fmt & F_SUBSCRIPT) el = <sub key={i}>{el}</sub>
      if (fmt & F_SUPERSCRIPT) el = <sup key={i}>{el}</sup>
      const style = textStyle(node)
      return (
        <span key={i} style={style}>
          {el}
        </span>
      )
    }
    if (node.type === 'link' || node.type === 'autolink') {
      const href = node.fields?.url || node.url || '#'
      const newTab = node.fields?.newTab
      return (
        <a
          key={i}
          href={href}
          className="text-primary underline underline-offset-2 hover:text-primary-dark"
          {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {node.children ? renderInline(node.children) : null}
        </a>
      )
    }
    if (node.type === 'linebreak') return <br key={i} />
    return node.children ? <React.Fragment key={i}>{renderInline(node.children)}</React.Fragment> : null
  })
}

function alignClass(node: Node): string | undefined {
  return typeof node.format === 'string' ? ALIGN_CLASS[node.format] : undefined
}

function renderImage(node: Node, key: React.Key): React.ReactNode {
  const val = node.value
  if (!val || typeof val !== 'object') return null
  const url = mediaUrl(val.url)
  if (!url) return null
  return (
    <figure key={key} className="my-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={val.alt ?? ''} className="mx-auto h-auto max-w-full rounded-xl" loading="lazy" />
      {val.alt ? <figcaption className="mt-2 text-center text-[13px] text-ink/50">{val.alt}</figcaption> : null}
    </figure>
  )
}

function renderCellChildren(children: unknown[] | undefined): React.ReactNode {
  if (!children?.length) return null
  // Cells contain block children (paragraphs); flatten their inline content.
  return children.map((c, i) => {
    const node = c as Node
    if (node.type === 'paragraph' || !node.type) return <React.Fragment key={i}>{renderInline(node.children ?? [])}</React.Fragment>
    return <React.Fragment key={i}>{renderBlock(node, i)}</React.Fragment>
  })
}

function renderTable(node: Node, key: React.Key): React.ReactNode {
  const rows = (node.children ?? []) as Node[]
  return (
    <div key={key} className="my-6 overflow-x-auto">
      <table className="w-full border-collapse text-[14px]">
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-primary-border/60">
              {((row.children ?? []) as Node[]).map((cell, ci) => {
                const isHeader = Boolean(cell.headerState)
                const Tag = isHeader ? 'th' : 'td'
                return (
                  <Tag
                    key={ci}
                    className={
                      isHeader
                        ? 'border border-primary-border bg-mist px-3 py-2 text-left font-semibold text-ink'
                        : 'border border-primary-border px-3 py-2 align-top text-ink/80'
                    }
                  >
                    {renderCellChildren(cell.children)}
                  </Tag>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Chữ thuần của một node — dùng để sinh id neo cho tiêu đề. */
export function nodeText(node: unknown): string {
  const n = node as { text?: string; children?: unknown[] }
  if (typeof n?.text === 'string') return n.text
  if (Array.isArray(n?.children)) return n.children.map(nodeText).join('')
  return ''
}

/** Bỏ dấu tiếng Việt rồi tạo slug — dùng làm id neo cho mục lục. */
export function headingId(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

function renderBlock(node: Node, key: React.Key): React.ReactNode {
  switch (node.type) {
    case 'heading': {
      const Tag = (node.tag as 'h2') || 'h2'
      // id neo để mục lục bên trái nhảy tới đúng mục.
      const id = headingId(nodeText(node))
      return (
        <Tag key={key} id={id || undefined} className={`scroll-mt-28 ${alignClass(node) ?? ''}`.trim()}>
          {renderInline(node.children ?? [])}
        </Tag>
      )
    }
    case 'quote':
      return (
        <blockquote key={key} className="my-5 border-l-4 border-primary/60 bg-mist/60 py-2 pl-4 pr-3 italic text-ink/75">
          {renderInline(node.children ?? [])}
        </blockquote>
      )
    case 'horizontalrule':
      return <hr key={key} className="my-8 border-t border-primary-border/70" />
    case 'upload':
      return renderImage(node, key)
    case 'table':
      return renderTable(node, key)
    case 'list': {
      const Tag = node.listType === 'number' ? 'ol' : 'ul'
      const isCheck = node.listType === 'check'
      return (
        <Tag key={key} className={isCheck ? 'list-none space-y-1 pl-0' : undefined}>
          {(node.children ?? []).map((li, j) => {
            const item = li as Node
            if (isCheck) {
              return (
                <li key={j} className="flex items-start gap-2">
                  <input type="checkbox" checked={Boolean(item.checked)} readOnly className="mt-1.5 accent-primary" />
                  <span className={item.checked ? 'text-ink/50 line-through' : undefined}>{renderInline(item.children ?? [])}</span>
                </li>
              )
            }
            return <li key={j}>{renderInline(item.children ?? [])}</li>
          })}
        </Tag>
      )
    }
    case 'paragraph':
    default: {
      const cls = alignClass(node)
      // Skip truly empty paragraphs to avoid stray gaps.
      if (!node.children?.length) return <p key={key} className={cls} />
      return (
        <p key={key} className={cls}>
          {renderInline(node.children)}
        </p>
      )
    }
  }
}

export function RichText({ value, className }: { value: unknown; className?: string }) {
  const root = (value as { root?: { children?: unknown[] } } | undefined)?.root
  if (!root?.children) return null
  return <div className={className ?? 'prose prose-neutral max-w-none'}>{root.children.map((c, i) => renderBlock(c as Node, i))}</div>
}

/**
 * Renders the CMS rich-text `value` when it has content, otherwise a plain-text
 * `fallback` (static i18n copy). Both share the same `className` so the styling
 * is identical whichever source is used.
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
  if (!fallback) return null
  return <div className={className}>{fallback}</div>
}
