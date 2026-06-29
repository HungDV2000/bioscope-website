import type { Ingredient } from './content'

// ─── Common value maps ───────────────────────────────────────────────────────

const INDUSTRY_EN: Record<string, string> = {
  'Dược phẩm': 'Pharmaceuticals',
  'Thực phẩm chức năng': 'Nutraceuticals',
  'Mỹ phẩm': 'Cosmetics',
}

const CATEGORY_EN: Record<string, string> = {
  'Chiết xuất thực vật': 'Botanical extracts',
  'Dầu & Omega': 'Oils & Omega',
  'Nấm dược liệu': 'Medicinal mushrooms',
  'Hoạt chất chức năng': 'Functional actives',
  'Vitamin & Khoáng': 'Vitamins & minerals',
  'Peptide & Protein': 'Peptides & protein',
  'Men vi sinh': 'Probiotics',
}

const ORIGIN_EN: Record<string, string> = {
  'Ấn Độ': 'India',
  'Na Uy': 'Norway',
  'Trung Quốc': 'China',
  'Nhật Bản': 'Japan',
  'Việt Nam': 'Vietnam',
  'Đức': 'Germany',
  'Hàn Quốc': 'South Korea',
  'Đan Mạch': 'Denmark',
  'Thụy Sĩ': 'Switzerland',
  'Pháp': 'France',
  'Mỹ': 'USA',
  Iceland: 'Iceland',
}

const APPLICATION_EN: Record<string, string> = {
  'Viên nang': 'Capsules',
  'Viên nang mềm': 'Softgels',
  'Viên nén': 'Tablets',
  'Gói bột': 'Powder sachets',
  'Dạng nhũ tương': 'Emulsion',
  Serum: 'Serum',
  'Kem dưỡng': 'Moisturizer cream',
  'Đồ uống chức năng': 'Functional beverages',
  'Dạng ngậm': 'Sublingual',
  'Dạng nước': 'Liquid format',
  'Dạng cốm': 'Granules',
}

const SPEC_LABEL_EN: Record<string, string> = {
  'Hàm lượng hoạt chất': 'Active content',
  'Hàm lượng': 'Assay',
  'Dạng': 'Form',
  'Cảm quan': 'Sensory',
  'Bảo quản': 'Storage',
  'Hạn dùng': 'Shelf life',
  'Chỉ số oxy hóa': 'Oxidation index',
  'Tỷ lệ chiết': 'Extract ratio',
  'Độ tinh khiết': 'Purity',
  'Công nghệ': 'Technology',
}

const SPEC_VALUE_EN: Record<string, string> = {
  'Bột mịn': 'Fine powder',
  'Vàng cam đặc trưng': 'Characteristic orange-yellow',
  'Khô ráo, tránh ánh sáng': 'Dry, protect from light',
  '36 tháng': '36 months',
  '24 tháng': '24 months',
  'Dầu lỏng': 'Liquid oil',
  'TOTOX thấp': 'Low TOTOX',
  '2–8°C': '2–8°C',
  'Bột chiết xuất': 'Extract powder',
  'Khô ráo, mát': 'Dry, cool storage',
  'Bột trắng': 'White powder',
  '2–8°C, tránh ẩm': '2–8°C, protect from moisture',
  'Phức chất bột': 'Powder complex',
  'Bột mịn tan nhanh': 'Fast-dissolving fine powder',
  'Khô ráo, tránh ẩm': 'Dry, protect from moisture',
  'Bột liophilized': 'Lyophilized powder',
  'Bột vàng nhạt': 'Pale yellow powder',
  'Dầu vàng nhạt': 'Pale yellow oil',
  '2–8°C, tránh ánh sáng': '2–8°C, protect from light',
  'Dầu đỏ đậm': 'Deep red oil',
  'Bột lipid': 'Lipid powder',
  'Phytosome ướt': 'Wet Phytosome',
}

const BENEFIT_EN: Record<string, string> = {
  'Kháng viêm': 'Anti-inflammatory',
  'Chống oxy hóa': 'Antioxidant',
  'Hỗ trợ tiêu hóa': 'Digestive support',
  'Tim mạch': 'Cardiovascular',
  'Não bộ': 'Cognitive',
  'Thị lực': 'Vision',
  'Tăng cường nhận thức': 'Cognitive enhancement',
  'Hỗ trợ thần kinh': 'Nerve support',
  'Miễn dịch': 'Immune support',
  'Chống lão hóa': 'Anti-aging',
  'Năng lượng tế bào': 'Cellular energy',
  'Sức bền': 'Stamina',
  'Tăng cường trí nhớ': 'Memory support',
  'Giảm căng thẳng': 'Stress relief',
  'Tập trung': 'Focus',
  'Bảo vệ niêm mạc dạ dày': 'Gastric mucosa protection',
  'Phục hồi loét': 'Ulcer recovery',
  'Hấp thu canxi': 'Calcium absorption',
  'Xương khớp': 'Joint & bone',
  'Đàn hồi da': 'Skin elasticity',
  'Săn chắc': 'Firmness',
  'Móng & tóc': 'Nails & hair',
  'Cấp ẩm': 'Hydration',
  'Làm đầy': 'Plumping',
  'Phục hồi hàng rào da': 'Skin barrier repair',
  'Làm sáng': 'Brightening',
  'Se khít lỗ chân lông': 'Pore refinement',
  'Giảm stress': 'Stress relief',
  'Ngủ ngon': 'Sleep support',
  'Tiêu hóa': 'Digestion',
  'Cân bằng hệ vi sinh': 'Microbiome balance',
  'Năng lượng': 'Energy',
  'Tái tạo da': 'Skin renewal',
  'Làm mịn': 'Smoothing',
  'Phục hồi hàng rào': 'Barrier repair',
  'Sụn khớp': 'Cartilage support',
  'Vận động': 'Mobility',
  'Mắt': 'Eye health',
  'Da & chống lão hóa': 'Skin & anti-aging',
  'Da mụn': 'Acne-prone skin',
  'Tổng hợp protein': 'Protein synthesis',
  'Phục hồi da': 'Skin recovery',
  'Giữ ẩm': 'Moisture retention',
  'Giảm kích ứng': 'Irritation relief',
}

