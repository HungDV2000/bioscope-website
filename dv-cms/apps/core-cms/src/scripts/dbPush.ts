import { getPayload } from 'payload'
import config from '../payload.config.js'

/**
 * Sync the DB schema to the current collections WITHOUT seeding any content.
 * Run in development mode so Payload/Drizzle performs its `push` (production
 * skips push). Creates/updates missing tables & columns, e.g. `ai_generate_jobs`.
 *
 *   docker compose exec -e NODE_ENV=development -w /app/apps/core-cms cms \
 *     sh -c "yes | ./node_modules/.bin/payload run src/scripts/dbPush.ts"
 */
try {
  await getPayload({ config })
  process.stdout.write('[db-push] ✅ schema synced (tables/columns created if missing)\n')
  process.exit(0)
} catch (err) {
  process.stderr.write(`[db-push] failed: ${(err as Error)?.stack || String(err)}\n`)
  process.exit(1)
}
