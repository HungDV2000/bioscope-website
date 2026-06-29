import os from 'os'
import path from 'path'
import fs from 'fs'
import type { Payload } from 'payload'

// 1×1 transparent PNG used as a placeholder upload for the gated document.
const PNG_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='

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

type Id = string | number

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

  /** upsert by a unique-ish where clause; returns the doc id. */
  const upsert = async (
    collection: string,
    where: Record<string, unknown>,
    data: Record<string, unknown>,
  ): Promise<Id> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c = collection as any
    const found = await payload.find({ collection: c, where: where as never, limit: 1 })
    if (found.totalDocs > 0) {
      const id = (found.docs[0] as { id: Id }).id
      await payload.update({ collection: c, id: id as never, data: data as never })
      return id
    }
    const created = (await payload.create({ collection: c, data: data as never })) as { id: Id }
    return created.id
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

  /* ── 2b. Navigation ────────────────────────────────────── */
  await payload.updateGlobal({
    slug: 'navigation',
    data: {
      header: [
        { label: 'Nguyên liệu', url: '/nguyen-lieu' },
        { label: 'Giải pháp', url: '/giai-phap' },
        { label: 'Đồng kiến tạo', url: '/dong-kien-tao' },
        { label: 'Nghiên cứu & Phát triển', url: '/rd' },
        { label: 'Tài nguyên', url: '/tai-nguyen' },
        { label: 'Về chúng tôi', url: '/ve-chung-toi' },
      ],
      footer: [
        { label: 'Câu hỏi thường gặp', url: '/cau-hoi-thuong-gap' },
        { label: 'Chính sách bảo mật', url: '/chinh-sach-bao-mat' },
        { label: 'Điều khoản sử dụng', url: '/dieu-khoan-su-dung' },
        { label: 'Liên hệ', url: '/lien-he' },
      ],
    },
  })
  log('navigation updated')

  /* ── 2c. Branding (whitelabel theme) ───────────────────── */
  await payload.updateGlobal({
    slug: 'branding',
    data: {
      brandName: 'Bioscope',
      loginSubtitle: 'Hệ quản trị nội dung Bioscope',
      primaryColor: '#0E6147',
      primaryDark: '#00301A',
      accentColor: '#F7941D',
      radius: 12,
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
  for (const p of partnerData) partners[p.name] = await upsert('partners', { name: { equals: p.name } }, p)
  log(`partners: ${partnerData.length}`)

  /* ── 4. Ingredient categories ──────────────────────────── */
  const catData = [
    { name: 'Hỗ trợ xương khớp', scope: 'supplement', slug: 'joint-health' },
    { name: 'Làm đẹp & chống lão hóa', scope: 'both', slug: 'beauty' },
    { name: 'Vitamin & khoáng chất', scope: 'supplement', slug: 'vitamins' },
  ]
  const cats: Record<string, Id> = {}
  for (const c of catData) cats[c.slug] = await upsert('ingredient-categories', { slug: { equals: c.slug } }, c)
  log(`ingredient categories: ${catData.length}`)

  /* ── 5. Technologies ───────────────────────────────────── */
  const techData = [
    { name: 'Liposome Technology', slug: 'liposome', tagline: 'Tăng sinh khả dụng tới 3.8x', order: 1 },
    { name: 'Microencapsulation', slug: 'microencapsulation', tagline: 'Ổn định & bảo vệ hoạt chất', order: 2 },
    { name: 'Spray Drying', slug: 'spray-drying', tagline: 'Giữ trọn hoạt tính', order: 3 },
  ]
  for (const t of techData) await upsert('technologies', { slug: { equals: t.slug } }, { ...t, _status: 'published' })
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
  for (const ing of ingredientData) await upsert('ingredients', { slug: { equals: ing.slug } }, { ...ing, _status: 'published' })
  log(`ingredients: ${ingredientData.length}`)

  /* ── 7. Services ───────────────────────────────────────── */
  const serviceData = [
    { title: 'Nghiên cứu & Phát triển công thức', slug: 'rnd-formulation', icon: 'FlaskConical', order: 1 },
    { title: 'Sản xuất ODM', slug: 'odm-manufacturing', icon: 'Factory', order: 2 },
    { title: 'Hỗ trợ pháp lý & công bố', slug: 'regulatory-support', icon: 'ShieldCheck', order: 3 },
    { title: 'Chuỗi cung ứng toàn cầu', slug: 'global-supply', icon: 'Globe', order: 4 },
  ]
  for (const s of serviceData) await upsert('services', { slug: { equals: s.slug } }, s)
  log(`services: ${serviceData.length}`)

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
  for (const c of certData) await upsert('certifications', { title: { equals: c.title } }, c)
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

  /* ── 10. Gated document (with placeholder upload) ──────── */
  const gated = await payload.find({ collection: 'gated-documents', limit: 1 })
  if (gated.totalDocs === 0) {
    const tmp = path.join(os.tmpdir(), 'seed-coa.png')
    fs.writeFileSync(tmp, Buffer.from(PNG_B64, 'base64'))
    const media = await payload.create({ collection: 'media', data: { alt: 'Sample CoA' }, filePath: tmp })
    await payload.create({
      collection: 'gated-documents',
      data: { title: 'CoA mẫu – Curcumin 95%', docType: 'COA', file: media.id, visibility: 'approved_members' },
    })
    log('gated-document created')
  } else {
    log('gated-document already exists')
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
  for (const cs of caseData) await upsert('case-studies', { slug: { equals: cs.slug } }, { ...cs, _status: 'published' })
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
  for (const f of faqData) await upsert('faqs', { question: { equals: f.question } }, { ...f, _status: 'published' })
  log(`faqs: ${faqData.length}`)

  /* ── 13. Categories & Tags (taxonomy for posts) ────────── */
  const categoryData = [
    { name: 'Whitepaper', slug: 'whitepaper' },
    { name: 'Blog chuyên môn', slug: 'blog' },
    { name: 'Webinar', slug: 'webinar' },
    { name: 'Hướng dẫn Formulator', slug: 'formulator' },
    { name: 'Infographic', slug: 'infographic' },
  ]
  const categoryIds: Record<string, Id> = {}
  for (const c of categoryData) categoryIds[c.slug] = await upsert('categories', { slug: { equals: c.slug } }, c)
  log(`categories: ${categoryData.length}`)

  const tagData = [
    { name: 'Phát triển nhãn hàng', slug: 'phat-trien-nhan-hang' },
    { name: 'Omega-3', slug: 'omega-3' },
    { name: 'Chứng nhận', slug: 'chung-nhan' },
    { name: 'Đồng kiến tạo', slug: 'dong-kien-tao' },
  ]
  const tagIds: Record<string, Id> = {}
  for (const t of tagData) tagIds[t.slug] = await upsert('tags', { slug: { equals: t.slug } }, t)
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
    await upsert(
      'posts',
      { slug: { equals: p.slug } },
      { ...rest, author: adminId, content: lexical(body), publishedAt: new Date().toISOString(), _status: 'published' },
    )
  }
  log(`posts: ${postData.length}`)

  /* ── 15. Pages (bố cục block) ──────────────────────────── */
  const link = (label: string, href: string, style = 'primary') => ({ label, href, style })

  const pageData: { slug: string; title: string; layout: Record<string, unknown>[] }[] = [
    {
      slug: 'trang-chu',
      title: 'Trang chủ',
      layout: [
        {
          blockType: 'hero',
          eyebrow: 'Nguyên liệu chuyên biệt · Thành công đồng kiến tạo',
          heading: 'Không chỉ là nguyên liệu. Chúng tôi đồng kiến tạo giải pháp đột phá.',
          subheading: 'Nguyên liệu cao cấp, dựa trên khoa học. Chuyên môn kỹ thuật sâu. Khả năng không giới hạn — cùng nhau.',
          links: [link('Khám phá nguyên liệu', '/nguyen-lieu', 'primary'), link('Đồng kiến tạo cùng chúng tôi', '/dong-kien-tao', 'outline')],
        },
        {
          blockType: 'stats',
          heading: 'Bioscope qua những con số',
          items: [
            { value: '15+', label: 'Năm kinh nghiệm' },
            { value: '23+', label: 'Dự án R&D' },
            { value: '14', label: 'Đơn sáng chế' },
            { value: '100+', label: 'Nguyên liệu mới' },
          ],
        },
        {
          blockType: 'featureGrid',
          heading: 'Vì sao chọn Bioscope?',
          columns: '3',
          items: [
            { icon: 'FlaskConical', title: 'Nguyên liệu chuyên biệt', description: 'Danh mục hoạt chất hiếm, hiệu quả đã được kiểm chứng — từ chiết xuất thực vật đến công nghệ nano.' },
            { icon: 'ShieldCheck', title: 'Đảm bảo chất lượng toàn cầu', description: 'Đầy đủ chứng nhận GMP, ISO 22000, HACCP, Halal, Kosher và tài liệu kỹ thuật minh bạch.' },
            { icon: 'Truck', title: 'Nguồn cung ổn định', description: 'Hợp tác trực tiếp với nhà sản xuất R&D tại hơn 50 quốc gia — ổn định chuỗi cung dài hạn.' },
          ],
        },
        {
          blockType: 'cta',
          heading: 'Sẵn sàng đồng kiến tạo thương hiệu tiếp theo?',
          text: 'Đặt lịch tư vấn cùng đội ngũ chuyên gia Bioscope.',
          background: 'solid',
          links: [link('Liên hệ ngay', '/lien-he', 'primary')],
        },
      ],
    },
    {
      slug: 've-chung-toi',
      title: 'Về chúng tôi',
      layout: [
        {
          blockType: 'hero',
          eyebrow: 'Về Bioscope',
          heading: 'Nhà phân phối công nghệ — không chỉ là nhà cung ứng nguyên liệu',
          subheading: 'Khác với đơn vị bán nguyên liệu thuần túy, Bioscope là đối tác chiến lược đồng hành từ ý tưởng đến thương mại hóa.',
        },
        {
          blockType: 'stats',
          items: [
            { value: '15+', label: 'Năm kinh nghiệm' },
            { value: '23+', label: 'Dự án R&D' },
            { value: '14', label: 'Đơn sáng chế' },
            { value: '100+', label: 'Nguyên liệu mới' },
          ],
        },
        {
          blockType: 'featureGrid',
          heading: 'Giá trị cốt lõi',
          columns: '4',
          items: [
            { title: 'Khoa học dẫn lối', description: 'Mọi quyết định dựa trên bằng chứng, cơ chế tác động và dữ liệu thị trường.' },
            { title: 'Hiệu quả/chi phí', description: 'Tối ưu công thức để người tiêu dùng nhận được giá trị thật với chi phí hợp lý.' },
            { title: 'Đồng hành dài hạn', description: 'Không giao hàng rồi kết thúc — cùng thương hiệu tăng trưởng bền vững.' },
            { title: 'Đổi mới không ngừng', description: '23+ dự án R&D, 14 đơn sáng chế và liên tục đưa công nghệ mới vào Việt Nam.' },
          ],
        },
      ],
    },
    {
      slug: 'dong-kien-tao',
      title: 'Đồng kiến tạo',
      layout: [
        {
          blockType: 'hero',
          eyebrow: 'Quy trình đồng kiến tạo',
          heading: 'Từ ý tưởng đến tăng trưởng — chúng tôi đồng hành mọi bước',
          subheading: 'Đồng hành sớm: nghiên cứu ý tưởng, phân tích thị trường, chọn phân khúc và kênh bán — rồi mới xây công thức và test nhu cầu.',
        },
        {
          blockType: 'featureGrid',
          heading: 'Bốn bước hành trình',
          columns: '4',
          items: [
            { icon: 'Lightbulb', title: 'Ý tưởng & phân tích', description: 'Thời lượng tham khảo: 2–4 tuần.' },
            { icon: 'FlaskConical', title: 'Nghiên cứu & đề xuất', description: 'Thời lượng tham khảo: 4–8 tuần.' },
            { icon: 'ShieldCheck', title: 'Kiểm chứng & thử nghiệm', description: 'Thời lượng tham khảo: 6–12 tuần.' },
            { icon: 'Rocket', title: 'Phát triển & ra mắt', description: 'Thời lượng tham khảo: 8–16 tuần.' },
          ],
        },
        {
          blockType: 'cta',
          heading: 'Bắt đầu hành trình đồng kiến tạo',
          text: 'Chia sẻ ý tưởng của bạn — chúng tôi sẽ đề xuất bước đi phù hợp.',
          background: 'solid',
          links: [link('Đặt lịch tư vấn', '/lien-he', 'primary')],
        },
      ],
    },
    {
      slug: 'chinh-sach-bao-mat',
      title: 'Chính sách bảo mật',
      layout: [
        { blockType: 'richText', content: lexical([
          'Bioscope cam kết bảo vệ thông tin cá nhân của khách hàng và đối tác. Chúng tôi chỉ thu thập thông tin cần thiết để phản hồi yêu cầu và cung cấp dịch vụ.',
          'Thông tin được lưu trữ an toàn, không chia sẻ cho bên thứ ba ngoài mục đích đã nêu, trừ khi có yêu cầu hợp pháp từ cơ quan chức năng.',
          'Khách hàng có quyền yêu cầu chỉnh sửa hoặc xóa thông tin cá nhân bằng cách liên hệ qua email info@bioscope.vn.',
        ]) },
      ],
    },
    {
      slug: 'dieu-khoan-su-dung',
      title: 'Điều khoản sử dụng',
      layout: [
        { blockType: 'richText', content: lexical([
          'Bằng việc truy cập website Bioscope, bạn đồng ý với các điều khoản sử dụng được nêu tại đây.',
          'Nội dung, hình ảnh và tài liệu kỹ thuật trên website thuộc quyền sở hữu của Bioscope và chỉ được sử dụng cho mục đích tham khảo, không sao chép thương mại khi chưa có sự đồng ý bằng văn bản.',
          'Thông tin sản phẩm mang tính tham khảo; thông số kỹ thuật chính thức được cung cấp qua tài liệu COA/TDS theo từng lô hàng.',
        ]) },
      ],
    },
  ]
  for (const pg of pageData) {
    await upsert('pages', { slug: { equals: pg.slug } }, { title: pg.title, slug: pg.slug, layout: pg.layout, _status: 'published' })
  }
  log(`pages: ${pageData.length}`)

  log('✅ seed hoàn tất')
  return out
}
