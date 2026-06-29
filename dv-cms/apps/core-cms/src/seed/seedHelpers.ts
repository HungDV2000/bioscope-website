import type { Payload } from 'payload'

export type Id = string | number

/** Upsert collection không localized (partners, users…). */
export async function upsert(
  payload: Payload,
  collection: string,
  where: Record<string, unknown>,
  data: Record<string, unknown>,
): Promise<Id> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c = collection as any
  const found = await payload.find({ collection: c, where: where as never, limit: 1 })
  if (found.totalDocs > 0) {
    const id = (found.docs[0] as { id: Id }).id
    await payload.update({ collection: c, id: id as never, data: data as never })
    return id
  }
  const created = (await payload.create({ collection: c, data: data as never })) as { id: Id }
  return created.id
}

/**
 * Upsert collection có field localized — ghi riêng locale vi + en.
 * Nếu không truyền `en`, dùng lại dữ liệu `vi` cho en (tránh admin hiển thị trống).
 */
export async function upsertLocalized(
  payload: Payload,
  collection: string,
  where: Record<string, unknown>,
  locales: { vi: Record<string, unknown>; en?: Record<string, unknown> },
): Promise<Id> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c = collection as any
  const found = await payload.find({ collection: c, where: where as never, limit: 1 })
  let id: Id

  if (found.totalDocs > 0) {
    id = (found.docs[0] as { id: Id }).id
  } else {
    const created = (await payload.create({
      collection: c,
      data: locales.vi as never,
      locale: 'vi',
    })) as { id: Id }
    id = created.id
  }

  await payload.update({ collection: c, id: id as never, data: locales.vi as never, locale: 'vi' })
  await payload.update({
    collection: c,
    id: id as never,
    data: (locales.en ?? locales.vi) as never,
    locale: 'en',
  })

  return id
}
