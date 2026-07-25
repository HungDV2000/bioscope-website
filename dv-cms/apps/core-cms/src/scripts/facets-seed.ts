/**
 * Seed thẻ lọc + gán tự động cho nguyên liệu sẵn có.
 *
 * VÌ SAO CẦN
 *   Thêm trường lọc mà không có dữ liệu thì bộ lọc rỗng — vô dụng. AI chỉ điền
 *   khi chạy sinh nội dung, mà 1.592 nguyên liệu thì chưa chạy hết. Script này
 *   gán thẻ cho dữ liệu CŨ bằng cách quét tên + mô tả ngắn theo từ khoá khai
 *   trong chính thẻ (trường `keywords`), nên biên tập viên tự mở rộng được mà
 *   không cần sửa code.
 *
 * AN TOÀN
 *   - Idempotent: chạy lại nhiều lần không tạo trùng, không xoá gán tay.
 *   - CHỈ THÊM thẻ, không bao giờ gỡ thẻ ai đó đã gán.
 *   - Chạy thử trước bằng --dry để xem sẽ gán gì mà không ghi gì.
 *
 * CHẠY
 *   pnpm --filter @dv/core-cms exec payload run src/scripts/facets-seed.ts
 *   pnpm --filter @dv/core-cms exec payload run src/scripts/facets-seed.ts --dry
 */

import { getPayload } from 'payload'
import config from '../payload.config.js'

type Seed = { name: string; en: string; group: string; keywords: string[]; order: number }

/**
 * Từ khoá lấy theo cách nguyên liệu thực tế được đặt tên trong CMS này
 * (khảo sát dữ liệu thật). Không phân biệt hoa thường / dấu tiếng Việt.
 */
