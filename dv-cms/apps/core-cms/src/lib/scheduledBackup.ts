/**
 * Sao lưu tự động theo lịch (bổ sung cho nút backup tải tay).
 *
 * OPT-IN: chỉ chạy khi đặt biến môi trường BACKUP_DIR (thư mục ghi được, nên là
 * volume gắn ngoài để không mất khi xoá container). Mỗi lần chạy `pg_dump -Fc`
 * ra một file rồi xoay vòng giữ N bản mới nhất.
 *
 *   BACKUP_DIR=/app/backups   (bắt buộc để bật)
 *   BACKUP_EVERY_HOURS=24     (mặc định 24)
 *   BACKUP_KEEP=7             (mặc định giữ 7 bản)
 */
import { spawn } from 'child_process'
import { mkdir, readdir, unlink } from 'fs/promises'
import path from 'path'
import type { Payload } from 'payload'

export function startScheduledBackups(payload: Payload): void {
  const dir = process.env.BACKUP_DIR
  if (!dir) return // không đặt thư mục = tắt (không sao lưu tự động)

  const conn = process.env.DATABASE_URI
  if (!conn) {
    payload.logger.warn('[backup] BACKUP_DIR được đặt nhưng thiếu DATABASE_URI — bỏ qua auto backup.')
    return
  }
  const hours = Math.max(1, Number(process.env.BACKUP_EVERY_HOURS ?? 24))
  const keep = Math.max(1, Number(process.env.BACKUP_KEEP ?? 7))

  const runOnce = async () => {
    try {
      await mkdir(dir, { recursive: true })
      const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
      const file = path.join(dir, `bioscope-${stamp}.dump`)
      await new Promise<void>((resolve, reject) => {
        const child = spawn(
          'pg_dump',
          ['--format=custom', '--no-owner', '--no-privileges', '--file', file, '--dbname', conn],
          { stdio: ['ignore', 'ignore', 'pipe'] },
        )
        let err = ''
        child.stderr.on('data', (c: Buffer) => (err = (err + c.toString()).slice(-1000)))
        child.once('error', reject)
        child.once('close', (code) => (code === 0 ? resolve() : reject(new Error(err || `pg_dump thoát mã ${code}`))))
      })
      // Xoay vòng: chỉ giữ `keep` bản mới nhất (tên có timestamp nên sort tăng dần).
      const files = (await readdir(dir))
        .filter((f) => f.startsWith('bioscope-') && f.endsWith('.dump'))
        .sort()
      for (const f of files.slice(0, Math.max(0, files.length - keep))) {
        await unlink(path.join(dir, f)).catch(() => {})
      }
      payload.logger.info(`[backup] auto backup xong: ${file} (giữ ${keep} bản gần nhất)`)
    } catch (e) {
      payload.logger.error(`[backup] auto backup lỗi: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  // Chạy một lần sau khi boot (đợi DB ổn định) + lặp định kỳ. setInterval sống
  // trong tiến trình — container restart thì onInit gọi lại nên tự khởi động.
  setTimeout(runOnce, 30_000)
  setInterval(runOnce, hours * 3600 * 1000)
  payload.logger.info(`[backup] đã bật sao lưu tự động: mỗi ${hours}h, giữ ${keep} bản, thư mục ${dir}`)
}
