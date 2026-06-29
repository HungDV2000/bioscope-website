import { getPayload } from 'payload'
import config from '../payload.config.js'
import { runSeed } from './runSeed.js'

// NOTE: top-level await — `payload run` awaits module evaluation, so the whole
// seed must run at the top level (a floating promise would be cut off by exit).
try {
  const payload = await getPayload({ config })
  await runSeed(payload)
  process.exit(0)
} catch (err) {
  process.stderr.write(`[seed] failed: ${(err as Error)?.stack || String(err)}\n`)
  process.exit(1)
}
