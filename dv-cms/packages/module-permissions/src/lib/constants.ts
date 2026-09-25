import type { PermissionAction } from '../types.js'

export const ALL_PERMISSION_ACTIONS: PermissionAction[] = [
  'read',
  'create',
  'update',
  'delete',
  'publish',
  'admin',
]

/** Collections that never inherit wildcard `*` grants (admin must be explicit). */
export const SENSITIVE_COLLECTIONS = new Set(['users', 'staff-roles', 'languages'])

/**
 * Collection KHÔNG BAO GIỜ nhận quyền qua `*` — vai trò phải được cấp đích
 * danh slug đó (hoặc là Admin toàn quyền).
 *
 * Tách khỏi SENSITIVE_COLLECTIONS vì nhánh xử lý của danh sách kia hiện vẫn
 * cho `*` khớp (xem check.ts); sửa nhánh đó sẽ đổi quyền của Biên tập viên với
 * users/languages đang dùng, nên để quyết định riêng. Danh sách dưới đây là
 * dữ liệu landing page: số điện thoại, triệu chứng sức khoẻ, giọng nói, địa
 * chỉ nhận hàng (NĐ 13/2023).
 */
export const EXPLICIT_ONLY_COLLECTIONS = new Set([
  'lp-participants',
  'lp-point-events',
  'lp-recordings',
  'lp-orders',
  'lp-otps',
  // Đợt theo tháng: chứa quan hệ tới người nhận quà (đọc kèm depth là ra tên).
  'lp-rounds',
])

export const STAFF_ROLES_SLUG = 'staff-roles' as const
