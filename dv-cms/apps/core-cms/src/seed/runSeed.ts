import type { Payload } from 'payload'

import { seedMediaLibrary } from './seedMedia.js'
import { seedForms } from './seedForms.js'
import { upsert, upsertLocalized, type Id } from './seedHelpers.js'

/** Build a minimal Lexical editor state from plain paragraphs. */
const lexical = (paragraphs: string[]) => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: paragraphs.map((t) => ({
      type: 'paragraph',
      version: 1,
      format: '',
      indent: 0,
      direction: 'ltr' as const,
      textFormat: 0,
      children: [
        { type: 'text', version: 1, text: t, format: 0, style: '', mode: 'normal', detail: 0 },
      ],
    })),
  },
})

/**
 * Recursively copy ids (nested groups + array rows) from a saved vi tree onto
 * an en tree by index, so an en-locale update writes the SAME rows/blocks.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const copyIds = (vi: any, en: any): any => {
  if (Array.isArray(en) && Array.isArray(vi)) return en.map((e, i) => copyIds(vi[i], e))
  if (en && typeof en === 'object' && vi && typeof vi === 'object') {
    const out: Record<string, unknown> = { ...en }
    if (vi.id != null) out.id = vi.id
    for (const k of Object.keys(en)) {
      if (en[k] && typeof en[k] === 'object') out[k] = copyIds(vi[k], en[k])
    }
    return out
  }
  return en
}

/**
 * Idempotent seed for Bioscope content. Safe to run repeatedly: existing
 * records are found (by a unique-ish field) and reused, globals are updated.
 * Returns a list of human-readable log lines for the caller to surface.
 */