type IngredientEnFields = Partial<
  Pick<
    Ingredient,
    | 'category'
    | 'industry'
    | 'origin'
    | 'shortDesc'
    | 'overview'
    | 'benefits'
    | 'suggestedDosage'
    | 'applications'
    | 'specs'
  >
>

const INGREDIENT_SLUG_EN: Record<string, IngredientEnFields> = {
  'curcumin-extract-95': {
    shortDesc: 'Curcuminoids 95% — natural anti-inflammatory, high bioavailability.',
    overview:
      'Standardized turmeric extract with Curcuminoids ≥95% from India, distributed by Indena. A proven natural anti-inflammatory active widely used in nutraceuticals and pharmaceuticals — can be combined with Phytosome technology to enhance bioavailability.',
    benefits: ['Anti-inflammatory', 'Antioxidant', 'Digestive support'],
    suggestedDosage: '500–1000 mg/day (reference only; depends on formulation)',
    specs: [
      { label: 'Active content', value: 'Curcuminoids ≥ 95%' },
      { label: 'Form', value: 'Fine powder' },
      { label: 'Sensory', value: 'Characteristic orange-yellow' },
      { label: 'Storage', value: 'Dry, protect from light' },
      { label: 'Shelf life', value: '36 months' },
    ],
    applications: ['Capsules', 'Tablets', 'Powder sachets'],
  },
  'omega-3-fish-oil': {
    shortDesc: 'TG form — EPA/DHA 90%, IFOS 5★ purity.',
    overview:
      'High-purity triglyceride (TG) fish oil omega-3 from GC Rieber Oils, Norway — IFOS 5-star certified. EPA/DHA 90% supports cardiovascular, cognitive, and vision health; ideal for premium softgels and emulsions.',
    benefits: ['Cardiovascular', 'Cognitive', 'Vision'],
    suggestedDosage: '1000–2000 mg EPA+DHA/day (reference)',
    specs: [
      { label: 'Assay', value: 'EPA/DHA 90% (TG form)' },
      { label: 'Form', value: 'Liquid oil' },
      { label: 'Oxidation index', value: 'Low TOTOX' },
      { label: 'Storage', value: '2–8°C' },
      { label: 'Shelf life', value: '24 months' },
    ],
    applications: ['Softgels', 'Emulsion', 'Liquid format'],
  },
  'lions-mane-extract': {
    shortDesc: 'Standardized extract supporting cognition and nerve health.',
    benefits: ['Cognitive enhancement', 'Nerve support', 'Immune support'],
    specs: [
      { label: 'Assay', value: 'Polysaccharides ≥ 30%' },
      { label: 'Form', value: 'Extract powder' },
      { label: 'Extract ratio', value: '10:1' },
      { label: 'Storage', value: 'Dry, cool storage' },
      { label: 'Shelf life', value: '36 months' },
    ],
    applications: ['Capsules', 'Powder sachets', 'Functional beverages'],
  },
  nmn: {
    shortDesc: 'Nicotinamide Mononucleotide ≥99% — cellular anti-aging support.',
    benefits: ['Anti-aging', 'Cellular energy', 'Stamina'],
    specs: [
      { label: 'Purity', value: '≥ 99%' },
      { label: 'Form', value: 'White powder' },
      { label: 'Storage', value: '2–8°C, protect from moisture' },
      { label: 'Shelf life', value: '24 months' },
    ],
    applications: ['Capsules', 'Tablets', 'Sublingual'],
  },
  'bacopa-extract': {
    shortDesc: 'Bacosides 20% — memory and focus support.',
    benefits: ['Memory support', 'Stress relief', 'Focus'],
    specs: [
      { label: 'Assay', value: 'Bacosides 20%' },
      { label: 'Form', value: 'Extract powder' },
      { label: 'Storage', value: 'Dry, cool storage' },
      { label: 'Shelf life', value: '36 months' },
    ],
    applications: ['Capsules', 'Tablets'],
  },
  'phytosome-curcumin': {
    shortDesc: 'Exclusive wet Phytosome technology — superior bioavailability.',
    overview:
      'Curcuminoid + phosphatidylcholine complex using Bioscope\'s exclusive wet Phytosome technology. Superior bioavailability vs. standard curcumin — used in Gastroheal and digestive/pharmaceutical products.',
    benefits: ['Gastric mucosa protection', 'Anti-inflammatory', 'Ulcer recovery'],
    suggestedDosage: 'Per Gastroheal formulation — contact our specialists',
    specs: [
      { label: 'Technology', value: 'Wet Phytosome' },
      { label: 'Form', value: 'Powder complex' },
      { label: 'Storage', value: 'Dry, cool storage' },
      { label: 'Shelf life', value: '24 months' },
    ],
    applications: ['Capsules', 'Granules'],
  },
  'vitamin-d3': {
    shortDesc: 'Pure Vitamin D3 ≥100,000 IU/g — bone, joint, and immune support.',
    benefits: ['Calcium absorption', 'Immune support', 'Joint & bone'],
    specs: [
      { label: 'Assay', value: '≥ 100,000 IU/g' },
      { label: 'Form', value: 'Fine powder' },
      { label: 'Storage', value: 'Dry, protect from light' },
      { label: 'Shelf life', value: '36 months' },
    ],
    applications: ['Capsules', 'Tablets', 'Powder sachets'],
  },
  'collagen-peptide': {
    shortDesc: 'Low-MW hydrolyzed collagen peptides — fast absorption, beauty from within.',
    benefits: ['Skin elasticity', 'Firmness', 'Nails & hair'],
    specs: [
      { label: 'Assay', value: 'Protein ≥ 90%' },
      { label: 'Form', value: 'Fast-dissolving fine powder' },
      { label: 'Storage', value: 'Dry, cool storage' },
      { label: 'Shelf life', value: '24 months' },
    ],
    applications: ['Powder sachets', 'Functional beverages', 'Serum'],
  },
  'hyaluronic-acid': {
    shortDesc: 'Low & high molecular weight HA — deep hydration, wrinkle plumping.',
    benefits: ['Hydration', 'Plumping', 'Skin barrier repair'],
    specs: [
      { label: 'Assay', value: '≥ 98%' },
      { label: 'Form', value: 'White powder' },
      { label: 'Storage', value: 'Dry, protect from moisture' },
      { label: 'Shelf life', value: '36 months' },
    ],
    applications: ['Serum', 'Moisturizer cream', 'Capsules'],
  },
  resveratrol: {
    shortDesc: 'Pure trans-resveratrol — potent antioxidant and anti-aging.',
    benefits: ['Antioxidant', 'Cardiovascular', 'Anti-aging'],
    specs: [
      { label: 'Assay', value: 'Trans-resveratrol ≥ 98%' },
      { label: 'Form', value: 'White powder' },
      { label: 'Storage', value: 'Dry, protect from light' },
      { label: 'Shelf life', value: '24 months' },
    ],
    applications: ['Capsules', 'Tablets', 'Powder sachets'],
  },
  'ashwagandha-extract': {
    shortDesc: 'Withanolides 5% — stress relief, cortisol balance, stamina.',
    benefits: ['Stress relief', 'Sleep support', 'Stamina'],
    specs: [
      { label: 'Assay', value: 'Withanolides ≥ 5%' },
      { label: 'Form', value: 'Extract powder' },
      { label: 'Storage', value: 'Dry, cool storage' },
      { label: 'Shelf life', value: '36 months' },
    ],
    applications: ['Capsules', 'Powder sachets', 'Functional beverages'],
  },
  'probiotics-blend': {
    shortDesc: '10-strain lactic blend — digestive and gut immune support.',
    benefits: ['Digestion', 'Immune support', 'Microbiome balance'],
    specs: [
      { label: 'Assay', value: '≥ 100 billion CFU/g' },
      { label: 'Form', value: 'Lyophilized powder' },
      { label: 'Storage', value: '2–8°C' },
      { label: 'Shelf life', value: '24 months' },
    ],
    applications: ['Capsules', 'Powder sachets', 'Sublingual'],
  },
  'coenzyme-q10': {
    shortDesc: 'Ubiquinone ≥98% — cellular energy and cardiovascular protection.',
    benefits: ['Cardiovascular', 'Energy', 'Antioxidant'],
    specs: [
      { label: 'Assay', value: 'Ubiquinone ≥ 98%' },
      { label: 'Form', value: 'Pale yellow powder' },
      { label: 'Storage', value: 'Dry, protect from light' },
      { label: 'Shelf life', value: '36 months' },
    ],
    applications: ['Softgels', 'Capsules', 'Tablets'],
  },
  'green-tea-extract': {
    shortDesc: 'EGCG ≥50% — antioxidant, brightening, oil control.',
    benefits: ['Antioxidant', 'Brightening', 'Pore refinement'],
    specs: [
      { label: 'Assay', value: 'EGCG ≥ 50%' },
      { label: 'Form', value: 'Extract powder' },
      { label: 'Storage', value: 'Dry, cool storage' },
      { label: 'Shelf life', value: '24 months' },
    ],
    applications: ['Serum', 'Moisturizer cream', 'Capsules'],
  },
  retinol: {
    shortDesc: 'Pure retinol — anti-aging, collagen stimulation.',
    benefits: ['Anti-aging', 'Skin renewal', 'Smoothing'],
    specs: [
      { label: 'Assay', value: '1,000,000 IU/g' },
      { label: 'Form', value: 'Pale yellow oil' },
      { label: 'Storage', value: '2–8°C, protect from light' },
      { label: 'Shelf life', value: '24 months' },
    ],
    applications: ['Serum', 'Moisturizer cream'],
  },
  niacinamide: {
    shortDesc: 'Vitamin B3 ≥99% — brightening, pore refinement, oil balance.',
    benefits: ['Brightening', 'Pore refinement', 'Barrier repair'],
    specs: [
      { label: 'Assay', value: '≥ 99%' },
      { label: 'Form', value: 'White powder' },
      { label: 'Storage', value: 'Dry, protect from moisture' },
      { label: 'Shelf life', value: '36 months' },
    ],
    applications: ['Serum', 'Moisturizer cream', 'Capsules'],
  },
  'glucosamine-sulfate': {
    shortDesc: 'Glucosamine sulfate 2KCl — cartilage and joint support.',
    benefits: ['Joint & bone', 'Cartilage support', 'Mobility'],
    specs: [
      { label: 'Assay', value: 'Glucosamine ≥ 83%' },
      { label: 'Form', value: 'White powder' },
      { label: 'Storage', value: 'Dry, cool storage' },
      { label: 'Shelf life', value: '36 months' },
    ],
    applications: ['Capsules', 'Tablets', 'Powder sachets'],
  },
  astaxanthin: {
    shortDesc: 'Natural astaxanthin from algae — antioxidant potency beyond vitamin E.',
    benefits: ['Antioxidant', 'Eye health', 'Skin & anti-aging'],
    specs: [
      { label: 'Assay', value: 'Astaxanthin ≥ 2%' },
      { label: 'Form', value: 'Deep red oil' },
      { label: 'Storage', value: '2–8°C, protect from light' },
      { label: 'Shelf life', value: '24 months' },
    ],
    applications: ['Softgels', 'Capsules', 'Emulsion'],
  },
  'zinc-picolinate': {
    shortDesc: 'Picolinate zinc — high bioavailability, immune and skin support.',
    benefits: ['Immune support', 'Acne-prone skin', 'Protein synthesis'],
    specs: [
      { label: 'Assay', value: 'Zinc ≥ 20%' },
      { label: 'Form', value: 'White powder' },
      { label: 'Storage', value: 'Dry, cool storage' },
      { label: 'Shelf life', value: '36 months' },
    ],
    applications: ['Capsules', 'Tablets', 'Powder sachets'],
  },
  'ceramide-complex': {
    shortDesc: 'Ceramide complex — skin barrier repair and deep moisture retention.',
    benefits: ['Skin recovery', 'Moisture retention', 'Irritation relief'],
    specs: [
      { label: 'Assay', value: 'Ceramide ≥ 5%' },
      { label: 'Form', value: 'Lipid powder' },
      { label: 'Storage', value: 'Dry, cool storage' },
      { label: 'Shelf life', value: '24 months' },
    ],
    applications: ['Serum', 'Moisturizer cream'],
  },
}

