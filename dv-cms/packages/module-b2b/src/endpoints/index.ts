import type { Endpoint, PayloadRequest } from 'payload'
import { addDataAndFileToRequest } from 'payload'

export type B2BEndpointOptions = {
  /** Members auth cookie max-age (seconds). Default 7 days. */
  cookieMaxAge?: number
}

const json = (data: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  })

const tokenCookie = (token: string, maxAge: number) =>
  `payload-token=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}${
    process.env.NODE_ENV === 'production' ? '; Secure' : ''
  }`

const baseUrl = (req: PayloadRequest) =>
  req.payload.config.serverURL ||
  `${req.headers.get('x-forwarded-proto') ?? 'http'}://${req.headers.get('host') ?? 'localhost:3001'}`

/** Khoá tin cậy giữa frontend và CMS (cùng stack). Thiếu = tắt hẳn kênh nội bộ. */
const internalSecret = () => (process.env.INTERNAL_API_SECRET || process.env.PAYLOAD_SECRET || '').trim()

/** So sánh chuỗi theo thời gian hằng số. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export type ActingMember = { id: string | number; email: string; [k: string]: unknown }

/**
 * Xác định thành viên đang thao tác, theo 2 đường:
 *  1. JWT/cookie Payload thường (req.user) — đăng nhập bằng mật khẩu.
 *  2. Kênh nội bộ server-to-server: frontend đã tự xác thực người dùng bằng
 *     cookie phiên CÓ KÝ của nó, rồi gọi sang kèm khoá nội bộ + id thành viên.
 *     Cần đường này vì tài khoản Google không có mật khẩu nên không cấp được
 *     JWT của Payload.
 *
 * Trả null nếu không xác định được (gọi hàm phải trả 401).
 */
export async function resolveMember(req: PayloadRequest): Promise<ActingMember | null> {
  if (req.user && req.user.collection === 'members') return req.user as unknown as ActingMember

  const secret = internalSecret()
  if (!secret) return null // fail-closed: chưa cấu hình khoá thì không mở kênh nội bộ
  const given = req.headers.get('x-internal-secret') ?? ''
  const memberId = req.headers.get('x-member-id') ?? ''
  if (!given || !memberId || !safeEqual(given, secret)) return null

  try {
    const doc = await req.payload.findByID({
      collection: 'members',
      id: memberId,
      depth: 0,
      overrideAccess: true,
      req,
    })
    return doc as unknown as ActingMember
  } catch {
    return null
  }
}

