export default {
  register() {},

  async bootstrap({ strapi }: { strapi: any }) {
    /* ── 1. Grant Public role read access to content APIs ───────── */
    const publicReadTypes = [
      'ingredient', 'ingredient-category', 'technology', 'service', 'certification',
      'partner', 'category', 'tag', 'post', 'page', 'redirect',
      'site-setting', 'navigation',
    ]
    const actions: string[] = []
    for (const t of publicReadTypes) {
      actions.push(`api::${t}.${t}.find`, `api::${t}.${t}.findOne`)
    }
    const publicRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } })
    if (publicRole) {
      for (const action of actions) {
        const existing = await strapi
          .query('plugin::users-permissions.permission')
          .findOne({ where: { action, role: publicRole.id } })
        if (!existing) {
          await strapi
            .query('plugin::users-permissions.permission')
            .create({ data: { action, role: publicRole.id } })
        }
      }
      strapi.log.info('[seed] public read permissions ensured')
    }

    /* ── helpers ─────────────────────────────────────────────── */
    const ensure = async (
      uid: string,
      where: Record<string, unknown>,
      data: Record<string, unknown>,
      opts: { locale?: string; publish?: boolean } = {},
    ) => {
      const found = await strapi
        .documents(uid)
        .findMany({ filters: where, locale: opts.locale, limit: 1 })
      if (found.length) return found[0]
      const created = await strapi.documents(uid).create({ data, locale: opts.locale })
      if (opts.publish) {
        await strapi.documents(uid).publish({ documentId: created.documentId, locale: opts.locale })
      }
      return created
    }

    /* ── 2. Seed catalog + bioscope ──────────────────────────── */
    const partners: Record<string, string> = {}
    for (const p of [
      { name: 'Yaizu Suisankagaku', country: 'JP', website: 'https://yaizu.example' },
      { name: 'Rousselot', country: 'AR', website: 'https://rousselot.example' },
      { name: 'DSM', country: 'CH', website: 'https://dsm.example' },
    ]) {
      const doc = await ensure('api::partner.partner', { name: p.name }, p)
      partners[p.name] = doc.documentId
    }

    const cats: Record<string, string> = {}
    for (const c of [
      { name: 'Hỗ trợ xương khớp', slug: 'joint-health', scope: 'supplement' },
      { name: 'Làm đẹp & chống lão hóa', slug: 'beauty', scope: 'both' },
      { name: 'Vitamin & khoáng chất', slug: 'vitamins', scope: 'supplement' },
    ]) {
      const doc = await ensure('api::ingredient-category.ingredient-category', { slug: c.slug }, c, { locale: 'vi' })
      cats[c.slug] = doc.documentId
    }

    const techs: Record<string, string> = {}
    for (const t of [
      { name: 'Liposome Technology', slug: 'liposome', tagline: 'Tăng sinh khả dụng tới 3.8x', order: 1 },
      { name: 'Microencapsulation', slug: 'microencapsulation', tagline: 'Ổn định & bảo vệ hoạt chất', order: 2 },
      { name: 'Spray Drying', slug: 'spray-drying', tagline: 'Giữ trọn hoạt tính', order: 3 },
    ]) {
      const doc = await ensure('api::technology.technology', { slug: t.slug }, t, { locale: 'vi', publish: true })
      techs[t.slug] = doc.documentId
    }

    const ingredients = [
      { name: 'Curcumin Extract 95%', slug: 'curcumin-extract-95', type: 'supplement', category: cats['joint-health'], originCountry: 'IN', moq: '25 kg', featured: true, benefits: ['Kháng viêm', 'Chống oxy hoá'], badges: ['Halal', 'Non-GMO', 'GMP'] },
      { name: 'Omega 3 Fish Oil', slug: 'omega-3-fish-oil', type: 'supplement', originCountry: 'NO', moq: '20 kg', featured: true, benefits: ['Tốt cho tim mạch'], badges: ['IFOS 5-Star', 'GMP'] },
      { name: 'Collagen Peptide', slug: 'collagen-peptide', type: 'cosmetic', category: cats['beauty'], partner: partners['Rousselot'], originCountry: 'AR', moq: '25 kg', featured: true, benefits: ['Tăng đàn hồi da'], badges: ['Halal', 'GMP'] },
      { name: 'NMN', slug: 'nmn', type: 'supplement', originCountry: 'JP', moq: '10 kg', featured: true, benefits: ['Chống lão hoá'], badges: ['≥ 99% Purity', 'GMP'] },
    ]
    for (const ing of ingredients) {
      await ensure('api::ingredient.ingredient', { slug: ing.slug }, ing, { locale: 'vi', publish: true })
    }

    for (const s of [
      { title: 'Nghiên cứu & Phát triển công thức', slug: 'rnd-formulation', icon: 'FlaskConical', order: 1 },
      { title: 'Sản xuất ODM', slug: 'odm-manufacturing', icon: 'Factory', order: 2 },
      { title: 'Hỗ trợ pháp lý & công bố', slug: 'regulatory-support', icon: 'ShieldCheck', order: 3 },
      { title: 'Chuỗi cung ứng toàn cầu', slug: 'global-supply', icon: 'Globe', order: 4 },
    ]) {
      await ensure('api::service.service', { slug: s.slug }, s, { locale: 'vi' })
    }

    for (const c of [
      { title: 'GMP', kind: 'certificate', value: 'GMP', order: 1 },
      { title: 'ISO 22000', kind: 'certificate', value: 'ISO 22000', order: 2 },
      { title: 'HACCP', kind: 'certificate', value: 'HACCP', order: 3 },
      { title: 'HALAL', kind: 'certificate', value: 'HALAL', order: 4 },
      { title: 'KOSHER', kind: 'certificate', value: 'K', order: 5 },
      { title: 'USDA', kind: 'certificate', value: 'USDA', order: 6 },
      { title: 'NON-GMO', kind: 'certificate', value: 'NON GMO', order: 7 },
    ]) {
      await ensure('api::certification.certification', { title: c.title }, c, { locale: 'vi' })
    }

    /* ── 3. Site settings (single type) ──────────────────────── */
    await ensure('api::site-setting.site-setting', {}, {
      siteName: 'Bioscope',
      contact: { phone: '+84 28 7300 9888', email: 'info@bioscope.vn', address: '123 Innovation Way, HCMC', mst: '0312345678' },
    }, { locale: 'vi' })

    /* ── 4. B2B members ──────────────────────────────────────── */
    const authRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'authenticated' } })
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const bcrypt = require('bcryptjs')
    const ensureMember = async (email: string, status: string, company: string) => {
      const password = await bcrypt.hash('Member@123', 10)
      const existing = await strapi
        .query('plugin::users-permissions.user')
        .findOne({ where: { email } })
      if (existing) {
        await strapi.query('plugin::users-permissions.user').update({
          where: { id: existing.id },
          data: { password, provider: 'local', confirmed: true, blocked: false, status },
        })
        return
      }
      await strapi.query('plugin::users-permissions.user').create({
        data: {
          username: email, email, password, provider: 'local', confirmed: true, blocked: false,
          role: authRole.id, company, contactName: 'Nguyễn Văn A', phone: '0900000000', status,
        },
      })
    }
    await ensureMember('member@acme.com', 'approved', 'ACME Pharma')
    await ensureMember('pending@acme.com', 'pending', 'Pending Co')

    /* ── 5. Gated document (no file — list works; upload via admin) ── */
    await ensure('api::gated-document.gated-document', { title: 'CoA mẫu – Curcumin 95%' }, {
      title: 'CoA mẫu – Curcumin 95%', docType: 'COA', visibility: 'approved_members',
    })

    strapi.log.info('[seed] ✅ Bioscope Strapi seed completed')
  },
}
