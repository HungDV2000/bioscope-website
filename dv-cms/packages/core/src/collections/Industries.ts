import type { CollectionConfig } from 'payload'
import { anyone, isAdminOrEditor } from '../access/index.js'
import { slugField } from '../fields/slug.js'
import { ADMIN_GROUP_CONTENT } from '../i18n/admin-groups.js'

/**
 * Ngành — taxonomy thứ hai của bài viết.
 *
 * Tách khỏi chủ đề vì hai chiều phân loại độc lập: một bài "Chứng nhận GMP"
 * (chủ đề) có thể thuộc ngành Dược phẩm, Thực phẩm chức năng, hoặc cả hai.
 * Gộp chung một danh sách thì biên tập viên phải tạo tổ hợp chéo.
 */
export const Industries: CollectionConfig = {
  slug: 'industries',
  trash: true,
  labels: {
    singular: { en: 'Industry', vi: 'Ngành' },
    plural: { en: 'Industries', vi: 'Ngành' },
  },
  admin: {
    useAsTitle: 'name',
    group: ADMIN_GROUP_CONTENT,
    defaultColumns: ['name', 'slug', 'order'],
    description: 'Ngành hàng dùng để lọc bài viết: Thực phẩm chức năng, Mỹ phẩm, Dược phẩm…',
  },
  access: { read: anyone, create: isAdminOrEditor, update: isAdminOrEditor, delete: isAdminOrEditor },
  defaultSort: 'order',
  fields: [
    { name: 'name', type: 'text', localized: true, required: true, label: { en: 'Name', vi: 'Tên ngành' } },
    slugField('name'),
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      label: { en: 'Description', vi: 'Mô tả' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: { en: 'Order', vi: 'Thứ tự' },
      admin: { position: 'sidebar', description: 'Số nhỏ hiện trước trong bộ lọc.' },
    },
  ],
}
