import { type NextRequest, NextResponse } from 'next/server'
import { B2B_API_URL, SESSION_SECRET } from '@/lib/member/config'
import { googleRedirectUri, publicOrigin } from '@/lib/member/google'

/**
 * Chẩn đoán lỗi `redirect_uri_mismatch`.
 *
 * Google chặn TRƯỚC khi gọi về site nên mình không bắt được lỗi để hiện thông
 * báo. Mở địa chỉ này bằng chính tên miền khách hay dùng sẽ thấy đúng chuỗi
 * redirect_uri đang gửi cho Google — dán y hệt vào Authorized redirect URIs.
 *
 * Chỉ trả thông tin công khai (redirect URI, có/không có Client ID) — không lộ
 * Client Secret.
 */
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const origin = publicOrigin(req)
  const redirectUri = googleRedirectUri(origin)

  let googleEnabled = false
  let clientIdTail = ''
  try {
    const cfg = (await fetch(`${B2B_API_URL}/api/b2b/google/config`, { cache: 'no-store' }).then((r) =>
      r.json(),
    )) as { googleEnabled?: boolean; clientId?: string }
    googleEnabled = cfg.googleEnabled === true
    // Chỉ hiện đuôi để đối chiếu đúng ứng dụng, không cần che vì Client ID vốn công khai.
    clientIdTail = cfg.clientId ? `…${cfg.clientId.slice(-24)}` : ''
  } catch {
    /* CMS không phản hồi */
  }

  return NextResponse.json(
    {
      huongDan:
        'Dán CHÍNH XÁC giá trị redirectUri dưới đây vào Google Cloud Console → Credentials → OAuth client → Authorized redirect URIs. Sai một ký tự (thừa/thiếu www, http vs https, thừa dấu /) là lỗi redirect_uri_mismatch.',
      redirectUri,
      javascriptOrigin: origin,
      googleDaBat: googleEnabled,
      clientId: clientIdTail || '(chưa cấu hình trong admin)',
      khoaKySession: SESSION_SECRET ? 'đã có' : 'THIẾU — không ai đăng nhập được',
      hostDaDoc: {
        'x-forwarded-host': req.headers.get('x-forwarded-host'),
        host: req.headers.get('host'),
        'x-forwarded-proto': req.headers.get('x-forwarded-proto'),
      },
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
