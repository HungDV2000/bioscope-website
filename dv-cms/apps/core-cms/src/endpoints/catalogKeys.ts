/**
 * Phát / đổi khoá API — CHỈ ADMIN.
 *
 * Khoá gốc chỉ tồn tại trong đúng phản hồi này rồi biến mất khỏi hệ thống: CSDL
 * chỉ giữ SHA-256. Mất khoá thì phát lại, không có đường "xem lại".
 */
import type { Endpoint, PayloadRequest } from 'payload'
import { randomBytes } from 'crypto'
import { hashApiKey } from '../lib/catalogAuth.js'

const json = (data: unknown, status = 200) =>
  Response.json(data as never, { status, headers: { 'Cache-Control': 'private, no-store' } })

const issueEndpoint: Endpoint = {
  path: '/catalog/keys/issue',
  method: 'post',
  handler: async (req: PayloadRequest): Promise<Response> => {
    if ((req.user as { role?: string; collection?: string } | undefined)?.role !== 'admin') {
      return json({ ok: false, error: 'Chỉ admin được phát khoá.' }, 403)
    }
    const body = (await (req as unknown as Request).json().catch(() => ({}))) as { id?: string | number }
    if (body.id == null) return json({ ok: false, error: 'Thiếu id bản ghi khoá.' }, 400)

    // 32 byte ngẫu nhiên từ nguồn của hệ điều hành ⇒ 256 bit entropy, không đoán được.
    const plain = `bsk_${randomBytes(32).toString('base64url')}`

    try {
      await req.payload.update({
        collection: 'api-keys',
        id: body.id,
        data: {
          keyHash: hashApiKey(plain),
          keyPrefix: plain.slice(0, 12),
          // Phát khoá mới thì số liệu cũ không còn ý nghĩa.
          callCount: 0,
          lastUsedAt: null,
        } as never,
        overrideAccess: true,
        req,
      })
    } catch (e) {
      req.payload.logger.error(`[catalog-keys] phát khoá lỗi: ${String(e)}`)
      return json({ ok: false, error: 'Không lưu được khoá.' }, 500)
    }

    // KHÔNG ghi `plain` vào log ở bất kỳ đâu.
    req.payload.logger.info(`[catalog-keys] đã phát khoá mới cho bản ghi ${body.id}`)
    return json({
      ok: true,
      key: plain,
      warning: 'Khoá chỉ hiện MỘT LẦN. Lưu lại ngay — hệ thống không xem lại được.',
    })
  },
}

export const catalogKeyEndpoints: Endpoint[] = [issueEndpoint]
