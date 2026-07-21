import type { Endpoint, PayloadRequest } from 'payload'

type DupRow = { name: string; ids: number[]; slugs: (string | null)[] }

/**
 * Ingredient duplicate report. Mounted at `GET /api/ingredient-duplicates`
 * (a top-level path — `/api/ingredients/...` would collide with Payload's
 * collection route `/api/ingredients/:id`)..
 *
 * Groups ingredients whose Vietnamese name matches after normalising case and
 * whitespace. Slugs stay unique (Payload appends a suffix), so duplicates are
 * only visible by name — which is why editors kept creating them unnoticed.
 *
 * Read-only: it never deletes or merges. The editor opens each record and
 * decides. Admin/editor only.
 */
export const ingredientDuplicatesEndpoint: Endpoint = {
  path: '/ingredient-duplicates',
  method: 'get',
  handler: async (req: PayloadRequest): Promise<Response> => {
    const user = req.user as { role?: string } | undefined
    if (!user) {
      return Response.json({ ok: false, error: 'Chưa đăng nhập.' }, { status: 401 })
    }
    if (user.role !== 'admin' && user.role !== 'editor') {
      return Response.json({ ok: false, error: 'Không đủ quyền.' }, { status: 403 })
    }

    const limit = Math.min(Number(req.query?.limit ?? 100) || 100, 500)

    try {
      // `drizzle` exposes the underlying pool; a grouped SQL query is far cheaper
      // than paging 1600+ docs through the Local API.
      const db = req.payload.db as unknown as {
        pool?: { query: (sql: string, params?: unknown[]) => Promise<{ rows: DupRow[] }> }
      }
      if (!db.pool) {
        return Response.json(
          { ok: false, error: 'Không truy cập được connection pool của database.' },
          { status: 500 },
        )
      }

      const { rows } = await db.pool.query(
        `SELECT lower(btrim(name)) AS name,
                array_agg(_parent_id ORDER BY _parent_id) AS ids,
                array_agg(slug ORDER BY _parent_id) AS slugs
           FROM ingredients_locales
          WHERE _locale = 'vi' AND name IS NOT NULL AND btrim(name) <> ''
          GROUP BY 1
         HAVING count(*) > 1
          ORDER BY count(*) DESC, 1
          LIMIT $1`,
        [limit],
      )

      const groups = rows.map((r) => ({
        name: r.name,
        count: r.ids.length,
        ids: r.ids,
        slugs: r.slugs,
      }))

      return Response.json({
        ok: true,
        groups,
        totalGroups: groups.length,
        totalDocs: groups.reduce((sum, g) => sum + g.count, 0),
      })
    } catch (err) {
      req.payload.logger.error(err)
      return Response.json(
        { ok: false, error: (err as Error)?.message ?? 'Không quét được trùng lặp.' },
        { status: 500 },
      )
    }
  },
}
