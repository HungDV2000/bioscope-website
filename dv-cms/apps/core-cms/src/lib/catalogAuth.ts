/**
 * Xác thực khoá API cho các endpoint danh mục công khai.
 *
 * NGUYÊN TẮC BẢO MẬT áp dụng ở đây:
 *  1. Khoá đi ở HEADER, không nhận qua query string — query string bị ghi vào
 *     log truy cập của nginx/CDN và nằm lại trong lịch sử trình duyệt.
 *  2. Chỉ so khớp bằng BĂM; cơ sở dữ liệu không hề có khoá gốc.
 *  3. Khoá bị tắt là chặn ngay, không cần deploy lại.
 *  4. Giới hạn tần suất theo TỪNG KHOÁ (không theo IP): bên gọi là máy chủ nên
 *     mọi lượt gọi đều chung một IP, giới hạn theo IP sẽ vô nghĩa.
 *  5. Ghi nhận lượt dùng để phát hiện bất thường, nhưng gom lại rồi mới ghi để
 *     không biến mỗi lượt gọi thành một lượt ghi cơ sở dữ liệu.
 */
import type { PayloadRequest } from 'payload'
import { createHash } from 'crypto'
import { rateLimit } from './rateLimit.js'

export type CatalogScope = 'search' | 'list' | 'detail' | 'content' | 'site'

export type ApiKeyDoc = {
  id: number | string
  name?: string
  enabled?: boolean
  rateLimitPerMin?: number
  /** Bật riêng cho từng khoá — mặc định tắt. */
  allowPricing?: boolean
  /** Endpoint được phép gọi. Rỗng = không gọi được gì (chặn mặc định). */
  scopes?: CatalogScope[]
  /** Rỗng = không hết hạn. */
  expiresAt?: string | null
}

/** Khoá có quyền gọi endpoint này không. */
export const hasScope = (key: ApiKeyDoc, scope: CatalogScope): boolean =>
  Array.isArray(key.scopes) && key.scopes.includes(scope)

export const hashApiKey = (raw: string) => createHash('sha256').update(raw.trim()).digest('hex')

/** Gom lượt gọi trong bộ nhớ, thỉnh thoảng mới ghi xuống DB. */
const pending = new Map<string, { count: number; lastFlush: number }>()
const FLUSH_EVERY_MS = 60_000

async function recordUsage(req: PayloadRequest, key: ApiKeyDoc): Promise<void> {
  const id = String(key.id)
  const now = Date.now()
  const cur = pending.get(id) ?? { count: 0, lastFlush: 0 }
  cur.count += 1

  if (now - cur.lastFlush < FLUSH_EVERY_MS) {
    pending.set(id, cur)
    return
  }

  const flushing = cur.count
  pending.set(id, { count: 0, lastFlush: now })
  try {
    const doc = (await req.payload.findByID({
      collection: 'api-keys',
      id: key.id,
      depth: 0,
      overrideAccess: true,
    })) as { callCount?: number }
    await req.payload.update({
      collection: 'api-keys',
      id: key.id,
      data: { callCount: (doc.callCount ?? 0) + flushing, lastUsedAt: new Date().toISOString() } as never,
      overrideAccess: true,
    })
  } catch {
    /* Thống kê hỏng thì bỏ qua — không được làm chết lời gọi API của khách. */
  }
}

export type AuthResult = { ok: true; key: ApiKeyDoc } | { ok: false; status: number; error: string }

export async function authenticateApiKey(req: PayloadRequest): Promise<AuthResult> {
  const raw = (req.headers as unknown as Headers)?.get?.('x-api-key') ?? ''
  if (!raw) return { ok: false, status: 401, error: 'Thiếu header x-api-key.' }

  // Tra theo băm: cơ sở dữ liệu không lưu khoá gốc nên có bị lộ cũng không dùng được.
  const found = await req.payload.find({
    collection: 'api-keys',
    where: { and: [{ keyHash: { equals: hashApiKey(raw) } }, { enabled: { equals: true } }] },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const key = found.docs[0] as ApiKeyDoc | undefined
  // Cùng một thông điệp cho "sai khoá" và "khoá bị tắt" — không hé lộ khoá nào
  // đang tồn tại trong hệ thống.
  if (!key) return { ok: false, status: 401, error: 'Khoá API không hợp lệ.' }

  // Hết hạn → chặn. Kiểm ở đây, trước cả giới hạn tần suất.
  if (key.expiresAt && Date.parse(key.expiresAt) < Date.now()) {
    return { ok: false, status: 401, error: 'Khoá API đã hết hạn.' }
  }

  if (!rateLimit(`catalog:${key.id}`, Math.max(1, key.rateLimitPerMin ?? 60), 60_000)) {
    return { ok: false, status: 429, error: 'Gọi quá nhanh, thử lại sau ít giây.' }
  }

  void recordUsage(req, key)
  return { ok: true, key }
}