function mapValue<T extends string>(value: T, map: Record<string, string>): string {
  return map[value] ?? value
}

function translateSpecs(specs: Ingredient['specs'], slugOverride?: Ingredient['specs']): Ingredient['specs'] {
  if (slugOverride) return slugOverride
  return specs.map((s) => ({
    label: mapValue(s.label, SPEC_LABEL_EN),
    value: mapValue(s.value, SPEC_VALUE_EN),
  }))
}

export function translateIngredientFields(ingredient: Ingredient): Ingredient {
  const slugEn = INGREDIENT_SLUG_EN[ingredient.slug]

  return {
    ...ingredient,
    category: slugEn?.category ?? mapValue(ingredient.category, CATEGORY_EN),
    industry: (slugEn?.industry ??
      mapValue(ingredient.industry, INDUSTRY_EN)) as Ingredient['industry'],
    origin: slugEn?.origin ?? mapValue(ingredient.origin, ORIGIN_EN),
    shortDesc: slugEn?.shortDesc ?? ingredient.shortDesc,
    overview: slugEn?.overview ?? ingredient.overview,
    benefits: slugEn?.benefits ?? ingredient.benefits.map((b) => mapValue(b, BENEFIT_EN)),
    suggestedDosage:
      slugEn?.suggestedDosage ??
      (ingredient.suggestedDosage
        ? ingredient.suggestedDosage
            .replace(/\/ngày/g, '/day')
            .replace(/\(tham khảo[^)]*\)/g, '(reference only)')
            .replace(/Theo công thức Gastroheal — liên hệ chuyên gia/, 'Per Gastroheal formulation — contact our specialists')
        : ingredient.suggestedDosage),
    applications:
      slugEn?.applications ??
      ingredient.applications.map((a) => mapValue(a, APPLICATION_EN)),
    specs: translateSpecs(ingredient.specs, slugEn?.specs),
  }
}