export const createB2BEndpoints = (opts: B2BEndpointOptions = {}): Endpoint[] => {
  const maxAge = opts.cookieMaxAge ?? 60 * 60 * 24 * 7

  return [
    // ── Register (always pending) ───────────────────────────────
    {
      path: '/b2b/register',
      method: 'post',
      handler: async (req: PayloadRequest) => {
        await addDataAndFileToRequest(req)
        const { email, password, company, contactName, phone, customerType, taxCode, position } =
          (req.data ?? {}) as Record<string, string>
        const type = customerType === 'individual' ? 'individual' : 'business'
        if (!email || !password || !contactName) {
          return json({ error: 'Thiếu thông tin bắt buộc.' }, { status: 400 })
        }
        // Khách cá nhân không có công ty; khách doanh nghiệp thì bắt buộc.
        if (type === 'business' && !company?.trim()) {
          return json({ error: 'Vui lòng nhập tên công ty.' }, { status: 400 })
        }
        try {
          await req.payload.create({
            collection: 'members',
            data: {
              email,
              password,
              customerType: type,
              company: type === 'business' ? company.trim() : undefined,
              taxCode: type === 'business' ? taxCode?.trim() : undefined,
              position: type === 'business' ? position?.trim() : undefined,
              contactName,
              phone,
              status: 'pending',
              authProvider: 'password',
              hasPassword: true,
            },
            overrideAccess: true,
            req,
          })
          return json({ ok: true, message: 'Đăng ký thành công, vui lòng chờ duyệt.' }, { status: 201 })
        } catch (err) {
          return json({ error: 'Email đã tồn tại hoặc dữ liệu không hợp lệ.', detail: String(err) }, { status: 409 })
        }
      },
    },

    // ── Login ───────────────────────────────────────────────────
    {
      path: '/b2b/login',
      method: 'post',
      handler: async (req: PayloadRequest) => {
        await addDataAndFileToRequest(req)
        const { email, password } = (req.data ?? {}) as Record<string, string>
        if (!email || !password) return json({ error: 'Thiếu email/mật khẩu.' }, { status: 400 })
        try {
          const result = await req.payload.login({
            collection: 'members',
            data: { email, password },
            req,
          })
          return json(
            { user: result.user, token: result.token },
            { status: 200, headers: { 'Set-Cookie': tokenCookie(result.token ?? '', maxAge) } },
          )
        } catch {
          return json({ error: 'Sai email hoặc mật khẩu.' }, { status: 401 })
        }
      },
    },

    // ── Logout ──────────────────────────────────────────────────
    {
      path: '/b2b/logout',
      method: 'post',
      handler: async () =>
        json({ ok: true }, { headers: { 'Set-Cookie': tokenCookie('', 0) } }),
    },

    // ── Current member ──────────────────────────────────────────
    {
      path: '/b2b/me',
      method: 'get',
      handler: async (req: PayloadRequest) => {
        if (req.user && req.user.collection === 'members') return json({ user: req.user })
        return json({ user: null }, { status: 401 })
      },
    },

    // ── Update own profile ──────────────────────────────────────
    // Chỉ cho sửa thông tin liên hệ. `status`/`email` KHÔNG sửa được từ đây
    // (status có field-level access chặn, email đổi sẽ đổi cả danh tính đăng nhập).
    {
      path: '/b2b/profile',
      method: 'post',
      handler: async (req: PayloadRequest) => {
        await addDataAndFileToRequest(req)
        const me = await resolveMember(req)
        if (!me) return json({ error: 'Chưa đăng nhập.' }, { status: 401 })
        const { company, contactName, phone, customerType, taxCode, position } =
          (req.data ?? {}) as Record<string, string>
        // Chưa chọn loại thì giữ nguyên loại đang lưu (vd tài khoản Google).
        const stored = (me as { customerType?: string }).customerType
        const type: 'business' | 'individual' =
          customerType === 'individual' || customerType === 'business'
            ? customerType
            : stored === 'individual'
              ? 'individual'
              : 'business'
        if (!contactName?.trim()) {
          return json({ error: 'Thiếu tên người liên hệ.' }, { status: 400 })
        }
        if (type === 'business' && !company?.trim()) {
          return json({ error: 'Vui lòng nhập tên công ty.' }, { status: 400 })
        }
        try {
          const user = await req.payload.update({
            collection: 'members',
            id: me.id,
            data: {
              customerType: type,
              // Chuyển sang cá nhân thì dọn luôn dữ liệu doanh nghiệp, tránh
              // hồ sơ còn sót thông tin công ty cũ gây hiểu nhầm.
              company: type === 'business' ? company.trim().slice(0, 200) : null,
              taxCode: type === 'business' ? (taxCode?.trim().slice(0, 40) || null) : null,
              position: type === 'business' ? (position?.trim().slice(0, 120) || null) : null,
              contactName: contactName.trim().slice(0, 120),
              phone: phone?.trim().slice(0, 40) || undefined,
            },
            overrideAccess: true, // access `update: isAdmin` — tự sửa mình đã kiểm ở trên
            req,
          })
          return json({ user })
        } catch (err) {
          return json({ error: 'Cập nhật thất bại.', detail: String(err) }, { status: 400 })
        }
      },
    },

    // ── Change own password ─────────────────────────────────────
    {
      path: '/b2b/change-password',
      method: 'post',
      handler: async (req: PayloadRequest) => {
        await addDataAndFileToRequest(req)
        const acting = await resolveMember(req)
        if (!acting) return json({ error: 'Chưa đăng nhập.' }, { status: 401 })
        const { currentPassword, newPassword } = (req.data ?? {}) as Record<string, string>
        if (!newPassword || newPassword.length < 8) {
          return json({ error: 'Mật khẩu mới phải từ 8 ký tự.' }, { status: 400 })
        }

        // Tài khoản Google chưa từng đặt mật khẩu → cho đặt lần đầu, không hỏi
        // mật khẩu cũ. Còn lại bắt buộc xác minh mật khẩu hiện tại.
        const me = acting as unknown as { email: string; hasPassword?: boolean }
        const needsCurrent = me.hasPassword !== false

        if (needsCurrent) {
          if (!currentPassword) return json({ error: 'Thiếu mật khẩu hiện tại.' }, { status: 400 })
          try {
            await req.payload.login({
              collection: 'members',
              data: { email: me.email, password: currentPassword },
              req,
            })
          } catch {
            return json({ error: 'Mật khẩu hiện tại không đúng.' }, { status: 403 })
          }
        }

        try {
          await req.payload.update({
            collection: 'members',
            id: acting.id,
            data: { password: newPassword, hasPassword: true },
            overrideAccess: true,
            req,
          })
          return json({ ok: true })
        } catch (err) {
          return json({ error: 'Đổi mật khẩu thất bại.', detail: String(err) }, { status: 400 })
        }
      },
    },

    // ── List documents the member may access ────────────────────
    {
      path: '/b2b/documents',
      method: 'get',
      handler: async (req: PayloadRequest) => {
        const me = await resolveMember(req)
        if (!me) return json({ error: 'Chưa đăng nhập.' }, { status: 401 })
        // Khu tài liệu B2B chỉ mở cho tài khoản đã được admin duyệt (tài khoản
        // Google tự duyệt ở mức cơ bản vẫn là 'pending' ở đây).
        if ((me as { status?: string }).status !== 'approved') {
          return json({ error: 'Tài khoản chưa được duyệt.' }, { status: 403 })
        }
        const result = await req.payload.find({
          collection: 'gated-documents',
          depth: 1,
          overrideAccess: false,
          user: { ...me, collection: 'members' } as never,
          req,
          limit: 100,
        })
        return json({ docs: result.docs, totalDocs: result.totalDocs })
      },
    },

    // ── Download a document (access-checked) ─────────────────────
    {
      path: '/b2b/documents/:id/download',
      method: 'get',
      handler: async (req: PayloadRequest) => {
        const id = req.routeParams?.id as string | undefined
        if (!id) return json({ error: 'Thiếu id.' }, { status: 400 })
        const me = await resolveMember(req)
        if (!me) return json({ error: 'Chưa đăng nhập.' }, { status: 401 })
        if ((me as { status?: string }).status !== 'approved') {
          return json({ error: 'Tài khoản chưa được duyệt.' }, { status: 403 })
        }
        try {
          const doc = (await req.payload.findByID({
            collection: 'gated-documents',
            id,
            depth: 1,
            overrideAccess: false,
            user: { ...me, collection: 'members' } as never,
            req,
          })) as { file?: { url?: string } }
          const fileUrl = doc.file?.url
          if (!fileUrl) return json({ error: 'Không tìm thấy file.' }, { status: 404 })
          return Response.redirect(`${baseUrl(req)}${fileUrl}`, 302)
        } catch {
          return json({ error: 'Không có quyền truy cập tài liệu này.' }, { status: 403 })
        }
      },
    },
  ]
}
