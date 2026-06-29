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

  const pages: { slug: string; vi: { title: string; layout: Block[] }; en: { title: string; layout: Block[] } }[] = [
    // ── Trang chủ / Home ──
    {
      slug: 'trang-chu',
      vi: { title: 'Trang chủ', layout: [
        hero('Nguyên liệu chuyên biệt · Thành công đồng kiến tạo', 'Không chỉ là nguyên liệu. Chúng tôi đồng kiến tạo giải pháp đột phá.', 'Nguyên liệu cao cấp, dựa trên khoa học. Chuyên môn kỹ thuật sâu. Khả năng không giới hạn — cùng nhau.', [link('Khám phá nguyên liệu', '/nguyen-lieu', 'primary'), link('Đồng kiến tạo cùng chúng tôi', '/dong-kien-tao', 'outline')]),
        stats('Bioscope qua những con số', [
          { value: '15+', label: 'Năm kinh nghiệm' }, { value: '23+', label: 'Dự án R&D' },
          { value: '14', label: 'Đơn sáng chế' }, { value: '100+', label: 'Nguyên liệu mới' },
        ]),
        features('Vì sao chọn Bioscope?', '3', [
          { icon: 'FlaskConical', title: 'Nguyên liệu chuyên biệt', description: 'Danh mục hoạt chất hiếm, hiệu quả đã được kiểm chứng — từ chiết xuất thực vật đến công nghệ nano.' },
          { icon: 'ShieldCheck', title: 'Đảm bảo chất lượng toàn cầu', description: 'Đầy đủ chứng nhận GMP, ISO 22000, HACCP, Halal, Kosher và tài liệu kỹ thuật minh bạch.' },
          { icon: 'Truck', title: 'Nguồn cung ổn định', description: 'Hợp tác trực tiếp với nhà sản xuất R&D tại hơn 50 quốc gia — ổn định chuỗi cung dài hạn.' },
        ]),
        cta('Sẵn sàng đồng kiến tạo thương hiệu tiếp theo?', 'Đặt lịch tư vấn cùng đội ngũ chuyên gia Bioscope.', [link('Liên hệ ngay', '/lien-he', 'primary')]),
      ] },
      en: { title: 'Home', layout: [
        hero('Specialty ingredients · Co-created success', 'More than ingredients. We co-create breakthrough solutions.', 'Premium, science-based ingredients. Deep technical expertise. Limitless possibilities — together.', [link('Explore ingredients', '/nguyen-lieu', 'primary'), link('Co-create with us', '/dong-kien-tao', 'outline')]),
        stats('Bioscope by the numbers', [
          { value: '15+', label: 'Years of experience' }, { value: '23+', label: 'R&D projects' },
          { value: '14', label: 'Patents' }, { value: '100+', label: 'New ingredients' },
        ]),
        features('Why choose Bioscope?', '3', [
          { icon: 'FlaskConical', title: 'Specialty ingredients', description: 'A catalog of rare, proven actives — from botanical extracts to nano technology.' },
          { icon: 'ShieldCheck', title: 'Global quality assurance', description: 'Full GMP, ISO 22000, HACCP, Halal, Kosher certifications and transparent technical documents.' },
          { icon: 'Truck', title: 'Stable supply', description: 'Direct partnerships with R&D manufacturers in 50+ countries — a stable long-term supply chain.' },
        ]),
        cta('Ready to co-create your next brand?', 'Book a consultation with the Bioscope team.', [link('Contact us', '/lien-he', 'primary')]),
      ] },
    },
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

  log('✅ seed hoàn tất')
  return out
}
