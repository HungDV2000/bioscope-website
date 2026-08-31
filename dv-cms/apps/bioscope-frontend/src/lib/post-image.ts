import { img } from '@/lib/images'
import type { BlogPost } from '@/lib/content'

/**
 * Ảnh của một bài viết.
 *
 * Ưu tiên ảnh đại diện biên tập viên tải lên CMS. Chưa có thì dùng bộ ảnh mặc
 * định luân phiên — giống cách trang Nguyên liệu xử lý ảnh thiếu, để thẻ bài
 * không bao giờ trống.
 */
export const postImage = (p: Pick<BlogPost, 'coverUrl' | 'image'>, width: number): string =>
  p.coverUrl || img(p.image, width)
