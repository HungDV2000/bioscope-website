import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '@dv/cms-core'

/**
 * Một hội thoại chat trên website. Tạo/ghi CHỈ qua endpoint (overrideAccess);
 * staff đọc để theo dõi. Mỗi hội thoại map tới một topic Telegram của nhóm sales.
 */
export const ChatConversations: CollectionConfig = {
  slug: 'chat-conversations',
  labels: { singular: { en: 'Conversation', vi: 'Hội thoại' }, plural: { en: 'Conversations', vi: 'Hội thoại chat' } },
  admin: {
    group: { en: 'Live Chat', vi: 'Live Chat' },
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'visitorEmail', 'lastMessageAt'],
    description: 'Hội thoại khách gửi từ website. Chỉ đọc — hệ thống tự tạo.',
  },
  access: {
    read: isAdminOrEditor,
    create: () => false,
    update: () => false,
    delete: isAdminOrEditor,
  },
  fields: [
    { name: 'title', type: 'text', admin: { readOnly: true }, label: 'Tiêu đề' },
    { name: 'sessionToken', type: 'text', index: true, admin: { hidden: true } },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'open',
      options: [
        { label: { en: 'Open', vi: 'Đang mở' }, value: 'open' },
        { label: { en: 'Closed', vi: 'Đã đóng' }, value: 'closed' },
      ],
      index: true,
    },
    { name: 'visitorName', type: 'text', label: { en: 'Visitor name', vi: 'Tên khách' } },
    { name: 'visitorEmail', type: 'text', label: { en: 'Visitor email', vi: 'Email khách' }, index: true },
    { name: 'telegramTopicId', type: 'number', admin: { readOnly: true }, label: 'Telegram topic ID' },
    { name: 'startPage', type: 'text', admin: { readOnly: true }, label: { en: 'Started on page', vi: 'Trang bắt đầu' } },
    { name: 'userAgent', type: 'text', admin: { readOnly: true, hidden: true } },
    { name: 'lastMessageAt', type: 'date', admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
  ],
}
