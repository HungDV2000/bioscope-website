import { cmsFetch, mediaUrl } from '@/lib/payload'
import type { Locale } from '@/lib/i18n/config'
import type { BlogPost } from '@/lib/content'
import type { ImgKey } from '@/lib/images'

type Paginated<T> = { docs: T[]; totalDocs: number }

type Rel = { title?: string; name?: string; slug?: string } | number

type PostDoc = {
  id: number
  slug: string
  title: string
  excerpt?: string
  content?: unknown
  cover?: { url?: string } | null
  author?: { name?: string; email?: string } | number | null
  categories?: Rel[]
  industries?: ({ title?: string; name?: string } | number)[]
  tags?: ({ title?: string; name?: string } | number)[]
  publishedAt?: string
}

/** Một mục trong bộ lọc — tên hiển thị lấy từ CMS, không phải danh sách cứng. */
export type TaxonomyItem = { slug: string; name: string }

type TaxDoc = { slug?: string; name?: string; order?: number }

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

function relName(rel: Rel | null | undefined): string | undefined {
  if (rel && typeof rel === 'object') return rel.title ?? rel.name
  return undefined
}

function relSlug(rel: Rel | null | undefined): string | undefined {
  return rel && typeof rel === 'object' ? rel.slug : undefined
}

function toPost(d: PostDoc, index: number): BlogPost {
  const body = lexicalToParagraphs(d.content)
  const words = body.join(' ').split(/\s+/).filter(Boolean).length
  const topic = (d.categories ?? []).map(relName).find(Boolean)
  const topicSlug = (d.categories ?? []).map(relSlug).find(Boolean)
  const industry = (d.industries ?? []).map(relName).find(Boolean)
  const authorObj = d.author && typeof d.author === 'object' ? d.author : undefined
  return {
    cmsId: d.id,
    slug: d.slug,
    title: d.title,
    excerpt: d.excerpt ?? body[0] ?? '',
    // Chủ đề và ngành lấy TỪ CMS. Trước đây `industry` bị gán cứng 'Đa ngành'
    // nên mọi bộ lọc ngành khác đều đếm ra 0.
    topic: (topic ?? '') as BlogPost['topic'],
    topicSlug,
    industry: (industry ?? '') as BlogPost['industry'],
    readTime: Math.max(3, Math.round(words / 200)),
    date: d.publishedAt ? d.publishedAt.slice(0, 10) : '',
    author: authorObj?.name ?? authorObj?.email ?? 'Bioscope',
    // Ảnh đại diện thật nếu biên tập viên đã tải lên; không thì dùng ảnh mặc
    // định luân phiên để thẻ bài không bị trống.
    coverUrl: mediaUrl(d.cover?.url) ?? undefined,
    image: FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
    // Giữ nguyên richText để trang chi tiết dựng đúng định dạng biên tập viên soạn.
    contentRich: d.content,
    body,
    tags: (d.tags ?? []).map(relName).filter((t): t is string => Boolean(t)),
  }
}

/** Đọc một taxonomy (chủ đề / ngành) để dựng bộ lọc. Trả [] khi CMS không phản hồi. */
async function getTaxonomy(collection: string, locale: Locale): Promise<TaxonomyItem[]> {
  const res = await cmsFetch<Paginated<TaxDoc>>(
    `${collection}?limit=100&sort=order&depth=0`,
    { locale, revalidate: 300 },
  )
  return (res?.docs ?? [])
    .map((d) => ({ slug: d.slug ?? '', name: d.name ?? '' }))
    .filter((x) => x.name)
}

export const getPostCategories = (locale: Locale) => getTaxonomy('categories', locale)
export const getIndustries = (locale: Locale) => getTaxonomy('industries', locale)

/**
 * Bài đã có nội dung ở ngôn ngữ đang xem chưa.
 *
 * Trường tiêu đề là ĐA NGỮ: đăng bản tiếng Anh mà chưa dịch sang tiếng Việt thì
 * Payload trả bản ghi với tiêu đề rỗng. Trước đây thẻ bài vẫn hiện ra — chỉ có
 * ảnh và nút "Đọc bài viết", không có chữ nào. Lọc bỏ ở đây thay vì ở từng chỗ
 * hiển thị, để mọi nơi (trang Bản tin, trang chủ, bài liên quan) đều nhất quán.
 */
const hasContent = (d: PostDoc): boolean =>
  typeof d.title === 'string' && d.title.trim().length > 0

/** All published posts (newest first). Returns null on failure/empty (caller falls back to static). */
export async function getPosts(locale: Locale): Promise<BlogPost[] | null> {
  /**
   * `fallback-locale=none` — TẮT dự phòng ngôn ngữ cho lời gọi này.
   *
   * Cấu hình site đặt en dự phòng về vi, nên bài chỉ có bản tiếng Việt vẫn trả
   * về tiêu đề tiếng Việt khi xem trang tiếng Anh — khách Anh đọc phải chữ Việt.
   * Còn vi không có dự phòng nên bài chưa dịch trả tiêu đề RỖNG, sinh ra thẻ
   * trắng không chữ.
   *
   * Tắt dự phòng làm cả hai trường hợp cùng trả rỗng, rồi `hasContent` lọc bỏ.
   * Kết quả: mỗi ngôn ngữ chỉ hiện bài THẬT SỰ có nội dung ở ngôn ngữ đó.
   *
   * Chỉ tắt ở đây, không đổi cấu hình chung — các trang khác vẫn cần dự phòng
   * để không trống trơn khi chưa dịch xong.
   */
  const res = await cmsFetch<Paginated<PostDoc>>(
    'posts?limit=100&sort=-publishedAt&depth=1&fallback-locale=none',
    { locale, revalidate: 60 },
  )
  if (!res?.docs?.length) return null
  const usable = res.docs.filter(hasContent)
  // Không còn bài nào ở ngôn ngữ này → trả null để nơi gọi dùng nội dung tĩnh.
  return usable.length ? usable.map(toPost) : null
}
