import type { BlogComment, BlogPost, BlogSection } from './content'
import { BLOG_INDUSTRIES, BLOG_TOPICS } from './content'

export const BLOG_TOPICS_EN = [
  'Brand development',
  'Formulation & formulator',
  'Ingredients & technology',
  'Market & trends',
  'Certifications & regulations',
] as const

export const BLOG_INDUSTRIES_EN = [
  'Nutraceuticals',
  'Cosmetics',
  'Pharmaceuticals',
  'Multi-industry',
] as const

export const TOPIC_VI_TO_EN: Record<string, string> = {
  [BLOG_TOPICS[0]]: BLOG_TOPICS_EN[0],
  [BLOG_TOPICS[1]]: BLOG_TOPICS_EN[1],
  [BLOG_TOPICS[2]]: BLOG_TOPICS_EN[2],
  [BLOG_TOPICS[3]]: BLOG_TOPICS_EN[3],
  [BLOG_TOPICS[4]]: BLOG_TOPICS_EN[4],
}

export const INDUSTRY_VI_TO_EN: Record<string, string> = {
  [BLOG_INDUSTRIES[0]]: BLOG_INDUSTRIES_EN[0],
  [BLOG_INDUSTRIES[1]]: BLOG_INDUSTRIES_EN[1],
  [BLOG_INDUSTRIES[2]]: BLOG_INDUSTRIES_EN[2],
  [BLOG_INDUSTRIES[3]]: BLOG_INDUSTRIES_EN[3],
}

export const SECTION_TITLES_EN = [
  'Context & challenge',
  'Analysis & solution',
  'Conclusion & next steps',
] as const

export const BLOG_AUTHOR_EN = 'Bioscope R&D Team'

export const BLOG_SAMPLE_COMMENTS_EN: BlogComment[] = [
  {
    id: 'c1',
    author: 'Nguyễn Minh Anh',
    role: 'Formulator',
    company: 'NovaHealth',
    date: '2026-06-18',
    content:
      'Highly practical article — especially the section on validating before production. Our team applied the approach and significantly reduced inventory risk.',
  },
  {
    id: 'c2',
    author: 'Trần Hoàng Long',
    role: 'Product Manager',
    company: 'GreenLab VN',
    date: '2026-06-12',
    content:
      'Thank you, Bioscope, for sharing such a clear case study. We would love to see more articles on premium nutraceutical positioning.',
  },
]

