import os from 'os'
import path from 'path'
import fs from 'fs'
import { getPayload } from 'payload'
import config from '../payload.config.js'

// Use stderr (synchronous on POSIX pipes) so logs survive process.exit().
const log = (m: string) => process.stderr.write(`[seed] ${m}\n`)

// 1×1 transparent PNG used as a placeholder upload for the gated document.
const PNG_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='

// NOTE: top-level await — `payload run` awaits module evaluation, so the whole
// seed must run at the top level (a floating promise would be cut off by exit).
try {
  const payload = await getPayload({ config })

  /* ── 1. Admin ──────────────────────────────────────────── */
  const admins = await payload.find({
    collection: 'users',
    where: { email: { equals: 'admin@bioscope.vn' } },
    limit: 1,
  })
  if (admins.totalDocs === 0) {
    await payload.create({
      collection: 'users',
      data: { name: 'Bioscope Admin', email: 'admin@bioscope.vn', password: 'Bioscope@123', role: 'admin' },
    })
    log('admin created → admin@bioscope.vn / Bioscope@123')
  } else {
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
    },
  })

  /* ── 2b. Branding (whitelabel theme) ───────────────────── */
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

  /* helper: upsert by a unique-ish field */
  const upsert = async (
    collection: string,
    where: Record<string, unknown>,
    data: Record<string, unknown>,
  ): Promise<{ id: string | number }> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c = collection as any
    const found = await payload.find({ collection: c, where: where as never, limit: 1 })
    if (found.totalDocs > 0) return found.docs[0] as { id: string | number }
    return (await payload.create({ collection: c, data: data as never })) as { id: string | number }
  }

  /* ── 3. Partners ───────────────────────────────────────── */
  const partnerData = [
    { name: 'Yaizu Suisankagaku', country: 'JP', website: 'https://yaizu.example' },
    { name: 'Rousselot', country: 'AR', website: 'https://rousselot.example' },
    { name: 'DSM', country: 'CH', website: 'https://dsm.example' },
  ]
  const partners: Record<string, number | string> = {}
  for (const p of partnerData) {
    const doc = await upsert('partners', { name: { equals: p.name } }, p)
    partners[p.name] = doc.id
  }
  log(`partners: ${Object.keys(partners).length}`)

  /* ── 4. Ingredient categories ──────────────────────────── */
  const catData = [
    { name: 'Hỗ trợ xương khớp', scope: 'supplement', slug: 'joint-health' },
    { name: 'Làm đẹp & chống lão hóa', scope: 'both', slug: 'beauty' },
    { name: 'Vitamin & khoáng chất', scope: 'supplement', slug: 'vitamins' },
  ]
  const cats: Record<string, number | string> = {}
  for (const c of catData) {
    const doc = await upsert('ingredient-categories', { slug: { equals: c.slug } }, c)
    cats[c.slug] = doc.id
  }
  log(`ingredient categories: ${Object.keys(cats).length}`)

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
    { name: 'Omega 3 Fish Oil', slug: 'omega-3-fish-oil', type: 'supplement', originCountry: 'NO', moq: '20 kg', featured: true, benefits: ['Tốt cho tim mạch'], badges: ['IFOS 5-Star', 'GMP', 'Halal'] },
    { name: 'Collagen Peptide', slug: 'collagen-peptide', type: 'cosmetic', category: cats['beauty'], partner: partners['Rousselot'], originCountry: 'AR', moq: '25 kg', featured: true, benefits: ['Tăng đàn hồi da'], badges: ['Halal', 'BSE/TSE Free', 'GMP'] },
    { name: 'NMN', slug: 'nmn', type: 'supplement', originCountry: 'JP', moq: '10 kg', featured: true, benefits: ['Hỗ trợ chống lão hoá'], badges: ['≥ 99% Purity', 'Non-GMO', 'GMP'] },
    { name: 'Vitamin C (Coated)', slug: 'vitamin-c-coated', type: 'supplement', category: cats['vitamins'], partner: partners['DSM'], originCountry: 'CH', moq: '25 kg', benefits: ['Phóng thích chậm 8h'], badges: ['Non-GMO', 'GMP', 'Kosher'] },
    { name: 'Marine Sweet® (NAG)', slug: 'marine-sweet-nag', type: 'supplement', category: cats['joint-health'], partner: partners['Yaizu Suisankagaku'], originCountry: 'JP', moq: '5 kg', benefits: ['Tái tạo sụn khớp', 'Dưỡng ẩm da'], badges: ['GMP', 'Halal'] },
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
  log('members: member@acme.com (approved) + pending@acme.com (pending), pwd Member@123')

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
    log('gated-document created (visible to approved members)')
  } else {
    log('gated-document already exists')
  }

  /* ── 11. Case studies ──────────────────────────────────── */
  const caseData = [
    {
      brand: 'vivomega®',
      slug: 'vivomega',
      partner: 'GC Rieber Oils',
      industry: 'Thực phẩm chức năng',
      kpi: '500K USD',
      kpiLabel: 'doanh thu/năm — từ con số 0',
      summary: 'Xây dựng ngành hàng omega-3 cao cấp tại Việt Nam cùng GC Rieber Oils.',
      problem: 'Thị trường Việt Nam thiếu một dòng omega-3 chất lượng cao, minh bạch nguồn gốc và đạt chuẩn quốc tế.',
      solution: 'Bioscope đồng kiến tạo cùng GC Rieber Oils: chọn nguyên liệu dạng TG tinh khiết IFOS 5★, xây dựng định vị và câu chuyện thương hiệu, hỗ trợ pháp lý và thương mại hóa.',
      results: ['Từ 0 → 500.000 USD doanh thu/năm', 'Xây dựng ngành hàng omega-3 cao cấp', 'Hệ thống phân phối ổn định'],
      coCreateSteps: ['Phân tích phân khúc omega-3 cao cấp', 'Chọn dầu cá TG IFOS 5★', 'Xây dựng thương hiệu & kênh phân phối', 'Scale doanh thu bền vững'],
      testimonial: 'Bioscope không chỉ cung cấp nguyên liệu — họ đồng hành từ định vị đến thương mại hóa, giúp chúng tôi tạo ra một ngành hàng mới tại Việt Nam.',
      tags: ['Đồng kiến tạo', 'Dầu & Omega'],
      featured: true,
      order: 1,
    },
    {
      brand: 'Gastroheal',
      slug: 'gastroheal',
      partner: 'Phytosome ướt',
      industry: 'Dược phẩm',
      kpi: '70%+',
      kpiLabel: 'doanh thu đến từ truyền miệng',
      summary: 'Giải pháp dạ dày được tin dùng — giảm đau nhanh, phục hồi niêm mạc.',
      problem: 'Thị trường thiếu giải pháp dạ dày vừa giảm đau nhanh vừa thực sự phục hồi tổn thương niêm mạc.',
      solution: 'Ứng dụng công nghệ Phytosome ướt độc quyền — phức chất curcuminoid + phosphatidylcholine, tăng sinh khả dụng và phục hồi niêm mạc.',
      results: ['Dứt cơn đau trong 30 phút', '53%+ lành loét sau 2 tháng', '70%+ doanh thu từ truyền miệng'],
      coCreateSteps: ['Nghiên cứu cơ chế Phytosome ướt', 'Tối ưu công thức & claim', 'Kiểm chứng lâm sàng thực tế', 'Ra mắt & tăng trưởng truyền miệng'],
      testimonial: 'Công nghệ Phytosome ướt tạo ra sự khác biệt rõ rệt — người dùng cảm nhận hiệu quả nhanh và tin tưởng giới thiệu cho người thân.',
      tags: ['Phytosome ướt', 'Tiêu hóa'],
      featured: true,
      order: 2,
    },
    {
      brand: 'PEA',
      slug: 'pea',
      partner: 'PolymerSolution',
      industry: 'Mỹ phẩm',
      kpi: '#1',
      kpiLabel: 'người tạo ngành hàng (Category Creator) tại Việt Nam',
      summary: 'Tiên phong giải pháp kháng viêm qua da với công nghệ phóng thích chậm 24h.',
      problem: 'Chưa có giải pháp kháng viêm qua da phóng thích chậm, hiệu quả kéo dài tại thị trường Việt Nam.',
      solution: 'Tiên phong đưa công nghệ phân phối thuốc qua da Polymerit, tạo ra ngành hàng mới với trị liệu liên tục 24h.',
      results: ['Người tạo ngành hàng (Category Creator)', 'Trị liệu liên tục 24h', 'Ứng dụng đa dạng da liễu & mỹ phẩm'],
      coCreateSteps: ['Đánh giá khoảng trống thị trường da liễu', 'Ứng dụng Polymerit', 'Tạo category mới', 'Mở rộng danh mục sản phẩm'],
      testimonial: 'Polymerit giúp chúng tôi không chỉ bán sản phẩm mà tạo ra một ngách mới — trị liệu liên tục 24 giờ qua da.',
      tags: ['Công nghệ độc quyền', 'Da liễu'],
      featured: true,
      order: 3,
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

  log('✅ seed completed')
  process.exit(0)
} catch (err) {
  process.stderr.write(`[seed] failed: ${(err as Error)?.stack || String(err)}\n`)
  process.exit(1)
}
