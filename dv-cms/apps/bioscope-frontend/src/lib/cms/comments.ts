import { cmsFetch } from '@/lib/payload'
import type { Locale } from '@/lib/i18n/config'

export type PostComment = { id: string; author: string; content: string; date: string }

export type CommentsData = {
  /** Khu bình luận có được bật trong Cài đặt website không. */
  enabled: boolean
  comments: PostComment[]
  /** Bình luận có phải chờ duyệt không — quyết định câu thông báo sau khi gửi. */
  requireApproval: boolean
  requireEmail: boolean
  maxLength: number
  /** Ghi chú dưới khung nhập do admin soạn (nếu có). */
  notice?: string
}

const OFF: CommentsData = {
  enabled: false, comments: [], requireApproval: true, requireEmail: false, maxLength: 1500,
}

type ListRes = { ok?: boolean; enabled?: boolean; comments?: PostComment[] }
type SettingsRes = {
  comments?: {
    enabled?: boolean; requireApproval?: boolean; requireEmail?: boolean
    maxLength?: number; notice?: string
  }
}

/**
 * Bình luận đã duyệt của một bài + cấu hình khu bình luận.
 *
 * CMS không phản hồi thì trả về trạng thái TẮT thay vì hiện khung nhập hỏng —
 * khách gõ xong bấm gửi mà lỗi còn khó chịu hơn là không thấy khung nào.
 */
export async function getPostComments(
  postId: number | string,
  locale: Locale,
): Promise<CommentsData> {
  const [list, settings] = await Promise.all([
    cmsFetch<ListRes>(`blog-comments/list?post=${encodeURIComponent(String(postId))}`, {
      revalidate: 30,
    }),
    cmsFetch<SettingsRes>('globals/site-settings?depth=0', { locale, revalidate: 300 }),
  ])
  if (!list?.enabled) return OFF

  const c = settings?.comments ?? {}
  return {
    enabled: true,
    comments: list.comments ?? [],
    requireApproval: c.requireApproval !== false,
    requireEmail: c.requireEmail === true,
    maxLength: typeof c.maxLength === 'number' ? c.maxLength : 1500,
    notice: c.notice?.trim() || undefined,
  }
}
