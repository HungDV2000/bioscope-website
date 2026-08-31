import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access/index.js'
import { ADMIN_GROUP_CONTENT } from '../i18n/admin-groups.js'

/**
 * Bình luận bài viết do khách gửi.
 *
 * BẢO MẬT — vì sao access.read là chỉ-nhân-viên:
 * Bản ghi chứa email và địa chỉ IP của người gửi. Frontend KHÔNG đọc trực tiếp
 * collection này; nó gọi một endpoint riêng chỉ trả về tên, nội dung và ngày —
 * không bao giờ trả email hay IP ra ngoài.
 *
 * Bình luận vào ở trạng thái chờ duyệt (hoặc hiện luôn, tuỳ cấu hình trong
 * Cài đặt website). Không cho khách tự đặt trạng thái.
 */
export const PostComments: CollectionConfig = {
  slug: 'post-comments',
  trash: true,
  labels: {
    singular: { en: 'Comment', vi: 'Bình luận' },
    plural: { en: 'Comments', vi: 'Bình luận' },
  },
  admin: {
    useAsTitle: 'authorName',
    group: ADMIN_GROUP_CONTENT,
    defaultColumns: ['authorName', 'post', 'status', 'createdAt'],
    description: 'Bình luận khách gửi từ trang bài viết. Duyệt tại đây trước khi hiển thị.',
  },
  defaultSort: '-createdAt',
  access: {
    // Không mở đọc công khai: bản ghi có email và IP.
    read: isAdminOrEditor,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      required: true,
      index: true,
      label: { en: 'Post', vi: 'Bài viết' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      label: { en: 'Status', vi: 'Trạng thái' },
      options: [
        { label: { en: 'Pending review', vi: 'Chờ duyệt' }, value: 'pending' },
        { label: { en: 'Approved', vi: 'Đã duyệt' }, value: 'approved' },
        { label: { en: 'Spam', vi: 'Rác' }, value: 'spam' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'authorName', type: 'text', required: true, maxLength: 120, label: { en: 'Name', vi: 'Họ tên' } },
    {
      name: 'authorEmail',
      type: 'email',
      label: { en: 'Email', vi: 'Email' },
      admin: { description: 'Chỉ nhân viên xem được. KHÔNG hiển thị ra website.' },
    },
    { name: 'content', type: 'textarea', required: true, maxLength: 5000, label: { en: 'Content', vi: 'Nội dung' } },
    {
      name: 'authorIp',
      type: 'text',
      label: { en: 'IP address', vi: 'Địa chỉ IP' },
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Ghi lại để xử lý khi bị gửi rác. Không hiển thị ra website.',
      },
    },
    {
      name: 'locale',
      type: 'text',
      label: { en: 'Language', vi: 'Ngôn ngữ' },
      admin: { readOnly: true, position: 'sidebar' },
    },
  ],
}
