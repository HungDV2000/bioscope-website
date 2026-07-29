import type { CollectionConfig } from 'payload'
import { contentTabs, isAdminOrEditor, isStaffFieldLevel, readPublishedOrStaff, slugField } from '@dv/cms-core'
import { specsField } from '@dv/module-catalog'

/** Imported nutraceutical / cosmetic raw ingredients. */
export const Ingredients: CollectionConfig = {
  slug: 'ingredients',
  trash: true,
  admin: {
    useAsTitle: 'name',
    group: 'Bioscope',
    defaultColumns: ['name', 'type', 'originCountry', 'needsReview', 'featured', '_status'],
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
    { name: 'moq', type: 'text', label: 'MOQ', admin: { description: 'MOQ nhỏ nhất, dạng chữ. Bảng giá nhiều bậc nhập ở mục dưới.' } },

    // ── Bảng giá — NỘI BỘ ────────────────────────────────────────────────────
    // KHOÁ QUYỀN ĐỌC Ở CẤP TRƯỜNG. Collection này cho public đọc mọi bản đã
    // publish (readPublishedOrStaff), nên nếu không khoá thì giá sỉ lộ thẳng ra
    // GET /api/ingredients — một lệnh curl là đối thủ lấy sạch bảng giá.
    // Payload loại hẳn nhóm này khỏi phản hồi khi người gọi không phải nhân viên.
    {
      name: 'pricing',
      type: 'group',
      label: { en: 'Pricing (internal only)', vi: 'Bảng giá (chỉ nội bộ)' },
      access: { read: isStaffFieldLevel },
      admin: {
        description:
          'CHỈ NHÂN VIÊN xem được — không lộ ra API công khai. Giá lấy từ file "Mô tả" trên Drive.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'quoteDate',
              type: 'date',
              label: { en: 'Quote date', vi: 'Ngày báo giá' },
              admin: { width: '50%', description: 'Vd: "Giá ngày 11/01/2024".' },
            },
            {
              name: 'currency',
              type: 'select',
              defaultValue: 'VND',
              options: [
                { label: 'VNĐ', value: 'VND' },
                { label: 'USD', value: 'USD' },
              ],
              label: { en: 'Currency', vi: 'Đơn vị tiền' },
              admin: { width: '50%' },
            },
          ],
        },
        {
          name: 'terms',
          type: 'text',
          localized: true,
          label: { en: 'Price terms', vi: 'Điều kiện giá' },
          admin: { description: 'Vd: "đã gồm CB, chưa VAT".' },
        },
        {
          name: 'tiers',
          type: 'array',
          label: { en: 'Price tiers', vi: 'Bậc giá theo MOQ' },
          admin: {
            description:
              'Mỗi bậc một dòng. Có nguyên liệu tới 6 bậc (vd Nanocumin: dưới 20kg → 400-500kg).',
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'moq',
                  type: 'text',
                  required: true,
                  label: 'MOQ',
                  admin: { width: '40%', description: 'Vd: "25kg", "dưới 20kg", "100-200kg".' },
                },
                {
                  name: 'price',
                  type: 'number',
                  label: { en: 'Price per unit', vi: 'Đơn giá' },
                  admin: { width: '35%', description: 'Chỉ số, vd 5678000.' },
                },
                {
                  name: 'unit',
                  type: 'text',
                  defaultValue: 'kg',
                  label: { en: 'Per', vi: 'Trên' },
                  admin: { width: '25%' },
                },
              ],
            },
            { name: 'note', type: 'text', label: { en: 'Note', vi: 'Ghi chú' } },
          ],
        },
      ],
    },
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
    // ── Thẻ lọc ──────────────────────────────────────────────────────────────
    // Phân loại CÓ CHỦ ĐÍCH để lọc trên web, tách khỏi `category` (vốn sinh từ
    // thư mục Drive nên lẫn thư mục NCC và rác test). `filterOptions` khiến mỗi
    // ô chỉ cho chọn thẻ đúng nhóm của nó, nên biên tập viên không chọn nhầm.
    {
      name: 'primaries',
      type: 'relationship',
      relationTo: 'ingredient-facets',
      hasMany: true,
      label: { en: 'Primary categories', vi: 'Danh mục chính' },
      filterOptions: () => ({ group: { equals: 'primary' } }),
      admin: {
        description:
          'BẮT BUỘC — Chiết xuất thực vật, Omega & dầu cá, Lợi khuẩn, Hoạt chất công nghệ cao, hoặc Nguyên liệu mới. Dùng cho card trang chủ và lọc chính. Gắn 1 hoặc nhiều.',
      },
    },
    {
      name: 'functions',
      type: 'relationship',
      relationTo: 'ingredient-facets',
      hasMany: true,
      label: { en: 'Functions / benefits', vi: 'Công dụng' },
      filterOptions: () => ({ group: { equals: 'function' } }),
      admin: { description: 'Miễn dịch, Tim mạch, Não bộ, Xương khớp… — quản lý ở mục "Thẻ lọc nguyên liệu".' },
    },
    {
      name: 'natures',
      type: 'relationship',
      relationTo: 'ingredient-facets',
      hasMany: true,
      label: { en: 'Ingredient class', vi: 'Bản chất nguyên liệu' },
      filterOptions: () => ({ group: { equals: 'nature' } }),
      admin: { description: 'Chiết xuất thực vật, Dầu & Omega, Vitamin, Khoáng chất…' },
    },
    {
      name: 'forms',
      type: 'relationship',
      relationTo: 'ingredient-facets',
      hasMany: true,
      label: { en: 'Physical form', vi: 'Dạng bào chế' },
      filterOptions: () => ({ group: { equals: 'form' } }),
      admin: { description: 'Bột, Dầu/lỏng, Dịch chiết, Viên nang…' },
    },
    {
      name: 'properties',
      type: 'relationship',
      relationTo: 'ingredient-facets',
      hasMany: true,
      label: { en: 'Technical properties', vi: 'Đặc tính kỹ thuật' },
      filterOptions: () => ({ group: { equals: 'property' } }),
      admin: { description: 'Tan trong nước, Tan trong dầu, Chịu nhiệt, Vi bao…' },
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
      ],
    },

    ]},

    // ── Tab · Tài liệu ───────────────────────────────────────────────────────
    { label: { en: 'Documents', vi: 'Tài liệu' }, fields: [
    {
      name: 'documents',
      type: 'array',
      label: { en: 'Documents', vi: 'Tài liệu' },
      labels: { singular: { en: 'Document', vi: 'Tài liệu' }, plural: { en: 'Documents', vi: 'Tài liệu' } },
      admin: { description: 'File công khai (TDS · COA · SDS…) hiển thị & tải trực tiếp ở tab "Tài liệu" ngoài web. Tài liệu cần đăng nhập mới tải thì dùng Cổng B2B → Tài liệu giới hạn.' },
      fields: [
        { name: 'title', type: 'text', localized: true, label: { en: 'Title', vi: 'Tên tài liệu' } },
        { name: 'file', type: 'upload', relationTo: 'media', label: { en: 'File', vi: 'Tệp' } },
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
    {
      // Editorial workflow gọn nhẹ: biên tập viên bật "Chờ duyệt" khi muốn người
      // có quyền kiểm tra trước khi Xuất bản. Người duyệt lọc danh sách theo cờ
      // này, rà xong thì tắt cờ + Xuất bản. Là cờ điều phối, không chặn cứng.
      name: 'needsReview',
      type: 'checkbox',
      defaultValue: false,
      label: { en: 'Needs review', vi: 'Chờ duyệt' },
      admin: {
        position: 'sidebar',
        description: 'Bật khi cần người có quyền duyệt kiểm tra trước khi xuất bản.',
      },
    },
    {
      // Ẩn hoàn toàn khỏi website (khác với lưu nháp — nháp KHÔNG gỡ bản đã
      // xuất bản đang live). Frontend lọc bỏ nguyên liệu có hidden=true ở cả
      // trang danh sách lẫn trang chi tiết. Vì bật draft nên phải BẤM XUẤT BẢN
      // sau khi tick thì bản live mới mang giá trị hidden mới.
      name: 'hidden',
      type: 'checkbox',
      defaultValue: false,
      label: { en: 'Hide from website', vi: 'Ẩn khỏi website' },
      admin: {
        position: 'sidebar',
        description: 'Bật = gỡ khỏi trang nguyên liệu + trang chi tiết. Nhớ bấm "Xuất bản tài liệu" để áp dụng.',
      },
    },

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
