import type { CollectionConfig } from 'payload'
import { anyone, isAdminOrEditor } from '../access/index.js'
import { slugField } from '../fields/slug.js'
import { ADMIN_GROUP_CONTENT } from '../i18n/admin-groups.js'

/** Thẻ bài viết — phân loại tự do, khác với chủ đề (danh sách đóng). */
export const Tags: CollectionConfig = {
  slug: 'tags',
  trash: true,
  labels: {
    singular: { en: 'Post tag', vi: 'Thẻ bài viết' },
    plural: { en: 'Post tags', vi: 'Thẻ bài viết' },
  },
  admin: {
    useAsTitle: 'name',
    group: ADMIN_GROUP_CONTENT,
    defaultColumns: ['name', 'slug'],
    description: 'Thẻ tự do gắn cho bài viết. Chủ đề mới là danh mục chính.',
  },
  access: { read: anyone, create: isAdminOrEditor, update: isAdminOrEditor, delete: isAdminOrEditor },
  fields: [
    { name: 'name', type: 'text', localized: true, required: true, label: { en: 'Name', vi: 'Tên thẻ' } },
    slugField('name'),
  ],
}
