import { revalidatePath, revalidateTag } from 'next/cache'
import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  const expected = process.env.REVALIDATE_SECRET
  if (!expected || secret !== expected) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const path = req.nextUrl.searchParams.get('path') ?? '/'
  revalidatePath(path, 'layout')

  // Landing page (/lp/<slug>): dữ liệu chiến dịch nằm trong cache fetch có tag
  // riêng. Hết hạn NGAY (expire: 0) — đổi trạng thái sang "Kết thúc"/"Nháp" thì
  // lượt xem kế tiếp phải thấy luôn, không được trả bản cũ thêm một lượt.
  const lp = path.match(/^\/lp\/([a-z0-9-]{1,80})$/)
  if (lp) revalidateTag(`lp:${lp[1]}`, { expire: 0 })

  return Response.json({ ok: true, revalidated: path })
}