const SEEDS: Seed[] = [
  // ── Danh mục chính (bắt buộc, dùng cho card trang chủ + lọc cấp cao) ───────
  // "Nguyên liệu mới" là CATCH-ALL: script backfill gán nó cho nguyên liệu
  // không khớp 4 danh mục kia (xử lý riêng ở cuối, không dựa vào keywords).
  { name: 'Chiết xuất thực vật', en: 'Botanical extract', group: 'primary', order: 10,
    keywords: ['chiết xuất', 'extract', 'thảo dược', 'botanical', 'herbal', 'dịch chiết', 'cao khô', 'flower', 'leaf', 'root', 'hoa', 'lá', 'rễ'] },
  { name: 'Omega & dầu cá', en: 'Omega & fish oil', group: 'primary', order: 20,
    keywords: ['omega', 'dầu cá', 'fish oil', 'dha', 'epa', 'krill', 'vivomega', 'triglyceride', 'cá hồi', 'salmon'] },
  { name: 'Lợi khuẩn', en: 'Probiotics', group: 'primary', order: 30,
    keywords: ['lợi khuẩn', 'probiotic', 'men vi sinh', 'lactobacillus', 'bifido', 'bào tử', 'postbiotic', 'prebiotic'] },
  { name: 'Hoạt chất công nghệ cao', en: 'High-tech actives', group: 'primary', order: 40,
    keywords: ['nano', 'liposome', 'phytosome', 'vi bao', 'microencapsul', 'công nghệ', 'peptide', 'ucii', 'uc-ii', 'chuẩn hoá', 'standardized'] },
  { name: 'Nguyên liệu mới', en: 'New ingredients', group: 'primary', order: 50,
    keywords: [] },

  // ── Công dụng ─────────────────────────────────────────────────────────────
  { name: 'Miễn dịch & kháng viêm', en: 'Immunity & anti-inflammatory', group: 'function', order: 10,
    keywords: ['miễn dịch', 'immune', 'immuno', 'beta glucan', 'beta-glucan', 'kháng viêm', 'anti-inflam', 'echinacea', 'elderberry'] },
  { name: 'Tim mạch & tuần hoàn', en: 'Cardiovascular', group: 'function', order: 20,
    keywords: ['tim mạch', 'cardio', 'huyết áp', 'cholesterol', 'tuần hoàn', 'circulation', 'coq10', 'nattokinase', 'diosmin', 'vein', 'tĩnh mạch'] },
  { name: 'Não bộ & thần kinh', en: 'Brain & nervous system', group: 'function', order: 30,
    keywords: ['não', 'brain', 'trí nhớ', 'memory', 'nootropic', 'ginkgo', 'bacopa', 'nmn', 'thần kinh', 'neuro', 'dha'] },
  { name: 'Tiêu hoá & gan mật', en: 'Digestion & liver', group: 'function', order: 40,
    keywords: ['tiêu hoá', 'tiêu hóa', 'digest', 'gan', 'liver', 'probiotic', 'men vi sinh', 'prebiotic', 'chất xơ', 'fiber', 'silymarin', 'milk thistle'] },
  { name: 'Xương khớp', en: 'Bone & joint', group: 'function', order: 50,
    keywords: ['xương', 'khớp', 'joint', 'bone', 'collagen type ii', 'collagen type 2', 'glucosamine', 'chondroitin', 'msm', 'calcium', 'canxi'] },
  { name: 'Làm đẹp & chống lão hoá', en: 'Beauty & anti-aging', group: 'function', order: 60,
    // 'da' cũng bị loại: "đa dạng", "dạ dày" đều thành "da ..." sau khi bỏ dấu.
    keywords: ['làm đẹp', 'làn da', 'dưỡng da', 'skin', 'beauty', 'chống lão hoá', 'chống lão hóa', 'anti-aging', 'collagen', 'hyaluronic', 'ceramide', 'tóc', 'hair', 'trắng da', 'whitening'] },
  { name: 'Chuyển hoá & cân nặng', en: 'Metabolism & weight', group: 'function', order: 70,
    keywords: ['giảm cân', 'weight', 'chuyển hoá', 'chuyển hóa', 'metabol', 'tiểu đường', 'diabet', 'đường huyết', 'blood sugar', 'garcinia', 'l-carnitine'] },
  { name: 'Thị lực', en: 'Eye health', group: 'function', order: 80,
    keywords: ['mắt', 'thị lực', 'eye', 'vision', 'lutein', 'zeaxanthin', 'astaxanthin', 'bilberry'] },
  { name: 'Hô hấp', en: 'Respiratory', group: 'function', order: 90,
    // KHÔNG dùng từ khoá 'ho': sau khi bỏ dấu, "hỗ trợ" → "ho tro" nên 'ho'
    // khớp nhầm gần như mọi nguyên liệu (đo được 49/300 lượt sai).
    keywords: ['hô hấp', 'respirat', 'phổi', 'lung', 'giảm ho', 'trị ho', 'cough', 'xoang', 'sinus'] },
  { name: 'Sinh lý & nội tiết', en: 'Hormonal & vitality', group: 'function', order: 100,
    keywords: ['sinh lý', 'nội tiết', 'hormon', 'testosterone', 'estrogen', 'mãn kinh', 'menopause', 'maca', 'tinh trùng'] },
  { name: 'Giấc ngủ & thư giãn', en: 'Sleep & relaxation', group: 'function', order: 110,
    keywords: ['giấc ngủ', 'mất ngủ', 'sleep', 'melatonin', 'thư giãn', 'relax', 'stress', 'an thần', 'gaba', 'l-theanine'] },
  { name: 'Thể thao & cơ bắp', en: 'Sports & muscle', group: 'function', order: 120,
    keywords: ['thể thao', 'sport', 'cơ bắp', 'muscle', 'protein', 'bcaa', 'creatine', 'whey'] },

  // ── Bản chất nguyên liệu ──────────────────────────────────────────────────
  { name: 'Chiết xuất thực vật', en: 'Botanical extract', group: 'nature', order: 10,
    keywords: ['chiết xuất', 'extract', 'thảo dược', 'botanical', 'herbal', 'dịch chiết', 'cao khô'] },
  { name: 'Dầu & Omega', en: 'Oils & Omega', group: 'nature', order: 20,
    keywords: ['dầu', 'oil', 'omega', 'dha', 'epa', 'fish oil', 'krill', 'mct', 'triglyceride'] },
  { name: 'Vitamin', en: 'Vitamins', group: 'nature', order: 30,
    keywords: ['vitamin', 'folic', 'biotin', 'niacin', 'thiamine', 'riboflavin', 'cobalamin', 'tocopherol', 'ascorbic'] },
  { name: 'Khoáng chất', en: 'Minerals', group: 'nature', order: 40,
    keywords: ['khoáng', 'mineral', 'calcium', 'canxi', 'magnesium', 'zinc', 'kẽm', 'iron', 'sắt', 'selen', 'chelate', 'iodine'] },
  { name: 'Axit amin & Peptide', en: 'Amino acids & peptides', group: 'nature', order: 50,
    keywords: ['amino', 'axit amin', 'acid amin', 'peptide', 'collagen', 'glutathione', 'taurine', 'arginine', 'lysine', 'carnitine'] },
  { name: 'Probiotic & Enzyme', en: 'Probiotics & enzymes', group: 'nature', order: 60,
    keywords: ['probiotic', 'men vi sinh', 'lactobacillus', 'bifido', 'enzyme', 'bromelain', 'papain', 'protease', 'bào tử'] },
  { name: 'Chất tạo ngọt & phụ gia', en: 'Sweeteners & additives', group: 'nature', order: 70,
    keywords: ['đường', 'sweeten', 'erythritol', 'sucralose', 'suclarose', 'aspartame', 'stevia', 'xylitol', 'sorbitol', 'hương', 'flavor', 'màu', 'chất bảo quản'] },
  { name: 'Vật liệu Nano', en: 'Nano materials', group: 'nature', order: 80,
    keywords: ['nano', 'liposome', 'phytosome', 'micell'] },
  { name: 'Tá dược', en: 'Excipients', group: 'nature', order: 90,
    keywords: ['tá dược', 'excipient', 'cellulose', 'magnesium stearate', 'maltodextrin', 'tinh bột', 'starch', 'talc'] },

  // ── Dạng bào chế ──────────────────────────────────────────────────────────
  { name: 'Bột', en: 'Powder', group: 'form', order: 10, keywords: ['bột', 'powder', 'wsp'] },
  { name: 'Dầu / Lỏng', en: 'Oil / Liquid', group: 'form', order: 20, keywords: ['dầu', 'oil', 'lỏng', 'liquid', 'dung dịch'] },
  { name: 'Dịch chiết', en: 'Liquid extract', group: 'form', order: 30, keywords: ['dịch chiết', 'liquid extract', 'tincture'] },
  { name: 'Hạt / Cốm', en: 'Granule', group: 'form', order: 40, keywords: ['hạt', 'cốm', 'granul', 'pellet'] },
  { name: 'Viên nang', en: 'Capsule', group: 'form', order: 50, keywords: ['viên nang', 'capsule', 'softgel'] },
  { name: 'Tinh thể', en: 'Crystalline', group: 'form', order: 60, keywords: ['tinh thể', 'crystal'] },

  // ── Đặc tính kỹ thuật ─────────────────────────────────────────────────────
  { name: 'Tan trong nước', en: 'Water soluble', group: 'property', order: 10,
    keywords: ['tan trong nước', 'water soluble', 'water-soluble', 'freely soluble in water', 'wsp'] },
  { name: 'Tan trong dầu', en: 'Oil soluble', group: 'property', order: 20,
    keywords: ['tan trong dầu', 'oil soluble', 'oil-soluble', 'liposoluble', 'không tan trong nước'] },
  { name: 'Chịu nhiệt', en: 'Heat stable', group: 'property', order: 30,
    keywords: ['chịu nhiệt', 'heat stable', 'thermostable', 'bền nhiệt'] },
  { name: 'Vi bao', en: 'Microencapsulated', group: 'property', order: 40,
    keywords: ['vi bao', 'microencapsul', 'encapsulated', 'coated'] },
  { name: 'Không mùi vị', en: 'Odourless / tasteless', group: 'property', order: 50,
    keywords: ['không mùi', 'odourless', 'odorless', 'tasteless', 'không vị'] },
  { name: 'Chuẩn hoá hàm lượng', en: 'Standardized', group: 'property', order: 60,
    keywords: ['chuẩn hoá', 'chuẩn hóa', 'standardized', 'standardised'] },
]