export async function runSeed(payload: Payload): Promise<string[]> {
  const out: string[] = []
  const log = (m: string) => {
    out.push(m)
    process.stderr.write(`[seed] ${m}\n`)
  }

  /* ── 1. Admin user ─────────────────────────────────────── */
  const admins = await payload.find({
    collection: 'users',
    where: { email: { equals: 'admin@bioscope.vn' } },
    limit: 1,
  })
  let adminId: Id
  if (admins.totalDocs === 0) {
    const a = await payload.create({
      collection: 'users',
      data: { name: 'Bioscope Admin', email: 'admin@bioscope.vn', password: 'Bioscope@123', role: 'admin' },
    })
    adminId = a.id
    log('admin created → admin@bioscope.vn / Bioscope@123')
  } else {
    adminId = (admins.docs[0] as { id: Id }).id
    log('admin already exists')
  }

  /* ── 1b. Media library (folders + sample images) ───────── */
  const coaMediaId = await seedMediaLibrary(payload, log)

  /* ── 1c. Forms (Liên hệ, mẫu thử, Bioscope AI) ─────────── */
  await seedForms(payload, log)

  /* ── 2. Site settings ──────────────────────────────────── */
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      siteName: 'Bioscope',
      contact: {
        phone: '+84 28 7300 9888',
        email: 'info@bioscope.vn',
        address: '123 Innovation Way, TP. Hồ Chí Minh',
        mst: '0312345678',
      },
      social: [
        { platform: 'facebook', url: 'https://facebook.com/bioscope' },
        { platform: 'linkedin', url: 'https://linkedin.com/company/bioscope' },
        { platform: 'youtube', url: 'https://youtube.com/@bioscope' },
      ],
      defaultSeo: {
        title: 'Bioscope — Đối tác nguyên liệu & đồng kiến tạo thương hiệu',
        description:
          'Nguyên liệu chuyên biệt, công nghệ độc quyền và quy trình đồng kiến tạo — đồng hành cùng thương hiệu từ ý tưởng đến tăng trưởng.',
      },
    },
  })
  log('site-settings updated')

  /* ── 2b. Navigation (song ngữ: menu đầu trang + 4 cột chân trang) ── */
  const navVi = {
    header: [
      { label: 'Nguyên liệu', url: '/nguyen-lieu' },
      { label: 'Giải pháp', url: '/giai-phap' },
      { label: 'Đồng kiến tạo', url: '/dong-kien-tao' },
      { label: 'Nghiên cứu & Phát triển', url: '/rd' },
      { label: 'Tài nguyên', url: '/tai-nguyen' },
      { label: 'Về chúng tôi', url: '/ve-chung-toi' },
    ],
    footer: [
      { label: 'Nguyên liệu', url: '#', children: [
        { label: 'Thực phẩm chức năng', url: '/nguyen-lieu' }, { label: 'Mỹ phẩm', url: '/nguyen-lieu' },
        { label: 'Dược phẩm', url: '/nguyen-lieu' }, { label: 'Chiết xuất thực vật', url: '/nguyen-lieu' },
      ] },
      { label: 'Giải pháp', url: '#', children: [
        { label: 'Cung cấp nguyên liệu', url: '/giai-phap' }, { label: 'Phát triển công thức ODM', url: '/giai-phap' },
        { label: 'Đồng kiến tạo', url: '/dong-kien-tao' },
      ] },
      { label: 'Công ty', url: '#', children: [
        { label: 'Về chúng tôi', url: '/ve-chung-toi' }, { label: 'Nghiên cứu & Phát triển', url: '/rd' },
        { label: 'Case study', url: '/case-study' }, { label: 'Tài nguyên', url: '/tai-nguyen' },
      ] },
      { label: 'Hỗ trợ', url: '#', children: [
        { label: 'Liên hệ', url: '/lien-he' }, { label: 'Yêu cầu mẫu thử', url: '/lien-he' },
        { label: 'Câu hỏi thường gặp', url: '/cau-hoi-thuong-gap' }, { label: 'Chính sách bảo mật', url: '/chinh-sach-bao-mat' },
        { label: 'Cổng đối tác', url: '/lien-he' },
      ] },
    ],
  }
  const navEn = {
    header: [
      { label: 'Ingredients', url: '/nguyen-lieu' }, { label: 'Solutions', url: '/giai-phap' },
      { label: 'Co-creation', url: '/dong-kien-tao' }, { label: 'R&D', url: '/rd' },
      { label: 'Resources', url: '/tai-nguyen' }, { label: 'About us', url: '/ve-chung-toi' },
    ],
    footer: [
      { label: 'Ingredients', url: '#', children: [
        { label: 'Nutraceuticals', url: '/nguyen-lieu' }, { label: 'Cosmetics', url: '/nguyen-lieu' },
        { label: 'Pharmaceuticals', url: '/nguyen-lieu' }, { label: 'Botanical extracts', url: '/nguyen-lieu' },
      ] },
      { label: 'Solutions', url: '#', children: [
        { label: 'Ingredient supply', url: '/giai-phap' }, { label: 'ODM formulation', url: '/giai-phap' },
        { label: 'Co-creation', url: '/dong-kien-tao' },
      ] },
      { label: 'Company', url: '#', children: [
        { label: 'About us', url: '/ve-chung-toi' }, { label: 'R&D', url: '/rd' },
        { label: 'Case studies', url: '/case-study' }, { label: 'Resources', url: '/tai-nguyen' },
      ] },
      { label: 'Support', url: '#', children: [
        { label: 'Contact', url: '/lien-he' }, { label: 'Request samples', url: '/lien-he' },
        { label: 'FAQ', url: '/cau-hoi-thuong-gap' }, { label: 'Privacy policy', url: '/chinh-sach-bao-mat' },
        { label: 'Partner portal', url: '/lien-he' },
      ] },
    ],
  }
  await payload.updateGlobal({ slug: 'navigation', data: navVi as never, locale: 'vi' })
  const navDoc = await payload.findGlobal({ slug: 'navigation', locale: 'vi', depth: 0 })
  await payload.updateGlobal({ slug: 'navigation', data: copyIds(navDoc, navEn) as never, locale: 'en' })
  log('navigation updated (song ngữ vi + en)')

  /* ── 2c. Branding (whitelabel theme) ───────────────────── */
  await payload.updateGlobal({
    slug: 'branding',
    data: {
      brandName: 'Bioscope',
      loginSubtitle: 'Hệ quản trị nội dung Bioscope',
      primaryColor: '#008E4D',
      primaryDark: '#036F3D',
      accentColor: '#F58E33',
      sidebarBackground: '#F4F8F6',
      radius: 12,
      fontFamily: 'be-vietnam-pro',
      frontendTheme: {
        primaryColor: '#008E4D',
        primaryDark: '#036F3D',
        primaryTint: '#EEF6F1',
        primaryBorder: '#CFE3D8',
        accentColor: '#F58E33',
        accentSoft: '#FFF4E8',
        ink: '#101814',
        mist: '#F4F8F6',
        fontFamily: 'be-vietnam-pro',
        radiusLg: 16,
        radiusXl: 24,
        radius2xl: 28,
      },
    },
  })

  /* ── 3. Partners ───────────────────────────────────────── */
  const partnerData = [
    { name: 'GC Rieber Oils', country: 'NO', website: 'https://gcrieber-oils.example' },
    { name: 'Indena', country: 'IT', website: 'https://indena.example' },
    { name: 'Sabinsa', country: 'US', website: 'https://sabinsa.example' },
    { name: 'Naturex', country: 'FR', website: 'https://naturex.example' },
  ]
  const partners: Record<string, Id> = {}
  for (const p of partnerData) partners[p.name] = await upsert(payload, 'partners', { name: { equals: p.name } }, p)
  log(`partners: ${partnerData.length}`)

  /* ── 4. Ingredient categories ──────────────────────────── */
  const catData = [
    { name: 'Hỗ trợ xương khớp', scope: 'supplement', slug: 'joint-health' },
    { name: 'Làm đẹp & chống lão hóa', scope: 'both', slug: 'beauty' },
    { name: 'Vitamin & khoáng chất', scope: 'supplement', slug: 'vitamins' },
  ]
  const cats: Record<string, Id> = {}
  for (const c of catData) cats[c.slug] = await upsertLocalized(payload, 'ingredient-categories', { slug: { equals: c.slug } }, { vi: c })
  log(`ingredient categories: ${catData.length}`)

  /* ── 5. Technologies ───────────────────────────────────── */
  const techData = [
    { name: 'Liposome Technology', slug: 'liposome', tagline: 'Tăng sinh khả dụng tới 3.8x', order: 1 },
    { name: 'Microencapsulation', slug: 'microencapsulation', tagline: 'Ổn định & bảo vệ hoạt chất', order: 2 },
    { name: 'Spray Drying', slug: 'spray-drying', tagline: 'Giữ trọn hoạt tính', order: 3 },
  ]
  for (const t of techData) await upsertLocalized(payload, 'technologies', { slug: { equals: t.slug } }, { vi: { ...t, _status: 'published' } })
  log(`technologies: ${techData.length}`)

  /* ── 6. Ingredients ────────────────────────────────────── */
  const ingredientData = [
    { name: 'Curcumin Extract 95%', slug: 'curcumin-extract-95', type: 'supplement', category: cats['joint-health'], originCountry: 'IN', moq: '25 kg', featured: true, benefits: ['Kháng viêm', 'Chống oxy hoá'], badges: ['Halal', 'Non-GMO', 'GMP'] },
    { name: 'Omega 3 Fish Oil', slug: 'omega-3-fish-oil', type: 'supplement', partner: partners['GC Rieber Oils'], originCountry: 'NO', moq: '20 kg', featured: true, benefits: ['Tốt cho tim mạch'], badges: ['IFOS 5-Star', 'GMP', 'Halal'] },
    { name: 'Collagen Peptide', slug: 'collagen-peptide', type: 'cosmetic', category: cats['beauty'], originCountry: 'AR', moq: '25 kg', featured: true, benefits: ['Tăng đàn hồi da'], badges: ['Halal', 'BSE/TSE Free', 'GMP'] },
    { name: 'NMN', slug: 'nmn', type: 'supplement', originCountry: 'JP', moq: '10 kg', featured: true, benefits: ['Hỗ trợ chống lão hoá'], badges: ['≥ 99% Purity', 'Non-GMO', 'GMP'] },
    { name: 'Vitamin C (Coated)', slug: 'vitamin-c-coated', type: 'supplement', category: cats['vitamins'], originCountry: 'CH', moq: '25 kg', benefits: ['Phóng thích chậm 8h'], badges: ['Non-GMO', 'GMP', 'Kosher'] },
    { name: 'Marine Sweet® (NAG)', slug: 'marine-sweet-nag', type: 'supplement', category: cats['joint-health'], originCountry: 'JP', moq: '5 kg', benefits: ['Tái tạo sụn khớp', 'Dưỡng ẩm da'], badges: ['GMP', 'Halal'] },
  ]
  for (const ing of ingredientData) await upsertLocalized(payload, 'ingredients', { slug: { equals: ing.slug } }, { vi: { ...ing, _status: 'published' } })
  log(`ingredients: ${ingredientData.length}`)

  /* ── 7. Services (giải pháp — nuôi trang /giai-phap/[slug]) ─ */
  const serviceData: { slug: string; order: number; icon: string; vi: Record<string, unknown>; en: Record<string, unknown> }[] = [
    {
      slug: 'cung-cap-nguyen-lieu',
      order: 1,
      icon: 'FlaskConical',
      vi: {
        title: 'Cung cấp nguyên liệu đặc biệt',
        forWho: 'Doanh nghiệp đã có đội R&D, cần nguồn nguyên liệu hiếm, chất lượng cao, đầy đủ tài liệu pháp lý.',
        cta: 'Khám phá nguyên liệu',
        summary: 'Danh mục hoạt chất hiếm, hiệu quả đã kiểm chứng — phù hợp khi bạn đã có năng lực phát triển sản phẩm và cần nguồn cung đáng tin.',
        receive: ['100+ nguyên liệu chuyên biệt', 'COA / TDS / SDS đầy đủ', 'Mẫu thử nhanh', 'Nguồn cung ổn định từ 50+ quốc gia'],
        idealFor: ['Nhà sản xuất đã có dây chuyền và đội R&D nội bộ', 'Thương hiệu cần nguyên liệu hiếm hoặc chuẩn hóa cao', 'Formulator cần COA/TDS đầy đủ cho hồ sơ công bố'],
        expectedOutcomes: ['Rút ngắn thời gian sourcing từ tuần xuống vài ngày', 'Giảm rủi ro chất lượng nhờ nguồn gốc minh bạch', 'Ổn định chuỗi cung ứng dài hạn'],
        process: [
          { step: 'Tư vấn kỹ thuật', desc: 'Xác định nguyên liệu, hàm lượng và chứng nhận phù hợp công thức & thị trường mục tiêu.' },
          { step: 'Gửi mẫu & tài liệu', desc: 'Cung cấp mẫu thử, TDS public và COA/SDS qua form gating khi cần đánh giá sâu.' },
          { step: 'Đàm phán & cung ứng', desc: 'Thống nhất MOQ, lịch giao hàng và hỗ trợ pháp lý nhập khẩu nếu cần.' },
          { step: 'Đồng hành sau bán', desc: 'Cập nhật batch mới, thay thế tương đương và tư vấn tối ưu công thức khi scale.' },
        ],
        faq: [
          { q: 'Bioscope có niêm yết giá công khai không?', a: 'Không — giá phụ thuộc MOQ, lô hàng và đàm phán. Vui lòng liên hệ để nhận báo giá phù hợp.' },
          { q: 'MOQ tối thiểu là bao nhiêu?', a: 'Tùy nguyên liệu, thường từ 5–25 kg. Một số mặt hàng độc quyền có MOQ thấp hơn cho mẫu thử.' },
          { q: 'TDS và COA lấy ở đâu?', a: 'TDS có thể xem/tải tại trang chi tiết nguyên liệu. COA và SDS yêu cầu email công việc qua form tải tài liệu.' },
        ],
        relatedCaseSlugs: ['vivomega'],
      },
      en: {
        title: 'Specialty ingredient supply',
        forWho: 'Companies with in-house R&D teams needing rare, high-quality ingredients with full regulatory documentation.',
        cta: 'Explore ingredients',
        summary: 'A catalog of rare, proven-performance actives — ideal when you already have product development capability and need a trusted supply source.',
        receive: ['100+ specialty ingredients', 'Complete COA / TDS / SDS', 'Fast sample delivery', 'Stable supply from 50+ countries'],
        idealFor: ['Manufacturers with production lines and internal R&D', 'Brands needing rare or highly standardized ingredients', 'Formulators requiring complete COA/TDS for product registration'],
        expectedOutcomes: ['Reduce sourcing time from weeks to days', 'Lower quality risk through transparent traceability', 'Long-term supply chain stability'],
        process: [
          { step: 'Technical consultation', desc: 'Identify ingredients, assay levels, and certifications aligned with your formula and target market.' },
          { step: 'Samples & documentation', desc: 'Provide trial samples, public TDS, and gated COA/SDS for in-depth evaluation.' },
          { step: 'Negotiation & supply', desc: 'Agree on MOQ, delivery schedule, and import compliance support when needed.' },
          { step: 'Post-sale partnership', desc: 'New batch updates, equivalent substitutions, and formula optimization advice as you scale.' },
        ],
        faq: [
          { q: 'Does Bioscope publish prices publicly?', a: 'No — pricing depends on MOQ, batch, and negotiation. Please contact us for a tailored quote.' },
          { q: 'What is the minimum MOQ?', a: 'Varies by ingredient, typically 5–25 kg. Some exclusive items have lower MOQs for trial evaluation.' },
          { q: 'Where can I get TDS and COA?', a: 'TDS is available on each ingredient page. COA and SDS require a business email via the document download form.' },
        ],
        relatedCaseSlugs: ['vivomega'],
      },
    },
    {
      slug: 'phat-trien-cong-thuc-odm',
      order: 2,
      icon: 'Factory',
      vi: {
        title: 'Phát triển công thức & ODM',
        forWho: 'Thương hiệu có ý tưởng nhưng cần đối tác xây dựng công thức và sản xuất.',
        cta: 'Tìm hiểu dịch vụ ODM',
        summary: 'Từ ý tưởng đến công thức hoàn chỉnh — Bioscope đồng hành formulator, kiểm chứng hiệu quả và hỗ trợ thương mại hóa.',
        receive: ['Đội ngũ R&D đồng hành', 'Công thức tối ưu hiệu quả/chi phí', 'Kiểm chứng & tạo mẫu', 'Hỗ trợ pháp lý, sản xuất'],
        idealFor: ['Startup brand có concept rõ nhưng thiếu lab nội bộ', 'Thương hiệu muốn mở dòng sản phẩm mới nhanh', 'Doanh nghiệp cần ODM trọn gói từ công thức đến bao bì'],
        expectedOutcomes: ['Công thức khác biệt nhờ nguyên liệu & công nghệ độc quyền', 'Giảm vòng lặp thử-sai nhờ kinh nghiệm 23+ dự án R&D', 'Lộ trình rõ ràng từ mẫu đến sản xuất hàng loạt'],
        process: [
          { step: 'Brief & mục tiêu', desc: 'Làm rõ phân khúc, claim, ngân sách và ràng buộc pháp lý (TPCN, mỹ phẩm, dược phẩm).' },
          { step: 'Đề xuất công thức', desc: 'Chọn nguyên liệu & công nghệ (Phytosome, nano…) tối ưu hiệu quả/chi phí.' },
          { step: 'Tạo mẫu & kiểm nghiệm', desc: 'Pilot batch, test cảm quan, ổn định và an toàn theo chuẩn ngành.' },
          { step: 'Scale-up & ra mắt', desc: 'Hỗ trợ chọn nhà máy GMP, hồ sơ công bố và triển khai sản xuất thương mại.' },
        ],
        faq: [
          { q: 'ODM khác gì mua nguyên liệu thuần?', a: 'ODM bao gồm nghiên cứu công thức, tạo mẫu, kiểm chứng và hỗ trợ sản xuất — không chỉ giao nguyên liệu.' },
          { q: 'Bao lâu có mẫu thử?', a: 'Thường 4–8 tuần tùy độ phức tạp; timeline cụ thể được ước lượng sau buổi brief đầu tiên.' },
          { q: 'Bioscope có hỗ trợ hồ sơ công bố không?', a: 'Có — hỗ trợ tài liệu kỹ thuật, COA và phối hợp với đơn vị công bố theo quy định Việt Nam.' },
        ],
        relatedCaseSlugs: ['gastroheal'],
      },
      en: {
        title: 'Formulation development & ODM',
        forWho: 'Brands with a concept who need a partner to build formulas and manufacture.',
        cta: 'Learn about ODM services',
        summary: 'From idea to finished formula — Bioscope partners with formulators, validates efficacy, and supports commercialization.',
        receive: ['Dedicated R&D team', 'Efficacy/cost-optimized formulas', 'Validation & prototyping', 'Regulatory and production support'],
        idealFor: ['Startup brands with a clear concept but no internal lab', 'Brands launching new product lines quickly', 'Companies needing end-to-end ODM from formula to packaging'],
        expectedOutcomes: ['Differentiated formulas through proprietary ingredients and technology', 'Fewer trial-and-error cycles thanks to 23+ R&D projects', 'Clear roadmap from prototype to mass production'],
        process: [
          { step: 'Brief & objectives', desc: 'Clarify segment, claims, budget, and regulatory constraints (nutraceuticals, cosmetics, pharmaceuticals).' },
          { step: 'Formula proposal', desc: 'Select ingredients and technologies (Phytosome, nano…) optimized for efficacy and cost.' },
          { step: 'Prototyping & testing', desc: 'Pilot batches, sensory, stability, and safety testing to industry standards.' },
          { step: 'Scale-up & launch', desc: 'GMP factory selection, registration dossiers, and commercial production rollout.' },
        ],
        faq: [
          { q: 'How is ODM different from buying raw ingredients?', a: 'ODM includes formula research, prototyping, validation, and production support — not just ingredient delivery.' },
          { q: 'How long until I receive a prototype?', a: 'Typically 4–8 weeks depending on complexity; a specific timeline is estimated after the initial brief.' },
          { q: 'Does Bioscope support product registration?', a: 'Yes — we provide technical documents, COA, and coordinate with registration bodies per Vietnamese regulations.' },
        ],
        relatedCaseSlugs: ['gastroheal'],
      },
    },
    {
      slug: 'dong-kien-tao-toan-hanh-trinh',
      order: 3,
      icon: 'Sparkles',
      vi: {
        title: 'Đồng kiến tạo toàn hành trình',
        forWho: 'Nhà phát triển nhãn hàng muốn xây thương hiệu lớn, bền vững từ con số 0.',
        cta: 'Bắt đầu hành trình',
        summary: 'Đối tác chiến lược từ ý tưởng đến tăng trưởng — nghiên cứu thị trường trước, chỉ sản xuất khi có tín hiệu rõ.',
        heroQuote: 'Bạn có ý tưởng thương hiệu. Chúng tôi có khoa học và kinh nghiệm thị trường. Nhiều nhà phát triển nhãn hàng thất bại vì làm sản phẩm trước, tìm thị trường sau.',
        receive: ['Phân tích thị trường & định giá', 'Xây dựng công thức', 'Test thị trường trước sản xuất', 'Thương mại hóa & tăng trưởng'],
        idealFor: ['Nhà phát triển nhãn hàng muốn launch từ con số 0', 'Founder cần đối tác chiến lược, không chỉ nhà cung ứng', 'Thương hiệu hướng tới tăng trưởng bền vững, biên cao'],
        expectedOutcomes: ['Giảm rủi ro tồn kho nhờ validate thị trường trước', 'Tăng tỷ lệ thành công sản phẩm mới', 'Xây dựng ngành hàng có lợi thế cạnh tranh lâu dài'],
        process: [
          { step: 'Khám phá thị trường', desc: 'Phân tích phân khúc, đối thủ, kênh bán và mức giá trước khi cam kết sản xuất.' },
          { step: 'Thiết kế giá trị', desc: 'Định vị thương hiệu, công thức và câu chuyện khoa học khác biệt.' },
          { step: 'Test tín hiệu', desc: 'Thử nghiệm online/offline với batch nhỏ để xác nhận nhu cầu thực.' },
          { step: 'Thương mại hóa', desc: 'Scale sản xuất, phân phối và tối ưu danh mục theo dữ liệu bán hàng.' },
          { step: 'Tăng trưởng dài hạn', desc: 'Mở rộng SKU, tối ưu chi phí và đồng hành marketing khoa học.' },
        ],
        faq: [
          { q: '"Đồng kiến tạo" khác ODM thế nào?', a: 'Đồng kiến tạo bao trùm chiến lược thị trường, định giá và tăng trưởng — ODM tập trung vào công thức & sản xuất.' },
          { q: 'Bioscope có tham gia phân phối không?', a: 'Chúng tôi hỗ trợ chiến lược kênh và thương mại hóa; mô hình cụ thể được thống nhất theo từng dự án.' },
          { q: 'Ví dụ thành công?', a: 'vivomega® (0 → 500K USD/năm), Gastroheal (70%+ truyền miệng), PEA (Category Creator tại Việt Nam).' },
        ],
        relatedCaseSlugs: ['vivomega', 'pea', 'gastroheal'],
      },
      en: {
        title: 'End-to-end co-creation',
        forWho: 'Brand developers building large, sustainable brands from scratch.',
        cta: 'Start your journey',
        summary: 'A strategic partner from idea to growth — market research first, production only when signals are clear.',
        heroQuote: 'You have a brand idea. We have the science and market experience. Many brand developers fail by making product first and finding the market later.',
        receive: ['Market analysis & pricing', 'Formula development', 'Pre-production market testing', 'Commercialization & growth'],
        idealFor: ['Brand developers launching from zero', 'Founders needing a strategic partner, not just a supplier', 'Brands targeting sustainable growth with healthy margins'],
        expectedOutcomes: ['Lower inventory risk by validating the market first', 'Higher new product success rates', 'Build categories with lasting competitive advantage'],
        process: [
          { step: 'Market discovery', desc: 'Analyze segments, competitors, sales channels, and pricing before committing to production.' },
          { step: 'Value design', desc: 'Brand positioning, formula, and differentiated science storytelling.' },
          { step: 'Signal testing', desc: 'Online/offline trials with small batches to confirm real demand.' },
          { step: 'Commercialization', desc: 'Scale production, distribution, and portfolio optimization based on sales data.' },
          { step: 'Long-term growth', desc: 'SKU expansion, cost optimization, and science-led marketing partnership.' },
        ],
        faq: [
          { q: 'How is co-creation different from ODM?', a: 'Co-creation covers market strategy, pricing, and growth — ODM focuses on formulation and manufacturing.' },
          { q: 'Does Bioscope participate in distribution?', a: 'We support channel strategy and commercialization; specific models are agreed per project.' },
          { q: 'Success examples?', a: 'vivomega® (0 → USD 500K/year), Gastroheal (70%+ word of mouth), PEA (Category Creator in Vietnam).' },
        ],
        relatedCaseSlugs: ['vivomega', 'pea', 'gastroheal'],
      },
    },
  ]
  for (const s of serviceData) {
    await upsertLocalized(
      payload,
      'services',
      { slug: { equals: s.slug } },
      { vi: { ...s.vi, slug: s.slug, icon: s.icon, order: s.order }, en: { ...s.en, slug: s.slug, icon: s.icon, order: s.order } },
    )
  }
  // Remove legacy placeholder services (superseded by the solution landing pages above).
  await payload.delete({
    collection: 'services',
    where: { slug: { in: ['rnd-formulation', 'odm-manufacturing', 'regulatory-support', 'global-supply'] } },
  })
  log(`services: ${serviceData.length}`)

  /* ── 7b. Redirects (mẫu — middleware frontend tiêu thụ) ── */
  const redirectData = [{ from: '/san-pham', to: '/nguyen-lieu', type: '301' }]
  for (const r of redirectData) await upsert(payload, 'redirects', { from: { equals: r.from } }, r)
  log(`redirects: ${redirectData.length}`)

  /* ── 7c. Bioscope AI global (song ngữ) ────────────────── */
  const aiVi = {
    status: 'Sắp ra mắt',
    statusDesc:
      'Trợ lý AI chuyên biệt cho ngành nguyên liệu chức năng — được huấn luyện trên catalog, tài liệu R&D và kinh nghiệm tư vấn thực tế của Bioscope.',
    introQuote: '“Từ câu hỏi đầu tiên đến danh sách hoạt chất ứng viên — trong vài phút, không vài ngày.”',
    stats: [
      { value: '500+', label: 'Nguyên liệu trong catalog' },
      { value: '24/7', label: 'Tra cứu mọi lúc' },
      { value: '3', label: 'Ngành: DP · TPCN · Mỹ phẩm' },
    ],
    previewEyebrow: 'Xem trước',
    previewTitle: 'Hỏi như đang chat với chuyên gia Bioscope',
    previewDesc:
      'Mô tả sản phẩm bạn đang phát triển — AI gợi ý hoạt chất, giải thích lý do lựa chọn và hỏi bạn muốn xem TDS hay đặt mẫu thử.',
    useCasesTitle: 'Ai sẽ dùng Bioscope AI?',
    useCasesDesc: 'Thiết kế cho mọi vai trò trong chuỗi phát triển sản phẩm — từ ý tưởng ban đầu đến quyết định mua nguyên liệu.',
    useCases: [
      { persona: 'Formulator / R&D', scenario: 'Cần shortlist hoạt chất cho concept mới', example: '“Serum chống lão hóa, phân khúc premium, ưu tiên peptide và botanical có bằng chứng lâm sàng.”' },
      { persona: 'Product Manager', scenario: 'So sánh phương án trước khi họp với supplier', example: '“Omega-3 dạng TG vs EE cho softgel — khác biệt sinh khả dụng và định vị giá?”' },
      { persona: 'QA / Regulatory', scenario: 'Tra cứu chứng nhận và tài liệu nhanh', example: '“Gửi TDS và COA của Curcumin Phytosome — có Halal và non-GMO không?”' },
    ],
    capabilitiesTitle: 'Tính năng chính',
    capabilitiesDesc: 'Mọi bước trong quy trình nghiên cứu nguyên liệu — gom vào một giao diện hội thoại.',
    capabilities: [
      { title: 'Tư vấn nguyên liệu thông minh', desc: 'Hiểu mục tiêu sản phẩm và đề xuất hoạt chất có căn cứ từ dữ liệu Bioscope.', bullets: ['Lọc theo ngành hàng, công dụng, ngân sách', 'Giải thích cơ chế và ưu điểm từng hoạt chất', 'Gợi ý thay thế khi MOQ hoặc nguồn cung hạn chế'] },
      { title: 'Gợi ý công thức & phối hợp', desc: 'Đề xuất kết hợp hoạt chất với liều tham khảo và lưu ý tương thích.', bullets: ['Phối hợp đa hoạt chất theo mục tiêu', 'Liều dùng tham khảo và cảnh báo tương tác', 'Liên kết công cụ gợi ý công thức Bioscope'] },
      { title: 'Tài liệu kỹ thuật tức thì', desc: 'Yêu cầu TDS, COA, SDS ngay trong chat — không cần email qua lại.', bullets: ['TDS / COA / SDS theo từng mã nguyên liệu', 'Thông tin chứng nhận (Halal, organic, non-GMO…)', 'Luồng gated cho tài liệu nhạy cảm'] },
      { title: 'Hỗ trợ 24/7', desc: 'Tra cứu nhanh trước khi liên hệ sales — lý tưởng cho giai đoạn brainstorm.', bullets: ['Phản hồi tức thì, không chờ giờ hành chính', 'Lưu ngữ cảnh cuộc hội thoại', 'Chuyển tiếp mượt sang đội tư vấn khi cần'] },
    ],
    compareTitle: 'Khác gì so với chatbot thông thường?',
    compareDesc: 'ChatGPT biết nhiều thứ — nhưng Bioscope AI biết đúng thứ bạn cần khi phát triển sản phẩm.',
    compareGeneric: 'Chatbot AI chung',
    compareBioscope: 'Bioscope AI',
    genericItems: ['Trả lời chung chung, thiếu dữ liệu catalog cụ thể', 'Không liên kết TDS/COA thật từ Bioscope', 'Dễ “ảo giác” tên hoạt chất hoặc liều dùng', 'Không hiểu MOQ, chứng nhận, nguồn cung Bioscope'],
    bioscopeItems: ['Gợi ý từ catalog và tài liệu kỹ thuật Bioscope', 'Yêu cầu & nhận TDS/COA qua luồng chuẩn', 'Ngôn ngữ chuyên môn DP · TPCN · Mỹ phẩm', 'Kết nối sales, mẫu thử và cổng đối tác B2B'],
    strengthsTitle: 'Điểm mạnh cốt lõi',
    strengthsDesc: 'Xây dựng trên nền tảng dữ liệu và kinh nghiệm tư vấn thực chiến — không phải wrapper ChatGPT.',
    strengths: [
      { title: 'Dữ liệu catalog thật', desc: 'Huấn luyện trên hàng trăm nguyên liệu, case study và whitepaper — câu trả lời có nguồn, không đoán mò.' },
      { title: 'Ngôn ngữ formulator', desc: 'Hiểu INCI, liều dùng, dạng bào chế, claim — nói đúng ngôn ngữ R&D và regulatory.' },
      { title: 'Một luồng, nhiều công cụ', desc: 'Từ chat → gợi ý công thức → tài liệu → liên hệ mẫu thử — không phải nhảy qua 4 tab.' },
      { title: 'Rút ngắn vòng R&D', desc: 'Giảm thời gian từ brief sản phẩm đến shortlist hoạt chất — formulator tập trung vào thử nghiệm.' },
    ],
    notifyTitle: 'Nhận thông báo khi ra mắt',
    notifyDesc: 'Để lại email công việc — chúng tôi ưu tiên mời các nhãn hàng và formulator đăng ký sớm.',
    notifyPlaceholder: 'Email công việc của bạn',
    notifyButton: 'Đăng ký nhận tin',
    contactCta: 'Liên hệ tư vấn ngay',
    backHome: '← Về trang chủ',
  }
  const aiEn = {
    status: 'Coming soon',
    statusDesc:
      'A specialized AI assistant for functional ingredients — trained on Bioscope catalog, R&D documents, and real advisory experience.',
    introQuote: '“From your first question to a shortlist of candidate actives — in minutes, not days.”',
    stats: [
      { value: '500+', label: 'Ingredients in catalog' },
      { value: '24/7', label: 'Always available' },
      { value: '3', label: 'Industries: Pharma · Nutraceutical · Cosmetics' },
    ],
    previewEyebrow: 'Preview',
    previewTitle: 'Chat like you are talking to a Bioscope expert',
    previewDesc: 'Describe the product you are developing — AI suggests actives, explains why, and asks if you want TDS or samples.',
    useCasesTitle: 'Who is Bioscope AI for?',
    useCasesDesc: 'Built for every role in product development — from early ideation to ingredient sourcing decisions.',
    useCases: [
      { persona: 'Formulator / R&D', scenario: 'Need a shortlist of actives for a new concept', example: '“Premium anti-aging serum — prioritize peptides and botanicals with clinical evidence.”' },
      { persona: 'Product Manager', scenario: 'Compare options before supplier meetings', example: '“TG vs EE omega-3 for softgels — bioavailability and price positioning differences?”' },
      { persona: 'QA / Regulatory', scenario: 'Quick lookup for certifications and documents', example: '“Send TDS and COA for Curcumin Phytosome — Halal and non-GMO certified?”' },
    ],
    capabilitiesTitle: 'Core features',
    capabilitiesDesc: 'Every step in ingredient research — unified in one conversational interface.',
    capabilities: [
      { title: 'Smart ingredient guidance', desc: 'Understands product goals and suggests actives backed by Bioscope data.', bullets: ['Filter by industry, benefit, budget', 'Explain mechanism and advantages per active', 'Suggest alternatives when MOQ or supply is limited'] },
      { title: 'Formula & combination ideas', desc: 'Proposes active pairings with reference dosing and compatibility notes.', bullets: ['Multi-active stacks by product goal', 'Reference dosing and interaction warnings', 'Links to Bioscope formulation tools'] },
      { title: 'Instant technical documents', desc: 'Request TDS, COA, SDS in chat — no back-and-forth emails.', bullets: ['TDS / COA / SDS per ingredient code', 'Certification info (Halal, organic, non-GMO…)', 'Gated flow for sensitive documents'] },
      { title: '24/7 support', desc: 'Quick lookup before contacting sales — ideal for brainstorming.', bullets: ['Instant responses, any time zone', 'Conversation context retained', 'Smooth handoff to advisory team when needed'] },
    ],
    compareTitle: 'How is it different from a generic chatbot?',
    compareDesc: 'ChatGPT knows a lot — Bioscope AI knows what you need when developing products.',
    compareGeneric: 'Generic AI chatbot',
    compareBioscope: 'Bioscope AI',
    genericItems: ['Generic answers without specific catalog data', 'No link to real Bioscope TDS/COA documents', 'Risk of hallucinated actives or dosing', 'No understanding of MOQ, certs, or Bioscope supply'],
    bioscopeItems: ['Suggestions from Bioscope catalog and technical docs', 'Request & receive TDS/COA through standard flow', 'Pharma · nutraceutical · cosmetics terminology', 'Connects to sales, samples, and B2B partner portal'],
    strengthsTitle: 'Core strengths',
    strengthsDesc: 'Built on real data and advisory experience — not a ChatGPT wrapper.',
    strengths: [
      { title: 'Real catalog data', desc: 'Trained on hundreds of ingredients, case studies, and whitepapers — sourced answers, not guesses.' },
      { title: 'Formulator language', desc: 'Understands INCI, dosing, dosage forms, claims — speaks R&D and regulatory fluently.' },
      { title: 'One flow, many tools', desc: 'Chat → formula ideas → documents → sample requests — no jumping across four tabs.' },
      { title: 'Shorter R&D cycles', desc: 'Less time from product brief to active shortlist — formulators focus on testing.' },
    ],
    notifyTitle: 'Get notified at launch',
    notifyDesc: 'Leave your work email — we will prioritize early access for registered brands and formulators.',
    notifyPlaceholder: 'Your work email',
    notifyButton: 'Notify me',
    contactCta: 'Contact us now',
    backHome: '← Back to home',
  }
  await payload.updateGlobal({ slug: 'bioscope-ai', data: aiVi as never, locale: 'vi' })
  const aiDoc = await payload.findGlobal({ slug: 'bioscope-ai', locale: 'vi', depth: 0 })
  await payload.updateGlobal({ slug: 'bioscope-ai', data: copyIds(aiDoc, aiEn) as never, locale: 'en' })
  log('bioscope-ai global: song ngữ vi + en')

  /* ── 7d. SEO settings global (Yoast-style, song ngữ) ──── */
  const seoBase = {
    siteUrl: 'https://web.bioscope.vn',
    titleSeparator: '·',
    siteRepresents: 'organization',
    orgName: 'Bioscope',
    discourageSearchEngines: false,
    enableSitemap: true,
  }
  await payload.updateGlobal({
    slug: 'seo-settings',
    locale: 'vi',
    data: {
      ...seoBase,
      siteName: 'Bioscope',
      homeTitle: 'Bioscope — Đối tác đổi mới y tế · Nguyên liệu & Đồng kiến tạo',
      homeDescription:
        'Không chỉ nguyên liệu — Bioscope đồng kiến tạo những giải pháp đột phá cho ngành Dược phẩm, Thực phẩm chức năng và Mỹ phẩm tại Việt Nam.',
    } as never,
  })
  await payload.updateGlobal({
    slug: 'seo-settings',
    locale: 'en',
    data: {
      siteName: 'Bioscope',
      homeTitle: 'Bioscope — Healthcare innovation partner · Ingredients & Co-creation',
      homeDescription:
        'Beyond ingredients — Bioscope co-creates breakthrough solutions for the pharmaceutical, nutraceutical, and cosmetics industries in Vietnam.',
    } as never,
  })
  log('seo-settings global: song ngữ vi + en')

  /* ── 8. Certifications ─────────────────────────────────── */
  const certData = [
    { title: 'GMP', kind: 'certificate', value: 'GMP', order: 1 },
    { title: 'ISO 22000', kind: 'certificate', value: 'ISO 22000', order: 2 },
    { title: 'HACCP', kind: 'certificate', value: 'HACCP', order: 3 },
    { title: 'HALAL', kind: 'certificate', value: 'HALAL', order: 4 },
    { title: 'KOSHER', kind: 'certificate', value: 'K', order: 5 },
    { title: 'USDA', kind: 'certificate', value: 'USDA', order: 6 },
    { title: 'NON-GMO', kind: 'certificate', value: 'NON GMO', order: 7 },
  ]
  for (const c of certData) await upsertLocalized(payload, 'certifications', { title: { equals: c.title } }, { vi: c })
  log(`certifications: ${certData.length}`)

  /* ── 9. B2B members ────────────────────────────────────── */
  const ensureMember = async (email: string, status: 'approved' | 'pending', company: string) => {
    const found = await payload.find({ collection: 'members', where: { email: { equals: email } }, limit: 1 })
    if (found.totalDocs > 0) return
    await payload.create({
      collection: 'members',
      data: { email, password: 'Member@123', company, contactName: 'Nguyễn Văn A', phone: '0900000000', status },
      overrideAccess: true,
    })
  }
  await ensureMember('member@acme.com', 'approved', 'ACME Pharma')
  await ensureMember('pending@acme.com', 'pending', 'Pending Co')
  log('members: member@acme.com (approved) + pending@acme.com (pending)')

  /* ── 10. Gated document ────────────────────────────────── */
  let mediaId = coaMediaId
  if (!mediaId) {
    const coaMedia = await payload.find({
      collection: 'media',
      where: { filename: { equals: 'seed-coa-sample.webp' } },
      limit: 1,
    })
    mediaId = coaMedia.totalDocs > 0 ? (coaMedia.docs[0] as { id: Id }).id : null
  }
  if (!mediaId) {
    log('gated-document skipped — chưa có ảnh CoA trong media seed')
  } else {
    await upsertLocalized(
      payload,
      'gated-documents',
      { title: { equals: 'CoA mẫu – Curcumin 95%' } },
      {
        vi: { title: 'CoA mẫu – Curcumin 95%', docType: 'COA', file: mediaId as never, visibility: 'approved_members' },
        en: { title: 'Sample CoA – Curcumin 95%' },
      },
    )
    log('gated-document ready')
  }

  /* ── 11. Case studies ──────────────────────────────────── */
  const caseData = [
    {
      brand: 'vivomega®', slug: 'vivomega', partner: 'GC Rieber Oils', industry: 'Thực phẩm chức năng',
      kpi: '500K USD', kpiLabel: 'doanh thu/năm — từ con số 0',
      summary: 'Xây dựng ngành hàng omega-3 cao cấp tại Việt Nam cùng GC Rieber Oils.',
      problem: 'Thị trường Việt Nam thiếu một dòng omega-3 chất lượng cao, minh bạch nguồn gốc và đạt chuẩn quốc tế.',
      solution: 'Bioscope đồng kiến tạo cùng GC Rieber Oils: chọn nguyên liệu dạng TG tinh khiết IFOS 5★, xây dựng định vị và câu chuyện thương hiệu, hỗ trợ pháp lý và thương mại hóa.',
      results: ['Từ 0 → 500.000 USD doanh thu/năm', 'Xây dựng ngành hàng omega-3 cao cấp', 'Hệ thống phân phối ổn định'],
      coCreateSteps: ['Phân tích phân khúc omega-3 cao cấp', 'Chọn dầu cá TG IFOS 5★', 'Xây dựng thương hiệu & kênh phân phối', 'Scale doanh thu bền vững'],
      testimonial: 'Bioscope không chỉ cung cấp nguyên liệu — họ đồng hành từ định vị đến thương mại hóa, giúp chúng tôi tạo ra một ngành hàng mới tại Việt Nam.',
      tags: ['Đồng kiến tạo', 'Dầu & Omega'], featured: true, order: 1,
    },
    {
      brand: 'Gastroheal', slug: 'gastroheal', partner: 'Phytosome ướt', industry: 'Dược phẩm',
      kpi: '70%+', kpiLabel: 'doanh thu đến từ truyền miệng',
      summary: 'Giải pháp dạ dày được tin dùng — giảm đau nhanh, phục hồi niêm mạc.',
      problem: 'Thị trường thiếu giải pháp dạ dày vừa giảm đau nhanh vừa thực sự phục hồi tổn thương niêm mạc.',
      solution: 'Ứng dụng công nghệ Phytosome ướt độc quyền — phức chất curcuminoid + phosphatidylcholine, tăng sinh khả dụng và phục hồi niêm mạc.',
      results: ['Dứt cơn đau trong 30 phút', '53%+ lành loét sau 2 tháng', '70%+ doanh thu từ truyền miệng'],
      coCreateSteps: ['Nghiên cứu cơ chế Phytosome ướt', 'Tối ưu công thức & claim', 'Kiểm chứng lâm sàng thực tế', 'Ra mắt & tăng trưởng truyền miệng'],
      testimonial: 'Công nghệ Phytosome ướt tạo ra sự khác biệt rõ rệt — người dùng cảm nhận hiệu quả nhanh và tin tưởng giới thiệu cho người thân.',
      tags: ['Phytosome ướt', 'Tiêu hóa'], featured: true, order: 2,
    },
    {
      brand: 'PEA', slug: 'pea', partner: 'PolymerSolution', industry: 'Mỹ phẩm',
      kpi: '#1', kpiLabel: 'người tạo ngành hàng (Category Creator) tại Việt Nam',
      summary: 'Tiên phong giải pháp kháng viêm qua da với công nghệ phóng thích chậm 24h.',
      problem: 'Chưa có giải pháp kháng viêm qua da phóng thích chậm, hiệu quả kéo dài tại thị trường Việt Nam.',
      solution: 'Tiên phong đưa công nghệ phân phối thuốc qua da Polymerit, tạo ra ngành hàng mới với trị liệu liên tục 24h.',
      results: ['Người tạo ngành hàng (Category Creator)', 'Trị liệu liên tục 24h', 'Ứng dụng đa dạng da liễu & mỹ phẩm'],
      coCreateSteps: ['Đánh giá khoảng trống thị trường da liễu', 'Ứng dụng Polymerit', 'Tạo category mới', 'Mở rộng danh mục sản phẩm'],
      testimonial: 'Polymerit giúp chúng tôi không chỉ bán sản phẩm mà tạo ra một ngách mới — trị liệu liên tục 24 giờ qua da.',
      tags: ['Công nghệ độc quyền', 'Da liễu'], featured: true, order: 3,
    },
  ]
  for (const cs of caseData) await upsertLocalized(payload, 'case-studies', { slug: { equals: cs.slug } }, { vi: { ...cs, _status: 'published' } })
  log(`case studies: ${caseData.length}`)

  /* ── 12. FAQs ──────────────────────────────────────────── */
  const faqData = [
    { category: 'ingredients', question: 'Bioscope có nhận đơn nhỏ / mẫu thử không?', answer: 'Có, đa số nguyên liệu có MOQ linh hoạt (5–25 kg) và sẵn mẫu thử. Một số mặt hàng độc quyền có MOQ thấp hơn cho đánh giá ban đầu.', order: 1 },
    { category: 'ingredients', question: 'Tài liệu kỹ thuật (TDS, COA) lấy như thế nào?', answer: 'TDS có thể xem tại trang nguyên liệu. COA và SDS yêu cầu email công việc — hệ thống gửi file tự động sau khi điền form.', order: 2 },
    { category: 'ingredients', question: 'Giá nguyên liệu có hiển thị trên website không?', answer: 'Không — giá phụ thuộc volume, thời hạn hợp đồng và điều kiện giao hàng. Vui lòng liên hệ hoặc yêu cầu báo giá qua form Liên hệ.', order: 3 },
    { category: 'solutions', question: 'Quy trình đồng kiến tạo mất bao lâu?', answer: 'Tùy độ phức tạp; thường 4–6 tháng từ ý tưởng đến ra mắt. Timeline cụ thể được ước lượng ngay sau buổi tư vấn đầu tiên.', order: 4 },
    { category: 'solutions', question: 'Bioscope khác gì nhà cung nguyên liệu thông thường?', answer: 'Chúng tôi là đối tác chiến lược — đồng hành từ phân tích thị trường, chọn phân khúc, xây công thức, test nhu cầu đến thương mại hóa — không chỉ giao hàng rồi kết thúc.', order: 5 },
    { category: 'solutions', question: 'Bioscope có hỗ trợ hồ sơ công bố TPCN/mỹ phẩm không?', answer: 'Có — cung cấp tài liệu kỹ thuật, COA và phối hợp với đơn vị công bố theo quy định Việt Nam.', order: 6 },
    { category: 'support', question: 'Có thể yêu cầu báo giá qua website không?', answer: 'Có — dùng form Liên hệ hoặc "Yêu cầu mẫu thử" trên header. Đội ngũ phản hồi trong 24 giờ làm việc.', showOnContact: true, order: 7 },
    { category: 'support', question: 'Thời gian phản hồi dự kiến là bao lâu?', answer: 'Trong vòng 24 giờ làm việc. Đội ngũ chuyên gia sẽ liên hệ để hiểu rõ nhu cầu và đề xuất bước tiếp theo.', showOnContact: true, order: 8 },
    { category: 'support', question: 'Tôi có thể liên hệ qua kênh nào?', answer: 'Qua form Liên hệ trên website, email công việc hoặc Zalo OA (sắp tích hợp). Hotline và địa chỉ văn phòng đang được cập nhật.', order: 9 },
  ]
  for (const f of faqData) await upsertLocalized(payload, 'faqs', { question: { equals: f.question } }, { vi: { ...f, _status: 'published' } })
  log(`faqs: ${faqData.length}`)

  /* ── 13. Categories & Tags (taxonomy for posts) ────────── */
  const categoryData = [
    { slug: 'whitepaper', nameVi: 'Whitepaper', nameEn: 'Whitepaper' },
    { slug: 'blog', nameVi: 'Blog chuyên môn', nameEn: 'Expert blog' },
    { slug: 'webinar', nameVi: 'Webinar', nameEn: 'Webinar' },
    { slug: 'formulator', nameVi: 'Hướng dẫn Formulator', nameEn: 'Formulator guide' },
    { slug: 'infographic', nameVi: 'Infographic', nameEn: 'Infographic' },
  ]
  const categoryIds: Record<string, Id> = {}
  for (const c of categoryData) {
    categoryIds[c.slug] = await upsertLocalized(
      payload,
      'categories',
      { slug: { equals: c.slug } },
      { vi: { name: c.nameVi, slug: c.slug }, en: { name: c.nameEn } },
    )
  }
  log(`categories: ${categoryData.length}`)

  const tagData = [
    { slug: 'phat-trien-nhan-hang', nameVi: 'Phát triển nhãn hàng', nameEn: 'Brand development' },
    { slug: 'omega-3', nameVi: 'Omega-3', nameEn: 'Omega-3' },
    { slug: 'chung-nhan', nameVi: 'Chứng nhận', nameEn: 'Certifications' },
    { slug: 'dong-kien-tao', nameVi: 'Đồng kiến tạo', nameEn: 'Co-creation' },
  ]
  const tagIds: Record<string, Id> = {}
  for (const t of tagData) {
    tagIds[t.slug] = await upsertLocalized(
      payload,
      'tags',
      { slug: { equals: t.slug } },
      { vi: { name: t.nameVi, slug: t.slug }, en: { name: t.nameEn } },
    )
  }
  log(`tags: ${tagData.length}`)

  /* ── 14. Posts (blog / tài nguyên) ─────────────────────── */
  const postData = [
    {
      slug: 'test-thi-truong-truoc-khi-lam-hang',
      title: 'Vì sao nên test thị trường trước khi làm hàng?',
      excerpt: 'Quy trình validate nhu cầu giúp giảm rủi ro đầu tư cho nhãn hàng mới — chỉ sản xuất khi có tín hiệu rõ.',
      categories: [categoryIds['blog']],
      tags: [tagIds['phat-trien-nhan-hang'], tagIds['dong-kien-tao']],
      body: [
        'Nhiều nhãn hàng mới thất bại không phải vì sản phẩm kém, mà vì sản xuất trước khi hiểu nhu cầu thị trường. Tồn kho lớn, dòng tiền kẹt, định vị sai — tất cả đều có thể tránh được.',
        'Bioscope đề xuất quy trình validate: phân tích phân khúc, dựng concept và claim, đo tín hiệu thị trường ở quy mô nhỏ trước khi scale. Chỉ khi có dữ liệu tốt mới đầu tư sản xuất.',
        'Kết quả là giảm rủi ro tồn kho, tối ưu chi phí R&D và rút ngắn thời gian đến điểm hòa vốn.',
      ],
    },
    {
      slug: 'omega-3-tg-vs-ee',
      title: 'Omega-3 dạng TG vs EE: điều gì quan trọng với người tiêu dùng?',
      excerpt: 'So sánh sinh khả dụng và định vị thương hiệu cho dòng sản phẩm omega-3 cao cấp.',
      categories: [categoryIds['blog']],
      tags: [tagIds['omega-3']],
      body: [
        'Dạng triglyceride (TG) và ethyl ester (EE) khác nhau ở cấu trúc và sinh khả dụng. Dạng TG gần với dầu cá tự nhiên, hấp thu tốt hơn nhưng chi phí cao hơn.',
        'Với phân khúc cao cấp, minh bạch dạng nguyên liệu và chỉ số IFOS là lợi thế định vị rõ ràng. Người tiêu dùng ngày càng quan tâm tới nguồn gốc và độ tinh khiết.',
      ],
    },
    {
      slug: 'chung-nhan-gmp-halal-kosher',
      title: 'Chứng nhận GMP, Halal, Kosher — hướng dẫn cho formulator',
      excerpt: 'Giải thích ý nghĩa từng chứng nhận và cách chọn nguyên liệu phù hợp thị trường mục tiêu.',
      categories: [categoryIds['formulator']],
      tags: [tagIds['chung-nhan']],
      body: [
        'GMP đảm bảo điều kiện sản xuất; ISO 22000 và HACCP quản lý an toàn thực phẩm; Halal và Kosher mở rộng thị trường theo tín ngưỡng.',
        'Chọn nguyên liệu có sẵn bộ chứng nhận phù hợp giúp rút ngắn thời gian công bố và mở rộng thị trường xuất khẩu.',
      ],
    },
  ]
  for (const p of postData) {
    const { body, ...rest } = p
    await upsertLocalized(
      payload,
      'posts',
      { slug: { equals: p.slug } },
      {
        vi: {
          ...rest,
          author: adminId,
          content: lexical(body),
          publishedAt: new Date().toISOString(),
          _status: 'published',
        },
      },
    )
  }
  log(`posts: ${postData.length}`)

  /* ── 15. Pages (bố cục block, song ngữ vi + en) ────────── */
  // Block builders
  type Block = Record<string, unknown>
  const link = (label: string, href: string, style = 'primary') => ({ label, href, style })
  const hero = (eyebrow: string, heading: string, subheading: string, links?: Block[]): Block => ({
    blockType: 'hero', eyebrow, heading, subheading, ...(links ? { links } : {}),
  })
  const stats = (heading: string, items: Block[]): Block => ({ blockType: 'stats', heading, items })
  const features = (heading: string, columns: string, items: Block[]): Block => ({
    blockType: 'featureGrid', heading, columns, items,
  })
  const cta = (heading: string, text: string, links: Block[]): Block => ({
    blockType: 'cta', heading, text, background: 'solid', links,
  })
  const rich = (paras: string[]): Block => ({ blockType: 'richText', content: lexical(paras) })

  // Recursively copy ids (blocks + nested arrays) from the saved vi tree onto
  // the en tree by index, so the en-locale update writes the SAME blocks/rows.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mergeIds = (viArr: any[], enArr: any[]): any[] =>
    enArr.map((en, i) => {
      const vi = viArr?.[i]
      const out: Record<string, unknown> = { ...en }
      if (vi?.id) out.id = vi.id
      for (const k of Object.keys(out)) {
        if (Array.isArray(out[k]) && Array.isArray(vi?.[k])) out[k] = mergeIds(vi[k], out[k] as unknown[])
      }
      return out
    })

  const upsertPage = async (
    slug: string,
    vi: { title: string; layout: Block[] },
    en: { title: string; layout: Block[] },
  ) => {
    const viData = { title: vi.title, slug, layout: vi.layout, _status: 'published' }
    const found = await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, limit: 1, locale: 'vi' })
    let id: Id
    if (found.totalDocs > 0) {
      id = (found.docs[0] as { id: Id }).id
      await payload.update({ collection: 'pages', id: id as never, data: viData as never, locale: 'vi' })
    } else {
      id = ((await payload.create({ collection: 'pages', data: viData as never, locale: 'vi' })) as { id: Id }).id
    }
    const doc = (await payload.findByID({ collection: 'pages', id: id as never, locale: 'vi', depth: 0 })) as {
      layout?: unknown[]
    }
    const enLayout = mergeIds((doc.layout as unknown[]) ?? [], en.layout)
    await payload.update({
      collection: 'pages',
      id: id as never,
      data: { title: en.title, layout: enLayout } as never,
      locale: 'en',
    })
  }

  // NOTE: home page is NOT a generic block Page — it is driven by the `home`
  // global (structured sections that match the real design). Do not seed a
  // `trang-chu` Page here; it would duplicate/confuse the home editor.
  const pages: { slug: string; vi: { title: string; layout: Block[] }; en: { title: string; layout: Block[] } }[] = [
    // ── Về chúng tôi / About ──
    {
      slug: 've-chung-toi',
      vi: { title: 'Về chúng tôi', layout: [
        hero('Về chúng tôi', 'Nhà phân phối công nghệ — không chỉ là nhà cung ứng nguyên liệu', 'Bioscope tồn tại để nâng cao cân bằng hiệu quả/chi phí cho người tiêu dùng — và đưa các nhà phát triển nhãn hàng Việt Nam vươn xa.'),
        stats('Bioscope qua những con số', [
          { value: '15+', label: 'Năm kinh nghiệm' }, { value: '23+', label: 'Dự án R&D' },
          { value: '14', label: 'Đơn sáng chế' }, { value: '100+', label: 'Nguyên liệu mới' },
        ]),
        features('Giá trị cốt lõi', '4', [
          { title: 'Khoa học dẫn lối', description: 'Mọi quyết định dựa trên bằng chứng, cơ chế tác động và dữ liệu thị trường.' },
          { title: 'Hiệu quả/chi phí', description: 'Tối ưu công thức để người tiêu dùng nhận được giá trị thật với chi phí hợp lý.' },
          { title: 'Đồng hành dài hạn', description: 'Không giao hàng rồi kết thúc — cùng thương hiệu tăng trưởng bền vững.' },
          { title: 'Đổi mới không ngừng', description: '23+ dự án R&D, 14 đơn sáng chế và liên tục đưa công nghệ mới vào Việt Nam.' },
        ]),
      ] },
      en: { title: 'About us', layout: [
        hero('About us', 'Technology distributor — not just an ingredient supplier', 'Bioscope exists to improve the efficacy-to-cost balance for consumers — and help Vietnamese brand builders go further.'),
        stats('Bioscope by the numbers', [
          { value: '15+', label: 'Years of experience' }, { value: '23+', label: 'R&D projects' },
          { value: '14', label: 'Patents' }, { value: '100+', label: 'New ingredients' },
        ]),
        features('Core values', '4', [
          { title: 'Science-led', description: 'Every decision is grounded in evidence, mechanism of action, and market data.' },
          { title: 'Efficacy-to-cost', description: 'Optimize formulas so consumers get real value at a reasonable cost.' },
          { title: 'Long-term partnership', description: "We don't deliver and leave — we grow with brands sustainably." },
          { title: 'Relentless innovation', description: '23+ R&D projects, 14 patents, and a constant pipeline of new technology into Vietnam.' },
        ]),
      ] },
    },
    // ── Nguyên liệu / Ingredients ──
    {
      slug: 'nguyen-lieu',
      vi: { title: 'Nguyên liệu', layout: [
        hero('Nguyên liệu', 'Danh mục hoạt chất chuyên biệt', 'Hơn 100 nguyên liệu hiệu suất cao — Dược phẩm, TPCN, Mỹ phẩm. Đầy đủ TDS, COA, sẵn mẫu thử.'),
        rich(['Danh mục nguyên liệu của Bioscope tập trung vào các hoạt chất hiệu suất cao, hiếm và đã được kiểm chứng cho ba ngành: Dược phẩm, Thực phẩm chức năng và Mỹ phẩm.', 'Mỗi nguyên liệu đi kèm tài liệu kỹ thuật (TDS), chứng nhận phân tích (COA) và sẵn mẫu thử — hỗ trợ rút ngắn quá trình phát triển sản phẩm.']),
      ] },
      en: { title: 'Ingredients', layout: [
        hero('Ingredients', 'Specialty actives catalog', '100+ high-performance ingredients — pharmaceuticals, nutraceuticals, cosmetics. Full TDS, COA, samples ready.'),
        rich(['Our ingredient catalog focuses on high-performance, rare, and proven actives across three industries: Pharmaceuticals, Nutraceuticals, and Cosmetics.', 'Every ingredient comes with a technical data sheet (TDS), certificate of analysis (COA), and a ready sample — helping shorten your product development cycle.']),
      ] },
    },
    // ── Giải pháp / Solutions ──
    {
      slug: 'giai-phap',
      vi: { title: 'Giải pháp', layout: [
        hero('Giải pháp', 'Ba cách Bioscope giúp thương hiệu của bạn chiến thắng', 'Tùy vào năng lực và mục tiêu, bạn có thể chọn mức độ đồng hành phù hợp — từ cung cấp nguyên liệu đến đồng kiến tạo trọn hành trình.'),
        features('Ba mức độ đồng hành', '3', [
          { icon: 'Package', title: 'Cung cấp nguyên liệu', description: 'Nguyên liệu chuyên biệt kèm TDS, COA, mẫu thử cho đội ngũ đã có công thức.' },
          { icon: 'FlaskConical', title: 'Phát triển công thức', description: 'Đồng phát triển công thức tối ưu hiệu quả/chi phí, hỗ trợ pháp lý và công bố.' },
          { icon: 'Rocket', title: 'Đồng kiến tạo trọn hành trình', description: 'Từ ý tưởng, phân tích thị trường đến thương mại hóa và tăng trưởng.' },
        ]),
      ] },
      en: { title: 'Solutions', layout: [
        hero('Solutions', 'Three ways Bioscope helps your brand win', 'Depending on your capabilities and goals, choose the right level of partnership — from ingredient supply to full-journey co-creation.'),
        features('Three levels of partnership', '3', [
          { icon: 'Package', title: 'Ingredient supply', description: 'Specialty ingredients with TDS, COA, and samples for teams that already have a formula.' },
          { icon: 'FlaskConical', title: 'Formulation development', description: 'Co-develop efficacy/cost-optimized formulas with regulatory and registration support.' },
          { icon: 'Rocket', title: 'Full-journey co-creation', description: 'From idea and market analysis to commercialization and growth.' },
        ]),
      ] },
    },
    // ── Đồng kiến tạo / Co-creation ──
    {
      slug: 'dong-kien-tao',
      vi: { title: 'Đồng kiến tạo', layout: [
        hero('Đồng kiến tạo', 'Tại sao đồng kiến tạo khác hẳn việc mua nguyên liệu thông thường?', 'Nhà phân phối thông thường giao hàng rồi kết thúc. Bioscope bắt đầu từ ý tưởng và đồng hành đến tận lúc thương hiệu của bạn tăng trưởng bền vững.'),
        features('Bốn bước hành trình', '4', [
          { icon: 'Lightbulb', title: 'Ý tưởng & phân tích', description: 'Thời lượng tham khảo: 2–4 tuần.' },
          { icon: 'FlaskConical', title: 'Nghiên cứu & đề xuất', description: 'Thời lượng tham khảo: 4–8 tuần.' },
          { icon: 'ShieldCheck', title: 'Kiểm chứng & thử nghiệm', description: 'Thời lượng tham khảo: 6–12 tuần.' },
          { icon: 'Rocket', title: 'Phát triển & ra mắt', description: 'Thời lượng tham khảo: 8–16 tuần.' },
        ]),
        cta('Bắt đầu hành trình đồng kiến tạo', 'Chia sẻ ý tưởng của bạn — chúng tôi sẽ đề xuất bước đi phù hợp.', [link('Đặt lịch tư vấn', '/lien-he', 'primary')]),
      ] },
      en: { title: 'Co-creation', layout: [
        hero('Co-creation', 'Why co-creation is nothing like buying ingredients off the shelf', 'Traditional distributors deliver and leave. Bioscope starts from your idea and stays with you until your brand grows sustainably.'),
        features('The four-step journey', '4', [
          { icon: 'Lightbulb', title: 'Idea & analysis', description: 'Typical duration: 2–4 weeks.' },
          { icon: 'FlaskConical', title: 'Research & proposal', description: 'Typical duration: 4–8 weeks.' },
          { icon: 'ShieldCheck', title: 'Validation & testing', description: 'Typical duration: 6–12 weeks.' },
          { icon: 'Rocket', title: 'Development & launch', description: 'Typical duration: 8–16 weeks.' },
        ]),
        cta('Start your co-creation journey', "Share your idea — we'll propose the right next step.", [link('Book a consultation', '/lien-he', 'primary')]),
      ] },
    },
    // ── R&D ──
    {
      slug: 'rd',
      vi: { title: 'Nghiên cứu & Phát triển', layout: [
        hero('Nghiên cứu & Phát triển', 'R&D là trái tim của Bioscope', '23+ dự án nghiên cứu · 14 đơn sáng chế · hàng trăm nguyên liệu công nghệ cao đã đưa ra thị trường — với cùng một mục tiêu: tối ưu hiệu quả/chi phí để nhãn hàng dễ thành công.'),
        stats('Năng lực R&D', [
          { value: '23+', label: 'Dự án nghiên cứu' }, { value: '14', label: 'Đơn sáng chế' },
          { value: '100+', label: 'Nguyên liệu công nghệ cao' }, { value: '50+', label: 'Đối tác R&D toàn cầu' },
        ]),
        rich(['R&D là nền tảng tạo nên khác biệt của Bioscope: từ công nghệ Phytosome ướt, Polymerit đến các hệ dẫn truyền nano hoạt chất.', 'Mục tiêu xuyên suốt là tối ưu sinh khả dụng và cân bằng hiệu quả/chi phí — giúp nhãn hàng tạo ra sản phẩm thực sự hiệu quả với giá hợp lý.']),
      ] },
      en: { title: 'R&D', layout: [
        hero('R&D', 'R&D is the heart of Bioscope', '23+ research projects · 14 patents · hundreds of high-tech ingredients brought to market — all with one goal: optimize efficacy and cost so brands succeed.'),
        stats('R&D capabilities', [
          { value: '23+', label: 'Research projects' }, { value: '14', label: 'Patents' },
          { value: '100+', label: 'High-tech ingredients' }, { value: '50+', label: 'Global R&D partners' },
        ]),
        rich(['R&D is the foundation of what sets Bioscope apart: from wet Phytosome and Polymerit technologies to nano active-delivery systems.', 'The constant goal is to optimize bioavailability and the efficacy-to-cost balance — helping brands create genuinely effective products at a reasonable price.']),
      ] },
    },
    // ── Tài nguyên / Resources ──
    {
      slug: 'tai-nguyen',
      vi: { title: 'Tài nguyên', layout: [
        hero('Tài nguyên', 'Kiến thức chuyên môn cho đội ngũ của bạn', 'Whitepaper, blog chuyên môn, webinar và tài liệu kỹ thuật — cập nhật xu hướng và công nghệ mới.'),
        rich(['Thư viện tài nguyên của Bioscope tổng hợp whitepaper, bài blog chuyên môn, webinar và hướng dẫn dành cho formulator và nhà phát triển sản phẩm.', 'Một số tài liệu chuyên sâu yêu cầu đăng ký email công việc để tải về.']),
      ] },
      en: { title: 'Resources', layout: [
        hero('Resources', 'Expert knowledge for your team', 'Whitepapers, expert blog, webinars, and technical documents — stay current on trends and technologies.'),
        rich(['The Bioscope resource library brings together whitepapers, expert blog posts, webinars, and guides for formulators and product developers.', 'Some in-depth documents require a business email to download.']),
      ] },
    },
    // ── Case study ──
    {
      slug: 'case-study',
      vi: { title: 'Case study', layout: [
        hero('Case study', 'Đổi mới tạo nên tác động', 'Giải pháp thật. Kết quả thật. Tăng trưởng thật — từ omega-3 cao cấp đến công nghệ da liễu.'),
        rich(['vivomega®, Gastroheal và PEA là ba câu chuyện tiêu biểu về đồng kiến tạo và công nghệ đột phá cùng Bioscope.', 'Mỗi case study minh họa cách chúng tôi đồng hành từ ý tưởng đến tăng trưởng — với kết quả đo lường được.']),
      ] },
      en: { title: 'Case studies', layout: [
        hero('Case studies', 'Innovation that drives impact', 'Real solutions. Real results. Real growth — from premium omega-3 to dermatology technology.'),
        rich(['vivomega®, Gastroheal, and PEA are three flagship stories of co-creation and breakthrough technology with Bioscope.', 'Each case study shows how we partner from idea to growth — with measurable results.']),
      ] },
    },
    // ── Liên hệ / Contact ──
    {
      slug: 'lien-he',
      vi: { title: 'Liên hệ', layout: [
        hero('Liên hệ', 'Bắt đầu dự án của bạn', 'Thời gian phản hồi dự kiến: trong vòng 24 giờ làm việc. Đội ngũ chuyên gia của Bioscope sẽ liên hệ để hiểu rõ nhu cầu và đề xuất bước tiếp theo.'),
        cta('Sẵn sàng bắt đầu?', 'Gửi yêu cầu của bạn — chúng tôi phản hồi trong vòng 24 giờ làm việc.', [link('Gửi yêu cầu', '/lien-he', 'primary')]),
      ] },
      en: { title: 'Contact', layout: [
        hero('Contact', 'Start your project', 'Expected response time: within 24 business hours. Our experts will contact you to understand your needs and propose next steps.'),
        cta('Ready to start?', 'Send your request — we respond within 24 business hours.', [link('Send request', '/lien-he', 'primary')]),
      ] },
    },
    // ── Câu hỏi thường gặp / FAQ ──
    {
      slug: 'cau-hoi-thuong-gap',
      vi: { title: 'Câu hỏi thường gặp', layout: [
        hero('Hỗ trợ', 'Câu hỏi thường gặp', 'Tìm câu trả lời nhanh về nguyên liệu, dịch vụ và quy trình hợp tác.'),
        rich(['Trang này tổng hợp các câu hỏi thường gặp về nguyên liệu, MOQ, chứng nhận, dịch vụ ODM và quy trình làm việc cùng Bioscope.', 'Không tìm thấy câu trả lời? Hãy liên hệ — đội ngũ của chúng tôi phản hồi trong vòng 24 giờ làm việc.']),
      ] },
      en: { title: 'FAQ', layout: [
        hero('Support', 'Frequently asked questions', 'Quick answers about ingredients, services, and our partnership process.'),
        rich(['This page collects frequently asked questions about ingredients, MOQ, certifications, ODM services, and working with Bioscope.', "Can't find an answer? Contact us — our team responds within 24 business hours."]),
      ] },
    },
    // ── Blog chuyên môn / Expert blog ──
    {
      slug: 'blog-chuyen-mon',
      vi: { title: 'Blog chuyên môn', layout: [
        hero('Tài nguyên', 'Blog chuyên môn', 'Phân tích kỹ thuật, case study và insight thị trường từ đội ngũ Bioscope.'),
        rich(['Blog chuyên môn của Bioscope chia sẻ kiến thức phát triển nhãn hàng, xây dựng công thức, xu hướng nguyên liệu và chiến lược thị trường.', 'Nội dung được biên soạn bởi đội ngũ R&D và chuyên gia ngành.']),
      ] },
      en: { title: 'Expert blog', layout: [
        hero('Resources', 'Expert blog', 'Technical analysis, case studies, and market insights from the Bioscope team.'),
        rich(['The Bioscope expert blog shares knowledge on brand development, formulation, ingredient trends, and market strategy.', 'Content is produced by our R&D team and industry experts.']),
      ] },
    },
    // ── Chính sách bảo mật / Privacy ──
    {
      slug: 'chinh-sach-bao-mat',
      vi: { title: 'Chính sách bảo mật', layout: [
        hero('Pháp lý', 'Chính sách bảo mật', 'Cách Bioscope thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn.'),
        rich([
          'Bioscope cam kết bảo vệ thông tin cá nhân của khách hàng và đối tác. Chúng tôi chỉ thu thập thông tin cần thiết để phản hồi yêu cầu và cung cấp dịch vụ.',
          'Thông tin được lưu trữ an toàn, không chia sẻ cho bên thứ ba ngoài mục đích đã nêu, trừ khi có yêu cầu hợp pháp từ cơ quan chức năng.',
          'Khách hàng có quyền yêu cầu chỉnh sửa hoặc xóa thông tin cá nhân bằng cách liên hệ qua email info@bioscope.vn.',
        ]),
      ] },
      en: { title: 'Privacy policy', layout: [
        hero('Legal', 'Privacy policy', 'How Bioscope collects, uses, and protects your personal information.'),
        rich([
          'Bioscope is committed to protecting the personal information of customers and partners. We only collect the information needed to respond to requests and provide services.',
          'Information is stored securely and is not shared with third parties beyond the stated purpose, except where legally required by authorities.',
          'You may request correction or deletion of your personal information by contacting info@bioscope.vn.',
        ]),
      ] },
    },
    // ── Điều khoản sử dụng / Terms ──
    {
      slug: 'dieu-khoan-su-dung',
      vi: { title: 'Điều khoản sử dụng', layout: [
        hero('Pháp lý', 'Điều khoản sử dụng', 'Điều khoản và điều kiện khi sử dụng website và dịch vụ của Bioscope.'),
        rich([
          'Bằng việc truy cập website Bioscope, bạn đồng ý với các điều khoản sử dụng được nêu tại đây.',
          'Nội dung, hình ảnh và tài liệu kỹ thuật trên website thuộc quyền sở hữu của Bioscope và chỉ được sử dụng cho mục đích tham khảo, không sao chép thương mại khi chưa có sự đồng ý bằng văn bản.',
          'Thông tin sản phẩm mang tính tham khảo; thông số kỹ thuật chính thức được cung cấp qua tài liệu COA/TDS theo từng lô hàng.',
        ]),
      ] },
      en: { title: 'Terms of use', layout: [
        hero('Legal', 'Terms of use', 'Terms and conditions for using Bioscope website and services.'),
        rich([
          'By accessing the Bioscope website, you agree to the terms of use set out here.',
          'Content, images, and technical documents on the website are owned by Bioscope and may be used for reference only, with no commercial reproduction without written consent.',
          'Product information is for reference; official specifications are provided via COA/TDS documents per batch.',
        ]),
      ] },
    },
    // ── Bioscope AI / AI assistant ──
    {
      slug: 'bioscope-ai',
      vi: { title: 'Bioscope AI', layout: [
        hero('Trợ lý AI', 'Bioscope AI', 'Hỏi bất cứ điều gì về nguyên liệu — gợi ý hoạt chất, đề xuất công thức và gửi TDS/COA ngay lập tức.', [link('Đăng ký nhận thông báo', '/lien-he', 'primary')]),
        stats('Bioscope AI', [
          { value: '500+', label: 'Nguyên liệu trong catalog' },
          { value: '24/7', label: 'Tra cứu mọi lúc' },
          { value: '3', label: 'Ngành: DP · TPCN · Mỹ phẩm' },
        ]),
        features('Tính năng chính', '4', [
          { icon: 'Sparkles', title: 'Tư vấn nguyên liệu thông minh', description: 'Hiểu mục tiêu sản phẩm và đề xuất hoạt chất có căn cứ từ dữ liệu Bioscope.' },
          { icon: 'FlaskConical', title: 'Gợi ý công thức & phối hợp', description: 'Đề xuất kết hợp hoạt chất với liều tham khảo và lưu ý tương thích.' },
          { icon: 'FileText', title: 'Tài liệu kỹ thuật tức thì', description: 'Yêu cầu TDS, COA, SDS ngay trong chat — không cần email qua lại.' },
          { icon: 'Clock', title: 'Hỗ trợ 24/7', description: 'Tra cứu nhanh trước khi liên hệ sales — lý tưởng cho giai đoạn brainstorm.' },
        ]),
        cta('Sắp ra mắt', 'Trợ lý AI chuyên biệt cho ngành nguyên liệu chức năng — được huấn luyện trên catalog, tài liệu R&D và kinh nghiệm tư vấn thực tế của Bioscope.', [link('Liên hệ với chúng tôi', '/lien-he', 'primary')]),
      ] },
      en: { title: 'Bioscope AI', layout: [
        hero('AI assistant', 'Bioscope AI', 'Ask anything about ingredients — get active suggestions, formula ideas, and TDS/COA delivery instantly.', [link('Notify me', '/lien-he', 'primary')]),
        stats('Bioscope AI', [
          { value: '500+', label: 'Ingredients in catalog' },
          { value: '24/7', label: 'Always-on lookup' },
          { value: '3', label: 'Industries: Pharma · Nutra · Cosmetics' },
        ]),
        features('Key features', '4', [
          { icon: 'Sparkles', title: 'Smart ingredient guidance', description: 'Understands your product goal and recommends evidence-based actives from Bioscope data.' },
          { icon: 'FlaskConical', title: 'Formula & combination ideas', description: 'Suggests active combinations with reference dosages and compatibility notes.' },
          { icon: 'FileText', title: 'Instant technical documents', description: 'Request TDS, COA, SDS right in the chat — no email back-and-forth.' },
          { icon: 'Clock', title: '24/7 support', description: 'Quick lookup before contacting sales — ideal for the brainstorming stage.' },
        ]),
        cta('Coming soon', 'A specialized AI assistant for the functional-ingredient industry — trained on Bioscope catalog, R&D documents, and real consulting experience.', [link('Contact us', '/lien-he', 'primary')]),
      ] },
    },
  ]
  for (const pg of pages) await upsertPage(pg.slug, pg.vi, pg.en)
  log(`pages: ${pages.length} (song ngữ vi + en)`)

  /* ── 16. Trang chủ = Page ghép từ 9 home block (song ngữ) ── */
  // Content mirrors the real home design 1:1; the page is then selected as
  // Site Settings → homePage so `/` renders it.
  const homeVi = {
    hero: {
      eyebrow: 'Nguyên liệu chuyên biệt · Thành công đồng kiến tạo',
      titleBefore: 'Không chỉ là nguyên liệu. Chúng tôi', titleHighlight: 'đồng kiến tạo', titleMid: 'giải pháp', titleAccent: 'đột phá',
      description: 'Nguyên liệu cao cấp, dựa trên khoa học. Chuyên môn kỹ thuật sâu. Khả năng không giới hạn — cùng nhau.',
      ctaPrimary: 'Khám phá nguyên liệu', ctaSecondary: 'Đồng kiến tạo cùng chúng tôi',
      trust: ['Nguyên liệu chuyên biệt', 'Đảm bảo chất lượng toàn cầu', 'Nguồn cung ổn định'],
    },
    brands: { title: 'Đã đồng hành cùng hơn 50 thương hiệu', categories: ['Thực phẩm chức năng', 'Mỹ phẩm', 'Dinh dưỡng', 'Dược phẩm', 'Tim mạch', 'Vitamin & Khoáng'] },
    process: {
      title: 'Chúng tôi đồng hành như thế nào?',
      description: 'Chúng tôi không chỉ cung cấp. Chúng tôi đồng kiến tạo — từ ý tưởng đến thành công thị trường, Bioscope đồng hành cùng bạn ở mọi bước.',
      steps: [
        { title: 'Ý tưởng', desc: 'Thấu hiểu nhu cầu và nắm bắt xu hướng thị trường.' },
        { title: 'Phát triển', desc: 'Nghiên cứu công thức, lựa chọn nguyên liệu tối ưu.' },
        { title: 'Kiểm chứng', desc: 'Đánh giá hiệu quả, độ an toàn và tính ổn định.' },
        { title: 'Ra mắt', desc: 'Hỗ trợ sản xuất và đưa sản phẩm ra thị trường.' },
        { title: 'Tăng trưởng', desc: 'Tối ưu và đồng hành tăng trưởng dài hạn.' },
      ],
    },
    categories: {
      title: 'Danh mục nguyên liệu',
      description: 'Hơn 100 nguyên liệu hiệu suất cao — Dược phẩm, TPCN, Mỹ phẩm. Đầy đủ TDS, COA, sẵn mẫu thử.',
      viewAll: 'Xem tất cả nguyên liệu',
      featured: { name: 'Chiết xuất thực vật', desc: 'Nguồn gốc tự nhiên, hiệu quả đã được khoa học chứng minh.', cta: 'Khám phá ngay' },
      items: [
        { name: 'Omega & dầu cá', desc: 'Hỗ trợ tim mạch, não bộ, lựa sức khỏe toàn diện.' },
        { name: 'Nấm dược liệu', desc: 'Tăng cường miễn dịch, bảo vệ và phục hồi cơ thể.' },
        { name: 'Hoạt chất công nghệ cao', desc: 'Hiệu quả vượt trội, ứng dụng đa dạng.' },
        { name: 'Axit amin & vitamin', desc: 'Nền tảng cho sức khỏe và hiệu suất tối ưu.' },
      ],
    },
    certifications: {
      title: 'Chất lượng bạn có thể tin tưởng',
      description: 'Đạt chuẩn toàn cầu cao nhất — GMP, ISO 22000, HACCP, Halal, Kosher.',
      countries: 'Quốc gia phân phối',
      items: [
        { name: 'GMP', sub: 'Nhà máy đạt chuẩn' }, { name: 'ISO 22000', sub: 'Quản lý an toàn thực phẩm' },
        { name: 'HACCP', sub: 'Hệ thống quản lý ATTP' }, { name: 'Halal', sub: 'Đạt chứng nhận' }, { name: 'Kosher', sub: 'Đạt chứng nhận' },
      ],
    },
    caseStudies: { title: 'Đổi mới tạo nên tác động — Giải pháp thật. Kết quả thật. Tăng trưởng thật.', viewAll: 'Xem tất cả câu chuyện' },
    experts: {
      eyebrow: 'Đội ngũ chuyên gia', title: 'Khoa học là nền tảng, con người là giá trị cốt lõi',
      paragraphs: [
        'Đội ngũ chuyên gia R&D giàu kinh nghiệm, tâm huyết và luôn tiên phong trong nghiên cứu ứng dụng.',
        'Chúng tôi đồng hành từ chọn nguyên liệu, phát triển công thức và kiểm chứng hiệu quả — đến khi sản phẩm của bạn sẵn sàng ra thị trường.',
      ],
      cta: 'Tìm hiểu về chúng tôi', imageAlt: 'Đội ngũ chuyên gia Bioscope',
      stats: [{ label: 'năm kinh nghiệm' }, { label: 'dự án nghiên cứu' }, { label: 'đơn sáng chế' }, { label: 'dự án R&D' }],
    },
    aiChat: {
      badge: 'Mới — Trợ lý AI', titleBefore: 'Gặp gỡ', titleHighlight: 'Bioscope AI',
      description: 'Hỏi bất cứ điều gì về nguyên liệu — trợ lý AI gợi ý hoạt chất phù hợp, đề xuất công thức và gửi tài liệu kỹ thuật cho bạn ngay lập tức.',
      features: ['Tư vấn nguyên liệu', 'Gợi ý công thức', 'Tải TDS / COA', '24/7'],
      cta: 'Tìm hiểu thêm', ctaHref: '/bioscope-ai', chatName: 'Bioscope AI', chatStatus: 'Đang hoạt động', typing: 'Đang nhập',
      suggestions: ['Chống lão hóa da', 'Omega-3 dạng TG'], demoUser: 'Serum chống lão hóa da',
      demoAi1: 'Chào bạn, tôi là Bioscope AI. Bạn đang phát triển sản phẩm gì?',
      demoAi2: 'Gợi ý 3 hoạt chất: NMN, Bacopa và Curcumin Phytosome. Bạn muốn xem TDS hay yêu cầu mẫu thử?',
      replyAntiAging: 'Gợi ý 3 hoạt chất: NMN, Bacopa và Curcumin Phytosome. Bạn muốn xem TDS hay yêu cầu mẫu thử?',
      replyOmega3: 'Omega-3 dạng TG có sinh khả dụng cao hơn EE — phù hợp phân khúc premium. Bạn muốn xem catalog vivomega® hay nhận TDS?',
    },
    cta: {
      title: 'Sẵn sàng bắt đầu dự án của bạn?',
      description: 'Chia sẻ ý tưởng hoặc thách thức của bạn — đội ngũ chuyên gia của Bioscope đã sẵn sàng đồng hành cùng bạn từ hôm nay.',
      primary: 'Nhận tư vấn miễn phí', secondary: 'Yêu cầu mẫu thử',
    },
  }

  const homeEn = {
    hero: {
      eyebrow: 'Specialty ingredients · Co-created success',
      titleBefore: 'More than ingredients. We', titleHighlight: 'co-create', titleMid: 'breakthrough', titleAccent: 'solutions',
      description: 'Premium, science-backed ingredients. Deep technical expertise. Limitless potential — together.',
      ctaPrimary: 'Explore ingredients', ctaSecondary: 'Co-create with us',
      trust: ['Specialty ingredients', 'Global quality assurance', 'Stable supply chain'],
    },
    brands: { title: 'Trusted by 50+ brands', categories: ['Nutraceuticals', 'Cosmetics', 'Nutrition', 'Pharmaceuticals', 'Cardiovascular', 'Vitamins & minerals'] },
    process: {
      title: 'How do we partner with you?',
      description: 'We do not just supply. We co-create — from idea to market success, Bioscope walks with you at every step.',
      steps: [
        { title: 'Ideation', desc: 'Understand needs and capture market trends.' },
        { title: 'Development', desc: 'Research formulations and select optimal ingredients.' },
        { title: 'Validation', desc: 'Assess efficacy, safety, and stability.' },
        { title: 'Launch', desc: 'Support production and go-to-market.' },
        { title: 'Growth', desc: 'Optimize and sustain long-term growth.' },
      ],
    },
    categories: {
      title: 'Ingredient categories',
      description: '100+ high-performance ingredients — pharmaceuticals, nutraceuticals, cosmetics. Full TDS, COA, samples available.',
      viewAll: 'View all ingredients',
      featured: { name: 'Botanical extracts', desc: 'Natural origin with scientifically proven efficacy.', cta: 'Explore now' },
      items: [
        { name: 'Omega & fish oils', desc: 'Cardiovascular, brain, and whole-body wellness support.' },
        { name: 'Medicinal mushrooms', desc: 'Immune support, protection, and recovery.' },
        { name: 'High-tech actives', desc: 'Superior efficacy, diverse applications.' },
        { name: 'Amino acids & vitamins', desc: 'Foundation for health and peak performance.' },
      ],
    },
    certifications: {
      title: 'Quality you can trust',
      description: 'Highest global standards — GMP, ISO 22000, HACCP, Halal, Kosher.',
      countries: 'Countries served',
      items: [
        { name: 'GMP', sub: 'Certified facilities' }, { name: 'ISO 22000', sub: 'Food safety management' },
        { name: 'HACCP', sub: 'Food safety system' }, { name: 'Halal', sub: 'Certified' }, { name: 'Kosher', sub: 'Certified' },
      ],
    },
    caseStudies: { title: 'Innovation that drives impact — Real solutions. Real results. Real growth.', viewAll: 'View all stories' },
    experts: {
      eyebrow: 'Expert team', title: 'Science is the foundation, people are the core value',
      paragraphs: [
        'An experienced, passionate R&D team pioneering applied research.',
        'We partner from ingredient selection and formulation development through efficacy validation — until your product is market-ready.',
      ],
      cta: 'Learn about us', imageAlt: 'Bioscope expert team',
      stats: [{ label: 'years of experience' }, { label: 'research projects' }, { label: 'patents' }, { label: 'R&D projects' }],
    },
    aiChat: {
      badge: 'New — AI assistant', titleBefore: 'Meet', titleHighlight: 'Bioscope AI',
      description: 'Ask anything about ingredients — our AI suggests suitable actives, proposes formulas, and sends technical documents instantly.',
      features: ['Ingredient advice', 'Formula suggestions', 'Download TDS / COA', '24/7'],
      cta: 'Learn more', ctaHref: '/bioscope-ai', chatName: 'Bioscope AI', chatStatus: 'Online', typing: 'Typing',
      suggestions: ['Anti-aging serum', 'Omega-3 TG form'], demoUser: 'Anti-aging facial serum',
      demoAi1: "Hi, I'm Bioscope AI. What product are you developing?",
      demoAi2: 'I suggest 3 actives: NMN, Bacopa, and Curcumin Phytosome. Would you like to view TDS or request samples?',
      replyAntiAging: 'I suggest 3 actives: NMN, Bacopa, and Curcumin Phytosome. Would you like to view TDS or request samples?',
      replyOmega3: 'TG-form omega-3 offers higher bioavailability than EE — ideal for premium positioning. View the vivomega® catalog or get TDS?',
    },
    cta: {
      title: 'Ready to start your project?',
      description: 'Share your idea or challenge — Bioscope experts are ready to partner with you from today.',
      primary: 'Get free consultation', secondary: 'Request samples',
    },
  }

  // Section content → ordered block layout (order = the real home design).
  const toHomeLayout = (d: typeof homeVi): Block[] => [
    { blockType: 'homeHero', ...d.hero },
    { blockType: 'homeBrands', ...d.brands },
    { blockType: 'homeProcess', ...d.process },
    { blockType: 'homeCategories', ...d.categories },
    { blockType: 'homeCaseStudies', ...d.caseStudies },
    { blockType: 'homeCertifications', ...d.certifications },
    { blockType: 'homeExperts', ...d.experts },
    { blockType: 'homeAiPromo', ...d.aiChat },
    { blockType: 'homeCta', ...d.cta },
  ]
  await upsertPage(
    'trang-chu',
    { title: 'Trang chủ', layout: toHomeLayout(homeVi) },
    { title: 'Home', layout: toHomeLayout(homeEn as typeof homeVi) },
  )
  const homePageDoc = await payload.find({ collection: 'pages', where: { slug: { equals: 'trang-chu' } }, limit: 1 })
  const homePageId = (homePageDoc.docs[0] as { id: string | number } | undefined)?.id
  if (homePageId) {
    await payload.updateGlobal({ slug: 'site-settings', data: { homePage: homePageId } as unknown as Record<string, unknown> })
  }
  log('trang chủ: Page 9 block (song ngữ) + site-settings.homePage')

  log('✅ seed hoàn tất')
  return out
}
