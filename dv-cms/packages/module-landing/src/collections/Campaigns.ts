import { APIError } from 'payload'
import type { CollectionConfig, Field } from 'payload'
import { SLUGS, CAMPAIGN_STATUS } from '../constants.js'
import { normalizeHost } from '../lib/domain.js'
import { revalidateCampaign } from '../lib/revalidate.js'
import { roundWindow } from '../lib/round-window.js'
import type { CampaignDoc } from '../lib/campaign.js'

const staffOnly = ({ req: { user } }: { req: { user: unknown } }) =>
  (user as { collection?: string } | null)?.collection === 'users'

const STATUS_LABELS: Record<(typeof CAMPAIGN_STATUS)[number], string> = {
  draft: 'Nháp — khách thấy "Sắp ra mắt"',
  active: 'Đang chạy',
  ended: 'Đã kết thúc — hiện danh sách nhận quà',
  off: 'Tắt hẳn — chuyển hướng đi nơi khác',
}

const pointField = (name: string, label: string, defaultValue: number, description?: string): Field => ({
  name,
  type: 'number',
  label,
  defaultValue,
  min: 0,
  required: true,
  admin: { width: '33%', ...(description ? { description } : {}) },
})

/**
 * Chiến dịch landing page.
 *
 * Một chiến dịch = một landing (ví dụ Gastroheal tháng 9) với tên miền, số suất
 * quà, thang điểm và nội dung riêng. Làm chung chung ngay từ đầu vì sau
 * Gastroheal còn các sản phẩm khác — phần định tuyến tên miền và quản lý người
 * tham gia dùng lại được nguyên vẹn.
 */
