import { B2B_API_URL } from './config'

export type PublicAuthConfig = { googleEnabled: boolean; allowRegistration: boolean }

/**
 * Cấu hình đăng nhập công khai lấy từ CMS (bật Google chưa, có cho tự đăng ký
 * không). Lỗi mạng → mặc định an toàn: tắt Google, vẫn cho đăng ký.
 */
export async function getPublicAuthConfig(): Promise<PublicAuthConfig> {
  try {
    const r = (await fetch(`${B2B_API_URL}/api/b2b/google/config`, { cache: 'no-store' }).then((x) =>
      x.json(),
    )) as { googleEnabled?: boolean; allowRegistration?: boolean }
    return {
      googleEnabled: r.googleEnabled === true,
      allowRegistration: r.allowRegistration !== false,
    }
  } catch {
    return { googleEnabled: false, allowRegistration: true }
  }
}