export const BLOG_SLUG_EN: Record<string, { title: string; excerpt: string; body: string[] }> = {
  'test-thi-truong-truoc-khi-lam-hang': {
    title: 'Why test the market before manufacturing?',
    excerpt:
      'A demand-validation workflow reduces investment risk for new brands — manufacture only when signals are clear.',
    body: [
      'Many brands fail not because the formula is weak, but because they manufacture before understanding the market. Bioscope recommends validating ideas through surveys, landing-page tests, or small trial sales before committing to large MOQs.',
      'Suggested workflow: define the segment → articulate core value → test messaging → collect leads/emails → evaluate conversion signals. Only when data is positive should you move forward with formulation and production.',
      'This approach is especially suited to nutraceutical and cosmetics startups with limited budgets — reducing inventory risk and improving product-market fit from day one.',
    ],
  },
  'omega-3-tg-vs-ee': {
    title: 'Omega-3 TG vs EE: what matters to consumers?',
    excerpt:
      'Comparing bioavailability, safety, and positioning strategies for premium nutraceutical brands.',
    body: [
      'Fish oil omega-3 comes in triglyceride (TG) or ethyl ester (EE) form. TG is the natural form, with higher bioavailability and is often preferred in the premium segment.',
      'EE can achieve higher EPA/DHA concentrations during refinement, but label communication must be clear so consumers understand the difference. Positioning should rest on bioavailability evidence and certifications (IFOS, Friend of the Sea, etc.).',
      'When building an omega-3 brand in Vietnam, consider target audience, raw-material budget, and differentiation messaging — Bioscope helps select the right grade from GC Rieber Oils and international partners.',
    ],
  },
  'phat-trien-nhan-hang-tpcn-tu-a-z': {
    title: 'Building a nutraceutical brand A–Z: 7 practical steps',
    excerpt:
      'A roadmap from idea and segment selection through formulation to launch in the Vietnamese market.',
    body: [
      'Steps 1–2: research the market and choose a segment with clear demand (cardiovascular, digestive, immune, etc.). Step 3: define differentiation — ingredient technology, bioavailability, or user experience.',
      'Steps 4–5: develop the formula with a formulator, optimize efficacy/cost, and run stability testing. Step 6: prepare product registration files and labels per regulations. Step 7: controlled launch — test channels, measure feedback, iterate.',
      'Bioscope partners at every step — from ingredient recommendations to positioning advice and reference case studies.',
    ],
  },
  'sinh-kha-dung-curcumin-thuc-chien': {
    title: 'Curcumin bioavailability in practice: Phytosome vs standard powder',
    excerpt:
      'Pure curcumin absorbs poorly — how does wet phytosome technology solve this challenge?',
    body: [
      'Curcumin has low bioavailability in traditional powder form. Phytosome — a complex with phospholipids — significantly improves absorption across cell membranes.',
      'Bioscope\'s wet Phytosome technology enables flexible use in nutraceuticals and pharmaceuticals, with clear mechanistic evidence to support label claims (subject to market-specific regulations).',
      'When formulators choose curcumin, they should weigh effective dose, cost per bioavailable active unit, and the ability to communicate the science credibly to consumers.',
    ],
  },
  'xay-dung-cong-thuc-my-pham-hieu-nang-cao': {
    title: 'High-performance cosmetic formulas: from actives to texture',
    excerpt:
      'Balancing functional actives, delivery vehicles, and sensory experience on skin.',
    body: [
      'High-performance (cosmeceutical) products require evidence-backed actives and suitable delivery systems — serum, cream, or patch depending on the goal.',
      'Polymerit and controlled-release technologies help maintain active concentration on skin, supporting long-lasting efficacy claims. Formulators must test stability, pH, and compatibility between actives.',
      'Bioscope supplies specialized ingredients with technical documentation and ODM formulation support when needed.',
    ],
  },
  'chung-nhan-gmp-la-gi': {
    title: 'What is GMP certification and why should formulators care?',
    excerpt:
      'A concise guide to GMP, ISO 22000, and HACCP — and how to choose certified ingredients.',
    body: [
      'GMP (Good Manufacturing Practice) ensures consistent quality in raw-material and finished-product manufacturing — a critical factor for product registration and brand trust.',
      'ISO 22000 and HACCP add food-safety management frameworks. Halal/Kosher certifications expand export markets and niche consumer segments.',
      'On the Bioscope catalog, each ingredient lists its certifications — helping formulators filter quickly for registration requirements.',
    ],
  },
  'quy-trinh-cong-bo-tpcn-viet-nam': {
    title: 'Nutraceutical registration in Vietnam: checklist for new brands',
    excerpt:
      'Steps to prepare dossiers, ingredient documentation, and common pitfalls for first-time registration.',
    body: [
      'Nutraceutical registration requires complete dossiers on composition, ingredient origin, COA, and quality commitments. Early preparation shortens time to market.',
      'Bioscope provides TDS, COA, and SDS under a hybrid model — helping formulators and registration agencies collect documents quickly.',
      'Note: label claims must comply with regulations — avoid therapeutic promises for nutraceutical products. The Bioscope team advises on safe claim scope during formula development.',
    ],
  },
  'phytosome-uot-khac-biet-the-nao': {
    title: 'How does wet Phytosome differ from dry form?',
    excerpt:
      'Bioavailability advantages and applications in Gastroheal and digestive products.',
    body: [
      'Wet Phytosome maintains the active–phospholipid complex in an optimal state, advantageous for certain dosage forms compared with traditional phytosome powder.',
      'A representative application: Gastroheal — gastric mucosa protection and recovery support. The mechanism is documented clearly in Bioscope technical materials.',
      'Pharmaceutical and nutraceutical formulators can request samples and technical consultations to assess fit with target formulas.',
    ],
  },
  'positioning-san-pham-moi-thi-truong-viet': {
    title: 'Positioning new products in Vietnam: 4 messaging frameworks',
    excerpt:
      'Science-led, real-world efficacy, transparent sourcing, and value-for-money — which pillar should you lead with?',
    body: [
      'Vietnamese consumers are increasingly informed — they trust evidence, not advertising alone. Effective positioning usually combines a clear mechanism with tangible benefits.',
      'Four pillars: (1) proprietary technology, (2) international certifications, (3) case studies/social proof, (4) optimized value per effective dose.',
      'Bioscope helps partners identify messaging that fits their segment — avoiding copied competitor claims without genuine differentiation.',
    ],
  },
  'chon-nguyen-lieu-mien-dich': {
    title: 'Choosing ingredients for immune lines: mushrooms, vitamins, or both?',
    excerpt:
      'Comparing Lion\'s Mane, beta-glucan, vitamins C/D3, and combination formulation strategies.',
    body: [
      'The immune segment continues to grow — but actives need evidence and appropriate dosing. Medicinal mushrooms (Lion\'s Mane, Reishi, etc.) and beta-glucan attract interest for immune support.',
      'Vitamins C, D3, and zinc provide foundational support — smart combinations increase perceived value without over-complicating the formula.',
      'The Bioscope catalog offers many options with flexible MOQs — contact us for ingredient bundle recommendations aligned with your brand goals.',
    ],
  },
  'xu-huong-ingredient-led-beauty-2026': {
    title: 'Ingredient-led beauty trends 2026: where dermatology meets nutraceuticals',
    excerpt:
      'Consumers read INCI lists and trust actives — what should brands prepare for?',
    body: [
      'Ingredient-led beauty: winning brands lead with transparent actives, concentrations, and mechanisms — not packaging alone. Retinol, peptides, and standardized botanical extracts remain key trends.',
      'The cosmetics–nutraceutical boundary is blurring: "skincare supplement" serums and inside-out skin support products are gaining attention.',
      'Bioscope supplies ingredients for both categories — supporting formulators building cross-category lines when brand strategy allows.',
    ],
  },
  'nano-hoat-chat-ung-dung-thuc-te': {
    title: 'Nano actives: real-world value or buzzword?',
    excerpt:
      'When nano truly delivers — and how to evaluate suppliers.',
    body: [
      'Nano technology can improve penetration or active stability — but not every "nano" claim carries equivalent evidence.',
      'Formulators should request TDS, particle-size data, safety profiles, and formula stability results. Reputable partners are transparent about mechanism and application scope.',
      'Bioscope curates nano ingredients with clear technical dossiers — excluding products lacking scientific foundation from the catalog.',
    ],
  },
  'dong-kien-tao-vs-mua-nguyen-lieu-thuan': {
    title: 'Co-creation vs raw ingredient supply: which model fits you?',
    excerpt:
      'Comparing two ways to work with Bioscope — suited to startups, established brands, or manufacturers?',
    body: [
      'Raw ingredient supply: best when you already have a formulator, formula, and need quality sourcing — MOQ and pricing are competitive by volume.',
      'Co-creation: best for startups or brands launching new products — Bioscope partners from idea, market analysis, and formulation through launch.',
      'Many partners start with co-creation on one product line, then shift to ingredient supply for subsequent lines — flexible as growth stages evolve.',
    ],
  },
  'checklist-validate-y-tuong-san-pham': {
    title: 'Product idea validation checklist in 30 days',
    excerpt:
      '10 questions and 5 minimum actions before signing a manufacturing contract.',
    body: [
      'Week 1: interview potential customers, map competitors, set target price. Week 2: draft a preliminary formula and estimate COGS.',
      'Week 3: test a landing page or small pre-order. Week 4: synthesize data — hold a go/no-go meeting with the team.',
      'Bioscope shares this checklist free via the blog — contact us for an idea review session with our experts.',
    ],
  },
  'halal-kosher-mo-rong-thi-truong': {
    title: 'Halal & Kosher: expanding markets with certified ingredients',
    excerpt:
      'What certifications mean, how to filter the catalog, and export considerations.',
    body: [
      'Halal and Kosher are not only religious labels — many international retail channels require certification for product listing.',
      'When selecting ingredients, verify COA and original manufacturer certifications — the Bioscope catalog marks Halal/Kosher badges on each item.',
      'Export plans should define certification requirements during formula development to avoid costly reformulation later.',
    ],
  },
  'polymerit-trong-san-pham-cham-soc-da': {
    title: 'Polymerit in skincare: 24-hour slow release',
    excerpt:
      'Mechanism, benefits vs conventional actives, and application cases in Vietnam.',
    body: [
      'Polymerit is a transdermal delivery technology that releases actives over extended periods — suited to therapeutic and intensive care products.',
      'PEA and dermatology line cases show users value sustained efficacy over short-lived instant effects.',
      'Formulators can request the Polymerit whitepaper and material samples through Bioscope for pilot formula evaluation.',
    ],
  },
  'men-vi-sinh-chon-strain-nao': {
    title: 'Probiotics: which strains for digestive and immune lines?',
    excerpt:
      'Lactobacillus, Bifidobacterium — criteria for selecting evidence-backed strains.',
    body: [
      'Not all probiotics are equal — strain, CFU dose, and clinical evidence determine efficacy and permissible claims.',
      'Digestive lines often use L. rhamnosus, B. lactis, etc. — cross-check TDS and supporting studies from the manufacturer.',
      'Bioscope distributes probiotics with clear dossiers — helping formulators choose strains aligned with product goals and storage conditions.',
    ],
  },
  'thiet-ke-nhan-tpcn-tranh-sai-lam': {
    title: 'Nutraceutical label design: 6 common registration mistakes',
    excerpt:
      'Over-claiming, missing warnings, font too small — and how to avoid dossier rejection.',
    body: [
      'Common mistakes: therapeutic disease claims, incomplete ingredient lists, misleading imagery, missing usage instructions and warnings.',
      'Early collaboration with registration agencies and complete ingredient documentation from Bioscope reduces dossier revision cycles.',
      'The Bioscope team advises on safe benefit descriptions during formula development — this does not replace formal legal counsel.',
    ],
  },
  'cach-doc-tds-nguyen-lieu': {
    title: 'How to read an ingredient TDS: 8 items formulators must check',
    excerpt:
      'Specification, assay, heavy metals, microbiology — read correctly to avoid batch risk.',
    body: [
      'The Technical Data Sheet (TDS) is the primary document for evaluating ingredients. Formulators should review assay, purity, heavy metals, microbiology, and storage conditions.',
      'Comparing TDS across suppliers helps select the right grade — not price per kg alone.',
      'On the Bioscope website, TDS is public or lightly gated; COA/SDS via business email to ensure quality leads.',
    ],
  },
}

