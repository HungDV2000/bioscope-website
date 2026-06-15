import type {
  Certification,
  Ingredient,
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
    image: img("photo-1583912267550-d44c9c0c0c0f"),
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
    image: img("photo-1570172619644-dfd03ed5d881", 800),
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
    image: img("photo-1532634922-8fe0b757fb13", 800),
    author: "Bioscope R&D",
    date: "2026-05-20",
    readingTime: 6,
    content: {
      vi: "Trong những năm gần đây, công nghệ nano đã trở thành mũi nhọn của ngành mỹ phẩm cao cấp...",
      en: "In recent years, nanotechnology has become the spearhead of premium cosmetics...",
    },
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
    image: img("photo-1611078489935-0cb964de46d6", 800),
    author: "Bioscope R&D",
    date: "2026-04-12",
    readingTime: 8,
    content: {
      vi: "Sinh khả dụng là yếu tố then chốt quyết định hiệu quả của một sản phẩm dược liệu...",
      en: "Bioavailability is the key factor determining the efficacy of a botanical product...",
    },
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
    image: img("photo-1581093458791-9d09a5c0d7a3", 800),
    author: "Bioscope QA",
    date: "2026-03-03",
    readingTime: 5,
    content: {
      vi: "GMP (Good Manufacturing Practice) là bộ tiêu chuẩn thực hành sản xuất tốt...",
      en: "GMP (Good Manufacturing Practice) is a set of good production practice standards...",
    },
  },
];

/* ----------------------------- helpers ----------------------------------- */
export const getTechnology = (slug: string) =>
  technologies.find((t) => t.slug === slug);
export const getIngredient = (slug: string) =>
  ingredients.find((i) => i.slug === slug);
export const getPost = (slug: string) => posts.find((p) => p.slug === slug);
export const getRelatedIngredients = (techSlug: string) =>
  ingredients.filter((i) => i.relatedTech === techSlug);
