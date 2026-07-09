import type { CollectionConfig } from 'payload'
import { isAdminOrEditor, readPublishedOrStaff, seoField, slugField } from '@dv/cms-core'
import { specsField } from '@dv/module-catalog'

/** Imported nutraceutical / cosmetic raw ingredients. */
export const Ingredients: CollectionConfig = {
  slug: 'ingredients',
  admin: {
    useAsTitle: 'name',
    group: 'Bioscope',
    defaultColumns: ['name', 'type', 'originCountry', 'featured', '_status'],
  },
  versions: { drafts: { autosave: false }, maxPerDoc: 10 },
  access: {
    read: readPublishedOrStaff,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    { name: 'name', type: 'text', localized: true, required: true },
    slugField('name'),
    {
      // Stable key used by CMS sync to upsert without duplicating records.
      // Drawn from external source (e.g. RAG product_name field).
      name: 'externalId',
      label: 'External ID (CMS Sync)',
      type: 'text',
      index: true,
      unique: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Khóa duy nhất từ hệ thống ngoài. Đồng bộ tự động.',
      },
    },
    { name: 'subtitle', type: 'text', localized: true },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'supplement',
      options: [
        { label: 'Supplement (TPCN)', value: 'supplement' },
        { label: 'Cosmetic (Mỹ phẩm)', value: 'cosmetic' },
        { label: 'Both (Đa ngành)', value: 'both' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      // Marketing badge hiển thị trên catalog card + advanced filter.
      // 'NEW' / 'TRENDING' / 'EXCLUSIVE' — match FE Ingredient.tag enum.
      name: 'tag',
      type: 'select',
      options: [
        { label: 'NEW', value: 'NEW' },
        { label: 'TRENDING', value: 'TRENDING' },
        { label: 'EXCLUSIVE', value: 'EXCLUSIVE' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Badge hiển thị trên thẻ nguyên liệu (NEW / TRENDING / EXCLUSIVE).',
      },
    },
    {
      // Tên khoa học / INCI — hiển thị dưới tên nguyên liệu trên trang detail.
      name: 'inci',
      type: 'text',
      localized: true,
      admin: { description: 'Tên khoa học / INCI.' },
    },
    {
      // Liều dùng gợi ý — hiển thị ở tab "Ứng dụng" trên trang detail.
      name: 'suggestedDosage',
      type: 'text',
      localized: true,
      admin: { description: 'Liều dùng gợi ý — tab Ứng dụng.' },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'ingredient-categories',
      admin: { position: 'sidebar' },
    },
    { name: 'originCountry', type: 'text', admin: { description: 'Mã quốc gia, vd JP.' } },
    { name: 'brandName', type: 'text', admin: { description: 'Thương hiệu OEM.' } },
    {
      name: 'partner',
      type: 'relationship',
      relationTo: 'partners',
      admin: { position: 'sidebar' },
    },
    { name: 'moq', type: 'text', label: 'MOQ' },
    { name: 'description', type: 'richText', localized: true },
    {
      name: 'benefits',
      type: 'text',
      hasMany: true,
      localized: true,
      admin: { description: 'Mỗi mục là một lợi ích.' },
    },
    {
      name: 'applications',
      type: 'text',
      hasMany: true,
      localized: true,
      admin: { description: 'Ứng dụng / dạng bào chế.' },
    },
    {
      name: 'badges',
      type: 'text',
      hasMany: true,
      admin: { description: 'Nhãn chứng nhận hiển thị trên thẻ (Halal, Non-GMO…).' },
    },
    { name: 'featuredImage', type: 'upload', relationTo: 'media' },
    {
      name: 'gallery',
      type: 'array',
      fields: [{ name: 'image', type: 'upload', relationTo: 'media' }],
    },
    {
      name: 'technologies',
      type: 'relationship',
      relationTo: 'technologies',
      hasMany: true,
    },
    specsField('specs'),
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },

    // ─── Google Drive Sync fields ─────────────────────────────────────────────
    // Legacy aliases (DB có sẵn cột sourceFileIds/lastIndexedAt từ schema cũ).
    {
      name: 'sourceFileIds',
      label: 'Source File IDs (Legacy)',
      type: 'json',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Danh sách file ID (cũ) — tương thích ngược với DB.',
      },
    },
    {
      name: 'lastIndexedAt',
      label: 'Last Indexed At (Legacy)',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Timestamp lần index cuối (cũ) — tương thích ngược với DB.',
      },
    },
    {
      // Drive folder ID cấp 2 (ingredient)
      name: 'driveId',
      label: 'Drive Folder ID',
      type: 'text',
      index: true,
      unique: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Google Drive folder ID của nguyên liệu này.',
      },
    },
    {
      // Drive folder ID cấp 1 (category)
      name: 'driveParentId',
      label: 'Drive Category ID',
      type: 'text',
      index: true,
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      // Danh sách file từ Google Drive
      name: 'driveFiles',
      label: 'Drive Files (CMS Sync)',
      type: 'json',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: '[{fileId, fileName, mimeType, webViewLink, webContentLink, size, modifiedTime}]',
      },
    },
    {
      name: 'fileCount',
      label: 'File Count',
      type: 'number',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Số file trong Drive folder.',
      },
    },
    {
      name: 'lastDriveSyncAt',
      label: 'Last Drive Sync At',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Lần cuối sync từ Google Drive.',
      },
    },

    seoField(),
  ],
}
