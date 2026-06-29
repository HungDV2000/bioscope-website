import { revalidatePath } from 'next/cache'
import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  const expected = process.env.REVALIDATE_SECRET
  if (!expected || secret !== expected) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const path = req.nextUrl.searchParams.get('path') ?? '/'
  revalidatePath(path, 'layout')

  return Response.json({ ok: true, revalidated: path })
}
