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

/** Gap between jobs (ms) — eases OpenAI rate limits and lets the event loop breathe. */
const GAP_MS = Number(process.env.AI_QUEUE_GAP_MS ?? 2000)

/**
 * Start draining the queue if not already running. Returns immediately; the
 * draining continues in the background. Safe to call repeatedly.
 */
export function ensureQueueRunner(payload: Payload): void {
  if (running) return
  running = true
  void drain(payload).finally(() => {
    running = false
  })
}

export function isQueueRunning(): boolean {
  return running
}

async function drain(payload: Payload): Promise<void> {
  // Hard cap on iterations as a safety valve against an unexpected infinite loop.
  for (let i = 0; i < 100_000; i++) {
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
      await run({
        jobId: String(job.id),
        ingredientId: String(job.ingredientId ?? ''),
        locale: (job.locale as Locale) ?? 'vi',
        payload,
      })
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
