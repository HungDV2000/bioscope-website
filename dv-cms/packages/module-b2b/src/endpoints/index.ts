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

export const createB2BEndpoints = (opts: B2BEndpointOptions = {}): Endpoint[] => {
  const maxAge = opts.cookieMaxAge ?? 60 * 60 * 24 * 7

  return [
    // ── Register (always pending) ───────────────────────────────
    {
      path: '/b2b/register',
      method: 'post',
      handler: async (req: PayloadRequest) => {
        await addDataAndFileToRequest(req)
        const { email, password, company, contactName, phone } = (req.data ?? {}) as Record<string, string>
        if (!email || !password || !company || !contactName) {
          return json({ error: 'Thiếu thông tin bắt buộc.' }, { status: 400 })
        }
        try {
          await req.payload.create({
            collection: 'members',
            data: { email, password, company, contactName, phone, status: 'pending' },
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

    // ── List documents the member may access ────────────────────
    {
      path: '/b2b/documents',
      method: 'get',
      handler: async (req: PayloadRequest) => {
        if (!req.user || req.user.collection !== 'members') {
          return json({ error: 'Chưa đăng nhập.' }, { status: 401 })
        }
        const result = await req.payload.find({
          collection: 'gated-documents',
          depth: 1,
          overrideAccess: false,
          user: req.user,
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
        if (!req.user || req.user.collection !== 'members') {
          return json({ error: 'Chưa đăng nhập.' }, { status: 401 })
        }
        try {
          const doc = (await req.payload.findByID({
            collection: 'gated-documents',
            id,
            depth: 1,
            overrideAccess: false,
            user: req.user,
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
