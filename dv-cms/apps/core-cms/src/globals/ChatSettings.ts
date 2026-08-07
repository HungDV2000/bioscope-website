import type { GlobalConfig } from 'payload'
import { isAdmin, isAdminOrEditor } from '@dv/cms-core'

/**
 * Cài đặt Live Chat (Web ↔ Telegram) — CẤU HÌNH ĐỘNG trong admin.
 *
 * Helper Telegram đọc các trường này TRƯỚC, chỉ lùi về biến môi trường khi ô
 * đây bỏ trống. Nhờ vậy đội vận hành bật/tắt chat, đổi bot/nhóm, sửa lời chào
 * mà KHÔNG cần deploy lại.
 *
 * Lưu ý bảo mật: botToken lưu trong DB (chỉ admin đọc/sửa) — đánh đổi để cấu
 * hình được ngay trong admin. Ai không muốn để trong DB thì bỏ trống ô này và
 * đặt TELEGRAM_BOT_TOKEN trong .env.
 */
export const ChatSettings: GlobalConfig = {
  slug: 'chat-settings',
  label: { en: 'Live Chat', vi: 'Cài đặt Chat' },
  admin: {
    group: { en: 'System', vi: 'Hệ thống' },
    description: 'Bật/tắt và cấu hình khung chat trên website + kết nối Telegram.',
  },
  access: {
    read: isAdminOrEditor,
    update: isAdmin,
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: false,
      label: { en: 'Enable live chat on website', vi: 'Bật live chat trên website' },
      admin: { description: 'Tắt = ẩn hẳn widget chat khỏi web.' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: { en: 'Telegram', vi: 'Telegram' },
          description: 'Kết nối bot + nhóm sales. Bỏ trống ô nào thì lấy từ biến môi trường tương ứng.',
          fields: [
            {
              name: 'botToken',
              type: 'text',
              label: 'Bot Token',
              admin: { description: 'Token từ @BotFather. Bí mật — chỉ admin xem/sửa. (fallback: TELEGRAM_BOT_TOKEN)' },
            },
            {
              name: 'salesChatId',
              type: 'text',
              label: { en: 'Sales group chat ID', vi: 'Chat ID nhóm sales' },
              admin: { description: 'Dạng -100xxxxxxxxxx (nhóm bật Topics). (fallback: TELEGRAM_SALES_CHAT_ID)' },
            },
            {
              name: 'webhookSecret',
              type: 'text',
              label: { en: 'Webhook secret', vi: 'Khoá webhook' },
              admin: { description: 'Chuỗi bí mật xác thực webhook Telegram. (fallback: TELEGRAM_WEBHOOK_SECRET)' },
            },
            {
              name: 'setup',
              type: 'ui',
              admin: { components: { Field: '/components/TelegramSetup/TelegramSetup#TelegramSetup' } },
            },
          ],
        },
        {
          label: { en: 'Widget', vi: 'Giao diện chat' },
          fields: [
            {
              name: 'widgetTitle',
              type: 'text',
              localized: true,
              label: { en: 'Widget title', vi: 'Tiêu đề khung chat' },
              defaultValue: 'Bioscope hỗ trợ',
            },
            {
              name: 'welcomeMessage',
              type: 'textarea',
              localized: true,
              label: { en: 'Welcome message', vi: 'Lời chào đầu tiên' },
              defaultValue: 'Chào bạn 👋 Bioscope có thể giúp gì cho bạn về nguyên liệu / báo giá?',
            },
            {
              name: 'offlineMessage',
              type: 'textarea',
              localized: true,
              label: { en: 'Offline message', vi: 'Lời nhắn ngoài giờ' },
              defaultValue: 'Hiện chưa có nhân viên trực. Để lại email, chúng tôi sẽ liên hệ lại sớm nhất.',
            },
          ],
        },
      ],
    },
  ],
}
