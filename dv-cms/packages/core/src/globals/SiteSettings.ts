import type { GlobalConfig } from 'payload'
import { anyone, isAdminOrEditor } from '../access/index.js'
import { ADMIN_GROUP_SYSTEM } from '../i18n/admin-groups.js'

/**
 * Cấu hình toàn site, chia TAB cho dễ tìm.
 *
 * Thông tin công ty hiển thị ở chân trang trước đây nằm trong global
 * `Navigation` — sai chỗ, vì Navigation nên chỉ giữ MENU. Nay gom về đây;
 * Navigation vẫn giữ menu đầu trang / chân trang.
 *
 * Nhóm `contact` GIỮ NGUYÊN TÊN TRƯỜNG cũ (address/phone/email/mst) để không
 * mất dữ liệu đã nhập — chỉ đổi nhãn và bổ sung trường còn thiếu.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: { group: ADMIN_GROUP_SYSTEM },
  access: { read: anyone, update: isAdminOrEditor },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // ── Chung ───────────────────────────────────────────────────────────
        {
          label: { en: 'General', vi: 'Chung' },
          fields: [
            { name: 'siteName', type: 'text', localized: true, label: { en: 'Site name', vi: 'Tên website' } },
            {
              name: 'homePage',
              type: 'relationship',
              relationTo: 'pages',
              label: { en: 'Home page', vi: 'Trang chủ' },
              admin: {
                description: {
                  en: 'The Page rendered at the site root (/).',
                  vi: 'Trang được hiển thị ở đường dẫn gốc (/).',
                },
              },
            },
            { name: 'logo', type: 'upload', relationTo: 'media', label: { en: 'Logo', vi: 'Logo' } },
            {
              name: 'logoDark',
              type: 'upload',
              relationTo: 'media',
              label: { en: 'Logo (dark background)', vi: 'Logo (nền tối)' },
            },
          ],
        },

        // ── Chân trang ──────────────────────────────────────────────────────
        {
          label: { en: 'Footer', vi: 'Chân trang' },
          description: 'Mọi nội dung hiển thị ở chân trang website. Menu chân trang nằm ở mục Navigation.',
          fields: [
            {
              name: 'contact',
              type: 'group',
              label: { en: 'Company information', vi: 'Thông tin công ty' },
              fields: [
                {
                  name: 'companyName',
                  type: 'text',
                  localized: true,
                  label: { en: 'Company name', vi: 'Tên công ty' },
                  admin: { description: 'In đậm ở đầu khối chân trang. Vd: CÔNG TY CỔ PHẦN BIOSCOPE VIỆT NAM' },
                },
                {
                  name: 'tagline',
                  type: 'textarea',
                  localized: true,
                  label: { en: 'Tagline', vi: 'Câu giới thiệu' },
                  admin: { description: 'Câu mô tả ngắn ngay sau tên công ty.' },
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'mst', type: 'text', label: { en: 'Tax code', vi: 'Mã số thuế' }, admin: { width: '50%' } },
                    {
                      name: 'phone',
                      type: 'text',
                      label: { en: 'Hotline', vi: 'Hotline' },
                      admin: { width: '50%' },
                    },
                  ],
                },
                {
                  name: 'address',
                  type: 'textarea',
                  localized: true,
                  label: { en: 'Registered address', vi: 'Địa chỉ đăng ký kinh doanh' },
                  admin: { description: 'Hiện sau nhãn "ĐKKD:" ở chân trang.' },
                },
                {
                  name: 'officeAddress',
                  type: 'textarea',
                  localized: true,
                  label: { en: 'Office address', vi: 'Địa chỉ văn phòng' },
                  admin: { description: 'Hiện sau nhãn "Văn phòng:". Bỏ trống thì không hiện dòng này.' },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'email',
                      type: 'text',
                      label: { en: 'Email', vi: 'Email' },
                      admin: { width: '50%', description: 'Email liên hệ chung, hiển thị công khai.' },
                    },
                    {
                      name: 'invoiceEmail',
                      type: 'text',
                      label: { en: 'Invoice email', vi: 'Email nhận hoá đơn' },
                      admin: {
                        width: '50%',
                        description: 'Hoá đơn điện tử / chứng từ kế toán.',
                      },
                    },
                  ],
                },
                { name: 'website', type: 'text', label: { en: 'Website', vi: 'Website' } },
              ],
            },
            {
              name: 'newsletter',
              type: 'group',
              label: { en: 'Newsletter block', vi: 'Khối đăng ký nhận bản tin' },
              fields: [
                { name: 'title', type: 'text', localized: true, label: { en: 'Heading', vi: 'Tiêu đề' } },
                { name: 'description', type: 'textarea', localized: true, label: { en: 'Description', vi: 'Mô tả' } },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'placeholder',
                      type: 'text',
                      localized: true,
                      label: { en: 'Input placeholder', vi: 'Gợi ý trong ô nhập' },
                      admin: { width: '50%' },
                    },
                    {
                      name: 'buttonLabel',
                      type: 'text',
                      localized: true,
                      label: { en: 'Button label', vi: 'Chữ trên nút' },
                      admin: { width: '50%' },
                    },
                  ],
                },
              ],
            },
            {
              name: 'copyright',
              type: 'text',
              localized: true,
              label: { en: 'Copyright line', vi: 'Dòng bản quyền' },
              admin: { description: 'Bỏ trống để dùng mặc định.' },
            },
          ],
        },

        // ── Mạng xã hội ─────────────────────────────────────────────────────
        {
          label: { en: 'Social', vi: 'Mạng xã hội' },
          description: 'Các icon tròn ở chân trang. Bỏ trống thì không hiện icon nào.',
          fields: [
            {
              name: 'social',
              type: 'array',
              label: { en: 'Social links', vi: 'Liên kết mạng xã hội' },
              labels: { singular: { en: 'Link', vi: 'Liên kết' }, plural: { en: 'Links', vi: 'Liên kết' } },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'platform',
                      type: 'select',
                      label: { en: 'Platform', vi: 'Nền tảng' },
                      options: ['facebook', 'linkedin', 'youtube', 'instagram', 'zalo', 'x', 'tiktok', 'website'],
                      admin: { width: '40%' },
                    },
                    {
                      name: 'url',
                      type: 'text',
                      required: true,
                      label: { en: 'URL', vi: 'Đường dẫn' },
                      admin: { width: '60%', description: 'Dán đầy đủ, vd https://facebook.com/bioscope' },
                    },
                  ],
                },
              ],
            },
          ],
        },

        // ── Theo dõi & SEO ──────────────────────────────────────────────────
        {
          label: { en: 'Tracking & SEO', vi: 'Theo dõi & SEO' },
          fields: [
            {
              name: 'tracking',
              type: 'group',
              label: { en: 'Analytics', vi: 'Đo lường' },
              admin: { description: 'ID đo lường (để trống nếu chưa dùng).' },
              fields: [
                { name: 'ga4', type: 'text', label: 'GA4 Measurement ID' },
                { name: 'gtm', type: 'text', label: 'Google Tag Manager ID' },
                { name: 'pixel', type: 'text', label: 'Meta Pixel ID' },
              ],
            },
            {
              name: 'defaultSeo',
              type: 'group',
              label: { en: 'Default SEO', vi: 'SEO mặc định' },
              fields: [
                { name: 'title', type: 'text', localized: true },
                { name: 'description', type: 'textarea', localized: true },
                { name: 'image', type: 'upload', relationTo: 'media' },
              ],
            },
          ],
        },
      ],
    },
  ],
}