export function translateBlogPost(post: BlogPost): BlogPost {
  const slugEn = BLOG_SLUG_EN[post.slug]
  return {
    ...post,
    title: slugEn?.title ?? post.title,
    excerpt: slugEn?.excerpt ?? post.excerpt,
    body: slugEn?.body ?? post.body,
    topic: (TOPIC_VI_TO_EN[post.topic] ?? post.topic) as any,
    industry: (INDUSTRY_VI_TO_EN[post.industry] ?? post.industry) as any,
    author: BLOG_AUTHOR_EN,
  }
}

export function getBlogSectionsEn(post: BlogPost): BlogSection[] {
  const translated = translateBlogPost(post)
  if (post.sections?.length) {
    return post.sections.map((section, idx) => ({
      ...section,
      title: SECTION_TITLES_EN[idx] ?? section.title,
    }))
  }
  if (translated.body.length === 0) return []
  if (translated.body.length === 1) {
    return [{ id: 'overview', title: 'Overview', paragraphs: translated.body }]
  }
  const sections: BlogSection[] = []
  const chunkSize = Math.ceil(translated.body.length / 3)
  for (let i = 0; i < translated.body.length; i += chunkSize) {
    const idx = sections.length
    sections.push({
      id: `section-${idx}`,
      title: SECTION_TITLES_EN[idx] ?? `Part ${idx + 1}`,
      paragraphs: translated.body.slice(i, i + chunkSize),
    })
  }
  return sections
}

export function formatBlogDateEn(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function getRelatedBlogPostsEn(
  post: BlogPost,
  allPosts: BlogPost[],
  limit = 3,
): BlogPost[] {
  const others = allPosts.filter((p) => p.slug !== post.slug)
  const sameTopic = others.filter((p) => p.topic === post.topic)
  const sameIndustry = others.filter((p) => p.industry === post.industry && p.topic !== post.topic)
  const rest = others.filter((p) => p.topic !== post.topic && p.industry !== post.industry)
  return [...sameTopic, ...sameIndustry, ...rest].slice(0, limit).map(translateBlogPost)
}
