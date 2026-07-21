import type { CollectionConfig } from 'payload'
import { contentTabs, isAdminOrEditor, readPublishedOrStaff, slugField } from '@dv/cms-core'
import { specsField } from '@dv/module-catalog'

/** Imported nutraceutical / cosmetic raw ingredients. */
export const Ingredients: CollectionConfig = {
  slug: 'ingredients',
  admin: {
    useAsTitle: 'name',
    group: 'Bioscope',
    defaultColumns: ['name', 'type', 'originCountry', 'featured', '_status'],
    components: {
      // Bulk "Tạo nội dung tự động" bar on the list view (selected / all).
      beforeListTable: ['/components/BulkAiGenerate/BulkAiGenerate#BulkAiGenerate'],
      edit: {
        // "⚙ Công cụ nguyên liệu" dropdown (AI + Import/Export) next to Save/Publish.
        beforeDocumentControls: ['/components/IngredientAiField/IngredientAiField#IngredientAiField'],
      },
    },
  },
  versions: { drafts: { autosave: false }, maxPerDoc: 10 },
  access: {
    read: readPublishedOrStaff,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: contentTabs([
    // ── Tab 1 · Tổng quan ────────────────────────────────────────────────────
    { label: { en: 'Overview', vi: 'Tổng quan' }, fields: [
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
    ]},

    // ── Tab 2 · Nội dung ─────────────────────────────────────────────────────
    { label: { en: 'Content', vi: 'Nội dung' }, fields: [
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
    ]},

    // ── Tab 3 · Hình ảnh ─────────────────────────────────────────────────────
    { label: { en: 'Media', vi: 'Hình ảnh' }, fields: [
    { name: 'featuredImage', type: 'upload', relationTo: 'media' },
    {
      name: 'gallery',
      type: 'array',
      fields: [{ name: 'image', type: 'upload', relationTo: 'media' }],
    },
    ]},

    // ── Tab 4 · Kỹ thuật ─────────────────────────────────────────────────────
    { label: { en: 'Technical', vi: 'Kỹ thuật' }, fields: [
    {
      name: 'technologies',
      type: 'relationship',
      relationTo: 'technologies',
      hasMany: true,
    },
    specsField('specs'),

    // ─── Hồ sơ kỹ thuật ───────────────────────────────────────────────────────
    // Gom vào group để form không bị dài; tất cả đều tùy chọn nên nguyên liệu cũ
    // vẫn hợp lệ, và cột mới chỉ được THÊM vào schema (push không xoá gì).
    {
      name: 'technical',
      type: 'group',
      label: { en: 'Technical profile', vi: 'Hồ sơ kỹ thuật' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'casNumber', type: 'text', label: { en: 'CAS number', vi: 'Số CAS' }, admin: { width: '33%' } },
            { name: 'hsCode', type: 'text', label: { en: 'HS code', vi: 'Mã HS' }, admin: { width: '33%', description: 'Dùng khai hải quan.' } },
            { name: 'eNumber', type: 'text', label: { en: 'E-number', vi: 'Mã E' }, admin: { width: '33%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'assay', type: 'text', localized: true, label: { en: 'Assay / purity', vi: 'Hàm lượng / độ tinh khiết' }, admin: { width: '50%', description: 'Vd: 95% curcuminoids.' } },
            { name: 'standardization', type: 'text', localized: true, label: { en: 'Standardized to', vi: 'Chuẩn hoá theo' }, admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'appearance', type: 'text', localized: true, label: { en: 'Appearance / form', vi: 'Dạng & ngoại quan' }, admin: { width: '50%', description: 'Bột / dịch / hạt, màu, mùi.' } },
            { name: 'solubility', type: 'text', localized: true, label: { en: 'Solubility', vi: 'Độ tan' }, admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'particleSize', type: 'text', label: { en: 'Particle size', vi: 'Kích thước hạt' }, admin: { width: '50%', description: 'Vd: 80 mesh.' } },
            { name: 'shelfLife', type: 'text', localized: true, label: { en: 'Shelf life', vi: 'Hạn dùng' }, admin: { width: '50%', description: 'Vd: 24 tháng.' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'storage', type: 'text', localized: true, label: { en: 'Storage conditions', vi: 'Điều kiện bảo quản' }, admin: { width: '50%', description: 'Vd: 2-8°C, tránh ánh sáng.' } },
            { name: 'packaging', type: 'text', localized: true, label: { en: 'Packaging', vi: 'Quy cách đóng gói' }, admin: { width: '50%', description: 'Vd: 25 kg/thùng.' } },
          ],
        },
        { name: 'leadTime', type: 'text', localized: true, label: { en: 'Lead time', vi: 'Thời gian giao hàng' } },
        { name: 'incompatibility', type: 'textarea', localized: true, label: { en: 'Handling / incompatibility notes', vi: 'Lưu ý phối trộn / tương kỵ' } },
      ],
    },

    ]},

    // ── Tab 5 · Pháp lý ──────────────────────────────────────────────────────
    { label: { en: 'Regulatory', vi: 'Pháp lý' }, fields: [
    {
      name: 'regulatory',
      type: 'group',
      label: '',
      admin: { hideGutter: true },
      fields: [
        {
          name: 'status',
          type: 'select',
          hasMany: true,
          label: { en: 'Regulatory status', vi: 'Trạng thái pháp lý' },
          options: [
            { label: 'FDA GRAS', value: 'fda_gras' },
            { label: 'EFSA (EU)', value: 'efsa' },
            { label: { en: 'Vietnam MoH permitted', vi: 'Bộ Y tế VN cho phép' }, value: 'vn_moh' },
            { label: 'Novel Food', value: 'novel_food' },
          ],
        },
        { name: 'registrationNo', type: 'text', label: { en: 'Registration / notification no.', vi: 'Số công bố / đăng ký' } },
        { name: 'usageLimit', type: 'text', localized: true, label: { en: 'Permitted usage level', vi: 'Ngưỡng sử dụng cho phép' }, admin: { description: 'Vd: tối đa 500 mg/ngày.' } },
        {
          name: 'documents',
          type: 'array',
          label: { en: 'Certificates / documents', vi: 'Chứng nhận / tài liệu' },
          admin: { description: 'File công khai. Tài liệu cần đăng nhập mới tải thì dùng Cổng B2B → Tài liệu giới hạn.' },
          fields: [
            { name: 'title', type: 'text', localized: true, label: { en: 'Title', vi: 'Tên tài liệu' } },
            { name: 'file', type: 'upload', relationTo: 'media', label: { en: 'File', vi: 'Tệp' } },
          ],
        },
      ],
    },

    ]},

    // ── Tab 6 · Nghiên cứu ───────────────────────────────────────────────────
    { label: { en: 'Research', vi: 'Nghiên cứu' }, fields: [
    {
      name: 'research',
      type: 'group',
      label: '',
      admin: { hideGutter: true },
      fields: [
        { name: 'mechanism', type: 'richText', localized: true, label: { en: 'Mechanism of action', vi: 'Cơ chế tác dụng' } },
        {
          name: 'studies',
          type: 'array',
          label: { en: 'Clinical studies', vi: 'Nghiên cứu lâm sàng' },
          fields: [
            { name: 'title', type: 'text', localized: true, label: { en: 'Title', vi: 'Tiêu đề' } },
            { name: 'summary', type: 'textarea', localized: true, label: { en: 'Key finding', vi: 'Kết quả chính' } },
            { name: 'url', type: 'text', label: { en: 'Link / DOI', vi: 'Liên kết / DOI' } },
          ],
        },
      ],
    },

    {
      name: 'relatedIngredients',
      type: 'relationship',
      relationTo: 'ingredients',
      hasMany: true,
      label: { en: 'Related / alternative ingredients', vi: 'Nguyên liệu liên quan / thay thế' },
    },

    ]},

    // ── Các trường sidebar + đồng bộ (helper tự tách sidebar ra ngoài tabs) ───
    { label: { en: 'Sync', vi: 'Đồng bộ' }, fields: [
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
      // Danh sách file từ Google Drive — hiển thị bằng DriveFilesPanel component
      name: 'driveFiles',
      label: 'Drive Files (CMS Sync)',
      type: 'json',
      admin: {
        position: 'sidebar',
        readOnly: true,
        components: {
          Field: '/components/DriveFilesPanel/DriveFilesPanel#DriveFilesPanel',
        },
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

    ]},
  ]),
}
