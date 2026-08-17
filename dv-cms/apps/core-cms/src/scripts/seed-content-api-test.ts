/**
 * Seed tối thiểu để kiểm thử API nội dung (/catalog/content/*, /catalog/site).
 *
 * CHỈ chạy trên DB nháp (dvcms_schemagen). Không dùng cho DB thật.
 */
import { getPayload } from 'payload'
import config from '../payload.config.js'

// Top-level await: `payload run` không chờ microtask nên bọc trong hàm là script chạy hụt.
const payload = await getPayload({ config })

const uri = process.env.DATABASE_URI ?? ''
if (!uri.includes('schemagen') && !uri.includes('test')) {
    throw new Error(`Từ chối chạy: DATABASE_URI không phải DB nháp (${uri.replace(/\/\/.*@/, '//***@')})`)
}

await payload.create({
    collection: 'faqs',
    data: {
      question: 'Bioscope có hỗ trợ đặt hàng số lượng nhỏ không?',
      answer: 'Có. MOQ tuỳ từng nguyên liệu, liên hệ đội kinh doanh để được tư vấn.',
      category: 'support',
      _status: 'published',
    } as never,
})

await payload.create({
    collection: 'faqs',
    data: {
      question: 'Câu hỏi NHÁP không được ra API',
      answer: 'Nếu câu này lọt ra API là lớp chặn bản nháp bị hỏng.',
      _status: 'draft',
    } as never,
})

await payload.create({
    collection: 'services',
    data: {
      title: 'Phát triển công thức',
      forWho: 'Thương hiệu muốn ra sản phẩm mới',
      summary: 'Đồng hành từ ý tưởng tới công thức hoàn chỉnh.',
      receive: ['Công thức mẫu', 'Hồ sơ kỹ thuật'],
      idealFor: ['Startup TPCN'],
      process: [{ step: 'Khảo sát', desc: 'Làm rõ mục tiêu sản phẩm' }],
      _status: 'published',
    } as never,
})

await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      siteName: 'Bioscope',
      contact: {
        companyName: 'Công ty CP Bioscope Việt Nam',
        phone: '028 1234 5678',
        email: 'info@bioscope.vn',
        address: 'Quận 1, TP.HCM',
        mst: '0301234567',
      },
      // Mã theo dõi — PHẢI KHÔNG lọt ra /catalog/site.
      tracking: { ga4: 'G-SECRET-TEST', gtm: 'GTM-SECRET', pixel: 'PIXEL-SECRET' },
    } as never,
})

console.log('[seed-content-api-test] xong')
process.exit(0)
