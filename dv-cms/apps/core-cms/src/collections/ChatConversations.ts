import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '@dv/cms-core'

const ro = { readOnly: true }

/**
 * Một hội thoại chat trên website. Tạo/ghi CHỈ qua endpoint (overrideAccess);
 * staff đọc để theo dõi. Mỗi hội thoại map tới một topic Telegram của nhóm sales.
 *
 * Dữ liệu tracking thu thập TỰ ĐỘNG từ IP + User-Agent + thông tin trình duyệt
 * gửi lên. KHÔNG xin quyền GPS. Cần nêu rõ trong Chính sách bảo mật.
 */
export const ChatConversations: CollectionConfig = {
  slug: 'chat-conversations',
  labels: { singular: { en: 'Conversation', vi: 'Hội thoại' }, plural: { en: 'Conversations', vi: 'Hội thoại chat' } },
  admin: {
    group: { en: 'Live Chat', vi: 'Live Chat' },
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'visitorEmail', 'location', 'lastMessageAt'],
    description: 'Hội thoại khách gửi từ website. Chỉ đọc — hệ thống tự tạo.',
  },
  access: {
    read: isAdminOrEditor,
    create: () => false,
    update: () => false,
    delete: isAdminOrEditor,
  },
  fields: [
    { name: 'title', type: 'text', admin: ro, label: 'Tiêu đề' },
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
    {
      type: 'tabs',
      tabs: [
        {
          label: { en: 'Transcript', vi: 'Lịch sử chat' },
          fields: [
            {
              name: 'transcript',
              type: 'ui',
              admin: { components: { Field: '/components/ChatTranscript/ChatTranscript#ChatTranscript' } },
            },
          ],
        },
        {
          label: { en: 'Visitor', vi: 'Khách' },
          fields: [
            { name: 'visitorName', type: 'text', label: { en: 'Visitor name', vi: 'Tên khách' } },
            { name: 'visitorEmail', type: 'text', label: { en: 'Visitor email', vi: 'Email khách' }, index: true },
            {
              name: 'loggedIn',
              type: 'checkbox',
              defaultValue: false,
              label: { en: 'Logged-in member', vi: 'Đã đăng nhập (thành viên B2B)' },
              admin: ro,
            },
            {
              name: 'member',
              type: 'relationship',
              relationTo: 'members',
              label: { en: 'Member account', vi: 'Tài khoản thành viên' },
              admin: { ...ro, description: 'Liên kết tới tài khoản B2B đã đăng nhập.' },
            },
            {
              name: 'company',
              type: 'text',
              label: { en: 'Company', vi: 'Công ty' },
              admin: ro,
            },
          ],
        },
        {
          label: { en: 'Location', vi: 'Vị trí' },
          description: 'Ước lượng từ địa chỉ IP — không phải vị trí GPS chính xác.',
          fields: [
            { name: 'visitorIp', type: 'text', admin: ro, label: { en: 'IP', vi: 'Địa chỉ IP' } },
            {
              name: 'location',
              type: 'text',
              admin: ro,
              label: { en: 'Location', vi: 'Vị trí (gộp)' },
            },
            {
              type: 'row',
              fields: [
                { name: 'country', type: 'text', admin: ro, label: { en: 'Country', vi: 'Quốc gia' } },
                { name: 'region', type: 'text', admin: ro, label: { en: 'Region', vi: 'Tỉnh / Bang' } },
                { name: 'city', type: 'text', admin: ro, label: { en: 'City', vi: 'Thành phố' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'postal', type: 'text', admin: ro, label: { en: 'Postal code', vi: 'Mã bưu chính' } },
                { name: 'timezone', type: 'text', admin: ro, label: { en: 'Timezone', vi: 'Múi giờ' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'latitude', type: 'number', admin: ro, label: { en: 'Latitude', vi: 'Vĩ độ' } },
                { name: 'longitude', type: 'number', admin: ro, label: { en: 'Longitude', vi: 'Kinh độ' } },
              ],
            },
            { name: 'isp', type: 'text', admin: ro, label: { en: 'ISP / Network', vi: 'Nhà mạng' } },
          ],
        },
        {
          label: { en: 'Device', vi: 'Thiết bị' },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'browser', type: 'text', admin: ro, label: { en: 'Browser', vi: 'Trình duyệt' } },
                { name: 'browserVersion', type: 'text', admin: ro, label: { en: 'Version', vi: 'Phiên bản' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'os', type: 'text', admin: ro, label: { en: 'OS', vi: 'Hệ điều hành' } },
                {
                  name: 'deviceType',
                  type: 'select',
                  admin: ro,
                  label: { en: 'Device', vi: 'Loại thiết bị' },
                  options: [
                    { label: { en: 'Desktop', vi: 'Máy tính' }, value: 'desktop' },
                    { label: { en: 'Mobile', vi: 'Điện thoại' }, value: 'mobile' },
                    { label: { en: 'Tablet', vi: 'Máy tính bảng' }, value: 'tablet' },
                    { label: 'Bot', value: 'bot' },
                  ],
                },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'screen', type: 'text', admin: ro, label: { en: 'Screen', vi: 'Độ phân giải' } },
                { name: 'language', type: 'text', admin: ro, label: { en: 'Language', vi: 'Ngôn ngữ' } },
              ],
            },
            { name: 'userAgent', type: 'textarea', admin: { ...ro, description: 'Chuỗi User-Agent gốc.' } },
          ],
        },
        {
          label: { en: 'Source', vi: 'Nguồn truy cập' },
          fields: [
            { name: 'startPage', type: 'text', admin: ro, label: { en: 'Started on page', vi: 'Trang bắt đầu chat' } },
            { name: 'referrer', type: 'text', admin: ro, label: { en: 'Referrer', vi: 'Trang giới thiệu' } },
            { name: 'landingPage', type: 'text', admin: ro, label: { en: 'Landing page', vi: 'Trang vào đầu tiên' } },
            {
              name: 'pageViews',
              type: 'number',
              admin: { ...ro, description: 'Số trang khách đã xem trước khi mở chat.' },
              label: { en: 'Pages viewed', vi: 'Số trang đã xem' },
            },
            {
              type: 'row',
              fields: [
                { name: 'utmSource', type: 'text', admin: ro, label: 'utm_source' },
                { name: 'utmMedium', type: 'text', admin: ro, label: 'utm_medium' },
                { name: 'utmCampaign', type: 'text', admin: ro, label: 'utm_campaign' },
              ],
            },
          ],
        },
      ],
    },
    { name: 'telegramTopicId', type: 'number', admin: { ...ro, position: 'sidebar' }, label: 'Telegram topic ID' },
    {
      name: 'lastMessageAt',
      type: 'date',
      admin: { ...ro, position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
      label: { en: 'Last message', vi: 'Tin cuối' },
    },
  ],
}
