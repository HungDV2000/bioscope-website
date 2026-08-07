/**
 * Dọn hội thoại chat cũ: tự ĐÓNG hội thoại không hoạt động quá N ngày, và (tuỳ
 * chọn) XOÁ hẳn sau M ngày. Gọi từ onInit; quét mỗi 6 giờ.
 *
 *   CHAT_CLOSE_AFTER_DAYS=7    (đóng hội thoại im lặng > 7 ngày)
 *   CHAT_DELETE_AFTER_DAYS=90  (0 = không xoá)
 */
import type { Payload } from 'payload'

export function startChatRetention(payload: Payload): void {
  const closeDays = Math.max(1, Number(process.env.CHAT_CLOSE_AFTER_DAYS ?? 7))
  const deleteDays = Math.max(0, Number(process.env.CHAT_DELETE_AFTER_DAYS ?? 90))

  const run = async () => {
    try {
      const closeBefore = new Date(Date.now() - closeDays * 86400000).toISOString()
      const stale = await payload.find({
        collection: 'chat-conversations',
        where: { and: [{ status: { equals: 'open' } }, { lastMessageAt: { less_than: closeBefore } }] },
        limit: 200,
        depth: 0,
        overrideAccess: true,
      })
      for (const c of stale.docs) {
        await payload.update({ collection: 'chat-conversations', id: c.id, data: { status: 'closed' } as never, overrideAccess: true })
      }
      if (stale.docs.length) payload.logger.info(`[chat-retention] đóng ${stale.docs.length} hội thoại im lặng >${closeDays} ngày`)

      if (deleteDays > 0) {
        const delBefore = new Date(Date.now() - deleteDays * 86400000).toISOString()
        const old = await payload.find({
          collection: 'chat-conversations',
          where: { lastMessageAt: { less_than: delBefore } },
          limit: 100,
          depth: 0,
          overrideAccess: true,
        })
        for (const c of old.docs) {
          await payload.delete({ collection: 'chat-messages', where: { conversation: { equals: c.id } }, overrideAccess: true }).catch(() => {})
          await payload.delete({ collection: 'chat-conversations', id: c.id, overrideAccess: true }).catch(() => {})
        }
        if (old.docs.length) payload.logger.info(`[chat-retention] xoá ${old.docs.length} hội thoại >${deleteDays} ngày`)
      }
    } catch (e) {
      payload.logger.error(`[chat-retention] lỗi: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  setTimeout(run, 120_000)
  setInterval(run, 6 * 3600 * 1000)
}
