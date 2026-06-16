import type {
  Certification,
  Ingredient,
  Job,
  Partner,
  Post,
  Service,
  Technology,
} from "./types";

const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

/* -------------------------------------------------------------------------- */
/*  TECHNOLOGIES — Công nghệ độc quyền                                          */
/* -------------------------------------------------------------------------- */
export const technologies: Technology[] = [
  {
    slug: "novaskin",
    order: 1,
    accent: "#098F50",
    name: { vi: "Novaskin™", en: "Novaskin™" },
    tagline: {
      vi: "Công nghệ vận chuyển dưỡng chất thẩm thấu sâu vào da",
      en: "Deep-delivery transport technology for active actives",
    },
    description: {
      vi: "Novaskin™ là nền tảng nano độc quyền của Bioscope, giúp đưa hoạt chất vượt qua hàng rào biểu bì và phóng thích có kiểm soát tại lớp hạ bì — nâng hiệu quả sinh khả dụng lên nhiều lần so với dạng bào chế thông thường.",
      en: "Novaskin™ is Bioscope's proprietary nano platform that carries actives across the epidermal barrier and releases them in a controlled manner in the dermis — multiplying bioavailability versus conventional forms.",
    },
    mechanism: {
      vi: "Hoạt chất được bao bọc trong cấu trúc lipid kép kích thước nano, mô phỏng màng tế bào tự nhiên. Cấu trúc này hợp nhất với màng tế bào da, giải phóng dưỡng chất đúng vị trí đích và giảm thất thoát trên bề mặt.",
      en: "Actives are encapsulated within a nano-sized bilayer lipid structure mimicking the natural cell membrane. It fuses with skin cell membranes, releasing nutrients exactly at the target site while minimising surface loss.",
    },
    image: img("photo-1556228720-195a672e8a03"),
    specs: [
      { label: { vi: "Kích thước hạt", en: "Particle size" }, value: "80–120", unit: "nm", display: "number" },
      { label: { vi: "Hiệu suất bao gói", en: "Encapsulation efficiency" }, value: "95", unit: "%", display: "bar", percent: 95 },
      { label: { vi: "Tăng thẩm thấu", en: "Permeation increase" }, value: "4.2", unit: "x", display: "number" },
      { label: { vi: "Độ ổn định", en: "Stability" }, value: "24", unit: "tháng", display: "text" },
    ],
  },
  {
    slug: "phytosome-wet",
    order: 2,
    accent: "#0FAE73",
    name: { vi: "Phytosome ướt", en: "Wet Phytosome" },
    tagline: {
      vi: "Tăng sinh khả dụng cho cao dược liệu khó hấp thu",
      en: "Boosting bioavailability of poorly absorbed botanical extracts",
    },
    description: {
      vi: "Quy trình phytosome ướt độc quyền tạo phức hợp giữa hoạt chất thực vật và phospholipid trong môi trường nước, giúp các hợp chất ưa nước như polyphenol, flavonoid hấp thu vượt trội qua đường tiêu hóa.",
      en: "A proprietary wet-phytosome process complexes plant actives with phospholipids in an aqueous medium, dramatically improving the absorption of hydrophilic compounds like polyphenols and flavonoids.",
    },
    mechanism: {
      vi: "Phospholipid liên kết với phân tử hoạt chất tạo phức 'phytosome' lưỡng tính, giúp hoạt chất dễ dàng đi qua màng ruột giàu lipid — khắc phục nhược điểm sinh khả dụng thấp của cao chiết truyền thống.",
      en: "Phospholipids bind active molecules into an amphipathic 'phytosome' complex that readily crosses the lipid-rich intestinal membrane — overcoming the low bioavailability of traditional extracts.",
    },
    image: img("photo-1547514701-42782101795e"),
    specs: [
      { label: { vi: "Tăng hấp thu", en: "Absorption boost" }, value: "6", unit: "x", display: "number" },
      { label: { vi: "Tỷ lệ phức hợp", en: "Complexation rate" }, value: "92", unit: "%", display: "bar", percent: 92 },
      { label: { vi: "Hàm lượng hoạt chất", en: "Active content" }, value: "40", unit: "%", display: "bar", percent: 40 },
    ],
  },
  {
    slug: "lipodisq",
    order: 3,
    accent: "#F68C36",
    name: { vi: "Lipodisq®", en: "Lipodisq®" },
    tagline: {
      vi: "Hệ nano đĩa lipid ổn định cho hoạt chất nhạy cảm",
      en: "Stable lipid nanodisc system for sensitive actives",
    },
    description: {
      vi: "Lipodisq® tạo các đĩa nano lipid đồng nhất, bảo vệ hoạt chất nhạy cảm với oxy hóa và nhiệt độ, đồng thời tối ưu phóng thích kéo dài cho cả ứng dụng uống và bôi.",
      en: "Lipodisq® forms uniform lipid nanodiscs that protect oxygen- and heat-sensitive actives while optimising sustained release for both oral and topical applications.",
    },
    mechanism: {
      vi: "Polymer lưỡng tính bao quanh đĩa lipid phẳng tạo cấu trúc bền vững, giữ hoạt chất ở trạng thái phân tán nano đồng đều, hạn chế kết tụ và phân hủy.",
      en: "An amphipathic polymer wraps a flat lipid disc into a robust structure, keeping actives in a uniform nano-dispersion that resists aggregation and degradation.",
    },
    image: img("photo-1570172619644-dfd03ed5d881"),
    specs: [
      { label: { vi: "Đường kính đĩa", en: "Disc diameter" }, value: "10–30", unit: "nm", display: "number" },
      { label: { vi: "Bảo vệ chống oxy hóa", en: "Oxidation protection" }, value: "88", unit: "%", display: "bar", percent: 88 },
      { label: { vi: "Phóng thích kéo dài", en: "Sustained release" }, value: "12", unit: "giờ", display: "text" },
    ],
  },
  {
    slug: "liposome",
    order: 4,
    accent: "#066B3B",
    name: { vi: "Liposome", en: "Liposome" },
    tagline: {
      vi: "Vận chuyển kép ưa nước & ưa dầu trong một cấu trúc",
      en: "Dual hydrophilic & lipophilic delivery in one vesicle",
    },
    description: {
      vi: "Hệ liposome tiêu chuẩn dược của Bioscope cho phép mang đồng thời hoạt chất tan trong nước và tan trong dầu, ứng dụng linh hoạt cho thực phẩm chức năng và mỹ phẩm cao cấp.",
      en: "Bioscope's pharmaceutical-grade liposome system carries water-soluble and oil-soluble actives simultaneously, flexible for both premium supplements and cosmetics.",
    },
    mechanism: {
      vi: "Túi cầu lipid kép bao bọc lõi nước trung tâm: hoạt chất ưa nước nằm trong lõi, hoạt chất ưa dầu nằm trong lớp màng — tối ưu bảo vệ và vận chuyển đa hoạt chất.",
      en: "A bilayer lipid vesicle surrounds an aqueous core: hydrophilic actives reside in the core, lipophilic actives in the membrane — optimising protection and multi-active delivery.",
    },
    image: img("photo-1532187863486-abf9dbad1b69"),
    specs: [
      { label: { vi: "Kích thước túi", en: "Vesicle size" }, value: "100–200", unit: "nm", display: "number" },
      { label: { vi: "Hiệu suất nạp", en: "Loading efficiency" }, value: "90", unit: "%", display: "bar", percent: 90 },
      { label: { vi: "Độ đồng nhất (PDI)", en: "Uniformity (PDI)" }, value: "<0.2", unit: "", display: "text" },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  INGREDIENTS — Nguyên liệu                                                   */
/* -------------------------------------------------------------------------- */
export const ingredients: Ingredient[] = [
  {
    slug: "marine-sweet-nag",
    type: "supplement",
    featured: true,
    name: { vi: "Marine Sweet® (N-Acetyl Glucosamine)", en: "Marine Sweet® (N-Acetyl Glucosamine)" },
    category: { vi: "Hỗ trợ xương khớp", en: "Joint health" },
    categorySlug: "joint-health",
    originCountry: "Nhật Bản",
    originCode: "JP",
    brandName: "Marine Sweet®",
    partner: "Yaizu Suisankagaku",
    description: {
      vi: "N-Acetyl Glucosamine chiết xuất từ vỏ tôm biển sâu, độ tinh khiết cao, hỗ trợ tái tạo sụn khớp và dưỡng ẩm da từ bên trong.",
      en: "High-purity N-Acetyl Glucosamine derived from deep-sea shrimp shells, supporting cartilage regeneration and skin hydration from within.",
    },
    benefits: [
      { vi: "Hỗ trợ tái tạo sụn khớp", en: "Supports cartilage regeneration" },
      { vi: "Dưỡng ẩm da từ bên trong", en: "Hydrates skin from within" },
      { vi: "Độ tinh khiết dược dụng", en: "Pharmaceutical-grade purity" },
    ],
    applications: [
      { vi: "Viên uống xương khớp", en: "Joint supplements" },
      { vi: "Thực phẩm bảo vệ sức khỏe", en: "Health-protection foods" },
    ],
    image: img("photo-1607619056574-7b8d3ee536b2", 800),
    relatedTech: "phytosome-wet",
    specs: [
      { label: { vi: "Độ tinh khiết", en: "Purity" }, value: "99", unit: "%", display: "bar", percent: 99 },
      { label: { vi: "Kích thước hạt", en: "Mesh size" }, value: "80", unit: "mesh", display: "number" },
    ],
  },
  {
    slug: "argentina-collagen-peptide",
    type: "supplement",
    featured: true,
    name: { vi: "Collagen Peptide thủy phân", en: "Hydrolyzed Collagen Peptide" },
    category: { vi: "Làm đẹp & chống lão hóa", en: "Beauty & anti-aging" },
    categorySlug: "beauty",
    originCountry: "Argentina",
    originCode: "AR",
    brandName: "BioPeptan®",
    partner: "Rousselot",
    description: {
      vi: "Collagen peptide trọng lượng phân tử thấp từ nguồn bò Argentina, hấp thu nhanh, hỗ trợ độ đàn hồi da và sức khỏe khớp.",
      en: "Low molecular weight collagen peptide from Argentine bovine source, rapidly absorbed, supporting skin elasticity and joint health.",
    },
    benefits: [
      { vi: "Tăng đàn hồi & săn chắc da", en: "Improves skin elasticity & firmness" },
      { vi: "Hấp thu nhanh nhờ phân tử nhỏ", en: "Fast absorption via small peptides" },
    ],
    applications: [
      { vi: "Nước uống collagen", en: "Collagen drinks" },
      { vi: "Bột pha & viên nén", en: "Powder & tablets" },
    ],
    image: img("photo-1620916566398-39f1143ab7be", 800),
    specs: [
      { label: { vi: "Trọng lượng phân tử", en: "Molecular weight" }, value: "2000", unit: "Da", display: "number" },
      { label: { vi: "Hàm lượng protein", en: "Protein content" }, value: "90", unit: "%", display: "bar", percent: 90 },
    ],
  },
  {
    slug: "swiss-vitamin-c-coated",
    type: "supplement",
    name: { vi: "Vitamin C bao tan chậm", en: "Sustained-release Vitamin C" },
    category: { vi: "Vitamin & khoáng chất", en: "Vitamins & minerals" },
    categorySlug: "vitamins",
    originCountry: "Thụy Sĩ",
    originCode: "CH",
    brandName: "DSM Quali®-C",
    partner: "DSM",
    description: {
      vi: "Vitamin C tinh khiết được bao phim phóng thích chậm, giảm kích ứng dạ dày và kéo dài thời gian hấp thu.",
      en: "High-purity Vitamin C with a sustained-release coating that reduces gastric irritation and extends absorption.",
    },
    benefits: [
      { vi: "Phóng thích kéo dài 8 giờ", en: "8-hour sustained release" },
      { vi: "Giảm kích ứng dạ dày", en: "Reduces gastric irritation" },
    ],
    applications: [
      { vi: "Viên nén bao phim", en: "Coated tablets" },
      { vi: "Thực phẩm tăng đề kháng", en: "Immunity products" },
    ],
    image: img("photo-1584017911766-d451b3d0e843", 800),
    relatedTech: "lipodisq",
    specs: [
      { label: { vi: "Độ tinh khiết", en: "Purity" }, value: "99.5", unit: "%", display: "bar", percent: 99 },
    ],
  },
  {
    slug: "novaskin-retinol",
    type: "cosmetic",
    featured: true,
    name: { vi: "Retinol bọc Novaskin™", en: "Novaskin™-encapsulated Retinol" },
    category: { vi: "Chống lão hóa", en: "Anti-aging" },
    categorySlug: "anti-aging",
    originCountry: "Việt Nam",
    originCode: "VN",
    brandName: "Bioscope R&D",
    partner: "Bioscope Lab",
    description: {
      vi: "Retinol ổn định hóa bằng công nghệ Novaskin™ độc quyền, giảm kích ứng và tăng hiệu quả tái tạo da rõ rệt.",
      en: "Retinol stabilised with proprietary Novaskin™ technology, reducing irritation while markedly boosting skin renewal.",
    },
    benefits: [
      { vi: "Giảm kích ứng so với retinol thường", en: "Less irritation than free retinol" },
      { vi: "Thẩm thấu sâu, hiệu quả cao", en: "Deep penetration, high efficacy" },
    ],
    applications: [
      { vi: "Serum chống lão hóa", en: "Anti-aging serum" },
      { vi: "Kem dưỡng đêm", en: "Night cream" },
    ],
    image: img("photo-1556228720-195a672e8a03", 800),
    relatedTech: "novaskin",
    specs: [
      { label: { vi: "Độ ổn định", en: "Stability" }, value: "92", unit: "%", display: "bar", percent: 92 },
      { label: { vi: "Giảm kích ứng", en: "Irritation reduction" }, value: "70", unit: "%", display: "bar", percent: 70 },
    ],
  },
  {
    slug: "liposome-niacinamide",
    type: "cosmetic",
    name: { vi: "Niacinamide Liposome", en: "Liposomal Niacinamide" },
    category: { vi: "Dưỡng sáng", en: "Brightening" },
    categorySlug: "brightening",
    originCountry: "Hàn Quốc",
    originCode: "KR",
    brandName: "Bioscope Lab",
    partner: "Bioscope Lab",
    description: {
      vi: "Niacinamide được bao trong hệ liposome giúp tăng độ thẩm thấu và ổn định, làm sáng và đều màu da.",
      en: "Niacinamide encapsulated in a liposome system for enhanced penetration and stability, brightening and evening skin tone.",
    },
    benefits: [
      { vi: "Làm sáng & đều màu da", en: "Brightens & evens skin tone" },
      { vi: "Tăng ổn định hoạt chất", en: "Improves active stability" },
    ],
    applications: [
      { vi: "Serum dưỡng sáng", en: "Brightening serum" },
      { vi: "Toner & essence", en: "Toner & essence" },
    ],
    image: img("photo-1612817288484-6f916006741a", 800),
    relatedTech: "liposome",
    specs: [
      { label: { vi: "Nồng độ", en: "Concentration" }, value: "10", unit: "%", display: "bar", percent: 100 },
    ],
  },
  {
    slug: "centella-phytosome",
    type: "cosmetic",
    name: { vi: "Cao rau má Phytosome", en: "Centella Phytosome" },
    category: { vi: "Phục hồi & làm dịu", en: "Repair & soothing" },
    categorySlug: "repair",
    originCountry: "Việt Nam",
    originCode: "VN",
    brandName: "Bioscope R&D",
    partner: "Bioscope Lab",
    description: {
      vi: "Chiết xuất rau má (Centella Asiatica) chuẩn hóa, ứng dụng công nghệ phytosome ướt giúp tăng hấp thu hoạt chất madecassoside.",
      en: "Standardised Centella Asiatica extract using wet-phytosome technology to enhance madecassoside absorption.",
    },
    benefits: [
      { vi: "Làm dịu & phục hồi hàng rào da", en: "Soothes & repairs skin barrier" },
      { vi: "Chuẩn hóa hoạt chất", en: "Standardised actives" },
    ],
    applications: [
      { vi: "Kem phục hồi", en: "Repair cream" },
      { vi: "Mặt nạ làm dịu", en: "Soothing mask" },
    ],
    image: img("photo-1556228578-8c89e6adf883", 800),
    relatedTech: "phytosome-wet",
    specs: [
      { label: { vi: "Madecassoside", en: "Madecassoside" }, value: "10", unit: "%", display: "bar", percent: 80 },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  SERVICES — Dịch vụ ODM                                                      */
/* -------------------------------------------------------------------------- */
export const services: Service[] = [
  {
    slug: "rnd-formulation",
    icon: "FlaskConical",
    title: { vi: "Nghiên cứu & Phát triển công thức", en: "R&D & Formulation" },
    description: {
      vi: "Đội ngũ chuyên gia phát triển công thức độc quyền theo yêu cầu, tối ưu hiệu quả và tính ổn định.",
      en: "Our experts develop bespoke proprietary formulations, optimising efficacy and stability.",
    },
    features: [
      { vi: "Công thức TPCN & mỹ phẩm", en: "Supplement & cosmetic formulas" },
      { vi: "Ứng dụng công nghệ nano độc quyền", en: "Proprietary nano technology" },
      { vi: "Thử nghiệm ổn định & hiệu quả", en: "Stability & efficacy testing" },
    ],
  },
  {
    slug: "manufacturing",
    icon: "Factory",
    title: { vi: "Gia công sản xuất GMP", en: "GMP Manufacturing" },
    description: {
      vi: "Gia công trọn gói trên dây chuyền đạt chuẩn GMP, đảm bảo chất lượng và truy xuất nguồn gốc.",
      en: "Full-service manufacturing on GMP-certified lines, ensuring quality and traceability.",
    },
    features: [
      { vi: "Nhà máy đạt chuẩn GMP", en: "GMP-certified facility" },
      { vi: "Đa dạng dạng bào chế", en: "Diverse dosage forms" },
      { vi: "Kiểm soát chất lượng nghiêm ngặt", en: "Strict quality control" },
    ],
  },
  {
    slug: "registration",
    icon: "FileCheck",
    title: { vi: "Tư vấn công bố & pháp lý", en: "Registration & Compliance" },
    description: {
      vi: "Hỗ trợ trọn gói thủ tục công bố sản phẩm, đăng ký lưu hành đúng quy định.",
      en: "End-to-end support for product declaration and regulatory registration.",
    },
    features: [
      { vi: "Công bố TPCN & mỹ phẩm", en: "Supplement & cosmetic declaration" },
      { vi: "Hồ sơ pháp lý đầy đủ", en: "Complete legal dossiers" },
      { vi: "Cập nhật quy định mới nhất", en: "Up-to-date regulations" },
    ],
  },
  {
    slug: "packaging-design",
    icon: "Package",
    title: { vi: "Thiết kế & bao bì", en: "Design & Packaging" },
    description: {
      vi: "Tư vấn thiết kế thương hiệu, bao bì sản phẩm chuyên nghiệp, sẵn sàng ra thị trường.",
      en: "Professional brand and packaging design consultancy, market-ready.",
    },
    features: [
      { vi: "Thiết kế nhận diện thương hiệu", en: "Brand identity design" },
      { vi: "Bao bì đạt chuẩn ngành", en: "Industry-compliant packaging" },
      { vi: "Nguồn cung bao bì", en: "Packaging sourcing" },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  CERTIFICATIONS / TRUST SIGNALS                                              */
/* -------------------------------------------------------------------------- */
export const certifications: Certification[] = [
  { value: "23", suffix: { vi: "Dự án R&D", en: "R&D projects" }, kind: "stat" },
  { value: "14", suffix: { vi: "Bằng sáng chế", en: "Patents" }, kind: "stat" },
  { value: "4", suffix: { vi: "Công nghệ độc quyền", en: "Proprietary technologies" }, kind: "stat" },
  { value: "150+", suffix: { vi: "Đối tác toàn cầu", en: "Global partners" }, kind: "stat" },
];

/* -------------------------------------------------------------------------- */
/*  PARTNERS                                                                    */
/* -------------------------------------------------------------------------- */
export const partners: Partner[] = [
  { name: "Yaizu Suisankagaku", country: "Nhật Bản", code: "JP" },
  { name: "Rousselot", country: "Argentina", code: "AR" },
  { name: "DSM", country: "Thụy Sĩ", code: "CH" },
  { name: "BASF", country: "Đức", code: "DE" },
  { name: "Lonza", country: "Thụy Sĩ", code: "CH" },
  { name: "Givaudan", country: "Pháp", code: "FR" },
];

/* -------------------------------------------------------------------------- */
/*  POSTS — Bioneer's Blog                                                      */
/* -------------------------------------------------------------------------- */
export const posts: Post[] = [
  {
    slug: "xu-huong-nano-trong-my-pham-2026",
    title: {
      vi: "Xu hướng công nghệ nano trong mỹ phẩm 2026",
      en: "Nanotechnology trends in cosmetics 2026",
    },
    excerpt: {
      vi: "Công nghệ nano đang định hình lại cách hoạt chất được vận chuyển vào da. Cùng điểm qua các xu hướng nổi bật.",
      en: "Nanotechnology is reshaping how actives are delivered into the skin. Here are the standout trends.",
    },
    category: { vi: "Công nghệ", en: "Technology" },
    categoryKey: "technology",
    image: img("photo-1556228720-195a672e8a03", 800),
    author: "Bioscope R&D",
    date: "2026-05-20",
    readingTime: 12,
    content: {
      vi: "Ngành mỹ phẩm và dermocosmetics toàn cầu đang bước vào giai đoạn mà hiệu quả sản phẩm không còn được đo bằng nồng độ hoạt chất trên nhãn, mà bằng khả năng hoạt chất thực sự đến đúng lớp da mục tiêu. Công nghệ nano — từ liposome, phytosome đến hệ vận chuyển đĩa lipid — trở thành lợi thế cạnh tranh then chốt của các thương hiệu cao cấp và nhà sản xuất ODM chuyên sâu.",
      en: "The global cosmetics and dermocosmetics industry is entering a phase where product efficacy is no longer measured by active concentration on the label, but by whether actives actually reach the target skin layer. Nano technology — from liposomes and phytosomes to lipid disc delivery systems — is becoming a decisive competitive edge for premium brands and specialised ODM manufacturers.",
    },
    sections: [
      {
        id: "thị-trường-2026",
        level: 2,
        title: { vi: "Bức tranh thị trường 2026", en: "The 2026 market landscape" },
        paragraphs: [
          {
            vi: "Theo các báo cáo ngành gần đây, phân khúc mỹ phẩm chức năng (cosmeceuticals) tăng trưởng hai con số tại châu Á — Thái Bình Dương, trong đó các sản phẩm có công bố cơ chế vận chuyển hoạt chất được minh chứng khoa học được ưu tiên bởi kênh phân phối chuyên biệt và bác sĩ da liễu.",
            en: "According to recent industry reports, the functional cosmetics (cosmeceuticals) segment is growing at double-digit rates across Asia-Pacific, with products backed by scientifically substantiated active delivery mechanisms favoured by specialist channels and dermatologists.",
          },
          {
            vi: "Tại Việt Nam, người tiêu dùng ngày càng am hiểu về retinol, peptide, vitamin C và các hoạt chất chống lão hóa. Điều này thúc đẩy doanh nghiệp nội địa tìm kiếm đối tác có năng lực bào chế nano để nâng cao hiệu quả thực tế, không chỉ cải thiện marketing claim.",
            en: "In Vietnam, consumers are increasingly knowledgeable about retinol, peptides, vitamin C and anti-ageing actives. This pushes domestic brands to seek partners with nano formulation capability to improve real efficacy, not just marketing claims.",
          },
        ],
      },
      {
        id: "vi-sao-nano",
        level: 2,
        title: { vi: "Vì sao nano quan trọng với mỹ phẩm", en: "Why nano matters for cosmetics" },
        paragraphs: [
          {
            vi: "Da người có hàng rào lipid tự nhiên (skin barrier) ngăn phần lớn phân tử lớn và kỵ nước thâm nhập. Nhiều hoạt chất quý — chiết xuất thực vật, vitamin tan trong dầu — có kích thước phân tử hoặc độ phân cực khiến chúng khó vượt qua lớp corneum, dẫn đến lãng phí nguyên liệu và hiệu quả kém trên thực tế.",
            en: "Human skin has a natural lipid barrier that blocks most large and hydrophobic molecules. Many valuable actives — botanical extracts, oil-soluble vitamins — have molecular size or polarity that makes crossing the stratum corneum difficult, wasting ingredients and reducing real-world efficacy.",
          },
        ],
      },
      {
        id: "sinh-kha-dung",
        level: 3,
        title: { vi: "Sinh khả dụng và thẩm thấu", en: "Bioavailability and permeation" },
        paragraphs: [
          {
            vi: "Hệ vận chuyển nano giúp đóng gói hoạt chất trong vesicle 80–200 nm, bảo vệ khỏi oxy hóa và tăng thời gian lưu trên bề mặt da. Khi tiếp xúc lipid da, cấu trúc nano có thể dung hợp hoặc giải phóng có kiểm soát, nâng tỷ lệ hoạt chất đến lớp epidermis và dermis.",
            en: "Nano delivery systems encapsulate actives in 80–200 nm vesicles, protecting against oxidation and extending residence time on the skin surface. Upon contact with skin lipids, nano structures can fuse or release in a controlled manner, increasing the fraction of actives reaching the epidermis and dermis.",
          },
        ],
      },
      {
        id: "on-dinh-hoat-chat",
        level: 3,
        title: { vi: "Ổn định hoạt chất nhạy cảm", en: "Stabilising sensitive actives" },
        paragraphs: [
          {
            vi: "Retinol, ascorbic acid và nhiều peptide dễ bị phân hủy khi tiếp xúc ánh sáng, nhiệt hoặc ion kim loại trong công thức. Bao gói nano tạo môi trường bảo vệ, kéo dài shelf-life và giảm kích ứng ban đầu — một yếu tố quan trọng với sản phẩm chống lão hóa cao cấp.",
            en: "Retinol, ascorbic acid and many peptides degrade easily when exposed to light, heat or metal ions in a formula. Nano encapsulation creates a protective environment, extending shelf life and reducing initial irritation — a key factor for premium anti-ageing products.",
          },
        ],
      },
      {
        id: "cong-nghe-bioscope",
        level: 2,
        title: { vi: "Nền tảng vận chuyển tại Bioscope", en: "Bioscope delivery platforms" },
        paragraphs: [
          {
            vi: "Bioscope phát triển nội bộ bốn nền tảng: Novaskin™ cho thẩm thấu sâu, Phytosome ướt cho dược liệu, Lipodisq® cho hoạt chất nhạy cảm và Liposome đa pha. Mỗi nền tảng được tối ưu cho nhóm hoạt chất và dạng bào chế (serum, cream, essence) cụ thể.",
            en: "Bioscope develops four platforms in-house: Novaskin™ for deep permeation, wet phytosome for botanicals, Lipodisq® for sensitive actives and multi-phase liposomes. Each platform is optimised for specific active classes and dosage forms (serum, cream, essence).",
          },
        ],
      },
      {
        id: "novaskin-lipodisq",
        level: 3,
        title: { vi: "Novaskin™ và Lipodisq® trong thực tế", en: "Novaskin™ and Lipodisq® in practice" },
        paragraphs: [
          {
            vi: "Novaskin™ đã được ứng dụng trong các công thức serum peptide và vitamin C cho thương hiệu mỹ phẩm nội địa, ghi nhận cải thiện độ đồng đều màu da và độ ẩm sau 4–6 tuần sử dụng trong thử nghiệm nội bộ. Lipodisq® phù hợp với retinoid và chiết xuất tan trong dầu cần bảo vệ khỏi oxy hóa.",
            en: "Novaskin™ has been applied in peptide and vitamin C serum formulas for domestic cosmetic brands, with internal testing showing improved skin tone evenness and hydration after 4–6 weeks of use. Lipodisq® suits retinoids and oil-soluble extracts that need protection from oxidation.",
          },
        ],
      },
      {
        id: "quy-dinh",
        level: 2,
        title: { vi: "Quy định và minh bạch công bố", en: "Regulation and transparent claims" },
        paragraphs: [
          {
            vi: "Cơ quan quản lý ngày càng chú trọng bằng chứng an toàn của hạt nano trong mỹ phẩm. Doanh nghiệp cần hồ sơ kỹ thuật về kích thước hạt, độ ổn định và kết quả in-vitro/in-vivo trước khi đưa claim \"công nghệ nano\" ra thị trường. Bioscope hỗ trợ đối tác xây dựng dossier kỹ thuật phục vụ công bố và truyền thông có trách nhiệm.",
            en: "Regulators are increasingly focused on safety evidence for nano particles in cosmetics. Brands need technical dossiers on particle size, stability and in-vitro/in-vivo results before bringing \"nano technology\" claims to market. Bioscope supports partners in building technical dossiers for compliant registration and responsible communication.",
          },
        ],
      },
      {
        id: "ket-luan",
        level: 2,
        title: { vi: "Kết luận và hướng đi cho doanh nghiệp", en: "Conclusion and recommendations" },
        paragraphs: [
          {
            vi: "Công nghệ nano không còn là xu hướng xa vời — đó là tiêu chuẩn mới cho sản phẩm mỹ phẩm hiệu quả cao. Doanh nghiệp Việt Nam nên bắt đầu từ một dòng sản phẩm chủ lực, chọn đúng nền tảng vận chuyển và đối tác có năng lực R&D chứng minh được bằng số liệu. Liên hệ đội ngũ Bioscope để được tư vấn lộ trình tích hợp công nghệ nano vào công thức của bạn.",
            en: "Nano technology is no longer a distant trend — it is the new standard for high-efficacy cosmetics. Vietnamese businesses should start with a hero product line, choose the right delivery platform and a partner with demonstrable R&D capability. Contact the Bioscope team for a roadmap to integrate nano technology into your formulations.",
          },
        ],
      },
    ],
  },
  {
    slug: "phytosome-giai-phap-sinh-kha-dung",
    title: {
      vi: "Phytosome: lời giải cho bài toán sinh khả dụng dược liệu",
      en: "Phytosome: the answer to herbal bioavailability",
    },
    excerpt: {
      vi: "Vì sao nhiều cao dược liệu hấp thu kém? Phytosome ướt giải quyết vấn đề này như thế nào?",
      en: "Why are many botanical extracts poorly absorbed, and how does wet phytosome solve it?",
    },
    category: { vi: "R&D", en: "R&D" },
    categoryKey: "rd",
    image: img("photo-1611078489935-0cb964de46d6", 800),
    author: "Bioscope R&D",
    date: "2026-04-12",
    readingTime: 9,
    content: {
      vi: "Chiết xuất thực vật là nguồn nguyên liệu quý cho TPCN và mỹ phẩm, nhưng sinh khả dụng thấp khiến nhiều công thức khó đạt hiệu quả lâm sàng mong đợi. Phytosome — đặc biệt quy trình Phytosome ướt của Bioscope — là một trong những giải pháp được chứng minh hiệu quả nhất hiện nay.",
      en: "Botanical extracts are a valuable source for supplements and cosmetics, but low bioavailability means many formulas fail to deliver expected clinical outcomes. Phytosome — especially Bioscope's wet phytosome process — is among the most proven solutions available today.",
    },
    sections: [
      {
        id: "van-de-sinh-kha-dung",
        level: 2,
        title: { vi: "Bài toán sinh khả dụng dược liệu", en: "The herbal bioavailability challenge" },
        paragraphs: [
          {
            vi: "Polyphenol, saponin và flavonoid thường có độ tan kém trong nước, dễ bị phân hủy trong dạ dày và chuyển hóa nhanh ở gan (hiệu ứng first-pass). Kết quả là chỉ một phần nhỏ hoạt chất đến được tuần hoàn hệ thống.",
            en: "Polyphenols, saponins and flavonoids are often poorly water-soluble, easily degraded in the stomach and rapidly metabolised by the liver (first-pass effect). As a result, only a small fraction of actives reaches systemic circulation.",
          },
        ],
      },
      {
        id: "co-che-phytosome",
        level: 2,
        title: { vi: "Cơ chế Phytosome", en: "How phytosome works" },
        paragraphs: [
          {
            vi: "Phytosome liên kết phối tử hoạt chất thực vật với phospholipid (thường là lecithin) tạo phức hợp có tính ampiphilic, cải thiện hấp thu qua màng tế bào ruột. Quy trình Phytosome ướt của Bioscope giữ được độ tinh khiết cao hơn so với phương pháp khô truyền thống.",
            en: "Phytosome complexes botanical actives with phospholipids (typically lecithin) to form amphiphilic structures that improve absorption across intestinal cell membranes. Bioscope's wet phytosome process maintains higher purity than conventional dry methods.",
          },
        ],
      },
      {
        id: "ung-dung",
        level: 2,
        title: { vi: "Ứng dụng thực tế", en: "Practical applications" },
        paragraphs: [
          {
            vi: "Phytosome phù hợp với công thức hỗ trợ gan (silymarin), kháng viêm (curcumin), mỹ phẩm chống oxy hóa (chiết xuất trà xanh, nho). Khi kết hợp với nguyên liệu chuẩn hóa từ Bioscope, doanh nghiệp có thể rút ngắn thời gian phát triển sản phẩm từ 12–18 tháng xuống còn 6–9 tháng.",
            en: "Phytosome suits liver support (silymarin), anti-inflammatory (curcumin) and antioxidant cosmetics (green tea, grape extracts). Combined with standardised Bioscope ingredients, brands can shorten product development from 12–18 months to 6–9 months.",
          },
        ],
      },
    ],
  },
  {
    slug: "tieu-chuan-gmp-trong-san-xuat-tpcn",
    title: {
      vi: "Tiêu chuẩn GMP trong sản xuất thực phẩm chức năng",
      en: "GMP standards in supplement manufacturing",
    },
    excerpt: {
      vi: "GMP không chỉ là chứng nhận — đó là cam kết về chất lượng xuyên suốt chuỗi sản xuất.",
      en: "GMP is more than a certificate — it is a commitment to quality across the entire production chain.",
    },
    category: { vi: "Sản xuất", en: "Manufacturing" },
    categoryKey: "manufacturing",
    image: img("photo-1570172619644-dfd03ed5d881", 800),
    author: "Bioscope QA",
    date: "2026-03-03",
    readingTime: 7,
    content: {
      vi: "Thực phẩm chức năng tại Việt Nam chịu sự quản lý ngày càng chặt chẽ về chất lượng, truy xuất nguồn gốc và công bố sản phẩm. GMP (Good Manufacturing Practice) là nền tảng bắt buộc cho mọi doanh nghiệp muốn xây dựng thương hiệu bền vững.",
      en: "Dietary supplements in Vietnam face increasingly strict oversight on quality, traceability and product notification. GMP (Good Manufacturing Practice) is the foundation for any business building a sustainable brand.",
    },
    sections: [
      {
        id: "gmp-la-gi",
        level: 2,
        title: { vi: "GMP là gì và vì sao quan trọng", en: "What GMP is and why it matters" },
        paragraphs: [
          {
            vi: "GMP là bộ nguyên tắc đảm bảo sản phẩm được sản xuất và kiểm soát theo tiêu chuẩn chất lượng, từ nguyên liệu đầu vào, quy trình sản xuất, đóng gói đến lưu trữ và phân phối. Vi phạm GMP có thể dẫn đến thu hồi sản phẩm, mất uy tín thương hiệu và trách nhiệm pháp lý.",
            en: "GMP is a set of principles ensuring products are manufactured and controlled to quality standards — from raw materials and production processes to packaging, storage and distribution. GMP violations can lead to product recalls, brand damage and legal liability.",
          },
        ],
      },
      {
        id: "yeu-cau-co-ban",
        level: 2,
        title: { vi: "Yêu cầu cơ bản của GMP", en: "Core GMP requirements" },
        paragraphs: [
          {
            vi: "Các yếu tố then chốt gồm: cơ sở vật chất phù hợp, nhân sự được đào tạo, tài liệu SOP rõ ràng, kiểm soát nguyên liệu (COA, kiểm nghiệm), validation quy trình, quản lý lô sản xuất và hệ thống CAPA khi phát hiện sai lệch.",
            en: "Key elements include suitable facilities, trained personnel, clear SOP documentation, raw material control (COAs, testing), process validation, batch management and CAPA systems when deviations are found.",
          },
        ],
      },
      {
        id: "bioscope-odm",
        level: 2,
        title: { vi: "GMP trong dịch vụ ODM của Bioscope", en: "GMP in Bioscope's ODM service" },
        paragraphs: [
          {
            vi: "Bioscope hợp tác với các nhà máy đạt chuẩn GMP trong và ngoài nước, đồng thời cung cấp nguyên liệu có COA đầy đủ và hỗ trợ hồ sơ công bố sản phẩm. Đối tác ODM nhận được quy trình minh bạch từ công thức đến thùng thành phẩm.",
            en: "Bioscope partners with GMP-certified factories domestically and abroad, supplies ingredients with full COAs and supports product notification dossiers. ODM partners receive transparent processes from formula to finished carton.",
          },
        ],
      },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  CAREERS — Tuyển dụng                                                        */
/* -------------------------------------------------------------------------- */
export const jobs: Job[] = [
  {
    slug: "chuyen-vien-rd-my-pham",
    title: { vi: "Chuyên viên R&D Mỹ phẩm", en: "Cosmetic R&D Specialist" },
    department: { vi: "R&D", en: "R&D" },
    location: { vi: "TP. HCM", en: "Ho Chi Minh City" },
    type: { vi: "Toàn thời gian", en: "Full-time" },
    description: {
      vi: "Tham gia phát triển công thức mỹ phẩm ứng dụng công nghệ nano Novaskin™, Phytosome và Liposome; phối hợp với đội QA/QC và đối tác ODM để đưa sản phẩm từ lab đến pilot scale.",
      en: "Develop cosmetic formulations using Novaskin™, Phytosome and Liposome nano technologies; collaborate with QA/QC and ODM partners to take products from lab to pilot scale.",
    },
    responsibilities: [
      { vi: "Nghiên cứu, thử nghiệm và tối ưu công thức mẫu theo brief khách hàng.", en: "Research, test and optimise sample formulas per client briefs." },
      { vi: "Đánh giá tính ổn định, cảm quan và hiệu quả của hoạt chất trong hệ bào chế.", en: "Evaluate stability, sensory profile and efficacy of actives in formulations." },
      { vi: "Lập báo cáo kỹ thuật, spec sheet và hỗ trợ scale-up sản xuất.", en: "Prepare technical reports, spec sheets and support production scale-up." },
      { vi: "Cập nhật xu hướng nguyên liệu và quy định mỹ phẩm trong nước, quốc tế.", en: "Track ingredient trends and domestic/international cosmetic regulations." },
    ],
    requirements: [
      { vi: "Tốt nghiệp Đại học chuyên ngành Hóa mỹ phẩm, Dược, Hóa học hoặc tương đương.", en: "Bachelor's in cosmetic chemistry, pharmacy, chemistry or equivalent." },
      { vi: "Tối thiểu 2 năm kinh nghiệm R&D mỹ phẩm hoặc dược mỹ phẩm.", en: "At least 2 years in cosmetic or dermocosmetic R&D." },
      { vi: "Thành thạo quy trình lab, ghi chép batch record và phân tích cơ bản.", en: "Proficient in lab workflows, batch records and basic analysis." },
      { vi: "Tiếng Anh đọc hiểu tài liệu kỹ thuật; chủ động, làm việc nhóm tốt.", en: "English for technical documents; proactive with strong teamwork." },
    ],
    benefits: [
      { vi: "Lương thưởng cạnh tranh theo năng lực.", en: "Competitive salary and performance bonus." },
      { vi: "Môi trường lab hiện đại, tiếp cận công nghệ nano độc quyền.", en: "Modern lab environment with proprietary nano technology." },
      { vi: "BHXH đầy đủ, review lương 2 lần/năm.", en: "Full social insurance, bi-annual salary review." },
    ],
  },
  {
    slug: "nhan-vien-kinh-doanh-b2b",
    title: { vi: "Nhân viên Kinh doanh B2B", en: "B2B Sales Executive" },
    department: { vi: "Kinh doanh", en: "Sales" },
    location: { vi: "TP. HCM", en: "Ho Chi Minh City" },
    type: { vi: "Toàn thời gian", en: "Full-time" },
    description: {
      vi: "Phát triển khách hàng doanh nghiệp trong lĩnh vực TPCN và mỹ phẩm; tư vấn nguyên liệu, giải pháp công thức và dịch vụ ODM trọn gói của Bioscope.",
      en: "Grow B2B accounts in supplements and cosmetics; advise on ingredients, formulation solutions and Bioscope's end-to-end ODM services.",
    },
    responsibilities: [
      { vi: "Tìm kiếm, chăm sóc và mở rộng danh mục khách hàng B2B.", en: "Prospect, nurture and expand the B2B client portfolio." },
      { vi: "Tư vấn nguyên liệu, báo giá và phối hợp với R&D cho yêu cầu kỹ thuật.", en: "Advise on ingredients, quoting and coordinating R&D on technical requests." },
      { vi: "Theo dõi pipeline, forecast doanh số và báo cáo định kỳ.", en: "Manage pipeline, sales forecast and periodic reporting." },
      { vi: "Tham gia hội thảo, triển lãm ngành và xây dựng quan hệ đối tác.", en: "Attend industry events and build partner relationships." },
    ],
    requirements: [
      { vi: "Tốt nghiệp Đại học kinh tế, marketing, hóa học hoặc dược.", en: "Bachelor's in business, marketing, chemistry or pharmacy." },
      { vi: "Kinh nghiệm B2B ngành TPCN, mỹ phẩm hoặc nguyên liệu là lợi thế.", en: "B2B experience in supplements, cosmetics or ingredients is a plus." },
      { vi: "Kỹ năng thuyết trình, đàm phán và CRM.", en: "Presentation, negotiation and CRM skills." },
      { vi: "Sẵn sàng đi công tác trong nước khi cần.", en: "Willing to travel domestically when required." },
    ],
    benefits: [
      { vi: "Thu nhập: lương cứng + hoa hồng theo doanh số.", en: "Base salary plus commission on sales." },
      { vi: "Đào tạo sản phẩm và công nghệ chuyên sâu.", en: "In-depth product and technology training." },
      { vi: "Laptop, điện thoại công ty và phụ cấp đi lại.", en: "Company laptop, phone and travel allowance." },
    ],
  },
  {
    slug: "chuyen-vien-dang-ky-cong-bo",
    title: { vi: "Chuyên viên Đăng ký công bố", en: "Product Registration Specialist" },
    department: { vi: "Pháp lý", en: "Legal" },
    location: { vi: "Hà Nội", en: "Hanoi" },
    type: { vi: "Toàn thời gian", en: "Full-time" },
    description: {
      vi: "Hỗ trợ đối tác và khách hàng ODM hoàn thiện hồ sơ công bố TPCN, mỹ phẩm; đảm bảo tuân thủ quy định Bộ Y tế và claim khoa học có căn cứ.",
      en: "Support partners and ODM clients with supplement and cosmetic notification dossiers; ensure Ministry of Health compliance and evidence-based claims.",
    },
    responsibilities: [
      { vi: "Soạn thảo, rà soát hồ sơ công bố sản phẩm theo quy định hiện hành.", en: "Draft and review product notification dossiers per current regulations." },
      { vi: "Phối hợp QA/QC, R&D để thu thập COA, spec và tài liệu nhà máy.", en: "Coordinate with QA/QC and R&D for COAs, specs and factory documents." },
      { vi: "Theo dõi tiến độ với cơ quan quản lý và xử lý phản hồi bổ sung.", en: "Track authority progress and handle supplementary feedback." },
      { vi: "Cập nhật thay đổi pháp lý, claim và nhãn sản phẩm.", en: "Monitor legal updates, claims and product labelling." },
    ],
    requirements: [
      { vi: "Tốt nghiệp Dược, Y, Hóa hoặc Luật có kinh nghiệm ngành TPCN/mỹ phẩm.", en: "Degree in pharmacy, medicine, chemistry or law with TPCN/cosmetics exposure." },
      { vi: "Hiểu quy trình công bố TPCN, mỹ phẩm tại Việt Nam.", en: "Understanding of Vietnamese supplement/cosmetic notification processes." },
      { vi: "Tỉ mỉ, có khả năng làm việc với nhiều hồ sơ song song.", en: "Detail-oriented; able to manage multiple dossiers in parallel." },
      { vi: "Tiếng Anh đọc hiểu tài liệu quy chuẩn.", en: "English for reading regulatory documents." },
    ],
    benefits: [
      { vi: "Lương cạnh tranh, thưởng theo số hồ sơ hoàn thành.", en: "Competitive pay with dossier completion bonus." },
      { vi: "Đào tạo regulatory chuyên sâu nội bộ và bên ngoài.", en: "Internal and external regulatory training." },
      { vi: "Làm việc tại văn phòng Hà Nội, hỗ trợ hybrid khi phù hợp.", en: "Hanoi office with hybrid support where appropriate." },
    ],
  },
  {
    slug: "marketing-executive",
    title: { vi: "Marketing Executive", en: "Marketing Executive" },
    department: { vi: "Marketing", en: "Marketing" },
    location: { vi: "TP. HCM", en: "Ho Chi Minh City" },
    type: { vi: "Toàn thời gian", en: "Full-time" },
    description: {
      vi: "Xây dựng nội dung thương hiệu Bioscope trên website, mạng xã hội và kênh B2B; truyền tải giá trị khoa học, minh bạch và đổi mới của công ty.",
      en: "Build Bioscope brand content across website, social and B2B channels; communicate the company's scientific, transparent and innovative values.",
    },
    responsibilities: [
      { vi: "Lên kế hoạch và triển khai nội dung blog, social, email B2B.", en: "Plan and execute blog, social and B2B email content." },
      { vi: "Phối hợp R&D biên tập tài liệu kỹ thuật thành nội dung dễ hiểu.", en: "Work with R&D to turn technical material into accessible content." },
      { vi: "Quản lý lịch đăng, báo cáo hiệu quả và tối ưu SEO cơ bản.", en: "Manage publishing calendar, performance reports and basic SEO." },
      { vi: "Hỗ trợ sự kiện, triển lãm và tài liệu sales enablement.", en: "Support events, trade shows and sales enablement assets." },
    ],
    requirements: [
      { vi: "Tốt nghiệp Marketing, Truyền thông hoặc ngành liên quan.", en: "Degree in marketing, communications or related field." },
      { vi: "1–2 năm kinh nghiệm content/digital, ưu tiên ngành life science.", en: "1–2 years in content/digital; life science background preferred." },
      { vi: "Thành thạo Canva/Adobe cơ bản; hiểu SEO và analytics.", en: "Canva/Adobe basics; SEO and analytics awareness." },
      { vi: "Tiếng Anh giao tiếp và viết nội dung tốt.", en: "Good English communication and writing." },
    ],
    benefits: [
      { vi: "Môi trường sáng tạo, làm việc trực tiếp với chuyên gia khoa học.", en: "Creative environment working alongside scientific experts." },
      { vi: "Ngân sách đào tạo marketing và công cụ số.", en: "Marketing training budget and digital tools." },
      { vi: "Review lương 2 lần/năm, team building định kỳ.", en: "Bi-annual salary review and regular team building." },
    ],
  },
];

/* ----------------------------- helpers ----------------------------------- */
export const getTechnology = (slug: string) =>
  technologies.find((t) => t.slug === slug);
export const getIngredient = (slug: string) =>
  ingredients.find((i) => i.slug === slug);
export const getPost = (slug: string) => posts.find((p) => p.slug === slug);
export const getJob = (slug: string) => jobs.find((j) => j.slug === slug);
export const getRelatedIngredients = (techSlug: string) =>
  ingredients.filter((i) => i.relatedTech === techSlug);
