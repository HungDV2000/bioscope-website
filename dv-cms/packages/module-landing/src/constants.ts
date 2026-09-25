/**
 * Hằng số dùng chung của module landing.
 *
 * Slug có tiền tố `lp-` để không đụng collection sẵn có của Bioscope, và để
 * nhìn vào CSDL là biết bảng nào thuộc landing page.
 */
export const SLUGS = {
  campaigns: 'lp-campaigns',
  participants: 'lp-participants',
  pointEvents: 'lp-point-events',
  recordings: 'lp-recordings',
  orders: 'lp-orders',
  otps: 'lp-otps',
  rounds: 'lp-rounds',
  settings: 'lp-settings',
} as const

/**
 * Collection chứa dữ liệu cá nhân (SĐT, triệu chứng sức khoẻ, giọng nói).
 *
 * Phải khai vào danh sách "nhạy cảm" của module phân quyền: vai trò Biên tập
 * viên mặc định có quyền `*` trên mọi collection, nếu không loại trừ thì họ
 * đọc được toàn bộ dữ liệu sức khoẻ của khách — trái NĐ 13/2023.
 */
export const SENSITIVE_SLUGS = [
  SLUGS.participants,
  SLUGS.rounds,
  SLUGS.pointEvents,
  SLUGS.recordings,
  SLUGS.orders,
  SLUGS.otps,
] as const

export const CAMPAIGN_STATUS = ['draft', 'active', 'ended', 'off'] as const
export type CampaignStatus = (typeof CAMPAIGN_STATUS)[number]

/** Năm triệu chứng điển hình ở bước 2 của landing. */
export const SYMPTOMS: Record<string, string> = {
  s1: 'Đau, nóng rát trên rốn',
  s2: 'Ợ hơi, ợ chua, trào ngược',
  s3: 'Đầy bụng, chậm tiêu',
  s4: 'Buồn nôn, ăn không ngon',
  s5: 'Viêm loét dạ dày – tá tràng / HP',
}

export const RECORDING_KINDS = ['intro', 'result', 'symptom'] as const
export type RecordingKind = (typeof RECORDING_KINDS)[number]

/**
 * Loại điểm. `order` giữ nguyên tên cột trong CSDL nhưng từ 09/2026 mang nghĩa
 * "mời được một người tham gia" (theo bảng điểm marketing chốt), không còn là
 * điểm theo đơn hàng.
 */
export const POINT_TYPES = ['video', 'record', 'order', 'result', 'manual'] as const
export type PointType = (typeof POINT_TYPES)[number]

export const ORDER_STATUS = ['new', 'confirmed', 'shipped', 'cancelled'] as const

/** Định dạng file ghi âm nhận vào. */
export const AUDIO_MIME = [
  'audio/webm',
  'audio/ogg',
  'audio/mp4',
  'audio/x-m4a',
  'audio/m4a',
  'audio/aac',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  // Trình duyệt ghi âm ra container WebM/MP4; thư viện dò kiểu file của Payload
  // (file-type) nhìn container và báo `video/webm`, `video/mp4` dù bên trong
  // chỉ có tiếng. Không cho hai kiểu này thì mọi bản ghi từ Chrome/Safari đều
  // bị từ chối. Endpoint upload tự kiểm magic bytes và giới hạn 15 MB.
  'video/webm',
  'video/mp4',
] as const

/** 15 MB — đủ cho ~15 phút giọng nói nén, chặn ai đó gửi file khổng lồ. */
export const MAX_AUDIO_BYTES = 15 * 1024 * 1024
