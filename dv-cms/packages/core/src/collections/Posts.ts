import type { CollectionConfig } from 'payload'
import { isAdminOrEditor, readPublishedOrStaff } from '../access/index.js'
import { slugField } from '../fields/slug.js'
import { contentTabs } from '../fields/tabs.js'
import { ADMIN_GROUP_CONTENT } from '../i18n/admin-groups.js'

/** Blog / news articles. */
export const Posts: CollectionConfig = {
  slug: 'posts',
  trash: true,
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'categories', 'author', '_status', 'publishedAt'],
    group: ADMIN_GROUP_CONTENT,
  },
  versions: { drafts: { autosave: false }, maxPerDoc: 20 },
  access: {
    read: readPublishedOrStaff,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: contentTabs([
    { label: { en: 'Content', vi: 'Nội dung' }, fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    slugField('title'),
    { name: 'excerpt', type: 'textarea', localized: true },
    { name: 'content', type: 'richText', localized: true },
    { name: 'cover', type: 'upload', relationTo: 'media', admin: { position: 'sidebar' } },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar' },
    },
    {
      // Ba loại danh mục dễ nhầm: chủ đề bài viết (đây), danh mục nguyên liệu,
      // và danh mục tài nguyên. Nhãn ghi rõ để biên tập viên chọn đúng.
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      label: { en: 'Post categories', vi: 'Chủ đề bài viết' },
      admin: {
        position: 'sidebar',
        description: 'Chủ đề chính của bài. Dùng để lọc trên trang Bản tin.',
      },
    },
    {
      name: 'industries',
      type: 'relationship',
      relationTo: 'industries',
      hasMany: true,
      label: { en: 'Industries', vi: 'Ngành' },
      admin: {
        position: 'sidebar',
        description: 'Ngành hàng bài viết hướng tới. Một bài có thể thuộc nhiều ngành.',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      label: { en: 'Post tags', vi: 'Thẻ bài viết' },
      admin: { position: 'sidebar', description: 'Thẻ tự do, tuỳ chọn.' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
    ]},
  ]),
}
