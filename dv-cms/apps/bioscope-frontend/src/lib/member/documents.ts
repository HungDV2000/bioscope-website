import 'server-only'
import { b2bFetch } from './api'
import type { GatedDocument } from './types'

type RawDoc = {
  id: string | number
  title?: string
  docType?: string
  ingredient?: { title?: string; name?: string } | string | null
  updatedAt?: string
}

const ingredientName = (v: RawDoc['ingredient']): string | undefined => {
  if (!v) return undefined
  if (typeof v === 'string') return v
  return v.title ?? v.name ?? undefined
}

/**
 * Tài liệu gated mà thành viên đang đăng nhập được xem. Tài khoản chưa duyệt
 * hoặc lỗi mạng → mảng rỗng (trang tự hiển thị thông báo phù hợp).
 */
export async function getMemberDocuments(): Promise<GatedDocument[]> {
  try {
    const res = await b2bFetch('/api/b2b/documents', { method: 'GET' })
    if (!res.ok) return []
    const data = (await res.json()) as { docs?: RawDoc[] }
    return (data.docs ?? []).map((d) => ({
      id: String(d.id),
      title: d.title ?? '—',
      docType: (d.docType as GatedDocument['docType']) ?? 'COA',
      ingredient: ingredientName(d.ingredient),
      updatedAt: d.updatedAt ? new Date(d.updatedAt).toLocaleDateString('vi-VN') : '—',
    }))
  } catch {
    return []
  }
}
