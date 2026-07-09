import type { Payload } from 'payload'

/**
 * Tạo (hoặc lấy lại) file placeholder mặc định cho các sản phẩm/danh mục
 * không có ảnh thật từ source.
 *
 * Placeholder được cache theo `externalId = 'cms-sync:placeholder'` để mọi
 * sản phẩm/danh mục dùng chung 1 ID Media — không tạo trùng mỗi lần chạy.
 *
 * File PNG 1×1 trong suốt 135 bytes — tối ưu và tương thích mọi pipeline.
 */
const PLACEHOLDER_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgAAIAAAUAAen63NgAAAAASUVORK5CYII='

const PLACEHOLDER_BUFFER = Buffer.from(PLACEHOLDER_BASE64, 'base64')

export const PLACEHOLDER_MEDIA_FILENAME = 'cms-sync-placeholder.png'

/** Idempotent. Tạo Media record lần đầu, sau đó trả về id cache. */
export async function getOrCreatePlaceholderMedia(payload: Payload): Promise<number | string> {
  const cached = await payload.find({
    collection: 'media',
    where: { alt: { equals: 'cms-sync:placeholder' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (cached.docs.length > 0) {
    return cached.docs[0].id
  }

  const created = await payload.create({
    collection: 'media',
    data: {
      alt: 'cms-sync:placeholder',
      // `text` description để Payload không render placeholder dưới dạng image broken.
      description: 'Ảnh mặc định cho sản phẩm/danh mục đồng bộ tự động từ RAG.',
    },
    file: {
      data: PLACEHOLDER_BUFFER,
      mimetype: 'image/png',
      name: PLACEHOLDER_MEDIA_FILENAME,
      size: PLACEHOLDER_BUFFER.byteLength,
    },
    overrideAccess: true,
  })

  return created.id
}
