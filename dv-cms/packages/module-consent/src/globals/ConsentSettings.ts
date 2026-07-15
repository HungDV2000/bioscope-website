/**
 * ConsentSettings — Complianz-style cookie-consent configuration. Drives the
 * frontend banner (text, categories, style) and the script blocker. Consumed by
 * the public /api/consent/config endpoint.
 */

import type { GlobalConfig } from 'payload'
import { anyone, isAdminOrEditor } from '@dv/cms-core'

const localizedText = (name: string, label: string, defaultValue?: string) => ({
  name,
  type: 'text' as const,
  localized: true,
  label,
  ...(defaultValue ? { defaultValue } : {}),
})

export const ConsentSettings: GlobalConfig = {
  slug: 'consent-settings',
  label: 'Cookie Consent (GDPR)',
  admin: {
    group: 'Security',
    description: 'Banner đồng ý cookie, phân loại cookie & chặn script (tham khảo Complianz).',
  },
  access: { read: anyone, update: isAdminOrEditor },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Banner',
          fields: [
            { name: 'enabled', type: 'checkbox', defaultValue: true, label: 'Bật banner cookie' },
            {
              name: 'mode',
              type: 'select',
              defaultValue: 'optIn',
              options: [
                { label: 'Opt-in (GDPR/EU — chặn tới khi đồng ý)', value: 'optIn' },
                { label: 'Opt-out (thông báo, mặc định bật)', value: 'optOut' },
              ],
            },
            localizedText('title', 'Tiêu đề', 'Chúng tôi sử dụng cookie'),
            {
              name: 'message',
              type: 'textarea',
              localized: true,
              label: 'Nội dung',
              defaultValue:
                'Website dùng cookie để cải thiện trải nghiệm, phân tích lưu lượng và cá nhân hóa nội dung. Bạn có thể chọn loại cookie cho phép.',
            },
            localizedText('acceptAllLabel', 'Nút "Chấp nhận tất cả"', 'Chấp nhận tất cả'),
            localizedText('rejectAllLabel', 'Nút "Từ chối"', 'Từ chối'),
            localizedText('customizeLabel', 'Nút "Tùy chỉnh"', 'Tùy chỉnh'),
            localizedText('saveLabel', 'Nút "Lưu lựa chọn"', 'Lưu lựa chọn'),
            {
              name: 'policyUrl',
              type: 'text',
              label: 'Link chính sách cookie/quyền riêng tư',
              defaultValue: '/chinh-sach-bao-mat',
            },
            {
              name: 'position',
              type: 'select',
              defaultValue: 'bottom',
              options: [
                { label: 'Dưới cùng', value: 'bottom' },
                { label: 'Góc dưới trái', value: 'bottom-left' },
                { label: 'Góc dưới phải', value: 'bottom-right' },
              ],
            },
          ],
        },
        {
          label: 'Danh mục cookie',
          fields: [
            {
              name: 'categories',
              type: 'array',
              label: 'Danh mục',
              admin: { description: 'Mỗi danh mục = 1 nhóm cookie/script người dùng bật/tắt.' },
              defaultValue: [
                { key: 'necessary', required: true, defaultOn: true },
                { key: 'preferences', required: false, defaultOn: false },
                { key: 'statistics', required: false, defaultOn: false },
                { key: 'marketing', required: false, defaultOn: false },
              ],
              fields: [
                {
                  name: 'key',
                  type: 'text',
                  required: true,
                  admin: { description: 'Mã danh mục (necessary/preferences/statistics/marketing).' },
                },
                localizedText('label', 'Nhãn hiển thị'),
                { name: 'description', type: 'textarea', localized: true },
                {
                  name: 'required',
                  type: 'checkbox',
                  defaultValue: false,
                  label: 'Bắt buộc (luôn bật, không tắt được)',
                },
                { name: 'defaultOn', type: 'checkbox', defaultValue: false, label: 'Mặc định bật' },
              ],
            },
          ],
        },
        {
          label: 'Giao diện',
          fields: [
            { name: 'accentColor', type: 'text', defaultValue: '#008e4d', admin: { description: 'Màu nút chính (hex).' } },
            {
              name: 'blockScripts',
              type: 'checkbox',
              defaultValue: true,
              label: 'Chặn script marketing/analytics tới khi có đồng ý',
            },
            {
              name: 'logConsent',
              type: 'checkbox',
              defaultValue: true,
              label: 'Lưu bằng chứng đồng ý (proof-of-consent)',
            },
          ],
        },
      ],
    },
  ],
}
