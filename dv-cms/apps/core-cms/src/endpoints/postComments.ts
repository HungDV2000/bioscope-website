/**
 * Bình luận bài viết — hai endpoint công khai.
 *
 *   GET  /api/blog-comments/list?post=<id>  → bình luận ĐÃ DUYỆT của một bài
 *   POST /api/blog-comments/submit          → khách gửi bình luận mới
 *
 * ĐƯỜNG DẪN CỐ Ý KHÁC slug collection (`post-comments`). Payload dựng sẵn route
 * REST theo slug, và route đó CHE MẤT endpoint tuỳ biến trùng tên — gọi
 * /api/post-comments/list sẽ bị hiểu là "lấy tài liệu có id = list" và trả 403.
 *
 * ══ ĐÂY LÀ ĐƯỜNG GHI MỞ CHO NGƯỜI LẠ ══
 * Khác mọi endpoint khác của hệ thống, cái này nhận dữ liệu từ người không đăng
 * nhập. Các lớp chặn:
 *   1. Tắt được hoàn toàn từ Cài đặt website.
 *   2. Giới hạn tần suất theo IP, ngưỡng do admin đặt.
 *   3. Chỉ nhận đúng bốn trường; trạng thái do MÁY CHỦ quyết định, khách không
 *      tự đặt được "đã duyệt".
 *   4. Bài phải tồn tại và đã xuất bản.
 *   5. Endpoint đọc chỉ trả tên, nội dung, ngày — KHÔNG bao giờ trả email/IP.
 */
import type { Endpoint, PayloadRequest } from 'payload'
import { rateLimit, clientIp } from '../lib/rateLimit.js'

const json = (data: unknown, status = 200) =>
  Response.json(data as never, { status, headers: { 'Cache-Control': 'no-store' } })

type CommentSettings = {
  enabled: boolean
  requireApproval: boolean
  requireEmail: boolean
  maxLength: number
  perHourPerIp: number
}

/** Đọc cấu hình bình luận. Lỗi thì mặc định TẮT — an toàn hơn là mở nhầm. */
async function getSettings(payload: PayloadRequest['payload']): Promise<CommentSettings> {
  try {
    const g = (await payload.findGlobal({ slug: 'site-settings', depth: 0 })) as unknown as {
      comments?: Partial<CommentSettings>
    }
    const c = g?.comments ?? {}
    return {
      enabled: c.enabled === true,
      requireApproval: c.requireApproval !== false,
      requireEmail: c.requireEmail === true,
      maxLength: typeof c.maxLength === 'number' && c.maxLength > 0 ? Math.min(c.maxLength, 5000) : 1500,
      perHourPerIp: typeof c.perHourPerIp === 'number' && c.perHourPerIp > 0 ? Math.min(c.perHourPerIp, 60) : 5,
    }
  } catch {
    return { enabled: false, requireApproval: true, requireEmail: false, maxLength: 1500, perHourPerIp: 5 }
  }
}

// ── GET /api/post-comments/list ──────────────────────────────────────────────
const listEndpoint: Endpoint = {
  path: '/blog-comments/list',
  method: 'get',
  handler: async (req: PayloadRequest): Promise<Response> => {
    const cfg = await getSettings(req.payload)
    if (!cfg.enabled) return json({ ok: true, enabled: false, comments: [] })

    const postId = Number(req.query?.post)
    if (!Number.isFinite(postId)) return json({ ok: false, error: 'Thiếu tham số post.' }, 400)

    const res = await req.payload.find({
      collection: 'post-comments',
      where: { and: [{ post: { equals: postId } }, { status: { equals: 'approved' } }] },
      sort: '-createdAt',
      limit: 100,
      depth: 0,
      // overrideAccess: collection đóng với khách, nhưng ta CHỦ ĐỘNG chỉ lấy bản
      // đã duyệt và chỉ trả ba trường an toàn ở dưới.
      overrideAccess: true,
      select: { authorName: true, content: true, createdAt: true } as never,
    })

    return json({
      ok: true,
      enabled: true,
      comments: res.docs.map((d) => {
        const x = d as { id: unknown; authorName?: string; content?: string; createdAt?: string }
        return {
          id: String(x.id),
          author: x.authorName ?? '',
          content: x.content ?? '',
          date: (x.createdAt ?? '').slice(0, 10),
        }
      }),
    })
  },
}

// ── POST /api/post-comments/submit ───────────────────────────────────────────
const submitEndpoint: Endpoint = {
  path: '/blog-comments/submit',
  method: 'post',
  handler: async (req: PayloadRequest): Promise<Response> => {
    const cfg = await getSettings(req.payload)
    if (!cfg.enabled) return json({ ok: false, error: 'Bình luận đang tắt.' }, 403)

    const ip = clientIp(req)
    if (!rateLimit(`comment:${ip}`, cfg.perHourPerIp, 60 * 60 * 1000)) {
      return json({ ok: false, error: 'Bạn gửi quá nhanh. Thử lại sau ít phút.' }, 429)
    }

    const body = (await (req as unknown as Request).json().catch(() => ({}))) as Record<string, unknown>
    const str = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max)
    const authorName = str(body.name, 120)
    const authorEmail = str(body.email, 200)
    const content = str(body.content, cfg.maxLength)
    const postId = Number(body.post)

    if (!authorName || !content) return json({ ok: false, error: 'Vui lòng nhập họ tên và nội dung.' }, 400)
    if (cfg.requireEmail && !authorEmail) return json({ ok: false, error: 'Vui lòng nhập email.' }, 400)
    if (authorEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(authorEmail)) {
      return json({ ok: false, error: 'Email không hợp lệ.' }, 400)
    }
    if (!Number.isFinite(postId)) return json({ ok: false, error: 'Thiếu bài viết.' }, 400)

    // Bài phải tồn tại và đã xuất bản — chặn gửi vào bản nháp hoặc id bịa.
    const post = await req.payload.find({
      collection: 'posts',
      where: { id: { equals: postId } },
      limit: 1,
      depth: 0,
      overrideAccess: false,
    })
    if (!post.docs.length) return json({ ok: false, error: 'Không tìm thấy bài viết.' }, 404)

    // Trạng thái do MÁY CHỦ quyết định. Không đọc từ body.
    const status = cfg.requireApproval ? 'pending' : 'approved'

    try {
      await req.payload.create({
        collection: 'post-comments',
        data: {
          post: postId,
          status,
          authorName,
          authorEmail: authorEmail || undefined,
          content,
          authorIp: ip,
          locale: String(req.query?.locale ?? 'vi'),
        } as never,
        overrideAccess: true,
      })
    } catch (e) {
      req.payload.logger.error(`[comments] không lưu được: ${String(e)}`)
      return json({ ok: false, error: 'Không gửi được, thử lại sau.' }, 500)
    }

    return json({ ok: true, pending: status === 'pending' }, 201)
  },
}

export const postCommentEndpoints: Endpoint[] = [listEndpoint, submitEndpoint]
