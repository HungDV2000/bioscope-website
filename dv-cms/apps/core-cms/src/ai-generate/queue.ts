/**
 * Sequential AI-generate queue. Processes `ai-generate-jobs` with status
 * `queued` ONE AT A TIME so bulk generation never fires dozens of OpenAI calls
 * at once (which would blow memory, hit rate limits, or time out). A single
 * module-level runner drains the queue; each job is claimed before running and
 * every job is wrapped so one failure can't stop the queue.
 */

import type { Payload } from 'payload'
import type { Locale } from '../lib/openaiService.js'

let running = false
/** Mốc thời gian lần cuối vòng drain nhúc nhích. Dùng để phát hiện runner chết cứng. */
let lastProgressAt = 0

/** Gap between jobs (ms) — eases OpenAI rate limits and lets the event loop breathe. */
const GAP_MS = Number(process.env.AI_QUEUE_GAP_MS ?? 2000)

/**
 * Trần thời gian cho MỘT job. Vượt qua thì bỏ job đó và chạy tiếp.
 *
 * Không có trần này, một lời gọi treo sẽ khiến `drain` không bao giờ kết thúc,
 * cờ `running` kẹt ở true, và MỌI lần bấm sau đều bị `ensureQueueRunner` bỏ qua
 * im lặng — job mới nằm mãi ở trạng thái "đã xếp hàng" mà không ai chạy. Đây
 * đúng là triệu chứng đã gặp trên production.
 *
 * Phải lớn hơn job hợp lệ chậm nhất: OPENAI_TIMEOUT_MS × (1 + retries) cộng
 * thời gian tải Drive và OCR từng file.
 */
const JOB_TIMEOUT_MS = Number(process.env.AI_JOB_TIMEOUT_MS ?? 15 * 60 * 1000)

/**
 * Start draining the queue if not already running. Returns immediately; the
 * draining continues in the background. Safe to call repeatedly.
 */
export function ensureQueueRunner(payload: Payload): void {
  if (running) {
    // Cờ `running` chỉ nằm trong RAM và không ai quan sát được từ bên ngoài.
    // Nếu tiến trình trước chết cứng mà không settle, hàng đợi sẽ tắc vĩnh viễn
    // cho tới khi restart container. Tự phục hồi khi quá lâu không nhúc nhích.
    const idleMs = Date.now() - lastProgressAt
    if (lastProgressAt === 0 || idleMs < JOB_TIMEOUT_MS * 2) return
    console.warn(`[ai-queue] runner treo ${Math.round(idleMs / 1000)}s không tiến triển — khởi động lại`)
    running = false
  }
  running = true
  lastProgressAt = Date.now()
  void drain(payload).finally(() => {
    running = false
  })
}

