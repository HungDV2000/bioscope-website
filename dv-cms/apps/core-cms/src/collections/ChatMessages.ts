import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '@dv/cms-core'

/** Một tin nhắn trong hội thoại chat. Ghi qua endpoint (khách) hoặc webhook (sales). */
export const ChatMessages: CollectionConfig = {
  slug: 'chat-messages',
  labels: { singular: { en: 'Message', vi: 'Tin nhắn' }, plural: { en: 'Messages', vi: 'Tin nhắn chat' } },
  admin: {
    group: { en: 'Live Chat', vi: 'Live Chat' },
    useAsTitle: 'text',
    defaultColumns: ['text', 'sender', 'agentName', 'createdAt'],
    description: 'Tin nhắn trong các hội thoại chat.',
  },
  access: {
    read: isAdminOrEditor,
    create: () => false,
    update: () => false,
    delete: isAdminOrEditor,
  },
  fields: [
    { name: 'conversation', type: 'relationship', relationTo: 'chat-conversations', index: true, required: true },
    {
      name: 'sender',
      type: 'select',
      required: true,
      options: [
        { label: { en: 'Visitor', vi: 'Khách' }, value: 'visitor' },
        { label: { en: 'Agent', vi: 'Sales' }, value: 'agent' },
        { label: { en: 'System', vi: 'Hệ thống' }, value: 'system' },
      ],
    },
    { name: 'text', type: 'textarea', required: true },
    { name: 'agentName', type: 'text', label: { en: 'Agent name', vi: 'Tên sales' } },
    { name: 'telegramMessageId', type: 'number', index: true, admin: { hidden: true } },
    // Ảnh/tệp sales gửi từ Telegram: chỉ lưu ID để tải lại khi cần, KHÔNG lưu
    // file vào thư viện Media (tệp có thể là báo giá riêng của một khách).
    { name: 'telegramFileId', type: 'text', admin: { hidden: true } },
    {
      name: 'attachmentKind',
      type: 'select',
      options: [
        { label: { en: 'Photo', vi: 'Ảnh' }, value: 'photo' },
        { label: { en: 'File', vi: 'Tệp' }, value: 'document' },
        { label: { en: 'Voice', vi: 'Tin thoại' }, value: 'voice' },
        { label: { en: 'Video', vi: 'Video' }, value: 'video' },
      ],
      admin: { readOnly: true },
      label: { en: 'Attachment', vi: 'Đính kèm' },
    },
    { name: 'attachmentName', type: 'text', admin: { readOnly: true }, label: { en: 'File name', vi: 'Tên tệp' } },
  ],
}
