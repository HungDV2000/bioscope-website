import type { CollectionConfig } from 'payload'
import { isAdmin } from '@dv/cms-core'

import { ADMIN_GROUP_LANGUAGES } from '../i18n/admin-groups.js'
import { LANGUAGES_SLUG, LOCALE_CODE_RE } from '../lib/constants.js'
import { ensureSingleDefault, validateLocaleCode } from '../hooks/languageHooks.js'
import { buildManifestFromPayload, writeManifest } from '../hooks/syncManifest.js'
import { getManifestPath } from '../lib/manifestPath.js'

const syncManifestAfterChange = async ({ req }: { req: { payload: import('payload').Payload } }) => {
  try {
    const manifest = await buildManifestFromPayload(req.payload)
    await writeManifest(manifest, getManifestPath())
  } catch (err) {
    req.payload.logger.error(`[languages] sync manifest failed: ${err}`)
  }
}

/** Site languages — drives Payload localization via locales manifest. */
export const Languages: CollectionConfig = {
  slug: LANGUAGES_SLUG,
  labels: {
    singular: { en: 'Language', vi: 'Ngôn ngữ' },
    plural: { en: 'Languages', vi: 'Ngôn ngữ' },
  },
  trash: false,
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'code', 'enabled', 'isDefault', 'sortOrder'],
    group: ADMIN_GROUP_LANGUAGES,
    description: {
      en: 'Manage content locales. After changes, run sync (`pnpm lang:sync`) and restart the dev server.',
      vi: 'Quản lý ngôn ngữ nội dung. Sau khi đổi, chạy đồng bộ (`pnpm lang:sync`) và restart dev server.',
    },
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
    admin: isAdmin,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.code) data.code = validateLocaleCode(data.code)
        if (data?.fallbackLocale === '') data.fallbackLocale = null
      },
    ],
    beforeChange: [
      ({ data, originalDoc, operation }) => {
        if (operation === 'update' && originalDoc?.code) {
          data.code = originalDoc.code
        }
        return data
      },
      ensureSingleDefault,
    ],
    afterChange: [syncManifestAfterChange],
    afterDelete: [syncManifestAfterChange],
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      access: {
        // Không cho sửa code sau khi tạo (tránh function readOnly — lỗi Client Component).
        update: ({ id }) => !id,
      },
      admin: {
        description: {
          en: 'Locale code (vi, en, en-US). Cannot change after create.',
          vi: 'Mã locale (vi, en, en-US). Không đổi sau khi tạo.',
        },
      },
      validate: (value) => {
        if (!value || !LOCALE_CODE_RE.test(String(value))) {
          return 'Mã phải dạng vi, en hoặc en-US'
        }
        return true
      },
    },
    {
      name: 'label',
      type: 'text',
      required: true,
      admin: {
        description: { en: 'Label in admin UI', vi: 'Nhãn hiển thị trong admin' },
      },
    },
    {
      name: 'nativeLabel',
      type: 'text',
      admin: {
        description: {
          en: 'Name in that language (for frontend switcher)',
          vi: 'Tên bằng chính ngôn ngữ đó (cho frontend)',
        },
      },
    },
    {
      name: 'flag',
      type: 'text',
      admin: {
        description: { en: 'Emoji flag or icon code', vi: 'Emoji cờ hoặc mã icon' },
      },
    },
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
      label: { en: 'Enabled', vi: 'Bật' },
      admin: { position: 'sidebar' },
    },
    {
      name: 'isDefault',
      type: 'checkbox',
      defaultValue: false,
      label: { en: 'Default', vi: 'Mặc định' },
      admin: { position: 'sidebar' },
    },
    {
      name: 'rtl',
      type: 'checkbox',
      defaultValue: false,
      label: { en: 'Right-to-left', vi: 'Viết từ phải sang trái' },
      admin: { position: 'sidebar' },
    },
    {
      name: 'fallbackLocale',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: {
          en: 'Fallback locale code when translation is missing',
          vi: 'Mã locale dự phòng khi thiếu bản dịch',
        },
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: { en: 'Sort in switcher', vi: 'Thứ tự trên switcher' } },
    },
  ],
}