/** Chạy `p`, nhưng bỏ cuộc sau `ms` để vòng drain không bao giờ tắc. */
function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label} quá ${Math.round(ms / 60000)} phút — bỏ qua`)), ms)
    p.then(
      (v) => { clearTimeout(t); resolve(v) },
      (e) => { clearTimeout(t); reject(e) },
    )
  })
}

export function isQueueRunning(): boolean {
  return running
}

/** Ảnh chụp trạng thái runner — cho endpoint chẩn đoán. */
export function queueSnapshot(): { running: boolean; lastProgressAt: string | null; idleSeconds: number | null } {
  return {
    running,
    lastProgressAt: lastProgressAt ? new Date(lastProgressAt).toISOString() : null,
    idleSeconds: lastProgressAt ? Math.round((Date.now() - lastProgressAt) / 1000) : null,
  }
}

/** In-progress statuses — a job sitting in one of these has a live runner… normally. */
const IN_PROGRESS = ['downloading', 'extracting', 'generating_content', 'generating_image', 'saving']

/**
 * Age (ms) after which an in-progress job is considered abandoned. Must exceed
 * the slowest realistic job: OPENAI_TIMEOUT_MS × (1 + retries) plus Drive
 * downloads and Vision OCR per file. 30 min is comfortably above that.
 */
const STUCK_AFTER_MS = Number(process.env.AI_QUEUE_STUCK_AFTER_MS ?? 30 * 60 * 1000)

/**
 * Return jobs abandoned by a previous process to the queue.
 *
 * The runner is in-memory (`running` above) and work is driven by an async loop
 * inside the Node process — so a container restart mid-job leaves that job
 * parked in an in-progress status with no runner, forever. Nothing else ever
 * reaps them. Run this before each drain so a restart self-heals the next time
 * anything touches the queue.
 */
async function requeueStuckJobs(payload: Payload): Promise<void> {
  const cutoff = new Date(Date.now() - STUCK_AFTER_MS).toISOString()
  try {
    const stuck = await payload.find({
      collection: 'ai-generate-jobs',
      where: {
        and: [
          { status: { in: IN_PROGRESS } },
          // `startedAt` is set at claim time; treat a missing one as stuck too.
          { or: [{ startedAt: { less_than: cutoff } }, { startedAt: { exists: false } }] },
        ],
      },
      limit: 100,
      depth: 0,
      overrideAccess: true,
    })

    for (const job of stuck.docs) {
      await payload.update({
        collection: 'ai-generate-jobs',
        id: job.id,
        data: {
          status: 'queued',
          phase: 'Xếp lại hàng đợi (tiến trình trước bị gián đoạn)...',
        },
        overrideAccess: true,
      })
      console.warn(`[ai-queue] requeued stuck job ${job.id}`)
    }
  } catch (err) {
    // Never block draining because the reaper failed.
    console.error('[ai-queue] requeue check failed:', err)
  }
}

async function drain(payload: Payload): Promise<void> {
  await requeueStuckJobs(payload)

  // Hard cap on iterations as a safety valve against an unexpected infinite loop.
  for (let i = 0; i < 100_000; i++) {
    lastProgressAt = Date.now()
    let job: { id: string | number; ingredientId?: string; locale?: string; mode?: string } | undefined
    try {
      const res = await payload.find({
        collection: 'ai-generate-jobs',
        where: { status: { equals: 'queued' } },
        sort: 'createdAt',
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      job = res.docs[0] as typeof job
    } catch (err) {
      console.error('[ai-queue] find failed, stopping drain:', err)
      return
    }

    if (!job) return // queue empty

    // Claim the job so a re-entrant runner / single-trigger can't double-process it.
    try {
      await payload.update({
        collection: 'ai-generate-jobs',
        id: job.id,
        data: { status: 'downloading', phase: 'Bắt đầu (hàng đợi)...', startedAt: new Date().toISOString() },
        overrideAccess: true,
      })
    } catch (err) {
      console.error('[ai-queue] claim failed, skipping job', job.id, err)
      continue
    }

    try {
      const { runAiGenerate, runAiGenerateImage } = await import('./AiGenerateWorker.js')
      const run = job.mode === 'image' ? runAiGenerateImage : runAiGenerate
      await withTimeout(
        run({
          jobId: String(job.id),
          ingredientId: String(job.ingredientId ?? ''),
          locale: (job.locale as Locale) ?? 'vi',
          payload,
        }),
        JOB_TIMEOUT_MS,
        `Job ${job.id}`,
      )
    } catch (err) {
      // runAiGenerate handles its own errors, but guard so the queue never dies.
      console.error('[ai-queue] job failed', job.id, err)
      try {
        await payload.update({
          collection: 'ai-generate-jobs',
          id: job.id,
          data: { status: 'error', errorMessage: err instanceof Error ? err.message : String(err), finishedAt: new Date().toISOString() },
          overrideAccess: true,
        })
      } catch {
        /* ignore */
      }
    }

    if (GAP_MS > 0) await new Promise((r) => setTimeout(r, GAP_MS))
  }
}
