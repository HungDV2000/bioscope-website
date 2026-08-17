import type { GlobalConfig } from 'payload'
import { isAdmin, isAdminOrEditor } from '@dv/cms-core'

/**
 * Cài đặt AI — CẤU HÌNH ĐỘNG trong admin.
 *
 * Sinh nội dung / đọc ảnh dùng giao thức chat-completions của OpenAI, mà
 * OpenRouter tương thích hoàn toàn → đổi nhà cung cấp và model ngay trong admin,
 * không cần deploy lại.
 *
 * LƯU Ý QUAN TRỌNG: OpenRouter KHÔNG tạo được ảnh (không có endpoint images).
 * Phần "Tạo lại ảnh đại diện" vì thế luôn cần khoá OpenAI riêng — xem tab Ảnh.
 *
 * Bảo mật: khoá lưu trong CSDL, chỉ admin đọc/sửa — đánh đổi để cấu hình được
 * ngay trong admin. Không muốn để trong CSDL thì bỏ trống ô và đặt biến môi
 * trường tương ứng.
 */
export const AiSettings: GlobalConfig = {
  slug: 'ai-settings',
  label: { en: 'AI provider', vi: 'Cài đặt AI' },
  admin: {
    group: { en: 'System', vi: 'Hệ thống' },
    description: 'Chọn nhà cung cấp AI và model cho tính năng tạo nội dung tự động.',
  },
  access: { read: isAdminOrEditor, update: isAdmin },
  hooks: {
    // Lưu là áp dụng ngay — khỏi phải khởi động lại tiến trình.
    afterChange: [
      async ({ req }) => {
        const { applyAiSettings } = await import('../lib/aiSettings.js')
        await applyAiSettings(req.payload)
      },
    ],
  },
  fields: [
    {
      name: 'provider',
      type: 'select',
      defaultValue: 'openrouter',
      required: true,
      label: { en: 'Provider', vi: 'Nhà cung cấp' },
      options: [
        { label: 'OpenRouter — tự điều phối model tốt/rẻ theo từng yêu cầu', value: 'openrouter' },
        { label: 'OpenAI (trực tiếp)', value: 'openai' },
      ],
      admin: { description: 'Áp dụng cho sinh nội dung và đọc ảnh/PDF. Sinh ảnh luôn dùng OpenAI — xem tab Ảnh.' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: { en: 'Connection', vi: 'Kết nối' },
          description: 'Bỏ trống ô nào thì lấy từ biến môi trường tương ứng.',
          fields: [
            {
              name: 'openRouterApiKey',
              type: 'text',
              label: 'OpenRouter API Key',
              admin: {
                description:
                  'Lấy ở openrouter.ai → Keys. Bí mật, chỉ admin xem/sửa. Nên đặt hạn mức chi tiêu trong bảng điều khiển OpenRouter. (fallback: OPENROUTER_API_KEY)',
                condition: (d: { provider?: string }) => d?.provider !== 'openai',
              },
            },
            {
              name: 'openAiApiKey',
              type: 'text',
              label: 'OpenAI API Key',
              admin: {
                description: 'Dùng khi chọn nhà cung cấp OpenAI. (fallback: OPENAI_API_KEY)',
                condition: (d: { provider?: string }) => d?.provider === 'openai',
              },
            },
            {
              name: 'appName',
              type: 'text',
              defaultValue: 'Bioscope CMS',
              label: { en: 'App name', vi: 'Tên ứng dụng' },
              admin: {
                description: 'Hiện trong bảng điều khiển OpenRouter để đối chiếu chi phí. (X-Title)',
                condition: (d: { provider?: string }) => d?.provider !== 'openai',
              },
            },
          ],
        },
        {
          label: { en: 'Models', vi: 'Model' },
          description:
            'Để trống = dùng mặc định. Với OpenRouter, "openrouter/auto" nghĩa là ĐỂ OPENROUTER TỰ CHỌN model phù hợp từng yêu cầu — câu dễ thì dùng model rẻ, câu khó mới dùng model mạnh, nhờ đó tiết kiệm token. Muốn chỉ định thẳng thì ghi tên có tiền tố nhà cung cấp (anthropic/claude-sonnet-4.5, openai/gpt-4o…) và có thể thêm hậu tố ":floor" để ép chọn nhà cung cấp RẺ NHẤT, ":nitro" để ép NHANH NHẤT. Danh sách và giá: openrouter.ai/models',
          fields: [
            {
              name: 'contentModel',
              type: 'text',
              label: { en: 'Content model', vi: 'Model sinh nội dung' },
              admin: {
                description:
                  'Bỏ trống = openrouter/auto (OpenRouter tự chọn). Dùng cho mô tả, lợi ích, ứng dụng… (fallback: OPENAI_CONTENT_MODEL)',
              },
            },
            {
              name: 'visionModel',
              type: 'text',
              label: { en: 'Vision model', vi: 'Model đọc ảnh / PDF scan' },
              admin: {
                description:
                  '⚠️ ĐỪNG để "openrouter/auto" ở đây — bộ định tuyến có thể chọn model chỉ xử lý chữ và bước đọc ảnh sẽ hỏng. Hãy ghi rõ một model nhìn được, ví dụ google/gemini-2.5-flash. (fallback: OPENAI_VISION_MODEL)',
              },
            },
          ],
        },
        {
          label: { en: 'Images', vi: 'Ảnh' },
          description:
            '⚠️ OpenRouter KHÔNG tạo được ảnh (không có endpoint images). Phần này LUÔN gọi thẳng OpenAI, kể cả khi đang chọn OpenRouter ở trên.',
          fields: [
            {
              name: 'imageApiKey',
              type: 'text',
              label: { en: 'OpenAI key for image generation', vi: 'Khoá OpenAI cho sinh ảnh' },
              admin: {
                description:
                  'Bỏ trống thì dùng OPENAI_API_KEY. Không có khoá này thì nút "Tạo lại ảnh đại diện" sẽ báo lỗi.',
              },
            },
            {
              name: 'imagePromptModel',
              type: 'text',
              label: { en: 'Image prompt model', vi: 'Model viết mô tả ảnh' },
              admin: { description: 'Chạy qua nhà cung cấp đã chọn ở trên (chỉ sinh chữ). Bỏ trống = dùng model nội dung.' },
            },
            {
              name: 'imageModel',
              type: 'text',
              label: { en: 'Image model', vi: 'Model tạo ảnh (OpenAI)' },
              admin: { description: 'Ví dụ gpt-image-2. (fallback: OPENAI_IMAGE_MODEL)' },
            },
          ],
        },
      ],
    },
  ],
}
