/**
 * Đăng theo lịch (scheduled publish) — bản tự viết, KHÔNG cần Payload Jobs.
 *
 * Biên tập viên lưu bản NHÁP + đặt `publishAt`. Runner nền quét định kỳ, tới
 * giờ thì Publish và xoá mốc. Nhẹ, đủ cho nhu cầu lên lịch bài/nguyên liệu.
 * Gọi từ onInit nên container restart là tự chạy lại.
 *
 *   SCHEDULED_PUBLISH_EVERY_MIN=5   (mặc định 5 phút/lần quét)
 */
import type { Payload } from 'payload'

const TARGETS = ['ingredients'] as const

export function startScheduledPublish(payload: Payload): void {
  const everyMin = Math.max(1, Number(process.env.SCHEDULED_PUBLISH_EVERY_MIN ?? 5))

  const run = async () => {
    const now = new Date().toISOString()
    for (const slug of TARGETS) {
      try {
        const due = await payload.find({
          collection: slug,
          where: { and: [{ publishAt: { less_than_equal: now } }, { _status: { equals: 'draft' } }] },
          limit: 50,
          depth: 0,
          overrideAccess: true,
        })
        for (const doc of due.docs) {
          const id = (doc as { id: string | number }).id
          try {
            await payload.update({
              collection: slug,
              id,
              data: { _status: 'published', publishAt: null } as never,
              overrideAccess: true,
            })
            payload.logger.info(`[scheduled-publish] đã xuất bản ${slug}#${id}`)
          } catch (e) {
            payload.logger.error(`[scheduled-publish] lỗi xuất bản ${slug}#${id}: ${e instanceof Error ? e.message : String(e)}`)
          }
        }
      } catch (e) {
        payload.logger.error(`[scheduled-publish] lỗi quét ${slug}: ${e instanceof Error ? e.message : String(e)}`)
      }
    }
  }

  setTimeout(run, 60_000) // sau boot 60s
  setInterval(run, everyMin * 60 * 1000)
  payload.logger.info(`[scheduled-publish] đã bật: quét mỗi ${everyMin} phút`)
}
