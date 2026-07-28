/**
 * Cờ bật/tắt module (tab "Quản lý Module" trong Site Settings).
 *
 * Đọc lúc chạy nên tắt module là có hiệu lực ngay, không cần build lại. Mặc
 * định BẬT: giá trị null/undefined (bản ghi cũ chưa có cột) được coi là bật để
 * không phá vỡ hành vi hiện tại.
 */
import type { Payload } from 'payload'

export type ModuleKey = 'moduleAiGenerate' | 'moduleDuplicateScan' | 'moduleDriveSync' | 'moduleClearCache'

const MODULE_LABEL: Record<ModuleKey, string> = {
  moduleAiGenerate: 'AI sinh nội dung',
  moduleDuplicateScan: 'Quét trùng lặp',
  moduleDriveSync: 'Đồng bộ Google Drive',
  moduleClearCache: 'Xoá cache website',
}

export async function isModuleEnabled(payload: Payload, key: ModuleKey): Promise<boolean> {
  try {
    const s = (await payload.findGlobal({ slug: 'site-settings', depth: 0 })) as unknown as Record<string, unknown>
    return s?.[key] !== false // null/undefined/true → bật
  } catch {
    return true // lỗi đọc cấu hình thì không chặn
  }
}

/** Trả về Response 403 nếu module tắt, ngược lại null (cho endpoint dùng gọn). */
export async function moduleGate(payload: Payload, key: ModuleKey): Promise<Response | null> {
  if (await isModuleEnabled(payload, key)) return null
  return Response.json(
    { ok: false, error: `Module "${MODULE_LABEL[key]}" đang tắt trong Site Settings → Quản lý Module.` },
    { status: 403 },
  )
}
