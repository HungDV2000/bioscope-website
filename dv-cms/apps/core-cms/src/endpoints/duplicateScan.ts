/**
 * Endpoint cho màn hình "Kiểm tra trùng lặp".
 *
 *   POST /api/duplicate-scan          → tạo lần quét mới, chạy nền
 *   GET  /api/duplicate-scan/options  → danh sách loại nội dung + trường quét được
 *   GET  /api/duplicate-scan/runs     → lịch sử
 *   GET  /api/duplicate-scan/runs/:id → chi tiết + kết quả (UI poll cái này)
 */

import type { Endpoint, PayloadRequest } from 'payload'
import { SCANNABLE, findScannable } from '../duplicate-scan/scannable.js'
import { DEFAULT_SCAN_CONFIG, type ScanConfig } from '../duplicate-scan/DuplicateScanWorker.js'

function isStaff(req: PayloadRequest): boolean {
  const role = (req.user as { role?: string } | undefined)?.role
  return role === 'admin' || role === 'editor'
}

const deny = () => Response.json({ ok: false, error: 'Không đủ quyền.' }, { status: 403 })

/** Loại nội dung quét được + các trường phụ của từng loại (UI dựng form từ đây). */
const optionsEndpoint: Endpoint = {
  path: '/duplicate-scan/options',
  method: 'get',
  handler: async (req: PayloadRequest): Promise<Response> => {
    if (!isStaff(req)) return deny()
    return Response.json({
      ok: true,
      collections: SCANNABLE.map((s) => ({
        slug: s.slug,
        label: s.label,
        nameField: s.nameField,
        extraFields: s.extraFields,
      })),
      defaults: DEFAULT_SCAN_CONFIG,
    })
  },
}

const startEndpoint: Endpoint = {
  path: '/duplicate-scan',
  method: 'post',
  handler: async (req: PayloadRequest): Promise<Response> => {
    if (!isStaff(req)) return deny()

    let body: Partial<ScanConfig> = {}
    try {
      body = (await (req as unknown as Request).json()) as Partial<ScanConfig>
    } catch {
      return Response.json({ ok: false, error: 'Body JSON không hợp lệ.' }, { status: 400 })
    }

    const target = findScannable(String(body.targetCollection ?? ''))
    if (!target) {
      return Response.json({ ok: false, error: 'Chưa chọn loại nội dung hợp lệ.' }, { status: 400 })
    }

    // Một lần quét đọc cả collection — chạy song song hai lần vừa tốn vừa vô ích.
    const running = await req.payload.find({
      collection: 'duplicate-scans',
      where: { status: { in: ['queued', 'running'] } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (running.docs.length) {
      return Response.json(
        { ok: false, error: 'Đang có một lần quét chạy dở. Chờ xong rồi chạy tiếp.', jobId: String(running.docs[0].id) },
        { status: 409 },
      )
    }

    const config: ScanConfig = {
      ...DEFAULT_SCAN_CONFIG,
      ...body,
      targetCollection: target.slug,
      // Ngưỡng ngoài khoảng [0.5, 1] hoặc là lỗi gõ, hoặc sẽ gộp bừa mọi thứ.
      threshold: Math.min(1, Math.max(0.5, Number(body.threshold ?? DEFAULT_SCAN_CONFIG.threshold))),
      maxGroups: Math.min(2000, Math.max(10, Number(body.maxGroups ?? DEFAULT_SCAN_CONFIG.maxGroups))),
      // Chỉ nhận các trường phụ thực sự thuộc loại nội dung này.
      extraFields: (body.extraFields ?? []).filter((p) => target.extraFields.some((f) => f.path === p)),
      normalize: { ...DEFAULT_SCAN_CONFIG.normalize, ...(body.normalize ?? {}) },
    }

    let scanId = ''
    try {
      const doc = await req.payload.create({
        collection: 'duplicate-scans',
        data: {
          targetCollection: target.slug,
          targetLabel: target.label.vi,
          status: 'queued',
          phase: 'Đang xếp hàng...',
          config,
          logs: [],
        },
        overrideAccess: true,
      })
      scanId = String(doc.id)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return Response.json({ ok: false, error: `Không tạo được bản ghi: ${msg}` }, { status: 500 })
    }

    // Chạy nền. An toàn khi gọi thẳng ở đây (khác endpoint AI): không có tiến
    // trình nào khác quét bảng này để nhặt việc, và endpoint đã chặn chạy song
    // song ở trên — nên không có chuyện hai runner cùng xử lý một record.
    const payload = req.payload
    setImmediate(async () => {
      try {
        const { runDuplicateScan } = await import('../duplicate-scan/DuplicateScanWorker.js')
        await runDuplicateScan({ scanId, config, payload })
      } catch (err) {
        console.error('[duplicate-scan] lỗi nền:', err)
        try {
          await payload.update({
            collection: 'duplicate-scans',
            id: scanId,
            data: {
              status: 'error',
              errorMessage: err instanceof Error ? err.message : String(err),
              finishedAt: new Date().toISOString(),
            },
            overrideAccess: true,
          })
        } catch {
          /* bỏ qua */
        }
      }
    })

    return Response.json({ ok: true, jobId: scanId, message: 'Đã bắt đầu quét.' }, { status: 202 })
  },
}

const runsEndpoint: Endpoint = {
  path: '/duplicate-scan/runs',
  method: 'get',
  handler: async (req: PayloadRequest): Promise<Response> => {
    if (!isStaff(req)) return deny()
    const limit = Math.min(Number(req.query?.limit ?? 20) || 20, 100)
    const res = await req.payload.find({
      collection: 'duplicate-scans',
      limit,
      sort: '-createdAt',
      depth: 0,
      overrideAccess: true,
      // Bỏ `results` và `logs` khỏi danh sách — chúng rất nặng và màn hình lịch
      // sử chỉ cần phần tóm tắt.
      select: {
        targetCollection: true,
        targetLabel: true,
        status: true,
        phase: true,
        groupsFound: true,
        docsScanned: true,
        docsInGroups: true,
        createdAt: true,
        startedAt: true,
        finishedAt: true,
      },
    })
    return Response.json({ ok: true, runs: res.docs, total: res.totalDocs })
  },
}

const runDetailEndpoint: Endpoint = {
  path: '/duplicate-scan/runs/:id',
  method: 'get',
  handler: async (req: PayloadRequest): Promise<Response> => {
    if (!isStaff(req)) return deny()
    const id = (req.routeParams?.id ?? '') as string
    if (!id) return Response.json({ ok: false, error: 'Thiếu id.' }, { status: 400 })
    try {
      const doc = await req.payload.findByID({
        collection: 'duplicate-scans',
        id,
        depth: 0,
        overrideAccess: true,
      })
      return Response.json({ ok: true, run: doc })
    } catch {
      return Response.json({ ok: false, error: 'Không tìm thấy.' }, { status: 404 })
    }
  },
}

export const duplicateScanEndpoints: Endpoint[] = [
  optionsEndpoint,
  startEndpoint,
  runsEndpoint,
  runDetailEndpoint,
]
