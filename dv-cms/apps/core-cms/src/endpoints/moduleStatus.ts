/**
 * GET /api/module-status — trạng thái KẾT NỐI của các tích hợp ngoài.
 *
 * Chỉ đọc sự hiện diện của biến môi trường (KHÔNG trả giá trị bí mật) để widget
 * "Quản lý Module" báo "Đã kết nối / Thiếu key" mà không lộ secret ra trình duyệt.
 */
import type { Endpoint, PayloadRequest } from 'payload'

function isStaff(req: PayloadRequest): boolean {
  const role = (req.user as { role?: string } | undefined)?.role
  return role === 'admin' || role === 'editor'
}

type Integration = { key: string; label: string; connected: boolean; envVar: string }

export const moduleStatusEndpoint: Endpoint = {
  path: '/module-status',
  method: 'get',
  handler: async (req: PayloadRequest): Promise<Response> => {
    if (!isStaff(req)) return Response.json({ ok: false, error: 'Không đủ quyền.' }, { status: 403 })

    const has = (v?: string) => Boolean(v && v.trim())
    const integrations: Integration[] = [
      { key: 'openai', label: 'OpenAI (sinh nội dung AI)', envVar: 'OPENAI_API_KEY', connected: has(process.env.OPENAI_API_KEY) },
      { key: 'mistral', label: 'Mistral OCR', envVar: 'MISTRAL_API_KEY', connected: has(process.env.MISTRAL_API_KEY) },
      {
        key: 'drive',
        label: 'Google Drive (đồng bộ file)',
        envVar: 'GOOGLE_SERVICE_ACCOUNT_KEY',
        connected: has(process.env.GOOGLE_SERVICE_ACCOUNT_KEY) || has(process.env.GOOGLE_APPLICATION_CREDENTIALS),
      },
      { key: 'revalidate', label: 'Xoá cache website', envVar: 'REVALIDATE_SECRET', connected: has(process.env.REVALIDATE_SECRET) && has(process.env.FRONTEND_URL) },
      { key: 'email', label: 'Email (SMTP)', envVar: 'SMTP_HOST', connected: has(process.env.SMTP_HOST) },
    ]

    return Response.json({ ok: true, integrations })
  },
}