export const Campaigns: CollectionConfig = {
  slug: SLUGS.campaigns,
  labels: {
    singular: { vi: 'Chiến dịch landing', en: 'Landing campaign' },
    plural: { vi: 'Chiến dịch landing', en: 'Landing campaigns' },
  },
  admin: {
    useAsTitle: 'title',
    group: 'Landing page',
    defaultColumns: ['title', 'slug', 'status', 'deadline', 'updatedAt'],
    description:
      'Mỗi chiến dịch là một landing page. Khai tên miền ở tab "Tên miền", đổi trạng thái ở cột bên phải là có hiệu lực ngay, không cần deploy lại.',
  },
  access: {
    // Frontend đọc cấu hình qua endpoint nội bộ, không đọc thẳng REST.
    read: staffOnly,
    create: staffOnly,
    update: staffOnly,
    delete: staffOnly,
    admin: staffOnly,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data
        if (typeof data.slug === 'string') data.slug = data.slug.trim().toLowerCase()
        if (Array.isArray(data.domains)) {
          data.domains = data.domains
            .map((d: { host?: string }) => ({ ...d, host: normalizeHost(d?.host ?? '') ?? d?.host ?? '' }))
            .filter((d: { host?: string }) => d.host)
        }
        return data
      },
    ],
    beforeChange: [
      async ({ data, req, originalDoc }) => {
        // Chu kỳ theo tháng: hạn chốt do hệ thống tính (cuối tháng, giờ Việt
        // Nam) — nhân viên không phải sửa tay mỗi tháng, và trang luôn đếm
        // ngược đúng mốc thật.
        if ((data.cycle ?? originalDoc?.cycle ?? 'monthly') === 'monthly') {
          data.deadline = roundWindow({ ...(originalDoc ?? {}), ...data } as CampaignDoc).endAt
        }
        // Một tên miền chỉ thuộc một chiến dịch — trùng thì proxy không biết
        // hiển thị landing nào.
        const hosts: string[] = (data.domains ?? []).map((d: { host: string }) => d.host)
        const dup = hosts.find((h, i) => hosts.indexOf(h) !== i)
        if (dup) throw new APIError(`Tên miền "${dup}" bị khai hai lần.`, 400, null, true)
        if (hosts.length) {
          const others = await req.payload.find({
            collection: SLUGS.campaigns,
            where: {
              and: [
                { 'domains.host': { in: hosts } },
                ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
              ],
            },
            depth: 0,
            limit: 1,
            overrideAccess: true,
            req,
          })
          const clash = others.docs[0] as { title?: string; domains?: { host: string }[] } | undefined
          if (clash) {
            const h = clash.domains?.find((d) => hosts.includes(d.host))?.host
            throw new APIError(`Tên miền "${h}" đang được chiến dịch "${clash.title}" dùng.`, 400, null, true)
          }
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, req }) => {
        await revalidateCampaign(req.payload, doc.slug)
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: { vi: 'Tên chiến dịch', en: 'Title' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: { vi: 'Mã chiến dịch (slug)', en: 'Slug' },
      admin: {
        description: 'Chữ thường, không dấu, gạch nối. Dùng cho đường dẫn xem trước: web.bioscope.vn/lp/<mã>.',
      },
      validate: (v: unknown) =>
        typeof v === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v)
          ? true
          : 'Chỉ gồm chữ thường, số và dấu gạch nối, ví dụ: gastroheal-thang-9',
    },

    // ── Cột phải ────────────────────────────────────────────────────────
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      label: { vi: 'Trạng thái', en: 'Status' },
      options: CAMPAIGN_STATUS.map((value) => ({ value, label: STATUS_LABELS[value] })),
      admin: { position: 'sidebar' },
    },
    {
      name: 'autoEndAtDeadline',
      type: 'checkbox',
      defaultValue: true,
      label: { vi: 'Tự kết thúc đúng hạn chốt', en: 'Auto end at deadline' },
      admin: {
        position: 'sidebar',
        description: 'Đúng giờ chốt: đóng đăng ký, đóng băng thứ hạng và chọn người nhận quà — không cần ai ngồi canh.',
      },
    },
    {
      name: 'actions',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: { Field: '@dv/module-landing/admin#CampaignActions' },
      },
    },
    {
      name: 'winnersFrozenAt',
      type: 'date',
      label: { vi: 'Đã chốt danh sách lúc', en: 'Winners frozen at' },
      admin: { position: 'sidebar', readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'piiPurgedAt',
      type: 'date',
      label: { vi: 'Đã xoá dữ liệu cá nhân lúc', en: 'PII purged at' },
      admin: { position: 'sidebar', readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
    },

    {
      type: 'tabs',
      tabs: [
        {
          label: 'Quà & hạn chốt',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'slots',
                  type: 'number',
                  required: true,
                  defaultValue: 43,
                  min: 1,
                  label: 'Số phần quà đợt này',
                  admin: { width: '33%', description: 'Số người đứng đầu sẽ nhận quà khi chốt.' },
                },
                {
                  name: 'given',
                  type: 'number',
                  required: true,
                  defaultValue: 57,
                  min: 0,
                  label: 'Số người ĐÃ được tặng',
                  admin: { width: '33%', description: 'Con số "57 người đã nhận" trên trang.' },
                },
                {
                  name: 'discountPercent',
                  type: 'number',
                  required: true,
                  defaultValue: 10,
                  min: 0,
                  max: 90,
                  label: 'Mã giảm giá (%)',
                  admin: { width: '33%' },
                },
              ],
            },
            {
              name: 'cycle',
              type: 'select',
              required: true,
              defaultValue: 'monthly',
              label: 'Chu kỳ chương trình',
              options: [
                { value: 'monthly', label: 'Theo tháng — tự chốt cuối tháng, tự mở đợt mới ngày 1' },
                { value: 'once', label: 'Một lần — chốt đúng hạn dưới đây rồi kết thúc' },
              ],
              admin: {
                description:
                  'Theo tháng: điểm tính lại từ đầu mỗi tháng, người tham gia không phải đăng ký lại. Mốc giờ tính theo giờ Việt Nam.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'closeTime',
                  type: 'text',
                  defaultValue: '23:59',
                  label: 'Giờ chốt ngày cuối tháng',
                  admin: { width: '33%', placeholder: '23:59', condition: (data) => data?.cycle !== 'once' },
                },
                {
                  name: 'announceDay',
                  type: 'number',
                  defaultValue: 5,
                  min: 1,
                  max: 28,
                  label: 'Ngày công bố (tháng sau)',
                  admin: { width: '33%', description: 'Mặc định ngày 05 tháng sau.' },
                },
                {
                  name: 'announceTime',
                  type: 'text',
                  defaultValue: '10:00',
                  label: 'Giờ công bố',
                  admin: { width: '34%', placeholder: '10:00' },
                },
              ],
            },
            {
              name: 'deadline',
              type: 'date',
              label: 'Hạn chốt danh sách',
              admin: {
                date: { pickerAppearance: 'dayAndTime' },
                description: 'Chỉ dùng cho chu kỳ "Một lần". Chu kỳ theo tháng thì hệ thống tự tính cuối tháng.',
                condition: (data) => data?.cycle === 'once',
              },
            },
            {
              name: 'showResultDays',
              type: 'number',
              defaultValue: 7,
              min: 1,
              max: 28,
              label: 'Số ngày hiện kết quả đợt trước trên trang',
              admin: { description: 'Sau khi công bố, dải "43 khách hàng nhận quà tháng trước" hiện trong bấy nhiêu ngày.' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'requireOtp',
                  type: 'checkbox',
                  defaultValue: true,
                  label: 'Bắt xác thực số điện thoại bằng OTP',
                  admin: {
                    width: '50%',
                    description: 'Tắt thì khách vào thẳng sau khi điền tên + SĐT — nhanh hơn nhưng dễ bị đăng ký ảo bằng số người khác.',
                  },
                },
                {
                  name: 'requireRecordingApproval',
                  type: 'checkbox',
                  defaultValue: true,
                  label: 'Duyệt ghi âm rồi mới cộng điểm',
                  admin: { width: '50%', description: 'Tắt thì gửi ghi âm là cộng điểm ngay.' },
                },
              ],
            },
          ],
        },
        {
          label: 'Tên miền',
          description:
            'Trỏ bản ghi A của tên miền về IP của VPS, thêm site trong aaPanel (reverse proxy về frontend, giữ nguyên Host), rồi khai tên miền ở đây. Bấm "Kiểm tra DNS" ở cột phải để xem đã trỏ đúng chưa.',
          fields: [
            {
              name: 'domains',
              type: 'array',
              label: 'Tên miền của landing',
              labels: { singular: 'Tên miền', plural: 'Tên miền' },
              fields: [
                {
                  name: 'host',
                  type: 'text',
                  required: true,
                  label: 'Tên miền',
                  admin: { placeholder: 'gastroheal.vn' },
                  validate: (v: unknown) =>
                    typeof v === 'string' && normalizeHost(v)
                      ? true
                      : 'Nhập dạng gastroheal.vn — không kèm https:// hay đường dẫn.',
                },
              ],
            },
            {
              name: 'offRedirectUrl',
              type: 'text',
              defaultValue: 'https://web.bioscope.vn',
              label: 'Khi "Tắt hẳn" thì chuyển khách tới',
              validate: (v: unknown) =>
                !v || (typeof v === 'string' && /^https?:\/\/[^\s]+$/.test(v)) ? true : 'Phải là đường dẫn http(s) đầy đủ.',
            },
          ],
        },
        {
          label: 'Thang điểm',
          description: 'Điểm quy ra % hộp quà theo "Điểm để hộp quà đầy". Mặc định theo yêu cầu gốc: 2 / 5 / 10 / 10 / 10.',
          fields: [
            {
              name: 'points',
              type: 'group',
              label: false,
              fields: [
                {
                  type: 'row',
                  fields: [
                    pointField('video', 'Xem 1 video', 2),
                    pointField('videoMain', 'Video giới thiệu chính', 5),
                    pointField('record', 'Ghi âm kể chuyện', 10),
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    pointField('order', 'Mời được 1 người tham gia', 10, 'Cộng khi người được mời xác thực OTP và xem xong 1 video.'),
                    pointField('result', 'Chia sẻ kết quả sau 2 tuần', 10),
                    pointField('goal', 'Điểm để tiến độ đạt 100%', 45),
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    pointField('bonusPerJoin', 'Mỗi người vào sau', 2),
                    pointField('bonusMax', 'Tối đa số người vào sau được tính', 10),
                    pointField('maxReferralOrders', 'Tối đa số người mời được cộng mỗi đợt', 5),
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Video',
          fields: [
            {
              name: 'videos',
              type: 'array',
              label: 'Video',
              labels: { singular: 'Video', plural: 'Video' },
              maxRows: 10,
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'title', type: 'text', required: true, label: 'Tiêu đề', admin: { width: '60%' } },
                    { name: 'durationLabel', type: 'text', label: 'Thời lượng hiển thị', admin: { width: '20%', placeholder: '2:30' } },
                    {
                      name: 'minWatchSeconds',
                      type: 'number',
                      defaultValue: 20,
                      min: 3,
                      label: 'Xem tối thiểu (giây)',
                      admin: { width: '20%', description: 'Mở video ít hơn chừng này giây thì chưa cộng điểm.' },
                    },
                  ],
                },
                {
                  name: 'url',
                  type: 'text',
                  label: 'Link video (YouTube / Vimeo)',
                  admin: { description: 'Để trống thì trang hiện "Video đang được cập nhật".' },
                },
                {
                  name: 'isMain',
                  type: 'checkbox',
                  defaultValue: false,
                  label: 'Là video giới thiệu chính (tính điểm cao hơn)',
                },
              ],
            },
          ],
        },
        {
          label: 'Nội dung',
          fields: [
            {
              name: 'programName',
              type: 'text',
              defaultValue: 'Chương trình quà tháng {thang}',
              label: 'Tên chương trình',
              admin: { description: 'Dùng {thang} và {nam} để tự điền theo đợt. VD: Chương trình quà tháng 10.' },
            },
            {
              name: 'heroTitle',
              type: 'textarea',
              defaultValue: '{soSuat} phần quà dành cho khách hàng quan tâm đến *sức khoẻ dạ dày*',
              label: 'Tiêu đề lớn đầu trang',
              admin: {
                description:
                  'Dùng {soSuat} để tự điền số phần quà. Đặt một cụm giữa *dấu sao* để cụm đó được tô xanh và gạch chân vàng.',
              },
            },
            {
              name: 'heroSubtitle',
              type: 'textarea',
              defaultValue: 'Tham gia chương trình, hoàn thành các hoạt động để tích điểm và có cơ hội nhận quà tận nhà.',
              label: 'Câu phụ đầu trang',
            },
            {
              name: 'giftNote',
              type: 'text',
              defaultValue: 'Mỗi phần quà: 1 lọ Gastroheal 50 ml, giao tận nhà',
              label: 'Mô tả phần quà (dòng nhỏ đầu trang)',
              admin: { description: 'Trả lời câu "quà là gì". Để trống thì ẩn dòng này.' },
            },
            {
              name: 'eligibilityNote',
              type: 'text',
              defaultValue: 'Miễn phí · dành cho khách từ 18 tuổi đang ở Việt Nam · mỗi số điện thoại tham gia một lần',
              label: 'Điều kiện tham gia (dòng nhỏ dưới nút)',
              admin: { description: 'Trả lời câu "ai được tham gia". Để trống thì ẩn.' },
            },
            {
              name: 'ctaLabel',
              type: 'text',
              defaultValue: 'THAM GIA NGAY',
              label: 'Chữ trên nút tham gia',
            },
            {
              name: 'numberExplain',
              type: 'textarea',
              label: 'Giải thích con số phần quà',
              admin: {
                description:
                  'Hiện ngay dưới mục "43 khách hàng có tổng điểm cao nhất". Để trống thì ẩn. Nội dung quảng cáo TPBVSK — nên cho bộ phận đăng ký duyệt câu chữ trước khi chạy.',
              },
            },
            {
              name: 'rulesText',
              type: 'textarea',
              label: 'Thể lệ chương trình',
              admin: {
                rows: 10,
                description: 'Hiện trong popup "Xem thể lệ chương trình" ở cuối trang. Mỗi dòng một ý; dòng trống để tách đoạn.',
              },
            },
            {
              type: 'row',
              fields: [
                { name: 'hotline', type: 'text', defaultValue: '0982 298 820', label: 'Hotline', admin: { width: '33%' } },
                { name: 'contactEmail', type: 'text', defaultValue: 'sales.admin@bioscope.vn', label: 'Email liên hệ', admin: { width: '33%' } },
                { name: 'zaloUrl', type: 'text', label: 'Link Zalo', admin: { width: '33%' } },
              ],
            },
            {
              name: 'company',
              type: 'group',
              label: 'Thông tin công ty (hiện trong popup, không đăng thẳng lên trang)',
              fields: [
                { name: 'name', type: 'text', defaultValue: 'Công ty Cổ phần Bioscope Việt Nam', label: 'Tên công ty' },
                {
                  name: 'intro',
                  type: 'textarea',
                  defaultValue: 'Đối tác đồng sáng tạo và cung ứng nguyên liệu ngành TPCN, Mỹ phẩm, Dược phẩm.',
                  label: 'Giới thiệu ngắn',
                },
                {
                  name: 'registeredAddress',
                  type: 'text',
                  defaultValue: 'Số nhà 10 Đường 1D, KDC Melosa Khang Điền, Khu phố 3, P. Long Trường, TP.HCM',
                  label: 'Địa chỉ đăng ký kinh doanh',
                },
                {
                  name: 'officeAddress',
                  type: 'text',
                  defaultValue: 'Tầng 2, Nhà xưởng số 4, Đường N6, Đ. D1, P. Tăng Nhơn Phú, TP.HCM',
                  label: 'Văn phòng',
                },
                { name: 'taxCode', type: 'text', defaultValue: '0105293554', label: 'Mã số thuế' },
                { name: 'invoiceEmail', type: 'text', defaultValue: 'hoadon@bioscope.vn', label: 'Email hoá đơn' },
                { name: 'website', type: 'text', defaultValue: 'https://www.bioscope.vn/', label: 'Website' },
              ],
            },
            {
              name: 'certifications',
              type: 'array',
              label: 'Chứng nhận & hồ sơ',
              labels: { singular: 'Chứng nhận', plural: 'Chứng nhận' },
              fields: [
                { name: 'name', type: 'text', required: true, label: 'Tên giấy tờ' },
                { name: 'number', type: 'text', label: 'Số hiệu' },
                { name: 'file', type: 'upload', relationTo: 'media', label: 'Bản scan (PDF/ảnh)' },
              ],
            },
            {
              name: 'testimonials',
              type: 'array',
              label: 'Phản hồi người dùng',
              labels: { singular: 'Phản hồi', plural: 'Phản hồi' },
              admin: {
                description:
                  'Chỉ đăng phản hồi có sự đồng ý của người dùng. Bật "Là nội dung minh hoạ" khi chưa có phản hồi thật — trang sẽ ghi rõ.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'name', type: 'text', required: true, label: 'Tên hiển thị', admin: { width: '33%' } },
                    { name: 'area', type: 'text', label: 'Khu vực', admin: { width: '33%', placeholder: 'P. Bến Nghé' } },
                    { name: 'symptom', type: 'text', label: 'Vấn đề', admin: { width: '33%', placeholder: 'đau thượng vị' } },
                  ],
                },
                { name: 'quote', type: 'textarea', required: true, label: 'Lời kể' },
                { name: 'isIllustration', type: 'checkbox', defaultValue: true, label: 'Là nội dung minh hoạ' },
              ],
            },
            {
              name: 'studies',
              type: 'array',
              label: 'Nghiên cứu',
              labels: { singular: 'Nghiên cứu', plural: 'Nghiên cứu' },
              fields: [
                { name: 'title', type: 'text', required: true, label: 'Tiêu đề' },
                { name: 'summary', type: 'textarea', label: 'Tóm tắt' },
                {
                  name: 'source',
                  type: 'text',
                  label: 'Tạp chí, cỡ mẫu, kết quả',
                  admin: { description: 'Để trống thì trang ghi "đang cập nhật".' },
                },
                { name: 'link', type: 'text', label: 'Link bài báo' },
              ],
            },
          ],
        },
        {
          label: 'SEO & theo dõi',
          fields: [
            { name: 'metaTitle', type: 'text', label: 'Tiêu đề trang (để trống = tự sinh theo số suất)' },
            { name: 'metaDescription', type: 'textarea', label: 'Mô tả chia sẻ' },
            { name: 'ogImage', type: 'upload', relationTo: 'media', label: 'Ảnh khi chia sẻ Zalo/Facebook (1200×630)' },
            {
              name: 'favicon',
              type: 'upload',
              relationTo: 'media',
              label: 'Biểu tượng tab trình duyệt (favicon)',
              admin: { description: 'Ảnh vuông PNG/SVG, tối thiểu 64×64. Bỏ trống = biểu tượng mặc định màu Gastroheal.' },
            },
            {
              name: 'gtmId',
              type: 'text',
              label: 'Google Tag Manager ID',
              admin: { description: 'Dạng GTM-XXXXXXX. Mọi sự kiện của landing được đẩy vào dataLayer.' },
              validate: (v: unknown) => (!v || (typeof v === 'string' && /^GTM-[A-Z0-9]+$/.test(v)) ? true : 'Dạng GTM-XXXXXXX'),
            },
          ],
        },
        {
          label: 'Quyền riêng tư',
          fields: [
            {
              name: 'consentText',
              type: 'textarea',
              required: true,
              defaultValue: 'Tôi đồng ý để Bioscope liên hệ báo tin về chương trình.',
              label: 'Câu đồng ý hiện ở form đăng ký',
              admin: { description: 'Nguyên văn câu này được lưu kèm từng người tham gia làm bằng chứng đồng ý.' },
            },
            {
              name: 'retentionDays',
              type: 'number',
              defaultValue: 180,
              min: 30,
              label: 'Giữ dữ liệu cá nhân (ngày sau khi kết thúc)',
              admin: { description: 'Quá hạn này nên bấm "Xoá dữ liệu cá nhân" ở cột phải.' },
            },
          ],
        },
      ],
    },
  ],
}