/** Bỏ dấu tiếng Việt + hạ chữ thường, để so khớp không phụ thuộc cách gõ. */
const norm = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()

const slugify = (s: string): string =>
  norm(s)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

async function main() {
  const dry = process.argv.includes('--dry')
  const payload = await getPayload({ config })

  if (dry) console.log('── CHẠY THỬ (--dry): không ghi gì vào database ──\n')

  // ── 1. Seed thẻ ───────────────────────────────────────────────────────────
  const bySlug = new Map<string, string | number>()
  let created = 0
  let updated = 0

  for (const seed of SEEDS) {
    const slug = slugify(seed.name)
    const existing = await payload.find({
      collection: 'ingredient-facets',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (existing.docs.length) {
      const doc = existing.docs[0]
      bySlug.set(slug, doc.id)
      // Cập nhật từ khoá (biên tập viên có thể đã thêm — hợp nhất, không ghi đè).
      const merged = Array.from(new Set([...(doc.keywords ?? []), ...seed.keywords]))
      if (merged.length !== (doc.keywords ?? []).length) {
        if (!dry) {
          await payload.update({
            collection: 'ingredient-facets',
            id: doc.id,
            data: { keywords: merged },
            overrideAccess: true,
          })
        }
        updated++
      }
      continue
    }

    if (dry) {
      console.log(`  + tạo thẻ [${seed.group}] ${seed.name}`)
      created++
      continue
    }
    const doc = await payload.create({
      collection: 'ingredient-facets',
      data: {
        name: seed.name,
        slug,
        group: seed.group,
        order: seed.order,
        keywords: seed.keywords,
      } as never,
      overrideAccess: true,
    })
    // Tên tiếng Anh ghi ở locale en.
    await payload.update({
      collection: 'ingredient-facets',
      id: doc.id,
      data: { name: seed.en } as never,
      locale: 'en',
      overrideAccess: true,
    })
    bySlug.set(slug, doc.id)
    created++
  }
  console.log(`\nThẻ lọc: tạo mới ${created}, cập nhật từ khoá ${updated}, tổng seed ${SEEDS.length}`)

  // ── 2. Gán thẻ cho nguyên liệu sẵn có ─────────────────────────────────────
  // Nạp lại toàn bộ thẻ (gồm cả thẻ biên tập viên tự thêm) để dùng từ khoá.
  const allFacets = await payload.find({
    collection: 'ingredient-facets',
    limit: 500,
    depth: 0,
    overrideAccess: true,
  })
  const facets = allFacets.docs
    .filter((f) => (f.keywords ?? []).length)
    .map((f) => ({
      id: f.id,
      group: f.group as string,
      name: f.name as string,
      // Khớp theo từ đầy đủ để "ho" không dính vào "cholesterol".
      patterns: (f.keywords ?? []).map((k) => norm(String(k))),
    }))

  const FIELD_OF: Record<string, 'primaries' | 'functions' | 'natures' | 'forms' | 'properties'> = {
    primary: 'primaries',
    function: 'functions',
    nature: 'natures',
    form: 'forms',
    property: 'properties',
  }
  // Id của "Nguyên liệu mới" — catch-all khi không khớp danh mục chính nào.
  const catchAllId = allFacets.docs.find(
    (f: { group?: unknown; name?: unknown }) =>
      f.group === 'primary' && String(f.name ?? '').toLowerCase().includes('nguyên liệu mới'),
  )?.id

  let page = 1
  let totalPages = 1
  let touched = 0
  let scanned = 0
  const tally = new Map<string, number>()

  do {
    const res = await payload.find({
      collection: 'ingredients',
      limit: 200,
      page,
      depth: 0,
      locale: 'vi',
      draft: true,
      overrideAccess: true,
    })
    totalPages = res.totalPages

    for (const ing of res.docs) {
      scanned++
      const hay = norm(
        [ing.name, ing.subtitle, (ing.technical as { appearance?: string })?.appearance, (ing.technical as { solubility?: string })?.solubility]
          .filter(Boolean)
          .join(' '),
      )

      const add: Record<string, (string | number)[]> = {}
      for (const f of facets) {
        // Ranh giới từ: tránh "ho" khớp "cholesterol", "da" khớp "soda".
        const hit = f.patterns.some((p) => new RegExp(`(^|[^a-z0-9])${p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`).test(hay))
        if (!hit) continue
        const field = FIELD_OF[f.group]
        if (!field) continue
        ;(add[field] ??= []).push(f.id)
        tally.set(f.name, (tally.get(f.name) ?? 0) + 1)
      }
      // Catch-all: nguyên liệu không khớp danh mục chính nào → "Nguyên liệu mới".
      // Chỉ khi bản ghi chưa có primary nào (kể cả gán tay) để không đè lựa chọn.
      if (catchAllId && !add.primaries) {
        const existingPrimary = ((ing as unknown as Record<string, unknown>).primaries as unknown[] | undefined) ?? []
        if (!existingPrimary.length) {
          add.primaries = [catchAllId]
          tally.set('Nguyên liệu mới', (tally.get('Nguyên liệu mới') ?? 0) + 1)
        }
      }
      if (!Object.keys(add).length) continue

      // CHỈ THÊM: giữ nguyên thẻ đã gán tay.
      const data: Record<string, unknown> = { name: ing.name }
      let changed = false
      for (const [field, ids] of Object.entries(add)) {
        const current = ((ing as unknown as Record<string, unknown>)[field] as (string | number)[] | undefined) ?? []
        const merged = Array.from(new Set([...current.map(String), ...ids.map(String)]))
        if (merged.length !== current.length) {
          data[field] = merged
          changed = true
        }
      }
      if (!changed) continue

      touched++
      if (!dry) {
        await payload.update({
          collection: 'ingredients',
          id: ing.id,
          data: data as never,
          locale: 'vi',
          draft: true,
          overrideAccess: true,
        })
      }
    }
    console.log(`  quét trang ${page}/${totalPages}…`)
    page++
  } while (page <= totalPages)

  console.log(`\nĐã quét ${scanned} nguyên liệu, gán thêm thẻ cho ${touched}.`)
  console.log('\nTop thẻ khớp nhiều nhất:')
  ;[...tally.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([n, c]) => console.log(`  ${String(c).padStart(5)}  ${n}`))

  if (dry) console.log('\n(--dry: chưa ghi gì. Bỏ --dry để thực sự lưu.)')
  process.exit(0)
}

await main()
