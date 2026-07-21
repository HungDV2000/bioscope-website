import { spawn } from 'child_process'
import type { Endpoint, PayloadRequest } from 'payload'

/**
 * Admin-triggered database backup. Mounted at `GET /api/backup`.
 *
 * Streams a `pg_dump` custom-format archive (-Fc) straight to the browser, so the
 * dump is never written to disk inside the container. Restore with:
 *   pg_restore -c -d <db> <file>
 *
 * Security notes:
 *  - Admin role only (same gate as the seed endpoint).
 *  - `spawn` is called with an argument array and `shell: false` (the default),
 *    so nothing is interpreted by a shell. The connection string comes from the
 *    server env — never from the request — so there is no injection surface.
 */
export const backupEndpoint: Endpoint = {
  path: '/backup',
  method: 'get',
  handler: async (req: PayloadRequest): Promise<Response> => {
    const user = req.user as { role?: string } | undefined
    if (!user) {
      return Response.json({ ok: false, error: 'Chưa đăng nhập.' }, { status: 401 })
    }
    if (user.role !== 'admin') {
      return Response.json(
        { ok: false, error: 'Chỉ quản trị viên (admin) mới được tải bản sao lưu.' },
        { status: 403 },
      )
    }

    const connectionString = process.env.DATABASE_URI
    if (!connectionString) {
      return Response.json(
        { ok: false, error: 'Thiếu biến môi trường DATABASE_URI.' },
        { status: 500 },
      )
    }

    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const filename = `bioscope-${stamp}.dump`

    // -Fc = custom format (compressed, restorable with pg_restore)
    // --no-owner / --no-privileges keep the dump portable across environments.
    const child = spawn(
      'pg_dump',
      ['--format=custom', '--no-owner', '--no-privileges', '--dbname', connectionString],
      { stdio: ['ignore', 'pipe', 'pipe'] },
    )

    let stderr = ''
    child.stderr.on('data', (chunk: Buffer) => {
      // Keep only the tail — a failing pg_dump can be chatty.
      stderr = (stderr + chunk.toString()).slice(-2000)
    })

    // Surface a clear message when the binary is missing from the image.
    const spawnFailed = await new Promise<string | null>((resolve) => {
      const onError = (err: NodeJS.ErrnoException) => {
        resolve(
          err.code === 'ENOENT'
            ? 'Không tìm thấy lệnh pg_dump trong container. Cần cài postgresql-client vào image (xem Dockerfile).'
            : err.message,
        )
      }
      child.once('error', onError)
      // If the process starts cleanly we get `spawn` instead of `error`.
      child.once('spawn', () => {
        child.off('error', onError)
        resolve(null)
      })
    })

    if (spawnFailed) {
      req.payload.logger.error(`[backup] ${spawnFailed}`)
      return Response.json({ ok: false, error: spawnFailed }, { status: 500 })
    }

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        child.stdout.on('data', (chunk: Buffer) => controller.enqueue(new Uint8Array(chunk)))
        child.stdout.on('end', () => controller.close())
        child.on('close', (code) => {
          if (code !== 0) {
            req.payload.logger.error(`[backup] pg_dump exited ${code}: ${stderr}`)
            // The response has already started streaming, so the only signal we
            // can give the client is an aborted stream.
            try {
              controller.error(new Error(`pg_dump exited with code ${code}`))
            } catch {
              /* stream already closed */
            }
          }
        })
      },
      cancel() {
        child.kill('SIGTERM')
      },
    })

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  },
}