// ─── English content overrides ─────────────────────────────────────────────

export const enOverrides = {
  INDUSTRIES: ['Pharmaceuticals', 'Nutraceuticals', 'Cosmetics'] as const,

  APPLICATION_TYPES: [
    'Capsules',
    'Tablets',
    'Powder sachets',
    'Emulsion',
    'Serum',
    'Moisturizer cream',
    'Functional beverages',
    'Sublingual',
  ] as const,

  CASE_STUDIES: [
    {
      slug: 'vivomega',
      brand: 'vivomega®',
      partner: 'GC Rieber Oils',
      kpi: '500K USD',
      kpiLabel: 'annual revenue — from zero',
      industry: 'Nutraceuticals',
      image: 'oil' as const,
      coverImage: '/images/vivomega.png',
      tags: ['Co-creation', 'Oils & Omega'],
      summary: 'Building a premium omega-3 category in Vietnam with GC Rieber Oils.',
      problem:
        'The Vietnamese market lacked a high-quality omega-3 line with transparent sourcing and international-grade standards.',
      solution:
        'Bioscope co-created with GC Rieber Oils: selected IFOS 5★ pure TG fish oil, built brand positioning and storytelling, and supported regulatory compliance and commercialization.',
      result: [
        'From 0 → USD 500,000 annual revenue',
        'Established a premium omega-3 category',
        'Stable distribution network',
      ],
      coCreateSteps: [
        'Premium omega-3 segment analysis',
        'IFOS 5★ TG fish oil selection',
        'Brand building & distribution channels',
        'Sustainable revenue scaling',
      ],
      testimonial:
        'Bioscope did more than supply ingredients — they partnered from positioning through commercialization, helping us create an entirely new category in Vietnam.',
    },
    {
      slug: 'gastroheal',
      brand: 'Gastroheal',
      partner: 'Wet Phytosome',
      kpi: '70%+',
      kpiLabel: 'revenue from word of mouth',
      industry: 'Pharmaceuticals',
      image: 'microscope' as const,
      coverImage: '/images/gastroheal.png',
      tags: ['Wet Phytosome', 'Digestive'],
      summary: 'A trusted gastric solution — fast pain relief and mucosal recovery.',
      problem:
        'The market lacked a gastric solution that both relieves pain quickly and genuinely repairs mucosal damage.',
      solution:
        'Applied exclusive wet Phytosome technology — curcuminoid + phosphatidylcholine complex, enhancing bioavailability and mucosal recovery.',
      result: [
        'Pain relief within 30 minutes',
        '53%+ ulcer healing after 2 months',
        '70%+ revenue from word of mouth',
      ],
      coCreateSteps: [
        'Wet Phytosome mechanism research',
        'Formula & claim optimization',
        'Real-world clinical validation',
        'Launch & word-of-mouth growth',
      ],
      testimonial:
        'Wet Phytosome technology made a clear difference — users feel fast results and confidently recommend it to family and friends.',
    },
    {
      slug: 'pea',
      brand: 'PEA',
      partner: 'PolymerSolution',
      kpi: '#1',
      kpiLabel: 'Category Creator in Vietnam',
      industry: 'Cosmetics',
      image: 'labWork' as const,
      coverImage: '/images/pea.png',
      tags: ['Proprietary technology', 'Dermatology'],
      summary: 'Pioneering transdermal anti-inflammatory solutions with 24-hour slow release.',
      problem:
        'No slow-release transdermal anti-inflammatory solution with sustained efficacy existed in the Vietnamese market.',
      solution:
        'Pioneered Polymerit transdermal drug delivery technology, creating a new category with continuous 24-hour therapy.',
      result: [
        'Category Creator',
        'Continuous 24-hour therapy',
        'Broad dermatology & cosmetics applications',
      ],
      coCreateSteps: [
        'Dermatology market gap assessment',
        'Polymerit application',
        'New category creation',
        'Product portfolio expansion',
      ],
      testimonial:
        'Polymerit helped us sell more than a product — we created a new niche: continuous 24-hour therapy through the skin.',
    },
  ],

  SOLUTIONS: [
    {
      slug: 'cung-cap-nguyen-lieu',
      title: 'Specialty ingredient supply',
      forWho:
        'Companies with in-house R&D teams needing rare, high-quality ingredients with full regulatory documentation.',
      receive: [
        '100+ specialty ingredients',
        'Complete COA / TDS / SDS',
        'Fast sample delivery',
        'Stable supply from 50+ countries',
      ],
      cta: 'Explore ingredients',
      summary:
        'A catalog of rare, proven-performance actives — ideal when you already have product development capability and need a trusted supply source.',
      process: [
        {
          step: 'Technical consultation',
          desc: 'Identify ingredients, assay levels, and certifications aligned with your formula and target market.',
        },
        {
          step: 'Samples & documentation',
          desc: 'Provide trial samples, public TDS, and gated COA/SDS for in-depth evaluation.',
        },
        {
          step: 'Negotiation & supply',
          desc: 'Agree on MOQ, delivery schedule, and import compliance support when needed.',
        },
        {
          step: 'Post-sale partnership',
          desc: 'New batch updates, equivalent substitutions, and formula optimization advice as you scale.',
        },
      ],
      idealFor: [
        'Manufacturers with production lines and internal R&D',
        'Brands needing rare or highly standardized ingredients',
        'Formulators requiring complete COA/TDS for product registration',
      ],
      expectedOutcomes: [
        'Reduce sourcing time from weeks to days',
        'Lower quality risk through transparent traceability',
        'Long-term supply chain stability',
      ],
      faq: [
        {
          q: 'Does Bioscope publish prices publicly?',
          a: 'No — pricing depends on MOQ, batch, and negotiation. Please contact us for a tailored quote.',
        },
        {
          q: 'What is the minimum MOQ?',
          a: 'Varies by ingredient, typically 5–25 kg. Some exclusive items have lower MOQs for trial evaluation.',
        },
        {
          q: 'Where can I get TDS and COA?',
          a: 'TDS is available on each ingredient page. COA and SDS require a business email via the document download form.',
        },
      ],
      relatedCaseSlugs: ['vivomega'],
    },
    {
      slug: 'phat-trien-cong-thuc-odm',
      title: 'Formulation development & ODM',
      forWho: 'Brands with a concept who need a partner to build formulas and manufacture.',
      receive: [
        'Dedicated R&D team',
        'Efficacy/cost-optimized formulas',
        'Validation & prototyping',
        'Regulatory and production support',
      ],
      cta: 'Learn about ODM services',
      summary:
        'From idea to finished formula — Bioscope partners with formulators, validates efficacy, and supports commercialization.',
      process: [
        {
          step: 'Brief & objectives',
          desc: 'Clarify segment, claims, budget, and regulatory constraints (nutraceuticals, cosmetics, pharmaceuticals).',
        },
        {
          step: 'Formula proposal',
          desc: 'Select ingredients and technologies (Phytosome, nano…) optimized for efficacy and cost.',
        },
        {
          step: 'Prototyping & testing',
          desc: 'Pilot batches, sensory, stability, and safety testing to industry standards.',
        },
        {
          step: 'Scale-up & launch',
          desc: 'GMP factory selection, registration dossiers, and commercial production rollout.',
        },
      ],
      idealFor: [
        'Startup brands with a clear concept but no internal lab',
        'Brands launching new product lines quickly',
        'Companies needing end-to-end ODM from formula to packaging',
      ],
      expectedOutcomes: [
        'Differentiated formulas through proprietary ingredients and technology',
        'Fewer trial-and-error cycles thanks to 23+ R&D projects',
        'Clear roadmap from prototype to mass production',
      ],
      faq: [
        {
          q: 'How is ODM different from buying raw ingredients?',
          a: 'ODM includes formula research, prototyping, validation, and production support — not just ingredient delivery.',
        },
        {
          q: 'How long until I receive a prototype?',
          a: 'Typically 4–8 weeks depending on complexity; a specific timeline is estimated after the initial brief.',
        },
        {
          q: 'Does Bioscope support product registration?',
          a: 'Yes — we provide technical documents, COA, and coordinate with registration bodies per Vietnamese regulations.',
        },
      ],
      relatedCaseSlugs: ['gastroheal'],
    },
    {
      slug: 'dong-kien-tao-toan-hanh-trinh',
      title: 'End-to-end co-creation',
      forWho: 'Brand developers building large, sustainable brands from scratch.',
      receive: [
        'Market analysis & pricing',
        'Formula development',
        'Pre-production market testing',
        'Commercialization & growth',
      ],
      cta: 'Start your journey',
      summary:
        'A strategic partner from idea to growth — market research first, production only when signals are clear.',
      heroQuote:
        'You have a brand idea. We have the science and market experience. Many brand developers fail by making product first and finding the market later.',
      process: [
        {
          step: 'Market discovery',
          desc: 'Analyze segments, competitors, sales channels, and pricing before committing to production.',
        },
        {
          step: 'Value design',
          desc: 'Brand positioning, formula, and differentiated science storytelling.',
        },
        {
          step: 'Signal testing',
          desc: 'Online/offline trials with small batches to confirm real demand.',
        },
        {
          step: 'Commercialization',
          desc: 'Scale production, distribution, and portfolio optimization based on sales data.',
        },
        {
          step: 'Long-term growth',
          desc: 'SKU expansion, cost optimization, and science-led marketing partnership.',
        },
      ],
      idealFor: [
        'Brand developers launching from zero',
        'Founders needing a strategic partner, not just a supplier',
        'Brands targeting sustainable growth with healthy margins',
      ],
      expectedOutcomes: [
        'Lower inventory risk by validating the market first',
        'Higher new product success rates',
        'Build categories with lasting competitive advantage',
      ],
      faq: [
        {
          q: 'How is co-creation different from ODM?',
          a: 'Co-creation covers market strategy, pricing, and growth — ODM focuses on formulation and manufacturing.',
        },
        {
          q: 'Does Bioscope participate in distribution?',
          a: 'We support channel strategy and commercialization; specific models are agreed per project.',
        },
        {
          q: 'Success examples?',
          a: 'vivomega® (0 → USD 500K/year), Gastroheal (70%+ word of mouth), PEA (Category Creator in Vietnam).',
        },
      ],
      relatedCaseSlugs: ['vivomega', 'pea', 'gastroheal'],
    },
  ],

  SOLUTIONS_ICP: [
    {
      priority: 'Priority 1',
      title: 'Brand developers / startups',
      desc: 'Launching new products — best fit for end-to-end co-creation & ODM, highest partnership value.',
      solution: 'dong-kien-tao-toan-hanh-trinh',
    },
    {
      priority: 'Priority 2',
      title: 'Brands upgrading / expanding lines',
      desc: 'Need proprietary technology (wet Phytosome, Polymerit) for differentiation.',
      solution: 'phat-trien-cong-thuc-odm',
    },
    {
      priority: 'Priority 3',
      title: 'Manufacturers needing ingredients',
      desc: 'Pure ingredient transactions, high volume — best fit for the specialty catalog.',
      solution: 'cung-cap-nguyen-lieu',
    },
  ],

  TECHNOLOGIES: [
    {
      name: 'Wet Phytosome technology',
      product: 'Gastroheal',
      mechanism:
        'A complex of phosphatidylcholine (a gastric mucosa component) and curcuminoids (natural anti-inflammatory), delivering superior bioavailability and mucosal "repair" for ulcers.',
      highlights: [
        'Gastric pain relief within 30 minutes',
        'Over 53% of patients healed ulcers after 2 months',
        'Over 70% of revenue from word of mouth',
      ],
      applications: ['Digestive', 'Anti-inflammatory'],
    },
    {
      name: 'Polymerit technology',
      product: '24-hour continuous transdermal therapy',
      mechanism:
        'Slow-release transdermal drug delivery, sustaining action for a full 24 hours each day — "continuous therapy".',
      highlights: [
        'Wound dressings, psoriasis, atopic dermatitis',
        'High-performance cosmetics: brightening, sun care, acne treatment',
        'Next-generation medical devices & topical drugs',
      ],
      applications: ['Dermatology', 'High-performance cosmetics'],
    },
  ],

  COMPANY_STATS: [
    { value: '15+', label: 'Years of experience' },
    { value: '23+', label: 'R&D projects' },
    { value: '14', label: 'Patent applications' },
    { value: '100+', label: 'New ingredients' },
  ],

  TRUST_PILLARS: [
    {
      title: 'Specialty ingredients',
      desc: 'A catalog of rare, proven-performance actives — from botanical extracts to nano technology.',
    },
    {
      title: 'Global quality assurance',
      desc: 'Full GMP, ISO 22000, HACCP, Halal, Kosher certifications and transparent technical documentation.',
    },
    {
      title: 'Stable supply chain',
      desc: 'Direct partnerships with R&D manufacturers in 50+ countries — long-term supply stability.',
    },
  ],

  ABOUT_TIMELINE: [
    {
      year: '2011',
      text: 'Bioscope founded, beginning the journey in pharmaceutical technology research and distribution.',
    },
    {
      year: '2015–2018',
      text: 'Expanded specialty ingredient portfolio and partnered with international leaders Indena, GC Rieber Oils, and Sabinsa.',
    },
    {
      year: '2019–2022',
      text: 'Developed wet Phytosome & Polymerit technologies; launched Gastroheal and dermatology applications.',
    },
    {
      year: '2023–present',
      text: 'Co-created vivomega® and new brands; 23+ R&D projects, 14 patents, 100+ new ingredients.',
    },
  ],

  ABOUT_DIFFERENTIATION: {
    title: 'Technology distributor — not just an ingredient supplier',
    description:
      'Unlike pure ingredient vendors, Bioscope is a strategic partner from idea to commercialization. We engage early: research ideas, analyze markets, choose segments, channels, and pricing — then build formulas and test demand, producing only when signals are strong. Vietnam\'s partner of choice for premium ingredients and breakthrough innovation.',
  },

  ABOUT_CORE_VALUES: [
    {
      title: 'Science-led',
      desc: 'Every decision grounded in evidence, mechanism of action, and market data.',
    },
    {
      title: 'Efficacy & cost balance',
      desc: 'Optimized formulas so consumers receive real value at a fair cost.',
    },
    {
      title: 'Long-term partnership',
      desc: 'We do not deliver and disappear — we grow with your brand sustainably.',
    },
    {
      title: 'Continuous innovation',
      desc: '23+ R&D projects, 14 patents, and ongoing introduction of new technologies to Vietnam.',
    },
  ],

  ABOUT_PRODUCT_PROCESS: {
    title: 'Product development process with Bioscope',
    description:
      'From initial idea to sustainable growth — Bioscope partners through 5 clear, science-driven, measurable stages.',
    image: '/images/quy-trinh.jpg',
    imageAlt: 'Product development process with Bioscope — 5 steps from idea to long-term growth',
    steps: [
      { n: '01', title: 'Ideation', desc: 'Understand needs and market trends.' },
      {
        n: '02',
        title: 'Research & solution design',
        desc: 'Deep analysis of market needs and product objectives.',
      },
      {
        n: '03',
        title: 'Validation & testing',
        desc: 'Assess efficacy, safety, and optimize the formula.',
      },
      {
        n: '04',
        title: 'Development & launch',
        desc: 'Smooth handoff and product communication support.',
      },
      {
        n: '05',
        title: 'Growth & long-term partnership',
        desc: 'Optimize products and sustain development together.',
      },
    ],
  },

  CO_CREATE_COMPARISON: {
    traditional: [
      'Deliver ingredients per order',
      'Clients research markets independently',
      'Risk of producing before knowing demand',
      'Relationship ends when delivery is complete',
    ],
    bioscope: [
      'Partner from ideation and market analysis',
      'Propose efficacy/cost-optimized formulas',
      'Test market signals before scaling',
      'Continuous growth and optimization after launch',
    ],
  },

  CO_CREATE_STEP_DURATIONS: [
    { step: 'Ideation & analysis', duration: '2–4 weeks' },
    { step: 'Research & proposal', duration: '4–8 weeks' },
    { step: 'Validation & testing', duration: '6–12 weeks' },
    { step: 'Development & launch', duration: '8–16 weeks' },
    { step: 'Long-term growth', duration: 'Ongoing' },
  ],

  RD_RESEARCH_AREAS: [
    'Bioavailability & phytosome',
    'Transdermal delivery & Polymerit',
    'Nano actives',
    'Probiotics & digestion',
    'Anti-aging & cognition',
    'Dermatology & high-performance cosmetics',
  ],

  RD_WHITEPAPERS: [
    {
      title: 'Curcumin bioavailability: from phytosome to clinical efficacy',
      type: 'Whitepaper',
      gated: true,
    },
    {
      title: 'Polymerit technology — 24-hour continuous transdermal therapy',
      type: 'E-book',
      gated: true,
    },
    {
      title: 'Why test the market before manufacturing?',
      type: 'Expert blog',
      gated: false,
    },
  ],

  INGREDIENT_PAGE_INTRO: {
    title: 'Specialty ingredients for every possibility',
    description:
      '100+ high-performance ingredients for pharmaceuticals, nutraceuticals, and cosmetics — full technical documentation and samples available. Each ingredient includes TDS, COA, and SDS via a hybrid model: public or lightly gated TDS; COA/SDS via business email to ensure quality leads. Prices are not published — please request a quote or samples directly from the ingredient detail page.',
    quickFilters: [
      'Botanical extracts',
      'Oils & Omega',
      'Amino acids',
      'Functional actives',
      'Nano materials',
    ],
  },

  CONTACT_FAQ: [
    {
      q: 'Does Bioscope accept small orders / samples?',
      a: 'Yes, most ingredients have flexible MOQs (5–25 kg) and samples available. Some exclusive items have lower MOQs for initial evaluation.',
    },
    {
      q: 'How long does the co-creation process take?',
      a: 'Depends on complexity; typically 4–6 months from idea to launch. A specific timeline is estimated after the first consultation.',
    },
    {
      q: 'How do I get technical documents (TDS, COA)?',
      a: 'TDS is available on ingredient pages. COA and SDS require a business email — files are sent automatically after form submission.',
    },
    {
      q: 'Does Bioscope support nutraceutical/cosmetic product registration?',
      a: 'Yes — we provide technical documents, COA, and coordinate with registration bodies per Vietnamese regulations.',
    },
    {
      q: 'Can I request a quote through the website?',
      a: 'Yes — use the Contact form or "Request samples" in the header. Our team responds within 24 business hours.',
    },
  ],

  CERTIFICATION_DETAILS: [
    {
      name: 'GMP',
      desc: 'Good Manufacturing Practice — ensures consistent product quality standards.',
    },
    {
      name: 'ISO 22000',
      desc: 'International food safety management system standard.',
    },
    {
      name: 'HACCP',
      desc: 'Hazard analysis and critical control points in production.',
    },
    {
      name: 'Halal',
      desc: 'Meets Islamic dietary consumption requirements.',
    },
    {
      name: 'Kosher',
      desc: 'Meets Jewish dietary consumption requirements.',
    },
  ],

  FAQ_PAGE: {
    title: 'Frequently asked questions',
    description:
      'Quick answers about ingredients, co-creation process, technical documentation, and working with Bioscope.',
    groups: [
      {
        title: 'Ingredients & samples',
        items: [
          {
            q: 'Does Bioscope accept small orders / samples?',
            a: 'Yes, most ingredients have flexible MOQs (5–25 kg) and samples available. Some exclusive items have lower MOQs for initial evaluation.',
          },
          {
            q: 'How do I get technical documents (TDS, COA)?',
            a: 'TDS is available on ingredient pages. COA and SDS require a business email — files are sent automatically after form submission.',
          },
          {
            q: 'Are ingredient prices shown on the website?',
            a: 'No — pricing depends on volume, contract term, and delivery terms. Please contact us or request a quote via the Contact form.',
          },
        ],
      },
      {
        title: 'Solutions & co-creation',
        items: [
          {
            q: 'How long does the co-creation process take?',
            a: 'Depends on complexity; typically 4–6 months from idea to launch. A specific timeline is estimated after the first consultation.',
          },
          {
            q: 'How is Bioscope different from a typical ingredient supplier?',
            a: 'We are a strategic partner — from market analysis, segment selection, and formula development through demand testing to commercialization — not just delivery.',
          },
          {
            q: 'Does Bioscope support nutraceutical/cosmetic product registration?',
            a: 'Yes — we provide technical documents, COA, and coordinate with registration bodies per Vietnamese regulations.',
          },
        ],
      },
      {
        title: 'Contact & support',
        items: [
          {
            q: 'Can I request a quote through the website?',
            a: 'Yes — use the Contact form or "Request samples" in the header. Our team responds within 24 business hours.',
          },
          {
            q: 'What is the expected response time?',
            a: 'Within 24 business hours. Our specialists will reach out to understand your needs and propose next steps.',
          },
          {
            q: 'Which channels can I use to contact you?',
            a: 'Via the Contact form, business email, or Zalo OA (coming soon). Hotline and office address are being updated.',
          },
        ],
      },
    ],
  },

  RESOURCE_ITEMS: [
    {
      slug: 'sinh-kha-dung-curcumin-phytosome',
      title: 'Bioavailability of curcumin: from phytosome to clinical efficacy',
      category: 'Whitepaper',
      desc: 'Analysis of wet Phytosome mechanism and comparison with conventional curcumin.',
      gated: true,
    },
    {
      slug: 'test-thi-truong-truoc-khi-lam-hang',
      title: 'Why test the market before manufacturing?',
      category: 'Blog',
      desc: 'A demand-validation process that reduces investment risk for new brands.',
      gated: false,
    },
    {
      slug: 'dong-kien-tao-nhan-hang-trieu-do',
      title: 'Co-creating million-dollar brands — a 5-step process',
      category: 'Webinar',
      desc: 'Recorded session with the R&D team and the vivomega® case study.',
      gated: true,
    },
    {
      slug: 'chung-nhan-gmp-halal-kosher',
      title: 'GMP, Halal, Kosher certifications — a formulator guide',
      category: 'Formulator',
      desc: 'What each certification means and how to choose ingredients for your target market.',
      gated: false,
    },
    {
      slug: 'omega-3-tg-vs-ee',
      title: 'Omega-3 TG vs EE: what matters to consumers?',
      category: 'Blog',
      desc: 'Bioavailability comparison and positioning for supplement brands.',
      gated: false,
    },
    {
      slug: 'cong-nghe-polymerit-da-lieu',
      title: 'Polymerit technology in high-performance dermatology & cosmetics',
      category: 'Whitepaper',
      desc: '24-hour slow-release mechanism and real-world applications in Vietnam.',
      gated: true,
    },
    {
      slug: 'checklist-cong-thuc-tpcn',
      title: 'Dietary supplement formula checklist — 12 steps before production',
      category: 'Formulator',
      desc: 'Verification list from active selection and dosing to registration dossiers.',
      gated: false,
    },
    {
      slug: 'infographic-phytosome-uot',
      title: 'Infographic: Wet Phytosome mechanism in one page',
      category: 'Infographic',
      desc: 'Visual summary of bioavailability and applications in supplements and pharma.',
      gated: false,
    },
    {
      slug: 'infographic-quy-trinh-launch',
      title: 'New product launch checklist — the first 8 weeks',
      category: 'Infographic',
      desc: 'Roadmap from idea validation and market testing to production readiness.',
      gated: true,
    },
    {
      slug: 'ebook-phat-trien-nhan-hang-tpcn',
      title: 'E-book: Developing dietary supplement brands from A to Z',
      category: 'E-book',
      desc: 'Guide to segment selection, formulation, sales channels, and positioning.',
      gated: true,
    },
  ],

  RESOURCE_CATEGORIES: [
    {
      slug: 'whitepaper-ebook',
      title: 'Whitepaper / E-book',
      shortDesc: 'In-depth research on technology mechanisms and bioavailability.',
      description:
        'Whitepapers and e-books from the Bioscope R&D team — analyzing mechanisms of action, bioavailability, and real-world application evidence. Some documents require email registration to download.',
      image: 'labWork' as const,
      filterCategories: ['Whitepaper', 'E-book'],
    },
    {
      slug: 'blog-chuyen-mon',
      title: 'Expert blog',
      shortDesc: 'Knowledge on brand development, formulation, and market strategy.',
      description:
        'In-depth articles on brand development, formula building, ingredient trends, and market strategy — repurposing existing R&D assets, supporting SEO, and nurturing the formulator community.',
      image: 'botanical' as const,
      filterCategories: ['Blog'],
    },
    {
      slug: 'video-webinar',
      title: 'Video webinars',
      shortDesc: 'Online sessions with R&D experts and partners.',
      description:
        'Recorded webinars, workshops, and experience sharing from Bioscope specialists and international partners — co-creation process, new technologies, and real case studies.',
      image: 'glassware' as const,
      filterCategories: ['Webinar'],
    },
    {
      slug: 'case-study',
      title: 'Case studies',
      shortDesc: 'Real lessons from vivomega®, Gastroheal, and co-created brands.',
      description:
        'True success stories — the challenge, Bioscope\'s solution, and measurable results. Each case study shows how we partner from idea to market growth.',
      image: 'field' as const,
      useCaseStudies: true,
    },
    {
      slug: 'huong-dan-formulator',
      title: 'Formulator guides',
      shortDesc: 'Formula checklists, GMP/Halal/Kosher certifications, and registration process.',
      description:
        'Practical resources for formulators and product developers — formula checklists, certification guidance, and nutraceutical/cosmetic registration preparation per Vietnamese regulations.',
      image: 'capsules' as const,
      filterCategories: ['Formulator'],
    },
    {
      slug: 'infographic-checklist',
      title: 'Infographics & checklists',
      shortDesc: 'Visual summaries of Phytosome, Polymerit mechanisms, and product launch process.',
      description:
        'Quick-download infographics and checklists — technology mechanism summaries, launch process, and pre-production verification steps, ideal for internal sharing or team training.',
      image: 'powder' as const,
      filterCategories: ['Infographic'],
    },
  ],

  PRIVACY_POLICY: {
    title: 'Privacy policy',
    updated: 'Updated: June 2026',
    intro:
      'Bioscope is committed to protecting your personal information when you visit our website and use our services. This policy describes how we collect, use, and safeguard your data.',
    sections: [
      {
        title: '1. Information we collect',
        paragraphs: [
          'Information you provide via Contact forms, sample requests, newsletter sign-ups, or gated document downloads: name, business email, phone number, company name, and needs description.',
          'Automatically collected technical data: IP address, browser type, pages viewed, and visit duration — collected via cookies and analytics tools (Google Analytics 4) to improve your experience.',
        ],
      },
      {
        title: '2. How we use your information',
        paragraphs: [
          'Respond to consultation, quote, sample, and technical document requests (TDS, COA, whitepapers).',
          'Send expert newsletters when you subscribe — you may unsubscribe at any time.',
          'Analyze site behavior to optimize content and user experience.',
        ],
      },
      {
        title: '3. Information sharing',
        paragraphs: [
          'Bioscope does not sell or rent personal data. Information is shared only with service providers as needed (email, CRM, hosting) under equivalent confidentiality commitments.',
          'We may disclose information when required by law or to protect the legitimate rights of Bioscope and users.',
        ],
      },
      {
        title: '4. Security & your rights',
        paragraphs: [
          'Data is stored on systems with appropriate security measures. We maintain restricted access and train staff on data handling.',
          'You may request access, correction, or deletion of your personal information via the Contact form on this website.',
        ],
      },
      {
        title: '5. Contact',
        paragraphs: [
          'For privacy policy questions, please contact Bioscope via the Contact page on this website.',
        ],
      },
    ],
  },

  TERMS_OF_USE: {
    title: 'Terms of use',
    updated: 'Updated: June 2026',
    intro:
      'By accessing and using the Bioscope website, you agree to the terms below. Please read carefully before use.',
    sections: [
      {
        title: '1. Scope',
        paragraphs: [
          'This website provides information about Bioscope ingredients, solutions, R&D, and co-creation services for business (B2B) customers.',
          'Content is for professional reference only — it does not replace medical, legal, or official product registration advice.',
        ],
      },
      {
        title: '2. Use of content',
        paragraphs: [
          'Text, images, logos, and downloadable materials are owned by Bioscope or licensed partners. Do not copy, redistribute, or use commercially without written consent.',
          'Technical documents (TDS, COA, whitepapers) are for ingredient evaluation and product development only — do not share publicly if marked confidential.',
        ],
      },
      {
        title: '3. User responsibilities',
        paragraphs: [
          'You agree to provide accurate contact information when submitting forms. Do not use this website for fraud, spam, or unlawful purposes.',
          'Dosage, formulas, and ingredient applications on this site are for reference only — product registration and safety responsibility rests with the brand developer.',
        ],
      },
      {
        title: '4. Limitation of liability',
        paragraphs: [
          'Bioscope strives to keep information accurate and current but does not guarantee uninterrupted or error-free website operation.',
          'Bioscope is not liable for indirect damages arising from use of website information outside the scope of a signed supply agreement.',
        ],
      },
      {
        title: '5. Changes to terms',
        paragraphs: [
          'Bioscope may update these terms over time. New versions take effect when posted on this website. Continued use constitutes acceptance of updated terms.',
        ],
      },
    ],
  },

  BLOG_TOPICS: [
    'Brand development',
    'Formulation & formulator',
    'Ingredients & technology',
    'Market & trends',
    'Certifications & regulations',
  ] as const,

  BLOG_INDUSTRIES: ['Nutraceuticals', 'Cosmetics', 'Pharmaceuticals', 'Multi-industry'] as const,
}
