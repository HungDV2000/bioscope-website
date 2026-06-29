import type { CollectionBeforeChangeHook, Payload } from 'payload'

import { LOCALE_CODE_RE, LANGUAGES_SLUG } from '../lib/constants.js'

/** Ensure only one language has `isDefault: true`. */
export const ensureSingleDefault: CollectionBeforeChangeHook = async ({ data, req, operation, originalDoc }) => {
  if (!data?.isDefault) return data

  const currentId = operation === 'update' ? originalDoc?.id : undefined

  const others = await req.payload.find({
    collection: LANGUAGES_SLUG,
    where: {
      and: [
        { isDefault: { equals: true } },
        ...(currentId ? [{ id: { not_equals: currentId } }] : []),
      ],
    },
    limit: 50,
    overrideAccess: true,
  })

  for (const doc of others.docs) {
    await req.payload.update({
      collection: LANGUAGES_SLUG,
      id: doc.id,
      data: { isDefault: false },
      overrideAccess: true,
      req,
    })
  }

  return data
}

export function validateLocaleCode(code: unknown): string {
  const value = String(code ?? '').trim()
  if (!LOCALE_CODE_RE.test(value)) {
    throw new Error(`Mã ngôn ngữ không hợp lệ: "${value}" (vd: vi, en, en-US)`)
  }
  return value
}

export const DEFAULT_SEED_LANGUAGES = [
  {
    code: 'vi',
    label: 'Tiếng Việt',
    nativeLabel: 'Tiếng Việt',
    flag: '🇻🇳',
    enabled: true,
    isDefault: true,
    rtl: false,
    sortOrder: 0,
  },
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    flag: '🇬🇧',
    enabled: true,
    isDefault: false,
    rtl: false,
    fallbackLocale: 'vi',
    sortOrder: 1,
  },
] as const

export async function seedDefaultLanguages(payload: Payload): Promise<void> {
  try {
    for (const lang of DEFAULT_SEED_LANGUAGES) {
      const existing = await payload.find({
        collection: LANGUAGES_SLUG,
        where: { code: { equals: lang.code } },
        limit: 1,
        overrideAccess: true,
      })

      if (existing.docs.length > 0) continue

      await payload.create({
        collection: LANGUAGES_SLUG,
        data: { ...lang },
        overrideAccess: true,
      })
    }
  } catch (err) {
    const msg = String((err as Error)?.message ?? err)
    if (/relation .* does not exist/i.test(msg)) {
      payload.logger.warn('[languages] Bỏ qua seed — bảng languages chưa có. Chạy cms:devsafe trước.')
      return
    }
    throw err
  }
}
