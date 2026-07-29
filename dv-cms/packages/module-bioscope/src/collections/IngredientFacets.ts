/**
 * Ingredient Facets — bộ phân loại dùng để LỌC nguyên liệu.
 *
 * VÌ SAO KHÔNG DÙNG `ingredient-categories`
 *   Collection đó sinh ra từ thư mục Google Drive nên lẫn lộn khái niệm: vừa có
 *   nhóm chức năng thật ("Miễn dịch & chống viêm"), vừa có thư mục nhà cung cấp
 *   ("DANH MỤC Nguyên liệu NCC NEXUS WISE - Malaysia") lẫn rác ("Mạnh test").
 *   Dùng nó làm bộ lọc thì danh sách vừa dài vừa vô nghĩa.
 *
 *   Facet là phân loại CÓ CHỦ ĐÍCH, biên tập viên tự kiểm soát, tách hẳn khỏi
 *   cấu trúc thư mục Drive.
 *
 * MỘT COLLECTION, BỐN NHÓM
 *   Gom vào một chỗ để quản lý một màn hình duy nhất. Trường `group` phân biệt,
 *   và mỗi trường quan hệ bên Ingredients lọc theo đúng nhóm của nó.
 */

import type { CollectionConfig } from 'payload'
import { anyone, isAdminOrEditor, slugField } from '@dv/cms-core'

export const FACET_GROUPS = [
  // 'primary' = danh mục chính (dùng cho card trang chủ + lọc cấp cao nhất).
  // Mỗi nguyên liệu gắn 1 hoặc nhiều. "Nguyên liệu mới" là catch-all.
  { label: { en: 'Primary category', vi: 'Danh mục chính' }, value: 'primary' },
  { label: { en: 'Function / benefit', vi: 'Công dụng' }, value: 'function' },
  { label: { en: 'Ingredient class', vi: 'Bản chất nguyên liệu' }, value: 'nature' },
  { label: { en: 'Physical form', vi: 'Dạng bào chế' }, value: 'form' },
  { label: { en: 'Technical property', vi: 'Đặc tính kỹ thuật' }, value: 'property' },
] as const

export type FacetGroup = (typeof FACET_GROUPS)[number]['value']

export const IngredientFacets: CollectionConfig = {
  slug: 'ingredient-facets',
  trash: true,
  labels: {
    singular: { en: 'Filter tag', vi: 'Thẻ lọc' },
    plural: { en: 'Filter tags', vi: 'Thẻ lọc nguyên liệu' },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'group', 'slug', 'order'],
    group: 'Bioscope',
    description:
      'Thẻ dùng để lọc nguyên liệu trên website. Thêm/sửa tự do — AI chỉ được chọn trong danh sách này, không tự bịa thẻ mới.',
    listSearchableFields: ['name', 'slug'],
  },
  access: {
    // Public read: bộ lọc trên web cần đọc danh sách thẻ.
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  defaultSort: 'order',
  fields: [
    { name: 'name', type: 'text', required: true, localized: true, label: { en: 'Name', vi: 'Tên thẻ' } },
    slugField('name'),
    {
      name: 'group',
      type: 'select',
      required: true,
      index: true,
      label: { en: 'Group', vi: 'Nhóm lọc' },
      options: [...FACET_GROUPS],
      admin: { description: 'Quyết định thẻ này xuất hiện ở bộ lọc nào trên web.' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 100,
      label: { en: 'Order', vi: 'Thứ tự' },
      admin: { description: 'Số nhỏ hiện trước.' },
    },
    {
      name: 'keywords',
      type: 'text',
      hasMany: true,
      label: { en: 'Match keywords', vi: 'Từ khoá nhận diện' },
      admin: {
        description:
          'Dùng để TỰ ĐỘNG gán thẻ cho nguyên liệu cũ (script backfill quét tên + mô tả). ' +
          'Vd thẻ "Dầu & Omega": omega, dha, epa, fish oil, dầu cá. Không phân biệt hoa thường và dấu tiếng Việt.',
      },
    },
    {
      name: 'description',
      type: 'text',
      localized: true,
      label: { en: 'Description', vi: 'Mô tả' },
      admin: { description: 'Giải thích ngắn cho biên tập viên. Không hiện trên web.' },
    },
  ],
}
