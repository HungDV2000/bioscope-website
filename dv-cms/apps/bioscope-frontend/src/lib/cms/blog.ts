import { cmsFetch } from '@/lib/payload'
import type { Locale } from '@/lib/i18n/config'
import type { BlogPost } from '@/lib/content'
import type { ImgKey } from '@/lib/images'

type Paginated<T> = { docs: T[]; totalDocs: number }

type PostDoc = {
  slug: string
  title: string
  excerpt?: string
  content?: unknown
  cover?: { url?: string } | null
  author?: { name?: string; email?: string } | number | null
  categories?: ({ title?: string; name?: string } | number)[]
  tags?: ({ title?: string; name?: string } | number)[]
  publishedAt?: string
}

// Rotating placeholder images until covers are uploaded to Media.
const FALLBACK_IMAGES: ImgKey[] = ['labWork', 'botanical', 'capsules', 'microscope', 'powder', 'glassware']

/** Flatten a Lexical richText value into an array of plain paragraphs. */
function lexicalToParagraphs(value: unknown): string[] {
  const root = (value as { root?: { children?: unknown[] } } | undefined)?.root
  if (!root?.children) return []
  const readNode = (node: unknown): string => {
    const n = node as { text?: string; children?: unknown[] }
    if (typeof n.text === 'string') return n.text
    if (Array.isArray(n.children)) return n.children.map(readNode).join('')
    return ''
  }
  return root.children.map(readNode).map((s) => s.trim()).filter(Boolean)
}

function relName(rel: { title?: string; name?: string } | number | null | undefined): string | undefined {
  if (rel && typeof rel === 'object') return rel.title ?? rel.name
  return undefined
}

function toPost(d: PostDoc, index: number): BlogPost {
  const body = lexicalToParagraphs(d.content)
  const words = body.join(' ').split(/\s+/).filter(Boolean).length
  const topic = (d.categories ?? []).map(relName).find(Boolean)
  const authorObj = d.author && typeof d.author === 'object' ? d.author : undefined
  return {
    slug: d.slug,
    title: d.title,
    excerpt: d.excerpt ?? body[0] ?? '',
    topic: (topic ?? 'Phát triển nhãn hàng') as BlogPost['topic'],
    industry: 'Đa ngành' as BlogPost['industry'],
    readTime: Math.max(3, Math.round(words / 200)),
    date: d.publishedAt ? d.publishedAt.slice(0, 10) : '',
    author: authorObj?.name ?? authorObj?.email ?? 'Bioscope',
    image: FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
    body,
    tags: (d.tags ?? []).map(relName).filter((t): t is string => Boolean(t)),
  }
}

/** All published posts (newest first). Returns null on failure/empty (caller falls back to static). */
export async function getPosts(locale: Locale): Promise<BlogPost[] | null> {
  const res = await cmsFetch<Paginated<PostDoc>>('posts?limit=100&sort=-publishedAt&depth=1', {
    locale,
    revalidate: 60,
  })
  if (!res?.docs?.length) return null
  return res.docs.map(toPost)
}
