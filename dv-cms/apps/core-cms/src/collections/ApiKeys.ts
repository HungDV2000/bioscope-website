import type { CollectionConfig } from 'payload'
import { isAdmin } from '@dv/cms-core'

/**
 * Khoá API cho bên thứ ba đọc danh mục nguyên liệu (chatbot Telegram của khách…).
 *
 * BẢO MẬT — vì sao lưu dạng BĂM chứ không lưu khoá gốc:
 * khoá này nằm ở hệ thống của BÊN KHÁC nên vòng đời không do mình kiểm soát.
 * Chỉ lưu SHA-256; ai xem được cơ sở dữ liệu hay bản sao lưu cũng không lấy
 * lại được khoá dùng thật. Khoá gốc chỉ hiện ĐÚNG MỘT LẦN lúc phát hành.
 *
 * Mất khoá thì phát lại (nút "Phát khoá mới") — khoá cũ mất hiệu lực ngay.
 */
export const ApiKeys: CollectionConfig = {
  slug: 'api-keys',
  labels: {
    singular: { en: 'API key', vi: 'Khoá API' },
    plural: { en: 'API keys', vi: 'Khoá API tích hợp' },
  },
  admin: {
    group: { en: 'System', vi: 'Hệ thống' },
    useAsTitle: 'name',
    defaultColumns: ['name', 'keyPrefix', 'enabled', 'lastUsedAt', 'callCount'],
    description: 'Cấp khoá cho hệ thống bên ngoài đọc danh mục nguyên liệu. Mỗi bên một khoá riêng để thu hồi độc lập.',
  },
  // Chỉ admin — khoá API là thông tin nhạy cảm, biên tập viên không cần thấy.
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
    admin: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: { en: 'Name', vi: 'Tên bên sử dụng' },
      admin: { description: 'Ví dụ: "Chatbot Telegram nội bộ". Đặt tên rõ để biết thu hồi khoá nào.' },
    },
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
      label: { en: 'Enabled', vi: 'Đang hiệu lực' },
      admin: {
        position: 'sidebar',
        description: 'Bỏ tick = KHOÁ NGỪNG HOẠT ĐỘNG NGAY, không cần deploy lại.',
      },
    },
    {
      name: 'keyPrefix',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Vài ký tự đầu để đối chiếu — không dùng để gọi API được.',
      },
      label: { en: 'Key prefix', vi: 'Đầu khoá' },
    },
    {
      // Chỉ lưu băm. KHÔNG có cách nào lấy lại khoá gốc từ đây.
      name: 'keyHash',
      type: 'text',
      index: true,
      admin: { hidden: true },
    },
    {
      /**
       * BẢNG GIÁ — mặc định TẮT.
       *
       * Payload đã đánh dấu `pricing` là chỉ-nhân-viên. Bật ô này là quyết định
       * KINH DOANH có chủ đích, không phải mặc định kỹ thuật: giá sẽ đi ra khỏi
       * hệ thống tới bên thứ ba giữ khoá. Bật/tắt được ngay, không cần deploy.
       */
      name: 'allowPricing',
      type: 'checkbox',
      defaultValue: false,
      label: { en: 'Allow price data', vi: 'Cho phép lấy bảng giá' },
      admin: {
        position: 'sidebar',
        description:
          '⚠️ Mặc định TẮT. Bật = bên giữ khoá đọc được bảng giá và điều khoản báo giá. Chỉ bật khi đã thống nhất với ban kinh doanh.',
      },
    },
    {
      /**
       * Phạm vi — khoá gọi được những endpoint nào.
       *
       * KHÔNG chọn mục nào = khoá không gọi được gì (chặn mặc định). Cố ý chọn
       * hướng chặt: cấp thừa quyền rồi quên là rủi ro lớn hơn nhiều so với việc
       * phải quay lại tick thêm một ô.
       */
      name: 'scopes',
      type: 'select',
      hasMany: true,
      defaultValue: ['search', 'list', 'detail'],
      label: { en: 'Allowed endpoints', vi: 'Endpoint được phép gọi' },
      options: [
        { label: { en: 'Search', vi: 'Tìm kiếm — /catalog/search' }, value: 'search' },
        { label: { en: 'List / sync', vi: 'Danh sách & đồng bộ — /catalog/ingredients' }, value: 'list' },
        { label: { en: 'Detail', vi: 'Chi tiết — /catalog/ingredients/{slug}' }, value: 'detail' },
      ],
      admin: {
        description:
          'Bỏ chọn hết = khoá không gọi được endpoint nào. Bên chỉ cần hỏi–đáp thì chỉ cần "Tìm kiếm"; muốn kéo cả kho về mới cần "Danh sách & đồng bộ". (/catalog/manifest luôn cho phép — chỉ trả số lượng, không có dữ liệu.)',
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      label: { en: 'Expires at', vi: 'Hết hạn' },
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        description:
          'Bỏ trống = không hết hạn. Nên đặt hạn với đối tác ngoài để khoá tự vô hiệu nếu quên thu hồi.',
      },
    },
    {
      name: 'rateLimitPerMin',
      type: 'number',
      defaultValue: 60,
      min: 1,
      max: 600,
      label: { en: 'Requests / minute', vi: 'Giới hạn lượt gọi mỗi phút' },
      admin: {
        position: 'sidebar',
        description: 'Chặn quét sạch dữ liệu và chặn lỗi vòng lặp bên gọi.',
      },
    },
    {
      name: 'issue',
      type: 'ui',
      admin: { components: { Field: '/components/ApiKeyIssue/ApiKeyIssue#ApiKeyIssue' } },
    },
    {
      name: 'lastUsedAt',
      type: 'date',
      admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
      label: { en: 'Last used', vi: 'Lần gọi gần nhất' },
    },
    {
      name: 'callCount',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true },
      label: { en: 'Total calls', vi: 'Tổng lượt gọi' },
    },
    {
      name: 'note',
      type: 'textarea',
      label: { en: 'Note', vi: 'Ghi chú' },
      admin: { description: 'Ai giữ khoá, liên hệ với ai khi cần thu hồi.' },
    },
  ],
}
