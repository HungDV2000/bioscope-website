/**
 * Static sample content for Phase 1.
 * Shapes mirror the planned Payload collections so pages can later swap
 * to `cmsFetch` with minimal changes.
 */
import type { ImgKey } from './images'

export type Ingredient = {
  slug: string
  name: string
  inci?: string
  category: string
  industry: 'Dược phẩm' | 'Thực phẩm chức năng' | 'Mỹ phẩm'
  origin: string
  manufacturer?: string
  shortDesc: string
  overview?: string
  benefits: string[]
  suggestedDosage?: string
  moq: string
  badges: string[]
  tag?: 'NEW' | 'TRENDING' | 'EXCLUSIVE'
  image: ImgKey
  imageSrc?: string
  specs: { label: string; value: string }[]
  applications: string[]
}

export const INDUSTRIES = ['Dược phẩm', 'Thực phẩm chức năng', 'Mỹ phẩm'] as const
export const CERT_FILTERS = ['GMP', 'Halal', 'Kosher', 'Non-GMO', 'Vegan', 'Organic'] as const
export const INGREDIENT_TAGS = ['NEW', 'TRENDING', 'EXCLUSIVE'] as const
export const APPLICATION_TYPES = [
  'Viên nang',
  'Viên nén',
  'Gói bột',
  'Dạng nhũ tương',
  'Serum',
  'Kem dưỡng',
  'Đồ uống chức năng',
  'Dạng ngậm',
] as const

export function ingredientForm(it: Ingredient) {
  return it.specs.find((s) => s.label === 'Dạng')?.value ?? ''
}

export function parseMoqKg(moq: string) {
  const n = Number.parseFloat(moq.replace(/[^\d.]/g, ''))
  return Number.isFinite(n) ? n : null
}

export const INGREDIENTS: Ingredient[] = [
  {
    slug: 'curcumin-extract-95',
    name: 'Curcumin Extract 95%',
    inci: 'Curcuma Longa Root Extract',
    category: 'Chiết xuất thực vật',
    industry: 'Thực phẩm chức năng',
    origin: 'Ấn Độ',
    manufacturer: 'Indena',
    shortDesc: 'Curcuminoids 95% — kháng viêm tự nhiên, sinh khả dụng cao.',
    overview:
      'Chiết xuất củ nghệ chuẩn hóa Curcuminoids ≥95% từ Ấn Độ, phân phối bởi Indena. Hoạt chất kháng viêm tự nhiên được ứng dụng rộng rãi trong TPCN và dược phẩm — có thể kết hợp công nghệ Phytosome để tăng sinh khả dụng.',
    benefits: ['Kháng viêm', 'Chống oxy hóa', 'Hỗ trợ tiêu hóa'],
    suggestedDosage: '500–1000 mg/ngày (tham khảo, tùy công thức)',
    moq: '25 kg',
    badges: ['Halal', 'Non-GMO', 'GMP'],
    tag: 'TRENDING',
    image: 'powder',
    specs: [
      { label: 'Hàm lượng hoạt chất', value: 'Curcuminoids ≥ 95%' },
      { label: 'Dạng', value: 'Bột mịn' },
      { label: 'Cảm quan', value: 'Vàng cam đặc trưng' },
      { label: 'Bảo quản', value: 'Khô ráo, tránh ánh sáng' },
      { label: 'Hạn dùng', value: '36 tháng' },
    ],
    applications: ['Viên nang', 'Viên nén', 'Gói bột'],
  },
  {
    slug: 'omega-3-fish-oil',
    name: 'Omega 3 Fish Oil',
    category: 'Dầu & Omega',
    industry: 'Thực phẩm chức năng',
    origin: 'Na Uy',
    manufacturer: 'GC Rieber Oils',
    shortDesc: 'Dạng TG – EPA/DHA 90%, tinh khiết IFOS 5★.',
    overview:
      'Dầu cá omega-3 dạng triglyceride (TG) tinh khiết từ GC Rieber Oils, Na Uy — chuẩn IFOS 5 sao. EPA/DHA 90% hỗ trợ tim mạch, não bộ và thị lực; phù hợp viên nang mềm và dạng nhũ tương cao cấp.',
    benefits: ['Tim mạch', 'Não bộ', 'Thị lực'],
    suggestedDosage: '1000–2000 mg EPA+DHA/ngày (tham khảo)',
    moq: '20 kg',
    badges: ['IFOS 5★', 'GMP', 'Halal'],
    tag: 'EXCLUSIVE',
    image: 'oil',
    imageSrc: '/images/ingredients/dau-ca-omega-3.webp',
    specs: [
      { label: 'Hàm lượng', value: 'EPA/DHA 90% (dạng TG)' },
      { label: 'Dạng', value: 'Dầu lỏng' },
      { label: 'Chỉ số oxy hóa', value: 'TOTOX thấp' },
      { label: 'Bảo quản', value: '2–8°C' },
      { label: 'Hạn dùng', value: '24 tháng' },
    ],
    applications: ['Viên nang mềm', 'Dạng nhũ tương', 'Dạng nước'],
  },
  {
    slug: 'lions-mane-extract',
    name: "Lion's Mane Extract",
    inci: 'Hericium Erinaceus Extract',
    category: 'Nấm dược liệu',
    industry: 'Thực phẩm chức năng',
    origin: 'Trung Quốc',
    shortDesc: 'Chiết xuất chuẩn hóa, hỗ trợ nhận thức & thần kinh.',
    benefits: ['Tăng cường nhận thức', 'Hỗ trợ thần kinh', 'Miễn dịch'],
    moq: '25 kg',
    badges: ['Chuẩn hóa', 'GMP', 'Vegan'],
    tag: 'NEW',
    image: 'botanical',
    imageSrc: '/images/ingredients/nam-duoc-lieu.jpeg',
    specs: [
      { label: 'Hàm lượng', value: 'Polysaccharides ≥ 30%' },
      { label: 'Dạng', value: 'Bột chiết xuất' },
      { label: 'Tỷ lệ chiết', value: '10:1' },
      { label: 'Bảo quản', value: 'Khô ráo, mát' },
      { label: 'Hạn dùng', value: '36 tháng' },
    ],
    applications: ['Viên nang', 'Gói bột', 'Đồ uống chức năng'],
  },
  {
    slug: 'nmn',
    name: 'NMN',
    category: 'Hoạt chất chức năng',
    industry: 'Thực phẩm chức năng',
    origin: 'Nhật Bản',
    shortDesc: 'Nicotinamide Mononucleotide ≥99%, hỗ trợ chống lão hóa.',
    benefits: ['Chống lão hóa', 'Năng lượng tế bào', 'Sức bền'],
    moq: '10 kg',
    badges: ['≥99%', 'Non-GMO', 'GMP'],
    image: 'capsules',
    specs: [
      { label: 'Độ tinh khiết', value: '≥ 99%' },
      { label: 'Dạng', value: 'Bột trắng' },
      { label: 'Bảo quản', value: '2–8°C, tránh ẩm' },
      { label: 'Hạn dùng', value: '24 tháng' },
    ],
    applications: ['Viên nang', 'Viên nén', 'Dạng ngậm'],
  },
  {
    slug: 'bacopa-extract',
    name: 'Bacopa Extract',
    inci: 'Bacopa Monnieri Extract',
    category: 'Chiết xuất thực vật',
    industry: 'Thực phẩm chức năng',
    origin: 'Ấn Độ',
    shortDesc: 'Bacosides 20% — hỗ trợ trí nhớ và tập trung.',
    benefits: ['Tăng cường trí nhớ', 'Giảm căng thẳng', 'Tập trung'],
    moq: '25 kg',
    badges: ['Chuẩn hóa', 'Halal', 'GMP'],
    image: 'leaf',
    specs: [
      { label: 'Hàm lượng', value: 'Bacosides 20%' },
      { label: 'Dạng', value: 'Bột chiết xuất' },
      { label: 'Bảo quản', value: 'Khô ráo, mát' },
      { label: 'Hạn dùng', value: '36 tháng' },
    ],
    applications: ['Viên nang', 'Viên nén'],
  },
  {
    slug: 'phytosome-curcumin',
    name: 'Phytosome Curcumin',
    category: 'Hoạt chất chức năng',
    industry: 'Dược phẩm',
    origin: 'Việt Nam',
    manufacturer: 'Bioscope',
    shortDesc: 'Công nghệ Phytosome ướt độc quyền — sinh khả dụng vượt trội.',
    overview:
      'Phức hợp curcuminoid + phosphatidylcholine theo công nghệ Phytosome ướt độc quyền của Bioscope. Sinh khả dụng vượt trội so với curcumin thông thường — ứng dụng trong Gastroheal và các sản phẩm tiêu hóa/dược phẩm.',
    benefits: ['Bảo vệ niêm mạc dạ dày', 'Kháng viêm', 'Phục hồi loét'],
    suggestedDosage: 'Theo công thức Gastroheal — liên hệ chuyên gia',
    moq: '5 kg',
    badges: ['Độc quyền', 'GMP'],
    tag: 'EXCLUSIVE',
    image: 'microscope',
    specs: [
      { label: 'Công nghệ', value: 'Phytosome ướt' },
      { label: 'Dạng', value: 'Phức chất bột' },
      { label: 'Bảo quản', value: 'Khô ráo, mát' },
      { label: 'Hạn dùng', value: '24 tháng' },
    ],
    applications: ['Viên nang', 'Dạng cốm'],
  },
  {
    slug: 'vitamin-d3',
    name: 'Vitamin D3 (Cholecalciferol)',
    category: 'Vitamin & Khoáng',
    industry: 'Thực phẩm chức năng',
    origin: 'Đức',
    shortDesc: 'Vitamin D3 tinh khiết ≥100.000 IU/g — hỗ trợ xương khớp và miễn dịch.',
    benefits: ['Hấp thu canxi', 'Miễn dịch', 'Xương khớp'],
    moq: '5 kg',
    badges: ['GMP', 'Non-GMO', 'Halal'],
    tag: 'TRENDING',
    image: 'capsules',
    specs: [
      { label: 'Hàm lượng', value: '≥ 100.000 IU/g' },
      { label: 'Dạng', value: 'Bột mịn' },
      { label: 'Bảo quản', value: 'Khô ráo, tránh ánh sáng' },
      { label: 'Hạn dùng', value: '36 tháng' },
    ],
    applications: ['Viên nang', 'Viên nén', 'Gói bột'],
  },
  {
    slug: 'collagen-peptide',
    name: 'Collagen Peptide',
    inci: 'Hydrolyzed Collagen',
    category: 'Peptide & Protein',
    industry: 'Mỹ phẩm',
    origin: 'Nhật Bản',
    shortDesc: 'Peptide collagen thủy phân MW thấp — hấp thu nhanh, làm đẹp da.',
    benefits: ['Đàn hồi da', 'Săn chắc', 'Móng & tóc'],
    moq: '25 kg',
    badges: ['GMP', 'Halal', 'Non-GMO'],
    tag: 'TRENDING',
    image: 'powder',
    specs: [
      { label: 'Hàm lượng', value: 'Protein ≥ 90%' },
      { label: 'Dạng', value: 'Bột mịn tan nhanh' },
      { label: 'Bảo quản', value: 'Khô ráo, mát' },
      { label: 'Hạn dùng', value: '24 tháng' },
    ],
    applications: ['Gói bột', 'Đồ uống chức năng', 'Serum'],
  },
  {
    slug: 'hyaluronic-acid',
    name: 'Hyaluronic Acid',
    inci: 'Sodium Hyaluronate',
    category: 'Hoạt chất chức năng',
    industry: 'Mỹ phẩm',
    origin: 'Hàn Quốc',
    shortDesc: 'HA phân tử thấp & cao — cấp ẩm sâu, làm đầy nếp nhăn.',
    benefits: ['Cấp ẩm', 'Làm đầy', 'Phục hồi hàng rào da'],
    moq: '10 kg',
    badges: ['GMP', 'Vegan', 'Non-GMO'],
    image: 'labWork',
    specs: [
      { label: 'Hàm lượng', value: '≥ 98%' },
      { label: 'Dạng', value: 'Bột trắng' },
      { label: 'Bảo quản', value: 'Khô ráo, tránh ẩm' },
      { label: 'Hạn dùng', value: '36 tháng' },
    ],
    applications: ['Serum', 'Kem dưỡng', 'Viên nang'],
  },
  {
    slug: 'resveratrol',
    name: 'Resveratrol 98%',
    inci: 'Polygonum Cuspidatum Extract',
    category: 'Chiết xuất thực vật',
    industry: 'Thực phẩm chức năng',
    origin: 'Trung Quốc',
    shortDesc: 'Trans-resveratrol tinh khiết — chống oxy hóa mạnh, chống lão hóa.',
    benefits: ['Chống oxy hóa', 'Tim mạch', 'Chống lão hóa'],
    moq: '10 kg',
    badges: ['GMP', 'Vegan', 'Organic'],
    tag: 'NEW',
    image: 'botanical',
    specs: [
      { label: 'Hàm lượng', value: 'Trans-resveratrol ≥ 98%' },
      { label: 'Dạng', value: 'Bột trắng' },
      { label: 'Bảo quản', value: 'Khô ráo, tránh ánh sáng' },
      { label: 'Hạn dùng', value: '24 tháng' },
    ],
    applications: ['Viên nang', 'Viên nén', 'Gói bột'],
  },
  {
    slug: 'ashwagandha-extract',
    name: 'Ashwagandha Extract',
    inci: 'Withania Somnifera Extract',
    category: 'Chiết xuất thực vật',
    industry: 'Thực phẩm chức năng',
    origin: 'Ấn Độ',
    shortDesc: 'Withanolides 5% — giảm stress, cân bằng cortisol, tăng sức bền.',
    benefits: ['Giảm stress', 'Ngủ ngon', 'Sức bền'],
    moq: '25 kg',
    badges: ['GMP', 'Halal', 'Organic'],
    image: 'field',
    specs: [
      { label: 'Hàm lượng', value: 'Withanolides ≥ 5%' },
      { label: 'Dạng', value: 'Bột chiết xuất' },
      { label: 'Bảo quản', value: 'Khô ráo, mát' },
      { label: 'Hạn dùng', value: '36 tháng' },
    ],
    applications: ['Viên nang', 'Gói bột', 'Đồ uống chức năng'],
  },
  {
    slug: 'probiotics-blend',
    name: 'Probiotics Blend',
    category: 'Men vi sinh',
    industry: 'Thực phẩm chức năng',
    origin: 'Đan Mạch',
    shortDesc: 'Hỗn hợp 10 chủng lactic — hỗ trợ tiêu hóa & miễn dịch đường ruột.',
    benefits: ['Tiêu hóa', 'Miễn dịch', 'Cân bằng hệ vi sinh'],
    moq: '10 kg',
    badges: ['GMP', 'Halal', 'Non-GMO'],
    tag: 'NEW',
    image: 'capsules',
    specs: [
      { label: 'Hàm lượng', value: '≥ 100 tỷ CFU/g' },
      { label: 'Dạng', value: 'Bột liophilized' },
      { label: 'Bảo quản', value: '2–8°C' },
      { label: 'Hạn dùng', value: '24 tháng' },
    ],
    applications: ['Viên nang', 'Gói bột', 'Dạng ngậm'],
  },
  {
    slug: 'coenzyme-q10',
    name: 'Coenzyme Q10',
    category: 'Hoạt chất chức năng',
    industry: 'Dược phẩm',
    origin: 'Nhật Bản',
    shortDesc: 'Ubiquinone ≥98% — năng lượng tế bào, bảo vệ tim mạch.',
    benefits: ['Tim mạch', 'Năng lượng', 'Chống oxy hóa'],
    moq: '5 kg',
    badges: ['GMP', 'Halal', 'Kosher'],
    image: 'oil',
    specs: [
      { label: 'Hàm lượng', value: 'Ubiquinone ≥ 98%' },
      { label: 'Dạng', value: 'Bột vàng nhạt' },
      { label: 'Bảo quản', value: 'Khô ráo, tránh ánh sáng' },
      { label: 'Hạn dùng', value: '36 tháng' },
    ],
    applications: ['Viên nang mềm', 'Viên nang', 'Viên nén'],
  },
  {
    slug: 'green-tea-extract',
    name: 'Green Tea Extract',
    inci: 'Camellia Sinensis Leaf Extract',
    category: 'Chiết xuất thực vật',
    industry: 'Mỹ phẩm',
    origin: 'Trung Quốc',
    shortDesc: 'EGCG ≥50% — chống oxy hóa, làm sáng da, kiểm soát dầu.',
    benefits: ['Chống oxy hóa', 'Làm sáng', 'Se khít lỗ chân lông'],
    moq: '25 kg',
    badges: ['GMP', 'Vegan', 'Organic'],
    image: 'leaf',
    specs: [
      { label: 'Hàm lượng', value: 'EGCG ≥ 50%' },
      { label: 'Dạng', value: 'Bột chiết xuất' },
      { label: 'Bảo quản', value: 'Khô ráo, mát' },
      { label: 'Hạn dùng', value: '24 tháng' },
    ],
    applications: ['Serum', 'Kem dưỡng', 'Viên nang'],
  },
  {
    slug: 'retinol',
    name: 'Retinol 1M IU/g',
    inci: 'Retinol',
    category: 'Hoạt chất chức năng',
    industry: 'Mỹ phẩm',
    origin: 'Thụy Sĩ',
    shortDesc: 'Retinol tinh khiết — chống lão hóa, tăng sinh collagen da.',
    benefits: ['Chống lão hóa', 'Tái tạo da', 'Làm mịn'],
    moq: '1 kg',
    badges: ['GMP', 'Non-GMO'],
    tag: 'EXCLUSIVE',
    image: 'glassware',
    specs: [
      { label: 'Hàm lượng', value: '1.000.000 IU/g' },
      { label: 'Dạng', value: 'Dầu vàng nhạt' },
      { label: 'Bảo quản', value: '2–8°C, tránh ánh sáng' },
      { label: 'Hạn dùng', value: '24 tháng' },
    ],
    applications: ['Serum', 'Kem dưỡng'],
  },
  {
    slug: 'niacinamide',
    name: 'Niacinamide',
    inci: 'Niacinamide',
    category: 'Hoạt chất chức năng',
    industry: 'Mỹ phẩm',
    origin: 'Hàn Quốc',
    shortDesc: 'Vitamin B3 ≥99% — làm sáng, se khít lỗ chân lông, cân bằng dầu.',
    benefits: ['Làm sáng', 'Se khít lỗ chân lông', 'Phục hồi hàng rào'],
    moq: '25 kg',
    badges: ['GMP', 'Vegan', 'Halal'],
    tag: 'TRENDING',
    image: 'powder',
    specs: [
      { label: 'Hàm lượng', value: '≥ 99%' },
      { label: 'Dạng', value: 'Bột trắng' },
      { label: 'Bảo quản', value: 'Khô ráo, tránh ẩm' },
      { label: 'Hạn dùng', value: '36 tháng' },
    ],
    applications: ['Serum', 'Kem dưỡng', 'Viên nang'],
  },
  {
    slug: 'glucosamine-sulfate',
    name: 'Glucosamine Sulfate',
    category: 'Vitamin & Khoáng',
    industry: 'Dược phẩm',
    origin: 'Pháp',
    shortDesc: 'Glucosamine sulfate 2KCl — hỗ trợ sụn khớp, giảm viêm khớp.',
    benefits: ['Xương khớp', 'Sụn khớp', 'Vận động'],
    moq: '25 kg',
    badges: ['GMP', 'Halal', 'Non-GMO'],
    image: 'capsules',
    specs: [
      { label: 'Hàm lượng', value: 'Glucosamine ≥ 83%' },
      { label: 'Dạng', value: 'Bột trắng' },
      { label: 'Bảo quản', value: 'Khô ráo, mát' },
      { label: 'Hạn dùng', value: '36 tháng' },
    ],
    applications: ['Viên nang', 'Viên nén', 'Gói bột'],
  },
  {
    slug: 'astaxanthin',
    name: 'Astaxanthin 2%',
    category: 'Dầu & Omega',
    industry: 'Thực phẩm chức năng',
    origin: 'Iceland',
    shortDesc: 'Astaxanthin tự nhiên từ tảo — chống oxy hóa mạnh gấp nhiều lần vitamin E.',
    benefits: ['Chống oxy hóa', 'Mắt', 'Da & chống lão hóa'],
    moq: '5 kg',
    badges: ['GMP', 'Vegan', 'Organic'],
    tag: 'EXCLUSIVE',
    image: 'oil',
    specs: [
      { label: 'Hàm lượng', value: 'Astaxanthin ≥ 2%' },
      { label: 'Dạng', value: 'Dầu đỏ đậm' },
      { label: 'Bảo quản', value: '2–8°C, tránh ánh sáng' },
      { label: 'Hạn dùng', value: '24 tháng' },
    ],
    applications: ['Viên nang mềm', 'Viên nang', 'Dạng nhũ tương'],
  },
  {
    slug: 'zinc-picolinate',
    name: 'Zinc Picolinate',
    category: 'Vitamin & Khoáng',
    industry: 'Thực phẩm chức năng',
    origin: 'Mỹ',
    shortDesc: 'Kẽm dạng picolinate — sinh khả dụng cao, hỗ trợ miễn dịch & da.',
    benefits: ['Miễn dịch', 'Da mụn', 'Tổng hợp protein'],
    moq: '10 kg',
    badges: ['GMP', 'Halal', 'Kosher'],
    image: 'powder',
    specs: [
      { label: 'Hàm lượng', value: 'Zinc ≥ 20%' },
      { label: 'Dạng', value: 'Bột trắng' },
      { label: 'Bảo quản', value: 'Khô ráo, mát' },
      { label: 'Hạn dùng', value: '36 tháng' },
    ],
    applications: ['Viên nang', 'Viên nén', 'Gói bột'],
  },
  {
    slug: 'ceramide-complex',
    name: 'Ceramide Complex',
    inci: 'Ceramide NP / AP / EOP',
    category: 'Hoạt chất chức năng',
    industry: 'Mỹ phẩm',
    origin: 'Nhật Bản',
    shortDesc: 'Phức hợp ceramide — phục hồi hàng rào da, giữ ẩm sâu.',
    benefits: ['Phục hồi da', 'Giữ ẩm', 'Giảm kích ứng'],
    moq: '5 kg',
    badges: ['GMP', 'Vegan', 'Non-GMO'],
    tag: 'NEW',
    image: 'labWork',
    specs: [
      { label: 'Hàm lượng', value: 'Ceramide ≥ 5%' },
      { label: 'Dạng', value: 'Bột lipid' },
      { label: 'Bảo quản', value: 'Khô ráo, mát' },
      { label: 'Hạn dùng', value: '24 tháng' },
    ],
    applications: ['Serum', 'Kem dưỡng'],
  },
]

export const INGREDIENT_CATEGORIES = [
  ...new Set(INGREDIENTS.map((it) => it.category)),
] as string[]

export const ORIGINS = [...new Set(INGREDIENTS.map((it) => it.origin))].sort() as string[]

export const PRODUCT_FORMS = [
  ...new Set(INGREDIENTS.map(ingredientForm).filter(Boolean)),
] as string[]

export type Solution = {
  slug: string
  title: string
  forWho: string
  receive: string[]
  cta: string
  summary?: string
  heroQuote?: string
  process?: { step: string; desc: string }[]
  idealFor?: string[]
  expectedOutcomes?: string[]
  faq?: { q: string; a: string }[]
  relatedCaseSlugs?: string[]
}

export const SOLUTIONS: Solution[] = [
  {
    slug: 'cung-cap-nguyen-lieu',
    title: 'Cung cấp nguyên liệu đặc biệt',
    forWho: 'Doanh nghiệp đã có đội R&D, cần nguồn nguyên liệu hiếm, chất lượng cao, đầy đủ tài liệu pháp lý.',
    receive: [
      '100+ nguyên liệu chuyên biệt',
      'COA / TDS / SDS đầy đủ',
      'Mẫu thử nhanh',
      'Nguồn cung ổn định từ 50+ quốc gia',
    ],
    cta: 'Khám phá nguyên liệu',
    summary: 'Danh mục hoạt chất hiếm, hiệu quả đã kiểm chứng — phù hợp khi bạn đã có năng lực phát triển sản phẩm và cần nguồn cung đáng tin.',
    process: [
      { step: 'Tư vấn kỹ thuật', desc: 'Xác định nguyên liệu, hàm lượng và chứng nhận phù hợp công thức & thị trường mục tiêu.' },
      { step: 'Gửi mẫu & tài liệu', desc: 'Cung cấp mẫu thử, TDS public và COA/SDS qua form gating khi cần đánh giá sâu.' },
      { step: 'Đàm phán & cung ứng', desc: 'Thống nhất MOQ, lịch giao hàng và hỗ trợ pháp lý nhập khẩu nếu cần.' },
      { step: 'Đồng hành sau bán', desc: 'Cập nhật batch mới, thay thế tương đương và tư vấn tối ưu công thức khi scale.' },
    ],
    idealFor: [
      'Nhà sản xuất đã có dây chuyền và đội R&D nội bộ',
      'Thương hiệu cần nguyên liệu hiếm hoặc chuẩn hóa cao',
      'Formulator cần COA/TDS đầy đủ cho hồ sơ công bố',
    ],
    expectedOutcomes: [
      'Rút ngắn thời gian sourcing từ tuần xuống vài ngày',
      'Giảm rủi ro chất lượng nhờ nguồn gốc minh bạch',
      'Ổn định chuỗi cung ứng dài hạn',
    ],
    faq: [
      { q: 'Bioscope có niêm yết giá công khai không?', a: 'Không — giá phụ thuộc MOQ, lô hàng và đàm phán. Vui lòng liên hệ để nhận báo giá phù hợp.' },
      { q: 'MOQ tối thiểu là bao nhiêu?', a: 'Tùy nguyên liệu, thường từ 5–25 kg. Một số mặt hàng độc quyền có MOQ thấp hơn cho mẫu thử.' },
      { q: 'TDS và COA lấy ở đâu?', a: 'TDS có thể xem/tải tại trang chi tiết nguyên liệu. COA và SDS yêu cầu email công việc qua form tải tài liệu.' },
    ],
    relatedCaseSlugs: ['vivomega'],
  },
  {
    slug: 'phat-trien-cong-thuc-odm',
    title: 'Phát triển công thức & ODM',
    forWho: 'Thương hiệu có ý tưởng nhưng cần đối tác xây dựng công thức và sản xuất.',
    receive: [
      'Đội ngũ R&D đồng hành',
      'Công thức tối ưu hiệu quả/chi phí',
      'Kiểm chứng & tạo mẫu',
      'Hỗ trợ pháp lý, sản xuất',
    ],
    cta: 'Tìm hiểu dịch vụ ODM',
    summary: 'Từ ý tưởng đến công thức hoàn chỉnh — Bioscope đồng hành formulator, kiểm chứng hiệu quả và hỗ trợ thương mại hóa.',
    process: [
      { step: 'Brief & mục tiêu', desc: 'Làm rõ phân khúc, claim, ngân sách và ràng buộc pháp lý (TPCN, mỹ phẩm, dược phẩm).' },
      { step: 'Đề xuất công thức', desc: 'Chọn nguyên liệu & công nghệ (Phytosome, nano…) tối ưu hiệu quả/chi phí.' },
      { step: 'Tạo mẫu & kiểm nghiệm', desc: 'Pilot batch, test cảm quan, ổn định và an toàn theo chuẩn ngành.' },
      { step: 'Scale-up & ra mắt', desc: 'Hỗ trợ chọn nhà máy GMP, hồ sơ công bố và triển khai sản xuất thương mại.' },
    ],
    idealFor: [
      'Startup brand có concept rõ nhưng thiếu lab nội bộ',
      'Thương hiệu muốn mở dòng sản phẩm mới nhanh',
      'Doanh nghiệp cần ODM trọn gói từ công thức đến bao bì',
    ],
    expectedOutcomes: [
      'Công thức khác biệt nhờ nguyên liệu & công nghệ độc quyền',
      'Giảm vòng lặp thử-sai nhờ kinh nghiệm 23+ dự án R&D',
      'Lộ trình rõ ràng từ mẫu đến sản xuất hàng loạt',
    ],
    faq: [
      { q: 'ODM khác gì mua nguyên liệu thuần?', a: 'ODM bao gồm nghiên cứu công thức, tạo mẫu, kiểm chứng và hỗ trợ sản xuất — không chỉ giao nguyên liệu.' },
      { q: 'Bao lâu có mẫu thử?', a: 'Thường 4–8 tuần tùy độ phức tạp; timeline cụ thể được ước lượng sau buổi brief đầu tiên.' },
      { q: 'Bioscope có hỗ trợ hồ sơ công bố không?', a: 'Có — hỗ trợ tài liệu kỹ thuật, COA và phối hợp với đơn vị công bố theo quy định Việt Nam.' },
    ],
    relatedCaseSlugs: ['gastroheal'],
  },
  {
    slug: 'dong-kien-tao-toan-hanh-trinh',
    title: 'Đồng kiến tạo toàn hành trình',
    forWho: 'Nhà phát triển nhãn hàng muốn xây thương hiệu lớn, bền vững từ con số 0.',
    receive: [
      'Phân tích thị trường & định giá',
      'Xây dựng công thức',
      'Test thị trường trước sản xuất',
      'Thương mại hóa & tăng trưởng',
    ],
    cta: 'Bắt đầu hành trình',
    summary: 'Đối tác chiến lược từ ý tưởng đến tăng trưởng — nghiên cứu thị trường trước, chỉ sản xuất khi có tín hiệu rõ.',
    heroQuote:
      'Bạn có ý tưởng thương hiệu. Chúng tôi có khoa học và kinh nghiệm thị trường. Nhiều nhà phát triển nhãn hàng thất bại vì làm sản phẩm trước, tìm thị trường sau.',
    process: [
      { step: 'Khám phá thị trường', desc: 'Phân tích phân khúc, đối thủ, kênh bán và mức giá trước khi cam kết sản xuất.' },
      { step: 'Thiết kế giá trị', desc: 'Định vị thương hiệu, công thức và câu chuyện khoa học khác biệt.' },
      { step: 'Test tín hiệu', desc: 'Thử nghiệm online/offline với batch nhỏ để xác nhận nhu cầu thực.' },
      { step: 'Thương mại hóa', desc: 'Scale sản xuất, phân phối và tối ưu danh mục theo dữ liệu bán hàng.' },
      { step: 'Tăng trưởng dài hạn', desc: 'Mở rộng SKU, tối ưu chi phí và đồng hành marketing khoa học.' },
    ],
    idealFor: [
      'Nhà phát triển nhãn hàng muốn launch từ con số 0',
      'Founder cần đối tác chiến lược, không chỉ nhà cung ứng',
      'Thương hiệu hướng tới tăng trưởng bền vững, biên cao',
    ],
    expectedOutcomes: [
      'Giảm rủi ro tồn kho nhờ validate thị trường trước',
      'Tăng tỷ lệ thành công sản phẩm mới',
      'Xây dựng ngành hàng có lợi thế cạnh tranh lâu dài',
    ],
    faq: [
      { q: '"Đồng kiến tạo" khác ODM thế nào?', a: 'Đồng kiến tạo bao trùm chiến lược thị trường, định giá và tăng trưởng — ODM tập trung vào công thức & sản xuất.' },
      { q: 'Bioscope có tham gia phân phối không?', a: 'Chúng tôi hỗ trợ chiến lược kênh và thương mại hóa; mô hình cụ thể được thống nhất theo từng dự án.' },
      { q: 'Ví dụ thành công?', a: 'vivomega® (0 → 500K USD/năm), Gastroheal (70%+ truyền miệng), PEA (Category Creator tại Việt Nam).' },
    ],
    relatedCaseSlugs: ['vivomega', 'pea', 'gastroheal'],
  },
]

export type CaseStudy = {
  slug: string
  brand: string
  partner: string
  kpi: string
  kpiLabel: string
  industry: string
  image: ImgKey
  coverImage?: string
  tags: string[]
  summary?: string
  problem: string
  solution: string
  result: string[]
  testimonial?: string
  coCreateSteps?: string[]
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'vivomega',
    brand: 'vivomega®',
    partner: 'GC Rieber Oils',
    kpi: '500K USD',
    kpiLabel: 'doanh thu/năm — từ con số 0',
    industry: 'Thực phẩm chức năng',
    image: 'oil',
    coverImage: '/images/vivomega.png',
    tags: ['Đồng kiến tạo', 'Dầu & Omega'],
    summary: 'Xây dựng ngành hàng omega-3 cao cấp tại Việt Nam cùng GC Rieber Oils.',
    problem: 'Thị trường Việt Nam thiếu một dòng omega-3 chất lượng cao, minh bạch nguồn gốc và đạt chuẩn quốc tế.',
    solution: 'Bioscope đồng kiến tạo cùng GC Rieber Oils: chọn nguyên liệu dạng TG tinh khiết IFOS 5★, xây dựng định vị và câu chuyện thương hiệu, hỗ trợ pháp lý và thương mại hóa.',
    result: ['Từ 0 → 500.000 USD doanh thu/năm', 'Xây dựng ngành hàng omega-3 cao cấp', 'Hệ thống phân phối ổn định'],
    coCreateSteps: ['Phân tích phân khúc omega-3 cao cấp', 'Chọn dầu cá TG IFOS 5★', 'Xây dựng thương hiệu & kênh phân phối', 'Scale doanh thu bền vững'],
    testimonial: 'Bioscope không chỉ cung cấp nguyên liệu — họ đồng hành từ định vị đến thương mại hóa, giúp chúng tôi tạo ra một ngành hàng mới tại Việt Nam.',
  },
  {
    slug: 'gastroheal',
    brand: 'Gastroheal',
    partner: 'Phytosome ướt',
    kpi: '70%+',
    kpiLabel: 'doanh thu đến từ truyền miệng',
    industry: 'Dược phẩm',
    image: 'microscope',
    coverImage: '/images/gastroheal.png',
    tags: ['Phytosome ướt', 'Tiêu hóa'],
    summary: 'Giải pháp dạ dày được tin dùng — giảm đau nhanh, phục hồi niêm mạc.',
    problem: 'Thị trường thiếu giải pháp dạ dày vừa giảm đau nhanh vừa thực sự phục hồi tổn thương niêm mạc.',
    solution: 'Ứng dụng công nghệ Phytosome ướt độc quyền — phức chất curcuminoid + phosphatidylcholine, tăng sinh khả dụng và phục hồi niêm mạc.',
    result: ['Dứt cơn đau trong 30 phút', '53%+ lành loét sau 2 tháng', '70%+ doanh thu từ truyền miệng'],
    coCreateSteps: ['Nghiên cứu cơ chế Phytosome ướt', 'Tối ưu công thức & claim', 'Kiểm chứng lâm sàng thực tế', 'Ra mắt & tăng trưởng truyền miệng'],
    testimonial: 'Công nghệ Phytosome ướt tạo ra sự khác biệt rõ rệt — người dùng cảm nhận hiệu quả nhanh và tin tưởng giới thiệu cho người thân.',
  },
  {
    slug: 'pea',
    brand: 'PEA',
    partner: 'PolymerSolution',
    kpi: '#1',
    kpiLabel: 'người tạo ngành hàng (Category Creator) tại Việt Nam',
    industry: 'Mỹ phẩm',
    image: 'labWork',
    coverImage: '/images/pea.png',
    tags: ['Công nghệ độc quyền', 'Da liễu'],
    summary: 'Tiên phong giải pháp kháng viêm qua da với công nghệ phóng thích chậm 24h.',
    problem: 'Chưa có giải pháp kháng viêm qua da phóng thích chậm, hiệu quả kéo dài tại thị trường Việt Nam.',
    solution: 'Tiên phong đưa công nghệ phân phối thuốc qua da Polymerit, tạo ra ngành hàng mới với trị liệu liên tục 24h.',
    result: ['Người tạo ngành hàng (Category Creator)', 'Trị liệu liên tục 24h', 'Ứng dụng đa dạng da liễu & mỹ phẩm'],
    coCreateSteps: ['Đánh giá khoảng trống thị trường da liễu', 'Ứng dụng Polymerit', 'Tạo category mới', 'Mở rộng danh mục sản phẩm'],
    testimonial: 'Polymerit giúp chúng tôi không chỉ bán sản phẩm mà tạo ra một ngách mới — trị liệu liên tục 24 giờ qua da.',
  },
]

export type Technology = {
  name: string
  product: string
  mechanism: string
  highlights: string[]
  applications: string[]
}

export const TECHNOLOGIES: Technology[] = [
  {
    name: 'Công nghệ Phytosome ướt',
    product: 'Gastroheal',
    mechanism:
      'Phức chất giữa phosphatidylcholine (thành phần màng nhày dạ dày) và curcuminoid (kháng viêm tự nhiên), cho sinh khả dụng vượt trội và "vá" vết loét niêm mạc.',
    highlights: ['Dứt cơn đau dạ dày trong 30 phút', 'Hơn 53% bệnh nhân lành loét sau 2 tháng', 'Hơn 70% doanh thu từ truyền miệng'],
    applications: ['Tiêu hóa', 'Kháng viêm'],
  },
  {
    name: 'Công nghệ Polymerit',
    product: 'Trị liệu liên tục 24h qua da',
    mechanism:
      'Công nghệ phân phối thuốc ngoài da phóng thích chậm, giúp tác dụng kéo dài suốt 24h mỗi ngày — "trị liệu liên tục".',
    highlights: ['Băng vết thương, vảy nến, viêm da cơ địa', 'Mỹ phẩm hiệu năng cao: làm sáng, chống nắng, trị mụn', 'Thiết bị y tế & thuốc ngoài da thế hệ mới'],
    applications: ['Da liễu', 'Mỹ phẩm hiệu năng cao'],
  },
]

export const COMPANY_STATS = [
  { value: '15+', label: 'Năm kinh nghiệm' },
  { value: '23+', label: 'Dự án R&D' },
  { value: '14', label: 'Đơn sáng chế' },
  { value: '100+', label: 'Nguyên liệu mới' },
]

/** Nội dung bổ sung theo tài liệu khảo sát — dùng trên các trang nội bộ */
export const TRUST_PILLARS = [
  {
    title: 'Nguyên liệu chuyên biệt',
    desc: 'Danh mục hoạt chất hiếm, hiệu quả đã được kiểm chứng — từ chiết xuất thực vật đến công nghệ nano.',
  },
  {
    title: 'Đảm bảo chất lượng toàn cầu',
    desc: 'Đầy đủ chứng nhận GMP, ISO 22000, HACCP, Halal, Kosher và tài liệu kỹ thuật minh bạch.',
  },
  {
    title: 'Nguồn cung ổn định',
    desc: 'Hợp tác trực tiếp với nhà sản xuất R&D tại hơn 50 quốc gia — ổn định chuỗi cung dài hạn.',
  },
]

export const ABOUT_TIMELINE = [
  { year: '2011', text: 'Bioscope được thành lập, khởi đầu hành trình nghiên cứu & phân phối công nghệ y dược.' },
  {
    year: '2015–2018',
    text: 'Mở rộng danh mục nguyên liệu chuyên biệt và hợp tác với các đối tác quốc tế Indena, GC Rieber Oils, Sabinsa.',
  },
  {
    year: '2019–2022',
    text: 'Phát triển công nghệ Phytosome ướt & Polymerit; ra mắt Gastroheal và các sản phẩm ứng dụng da liễu.',
  },
  {
    year: '2023–nay',
    text: 'Đồng kiến tạo vivomega® và nhiều thương hiệu mới; 23+ dự án R&D, 14 đơn sáng chế, 100+ nguyên liệu mới.',
  },
]

export const ABOUT_DIFFERENTIATION = {
  title: 'Nhà phân phối công nghệ — không chỉ là nhà cung ứng nguyên liệu',
  description:
    'Khác với đơn vị bán nguyên liệu thuần túy, Bioscope là đối tác chiến lược đồng hành từ ý tưởng đến thương mại hóa. Chúng tôi đồng hành sớm: nghiên cứu ý tưởng, phân tích thị trường, chọn phân khúc, kênh bán, mức giá… rồi mới xây công thức và test nhu cầu — chỉ làm hàng khi có tín hiệu tốt. Đối tác được lựa chọn của Việt Nam cho nguyên liệu cao cấp và đổi mới đột phá.',
}

export const ABOUT_CORE_VALUES = [
  { title: 'Khoa học dẫn lối', desc: 'Mọi quyết định dựa trên bằng chứng, cơ chế tác động và dữ liệu thị trường.' },
  { title: 'Hiệu quả/chi phí', desc: 'Tối ưu công thức để người tiêu dùng nhận được giá trị thật với chi phí hợp lý.' },
  { title: 'Đồng hành dài hạn', desc: 'Không giao hàng rồi kết thúc — cùng thương hiệu tăng trưởng bền vững.' },
  { title: 'Đổi mới không ngừng', desc: '23+ dự án R&D, 14 đơn sáng chế và liên tục đưa công nghệ mới vào Việt Nam.' },
]

export const CLIENT_LOGOS = [
  { name: 'GC Rieber Oils', logo: '/images/clients/GCRieberOils.svg' },
  { name: 'Indena', logo: '/images/clients/indena_science.png' },
  { name: 'PolymerSolution', logo: '/images/clients/PolymerSolution.png' },
  { name: 'Naturex', logo: '/images/clients/Naturex.png' },
  { name: 'Sabinsa', logo: '/images/clients/sabinsa-canada-logo.png' },
  { name: 'PLT Health Solutions', logo: '/images/clients/PLT-logo.webp' },
  { name: 'Healthy Care', logo: '/images/clients/healthy-care-logo.webp' },
  { name: 'DHG Pharma', logo: '/images/clients/dgh.png' },
] as const

export const GLOBAL_PARTNERS = CLIENT_LOGOS.map((c) => c.name)

export const CO_CREATE_COMPARISON = {
  traditional: [
    'Giao nguyên liệu theo đơn hàng',
    'Khách tự nghiên cứu thị trường',
    'Rủi ro làm hàng trước khi biết nhu cầu',
    'Kết thúc khi giao hàng xong',
  ],
  bioscope: [
    'Đồng hành từ ý tưởng & phân tích thị trường',
    'Đề xuất công thức tối ưu hiệu quả/chi phí',
    'Test tín hiệu thị trường trước khi scale',
    'Tăng trưởng & tối ưu liên tục sau ra mắt',
  ],
}

export const CO_CREATE_STEP_DURATIONS = [
  { step: 'Ý tưởng & phân tích', duration: '2–4 tuần' },
  { step: 'Nghiên cứu & đề xuất', duration: '4–8 tuần' },
  { step: 'Kiểm chứng & thử nghiệm', duration: '6–12 tuần' },
  { step: 'Phát triển & ra mắt', duration: '8–16 tuần' },
  { step: 'Tăng trưởng dài hạn', duration: 'Liên tục' },
]

export const RD_RESEARCH_AREAS = [
  'Sinh khả dụng & phytosome',
  'Dẫn truyền qua da & Polymerit',
  'Nano hoạt chất',
  'Men vi sinh & tiêu hóa',
  'Chống lão hóa & nhận thức',
  'Da liễu & mỹ phẩm hiệu năng cao',
]

export const RD_WHITEPAPERS = [
  {
    title: 'Sinh khả dụng của curcumin: từ phytosome đến hiệu quả lâm sàng',
    type: 'Whitepaper',
    gated: true,
  },
  {
    title: 'Công nghệ Polymerit — trị liệu liên tục 24h qua da',
    type: 'E-book',
    gated: true,
  },
  {
    title: 'Vì sao nên test thị trường trước khi làm hàng?',
    type: 'Blog chuyên môn',
    gated: false,
  },
]

export const RESOURCE_ITEMS = [
  {
    slug: 'sinh-kha-dung-curcumin-phytosome',
    title: 'Sinh khả dụng của curcumin: từ phytosome đến hiệu quả lâm sàng',
    category: 'Whitepaper',
    desc: 'Phân tích cơ chế Phytosome ướt và so sánh với curcumin thông thường.',
    gated: true,
  },
  {
    slug: 'test-thi-truong-truoc-khi-lam-hang',
    title: 'Vì sao nên test thị trường trước khi làm hàng?',
    category: 'Blog',
    desc: 'Quy trình validate nhu cầu giúp giảm rủi ro đầu tư cho nhãn hàng mới.',
    gated: false,
  },
  {
    slug: 'dong-kien-tao-nhan-hang-trieu-do',
    title: 'Đồng kiến tạo nhãn hàng triệu đô — quy trình 5 bước',
    category: 'Webinar',
    desc: 'Ghi hình hội thảo cùng đội ngũ R&D và case study vivomega®.',
    gated: true,
  },
  {
    slug: 'chung-nhan-gmp-halal-kosher',
    title: 'Chứng nhận GMP, Halal, Kosher — hướng dẫn cho formulator',
    category: 'Formulator',
    desc: 'Giải thích ý nghĩa từng chứng nhận và cách chọn nguyên liệu phù hợp thị trường.',
    gated: false,
  },
  {
    slug: 'omega-3-tg-vs-ee',
    title: 'Omega-3 dạng TG vs EE: điều gì quan trọng với người tiêu dùng?',
    category: 'Blog',
    desc: 'So sánh sinh khả dụng và positioning cho thương hiệu TPCN.',
    gated: false,
  },
  {
    slug: 'cong-nghe-polymerit-da-lieu',
    title: 'Công nghệ Polymerit trong da liễu & mỹ phẩm hiệu năng cao',
    category: 'Whitepaper',
    desc: 'Cơ chế phóng thích chậm 24h và ứng dụng thực tế tại Việt Nam.',
    gated: true,
  },
  {
    slug: 'checklist-cong-thuc-tpcn',
    title: 'Checklist công thức TPCN — 12 bước trước khi sản xuất',
    category: 'Formulator',
    desc: 'Danh sách kiểm tra từ chọn hoạt chất, liều dùng đến hồ sơ công bố.',
    gated: false,
  },
  {
    slug: 'infographic-phytosome-uot',
    title: 'Infographic: Cơ chế Phytosome ướt trong 1 trang',
    category: 'Infographic',
    desc: 'Tóm tắt trực quan sinh khả dụng và ứng dụng trong TPCN/dược phẩm.',
    gated: false,
  },
  {
    slug: 'infographic-quy-trinh-launch',
    title: 'Checklist launch sản phẩm mới — 8 tuần đầu tiên',
    category: 'Infographic',
    desc: 'Lộ trình từ validate ý tưởng, test thị trường đến chuẩn bị sản xuất.',
    gated: true,
  },
  {
    slug: 'ebook-phat-trien-nhan-hang-tpcn',
    title: 'E-book: Phát triển nhãn hàng TPCN từ A–Z',
    category: 'E-book',
    desc: 'Hướng dẫn chọn phân khúc, công thức, kênh bán và positioning.',
    gated: true,
  },
]

export type ResourceCategory = {
  slug: string
  title: string
  shortDesc: string
  description: string
  image: ImgKey
  filterCategories?: string[]
  useCaseStudies?: boolean
}

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  {
    slug: 'whitepaper-ebook',
    title: 'Whitepaper / E-book',
    shortDesc: 'Nghiên cứu chuyên sâu về cơ chế công nghệ và sinh khả dụng.',
    description:
      'Whitepaper và E-book từ đội ngũ R&D Bioscope — phân tích cơ chế tác động, sinh khả dụng và bằng chứng ứng dụng thực tế. Một số tài liệu yêu cầu đăng ký email để tải về.',
    image: 'labWork',
    filterCategories: ['Whitepaper', 'E-book'],
  },
  {
    slug: 'blog-chuyen-mon',
    title: 'Blog chuyên môn',
    shortDesc: 'Kiến thức phát triển nhãn hàng, công thức và thị trường.',
    description:
      'Bài viết chuyên sâu về phát triển nhãn hàng, xây dựng công thức, xu hướng nguyên liệu và chiến lược thị trường — tái sử dụng tài sản R&D sẵn có, nuôi SEO và nuôi dưỡng cộng đồng formulator.',
    image: 'botanical',
    filterCategories: ['Blog'],
  },
  {
    slug: 'video-webinar',
    title: 'Video Webinar',
    shortDesc: 'Hội thảo trực tuyến cùng chuyên gia R&D và đối tác.',
    description:
      'Ghi hình hội thảo, workshop và chia sẻ kinh nghiệm từ chuyên gia Bioscope cùng đối tác quốc tế — quy trình đồng kiến tạo, công nghệ mới và case study thực tế.',
    image: 'glassware',
    filterCategories: ['Webinar'],
  },
  {
    slug: 'case-study',
    title: 'Case Study',
    shortDesc: 'Bài học thực tế từ vivomega®, Gastroheal và các nhãn hàng đồng kiến tạo.',
    description:
      'Câu chuyện thành công thật — vấn đề, giải pháp Bioscope và kết quả đo lường được. Mỗi case study minh họa cách chúng tôi đồng hành từ ý tưởng đến tăng trưởng thị trường.',
    image: 'field',
    useCaseStudies: true,
  },
  {
    slug: 'huong-dan-formulator',
    title: 'Hướng dẫn Formulator',
    shortDesc: 'Checklist công thức, chứng nhận GMP/Halal/Kosher và quy trình công bố.',
    description:
      'Tài liệu thực hành dành cho formulator và nhà phát triển sản phẩm — checklist công thức, hiểu chứng nhận, chuẩn bị hồ sơ công bố TPCN/mỹ phẩm theo quy định Việt Nam.',
    image: 'capsules',
    filterCategories: ['Formulator'],
  },
  {
    slug: 'infographic-checklist',
    title: 'Infographic & Checklist',
    shortDesc: 'Tóm tắt trực quan cơ chế Phytosome, Polymerit và quy trình launch sản phẩm.',
    description:
      'Infographic và checklist tải nhanh — tóm tắt cơ chế công nghệ, quy trình launch và các bước kiểm tra trước khi sản xuất, phù hợp chia sẻ nội bộ hoặc training đội ngũ.',
    image: 'powder',
    filterCategories: ['Infographic'],
  },
]

export function getResourceCategory(slug: string) {
  return RESOURCE_CATEGORIES.find((c) => c.slug === slug)
}

export function getResourceItemsForCategory(slug: string) {
  const cat = getResourceCategory(slug)
  if (!cat?.filterCategories) return []
  return RESOURCE_ITEMS.filter((i) => cat.filterCategories!.includes(i.category))
}

export const BLOG_TOPICS = [
  'Phát triển nhãn hàng',
  'Công thức & Formulator',
  'Nguyên liệu & Công nghệ',
  'Thị trường & Xu hướng',
  'Chứng nhận & Quy định',
] as const

export const BLOG_INDUSTRIES = ['Thực phẩm chức năng', 'Mỹ phẩm', 'Dược phẩm', 'Đa ngành'] as const

export type BlogSection = {
  id: string
  title: string
  paragraphs: string[]
}

export type BlogComment = {
  id: string
  author: string
  role?: string
  company?: string
  date: string
  content: string
}

export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  topic: (typeof BLOG_TOPICS)[number]
  industry: (typeof BLOG_INDUSTRIES)[number]
  readTime: number
  date: string
  author: string
  image: ImgKey
  body: string[]
  sections?: BlogSection[]
  tags?: string[]
}

const SECTION_TITLES = ['Bối cảnh & vấn đề', 'Phân tích & giải pháp', 'Kết luận & hành động'] as const

export function getBlogSections(post: BlogPost): BlogSection[] {
  if (post.sections?.length) return post.sections
  if (post.body.length === 0) return []
  if (post.body.length === 1) {
    return [{ id: 'tong-quan', title: 'Tổng quan', paragraphs: post.body }]
  }
  const sections: BlogSection[] = []
  const chunkSize = Math.ceil(post.body.length / 3)
  for (let i = 0; i < post.body.length; i += chunkSize) {
    const idx = sections.length
    sections.push({
      id: `section-${idx}`,
      title: SECTION_TITLES[idx] ?? `Phần ${idx + 1}`,
      paragraphs: post.body.slice(i, i + chunkSize),
    })
  }
  return sections
}

export const BLOG_SAMPLE_COMMENTS: BlogComment[] = [
  {
    id: 'c1',
    author: 'Nguyễn Minh Anh',
    role: 'Formulator',
    company: 'NovaHealth',
    date: '2026-06-18',
    content: 'Bài viết rất thực tế — đặc biệt phần validate trước khi sản xuất. Team chúng tôi đã áp dụng và giảm được rủi ro tồn kho đáng kể.',
  },
  {
    id: 'c2',
    author: 'Trần Hoàng Long',
    role: 'Product Manager',
    company: 'GreenLab VN',
    date: '2026-06-12',
    content: 'Cảm ơn Bioscope đã chia sẻ case study rõ ràng. Mong có thêm bài về positioning TPCN premium.',
  },
]

export function getRelatedBlogPosts(post: BlogPost, limit = 3): BlogPost[] {
  const others = BLOG_POSTS.filter((p) => p.slug !== post.slug)
  const sameTopic = others.filter((p) => p.topic === post.topic)
  const sameIndustry = others.filter((p) => p.industry === post.industry && p.topic !== post.topic)
  const rest = others.filter((p) => p.topic !== post.topic && p.industry !== post.industry)
  return [...sameTopic, ...sameIndustry, ...rest].slice(0, limit)
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'test-thi-truong-truoc-khi-lam-hang',
    title: 'Vì sao nên test thị trường trước khi làm hàng?',
    excerpt: 'Quy trình validate nhu cầu giúp giảm rủi ro đầu tư cho nhãn hàng mới — chỉ sản xuất khi có tín hiệu rõ.',
    topic: 'Phát triển nhãn hàng',
    industry: 'Đa ngành',
    readTime: 6,
    date: '2026-06-20',
    author: 'Đội ngũ R&D Bioscope',
    image: 'field',
    body: [
      'Nhiều nhãn hàng thất bại không phải vì công thức kém, mà vì làm hàng trước khi hiểu thị trường. Bioscope khuyến nghị validate ý tưởng qua khảo sát, landing page test hoặc bán thử trước khi cam kết MOQ lớn.',
      'Quy trình gợi ý: xác định phân khúc → đề xuất giá trị cốt lõi → test messaging → thu thập lead/email → đánh giá tín hiệu chuyển đổi. Chỉ khi có dữ liệu tích cực mới triển khai công thức và sản xuất.',
      'Cách tiếp cận này đặc biệt phù hợp startup TPCN/mỹ phẩm với ngân sách hạn chế — giảm tồn kho và tăng xác suất product-market fit ngay từ đầu.',
    ],
  },
  {
    slug: 'omega-3-tg-vs-ee',
    title: 'Omega-3 dạng TG vs EE: điều gì quan trọng với người tiêu dùng?',
    excerpt: 'So sánh sinh khả dụng, an toàn và cách positioning cho thương hiệu TPCN cao cấp.',
    topic: 'Nguyên liệu & Công nghệ',
    industry: 'Thực phẩm chức năng',
    readTime: 7,
    date: '2026-06-15',
    author: 'Đội ngũ R&D Bioscope',
    image: 'oil',
    body: [
      'Dầu cá omega-3 có thể ở dạng triglyceride (TG) hoặc ethyl ester (EE). TG là dạng tự nhiên, sinh khả dụng cao hơn và thường được ưa chuộng trong phân khúc premium.',
      'EE có thể đạt nồng độ EPA/DHA cao hơn trong quá trình tinh chế, nhưng cần giải thích rõ trên nhãn để người tiêu dùng hiểu. Positioning nên dựa trên bằng chứng sinh khả dụng và chứng nhận (IFOS, Friend of the Sea…).',
      'Khi xây dựng nhãn hàng omega-3 tại Việt Nam, hãy cân nhắc đối tượng mục tiêu, ngân sách nguyên liệu và thông điệp khác biệt — Bioscope hỗ trợ chọn grade phù hợp từ GC Rieber Oils và đối tác quốc tế.',
    ],
  },
  {
    slug: 'phat-trien-nhan-hang-tpcn-tu-a-z',
    title: 'Phát triển nhãn hàng TPCN từ A–Z: 7 bước thực chiến',
    excerpt: 'Lộ trình từ ý tưởng, chọn phân khúc, công thức đến ra mắt thị trường Việt Nam.',
    topic: 'Phát triển nhãn hàng',
    industry: 'Thực phẩm chức năng',
    readTime: 9,
    date: '2026-06-10',
    author: 'Đội ngũ R&D Bioscope',
    image: 'capsules',
    body: [
      'Bước 1–2: nghiên cứu thị trường và chọn phân khúc có nhu cầu rõ (tim mạch, tiêu hóa, miễn dịch…). Bước 3: xác định điểm khác biệt — công nghệ nguyên liệu, sinh khả dụng hoặc trải nghiệm sử dụng.',
      'Bước 4–5: phát triển công thức với formulator, tối ưu hiệu quả/chi phí và kiểm tra ổn định. Bước 6: chuẩn bị hồ sơ công bố và nhãn theo quy định. Bước 7: launch có kiểm soát — test kênh, đo phản hồi, điều chỉnh.',
      'Bioscope đồng hành ở mọi bước — từ gợi ý nguyên liệu đến tư vấn positioning và case study tham khảo.',
    ],
  },
  {
    slug: 'sinh-kha-dung-curcumin-thuc-chien',
    title: 'Sinh khả dụng curcumin trong thực chiến: Phytosome vs bột thường',
    excerpt: 'Curcumin thuần hấp thu kém — công nghệ phytosome ướt giải quyết bài toán này như thế nào?',
    topic: 'Nguyên liệu & Công nghệ',
    industry: 'Thực phẩm chức năng',
    readTime: 8,
    date: '2026-06-05',
    author: 'Đội ngũ R&D Bioscope',
    image: 'powder',
    body: [
      'Curcumin có sinh khả dụng sinh học thấp khi dùng dạng bột truyền thống. Phytosome — phức hợp với phospholipid — cải thiện đáng kể hấp thu qua màng tế bào.',
      'Công nghệ Phytosome ướt của Bioscope cho phép ứng dụng linh hoạt trong TPCN và dược phẩm, với bằng chứng cơ chế rõ ràng để hỗ trợ claim trên nhãn (theo quy định từng thị trường).',
      'Khi formulator chọn curcumin, cần cân nhắc liều hiệu quả, chi phí trên đơn vị hoạt chất sinh khả dụng và khả năng kể câu chuyện khoa học với người tiêu dùng.',
    ],
  },
  {
    slug: 'xay-dung-cong-thuc-my-pham-hieu-nang-cao',
    title: 'Xây dựng công thức mỹ phẩm hiệu năng cao: từ hoạt chất đến texture',
    excerpt: 'Cân bằng hoạt chất chức năng, vehicle dẫn truyền và trải nghiệm cảm quan trên da.',
    topic: 'Công thức & Formulator',
    industry: 'Mỹ phẩm',
    readTime: 8,
    date: '2026-05-28',
    author: 'Đội ngũ R&D Bioscope',
    image: 'glassware',
    body: [
      'Mỹ phẩm hiệu năng cao (cosmeceutical) đòi hỏi hoạt chất có bằng chứng và hệ dẫn truyền phù hợp — serum, cream hoặc patch tùy mục tiêu.',
      'Polymerit và các công nghệ phóng thích chậm giúp duy trì nồng độ hoạt chất trên da, hỗ trợ claim hiệu quả lâu dài. Formulator cần test ổn định, pH và tương thích giữa các hoạt chất.',
      'Bioscope cung cấp nguyên liệu chuyên biệt kèm tài liệu kỹ thuật và hỗ trợ phối hợp công thức ODM khi cần.',
    ],
  },
  {
    slug: 'chung-nhan-gmp-la-gi',
    title: 'Chứng nhận GMP là gì và vì sao formulator cần quan tâm?',
    excerpt: 'Giải thích ngắn gọn GMP, ISO 22000, HACCP — và cách chọn nguyên liệu đạt chuẩn.',
    topic: 'Chứng nhận & Quy định',
    industry: 'Đa ngành',
    readTime: 5,
    date: '2026-05-22',
    author: 'Đội ngũ R&D Bioscope',
    image: 'labWork',
    body: [
      'GMP (Good Manufacturing Practice) đảm bảo quy trình sản xuất nguyên liệu và thành phẩm đạt chuẩn chất lượng đồng nhất — yếu tố then chốt khi công bố sản phẩm và xây dựng niềm tin thương hiệu.',
      'ISO 22000 và HACCP bổ sung khung quản lý an toàn thực phẩm. Halal/Kosher mở rộng thị trường xuất khẩu và phân khúc tiêu dùng đặc thù.',
      'Trên catalog Bioscope, mỗi nguyên liệu ghi rõ chứng nhận — giúp formulator lọc nhanh theo yêu cầu hồ sơ công bố.',
    ],
  },
  {
    slug: 'quy-trinh-cong-bo-tpcn-viet-nam',
    title: 'Quy trình công bố TPCN tại Việt Nam: checklist cho nhãn hàng mới',
    excerpt: 'Các bước chuẩn bị hồ sơ, tài liệu nguyên liệu và lưu ý thường gặp khi công bố lần đầu.',
    topic: 'Chứng nhận & Quy định',
    industry: 'Thực phẩm chức năng',
    readTime: 10,
    date: '2026-05-18',
    author: 'Đội ngũ R&D Bioscope',
    image: 'capsules',
    body: [
      'Công bố TPCN yêu cầu hồ sơ đầy đủ về thành phần, nguồn gốc nguyên liệu, COA và cam kết chất lượng. Chuẩn bị sớm giúp rút ngắn thời gian ra mắt.',
      'Bioscope cung cấp TDS, COA, SDS theo mô hình hybrid — hỗ trợ formulator và đơn vị công bố thu thập tài liệu nhanh chóng.',
      'Lưu ý: claim trên nhãn phải phù hợp quy định — tránh cam kết điều trị khi sản phẩm là TPCN. Đội ngũ Bioscope tư vấn phạm vi claim an toàn khi phát triển công thức.',
    ],
  },
  {
    slug: 'phytosome-uot-khac-biet-the-nao',
    title: 'Phytosome ướt khác biệt thế nào so với dạng khô?',
    excerpt: 'Ưu điểm sinh khả dụng, ứng dụng trong Gastroheal và các sản phẩm tiêu hóa.',
    topic: 'Nguyên liệu & Công nghệ',
    industry: 'Dược phẩm',
    readTime: 7,
    date: '2026-05-12',
    author: 'Đội ngũ R&D Bioscope',
    image: 'botanical',
    body: [
      'Phytosome ướt duy trì phức hợp hoạt chất–phospholipid ở trạng thái tối ưu, thuận lợi cho một số dạng bào chế so với powder phytosome truyền thống.',
      'Ứng dụng tiêu biểu: Gastroheal — bảo vệ niêm mạc dạ dày, hỗ trợ phục hồi. Cơ chế được mô tả rõ trong tài liệu kỹ thuật Bioscope.',
      'Formulator dược phẩm/TPCN có thể yêu cầu mẫu và buổi tư vấn kỹ thuật để đánh giá phù hợp với công thức mục tiêu.',
    ],
  },
  {
    slug: 'positioning-san-pham-moi-thi-truong-viet',
    title: 'Positioning sản phẩm mới trên thị trường Việt: 4 khung thông điệp',
    excerpt: 'Khoa học dẫn lối, hiệu quả thực tế, nguồn gốc minh bạch và giá trị/chi phí — chọn trụ cột nào?',
    topic: 'Thị trường & Xu hướng',
    industry: 'Đa ngành',
    readTime: 6,
    date: '2026-05-08',
    author: 'Đội ngũ R&D Bioscope',
    image: 'field',
    body: [
      'Thị trường Việt ngày càng am hiểu — người tiêu dùng tin vào bằng chứng, không chỉ quảng cáo. Positioning hiệu quả thường kết hợp cơ chế rõ ràng và lợi ích cảm nhận được.',
      'Khung 4 trụ: (1) Công nghệ độc quyền, (2) Chứng nhận quốc tế, (3) Case study/ social proof, (4) Tối ưu giá trị trên liều dùng hiệu quả.',
      'Bioscope hỗ trợ đối tác xác định thông điệp phù hợp phân khúc — tránh copy claim đối thủ mà không có differentiation thật.',
    ],
  },
  {
    slug: 'chon-nguyen-lieu-mien-dich',
    title: 'Chọn nguyên liệu cho dòng sản phẩm miễn dịch: nấm, vitamin hay kết hợp?',
    excerpt: 'So sánh Lion\'s Mane, beta-glucan, vitamin C/D3 và chiến lược phối hợp công thức.',
    topic: 'Công thức & Formulator',
    industry: 'Thực phẩm chức năng',
    readTime: 8,
    date: '2026-05-02',
    author: 'Đội ngũ R&D Bioscope',
    image: 'botanical',
    body: [
      'Phân khúc miễn dịch vẫn tăng trưởng — nhưng cần hoạt chất có cơ sở và liều hợp lý. Nấm dược liệu (Lion\'s Mane, Reishi…) và beta-glucan được quan tâm nhờ bằng chứng miễn dịch.',
      'Vitamin C, D3, kẽm bổ trợ nền tảng — phối hợp đúng giúp tăng giá trị cảm nhận mà không làm công thức phức tạp quá mức.',
      'Catalog Bioscope có nhiều lựa chọn kèm MOQ linh hoạt — liên hệ để nhận gợi ý bộ nguyên liệu theo mục tiêu nhãn hàng.',
    ],
  },
  {
    slug: 'xu-huong-ingredient-led-beauty-2026',
    title: 'Xu hướng ingredient-led beauty 2026: da liễu gặp TPCN',
    excerpt: 'Người tiêu dùng đọc INCI, tin hoạt chất — thương hiệu cần chuẩn bị gì?',
    topic: 'Thị trường & Xu hướng',
    industry: 'Mỹ phẩm',
    readTime: 6,
    date: '2026-04-25',
    author: 'Đội ngũ R&D Bioscope',
    image: 'glassware',
    body: [
      'Ingredient-led beauty: nhãn hàng thắng nhờ minh bạch hoạt chất, nồng độ và cơ chế — không chỉ packaging. Retinol, peptide, chiết xuất thực vật chuẩn hóa là xu hướng.',
      'Ran giới mỹ phẩm–TPCN mờ dần: serum "skincare supplement" và sản phẩm hỗ trợ làn da từ bên trong được quan tâm.',
      'Bioscope cung cấp nguyên liệu cho cả hai ngành — hỗ trợ formulator xây dòng sản phẩm cross-category khi chiến lược thương hiệu phù hợp.',
    ],
  },
  {
    slug: 'nano-hoat-chat-ung-dung-thuc-te',
    title: 'Nano hoạt chất: ứng dụng thực tế hay buzzword?',
    excerpt: 'Khi nào nano thực sự tạo giá trị — và cách đánh giá nhà cung cấp.',
    topic: 'Nguyên liệu & Công nghệ',
    industry: 'Mỹ phẩm',
    readTime: 7,
    date: '2026-04-18',
    author: 'Đội ngũ R&D Bioscope',
    image: 'microscope',
    body: [
      'Công nghệ nano có thể cải thiện penetration hoặc ổn định hoạt chất — nhưng không phải mọi claim "nano" đều có bằng chứng tương đương.',
      'Formulator nên yêu cầu TDS, dữ liệu kích thước hạt, an toàn và ổn định công thức. Đối tác uy tín minh bạch cơ chế và phạm vi ứng dụng.',
      'Bioscope chọn lọc nguyên liệu nano có hồ sơ kỹ thuật rõ — tránh đưa vào catalog các sản phẩm thiếu cơ sở khoa học.',
    ],
  },
  {
    slug: 'dong-kien-tao-vs-mua-nguyen-lieu-thuan',
    title: 'Đồng kiến tạo vs mua nguyên liệu thuần: chọn mô hình nào?',
    excerpt: 'So sánh hai cách làm việc với Bioscope — phù hợp startup, brand lớn hay nhà máy?',
    topic: 'Phát triển nhãn hàng',
    industry: 'Đa ngành',
    readTime: 5,
    date: '2026-04-12',
    author: 'Đội ngũ R&D Bioscope',
    image: 'heroTeam',
    body: [
      'Mua nguyên liệu thuần: phù hợp khi bạn đã có formulator, công thức và chỉ cần nguồn cung chất lượng — MOQ và giá cạnh tranh theo volume.',
      'Đồng kiến tạo: phù hợp startup hoặc brand muốn launch sản phẩm mới — Bioscope đồng hành từ ý tưởng, phân tích thị trường, công thức đến ra mắt.',
      'Nhiều đối tác bắt đầu với đồng kiến tạo một dòng sản phẩm, sau đó chuyển sang cung ứng nguyên liệu cho các dòng tiếp theo — linh hoạt theo giai đoạn tăng trưởng.',
    ],
  },
  {
    slug: 'checklist-validate-y-tuong-san-pham',
    title: 'Checklist validate ý tưởng sản phẩm trong 30 ngày',
    excerpt: '10 câu hỏi và 5 hành động tối thiểu trước khi ký hợp đồng sản xuất.',
    topic: 'Phát triển nhãn hàng',
    industry: 'Đa ngành',
    readTime: 6,
    date: '2026-04-05',
    author: 'Đội ngũ R&D Bioscope',
    image: 'leaf',
    body: [
      'Tuần 1: phỏng vấn khách hàng tiềm năng, map đối thủ, xác định giá mục tiêu. Tuần 2: draft công thức sơ bộ và estimate COGS.',
      'Tuần 3: test landing page hoặc pre-order nhỏ. Tuần 4: tổng hợp dữ liệu — go/no-go meeting với team.',
      'Checklist Bioscope chia sẻ miễn phí qua blog — liên hệ nếu cần buổi review ý tưởng cùng chuyên gia.',
    ],
  },
  {
    slug: 'halal-kosher-mo-rong-thi-truong',
    title: 'Halal & Kosher: mở rộng thị trường với nguyên liệu đạt chuẩn',
    excerpt: 'Ý nghĩa chứng nhận, cách lọc catalog và lưu ý khi xuất khẩu.',
    topic: 'Chứng nhận & Quy định',
    industry: 'Thực phẩm chức năng',
    readTime: 5,
    date: '2026-03-28',
    author: 'Đội ngũ R&D Bioscope',
    image: 'field',
    body: [
      'Halal và Kosher không chỉ là nhãn tôn giáo — nhiều kênh bán lẻ quốc tế yêu cầu chứng nhận để niêm yết sản phẩm.',
      'Khi chọn nguyên liệu, kiểm tra COA và chứng nhận của nhà sản xuất gốc — Bioscope catalog ghi rõ badge Halal/Kosher trên từng mặt hàng.',
      'Kế hoạch xuất khẩu nên xác định chứng nhận ngay từ giai đoạn phát triển công thức để trải lại công thức tốn kém.',
    ],
  },
  {
    slug: 'polymerit-trong-san-pham-cham-soc-da',
    title: 'Polymerit trong sản phẩm chăm sóc da: phóng thích chậm 24h',
    excerpt: 'Cơ chế, lợi ích so với hoạt chất thông thường và case ứng dụng tại Việt Nam.',
    topic: 'Nguyên liệu & Công nghệ',
    industry: 'Mỹ phẩm',
    readTime: 8,
    date: '2026-03-20',
    author: 'Đội ngũ R&D Bioscope',
    image: 'powder',
    body: [
      'Polymerit là công nghệ dẫn truyền qua da giúp phóng thích hoạt chất trong thời gian dài — phù hợp sản phẩm trị liệu và chăm sóc chuyên sâu.',
      'Case PEA và các dòng da liễu cho thấy người dùng đánh giá cao hiệu quả kéo dài thay vì cảm giác tức thì ngắn hạn.',
      'Formulator có thể yêu cầu whitepaper Polymerit và mẫu nguyên liệu qua Bioscope để đánh giá trong công thức pilot.',
    ],
  },
  {
    slug: 'men-vi-sinh-chon-strain-nao',
    title: 'Men vi sinh: chọn strain nào cho dòng tiêu hóa & miễn dịch?',
    excerpt: 'Lactobacillus, Bifidobacterium — tiêu chí chọn strain có bằng chứng.',
    topic: 'Công thức & Formulator',
    industry: 'Thực phẩm chức năng',
    readTime: 7,
    date: '2026-03-14',
    author: 'Đội ngũ R&D Bioscope',
    image: 'capsules',
    body: [
      'Không phải mọi probiotic đều tương đương — strain, liều CFU và bằng chứng lâm sàng quyết định hiệu quả và claim được phép.',
      'Dòng tiêu hóa thường dùng L. rhamnosus, B. lactis… — cần đối chiếu TDS và nghiên cứu hỗ trợ từ nhà sản xuất.',
      'Bioscope phân phối men vi sinh có hồ sơ rõ — hỗ trợ formulator chọn strain phù hợp mục tiêu sản phẩm và điều kiện bảo quản.',
    ],
  },
  {
    slug: 'thiet-ke-nhan-tpcn-tranh-sai-lam',
    title: 'Thiết kế nhãn TPCN: 6 sai lầm thường gặp khi công bố',
    excerpt: 'Claim quá mức, thiếu cảnh báo, font quá nhỏ — và cách tránh bị từ chối hồ sơ.',
    topic: 'Chứng nhận & Quy định',
    industry: 'Thực phẩm chức năng',
    readTime: 6,
    date: '2026-03-08',
    author: 'Đội ngũ R&D Bioscope',
    image: 'capsules',
    body: [
      'Sai lầm phổ biến: claim điều trị bệnh, không ghi đủ thành phần, hình ảnh gây hiểu nhầm, thiếu hướng dẫn sử dụng và cảnh báo.',
      'Làm việc sớm với đơn vị công bố và chuẩn bị tài liệu nguyên liệu đầy đủ từ Bioscope giúp giảm vòng lặp chỉnh sửa hồ sơ.',
      'Đội ngũ Bioscope tư vấn phạm vi mô tả công dụng an toàn khi hỗ trợ phát triển công thức — không thay thế tư vấn pháp lý chính thức.',
    ],
  },
  {
    slug: 'cach-doc-tds-nguyen-lieu',
    title: 'Cách đọc TDS nguyên liệu: 8 mục formulator cần kiểm tra',
    excerpt: 'Specification, assay, heavy metals, microbiology — đọc đúng để tránh rủi ro batch.',
    topic: 'Công thức & Formulator',
    industry: 'Đa ngành',
    readTime: 7,
    date: '2026-02-28',
    author: 'Đội ngũ R&D Bioscope',
    image: 'labWork',
    body: [
      'TDS (Technical Data Sheet) là tài liệu gốc khi đánh giá nguyên liệu. Formulator cần chú ý assay, độ tinh khiết, kim loại nặng, vi sinh và điều kiện bảo quản.',
      'So sánh TDS giữa các nhà cung giúp chọn grade phù hợp — không chỉ dựa vào giá kg.',
      'Trên website Bioscope, TDS public hoặc gate nhẹ; COA/SDS qua email công việc để đảm bảo lead chất lượng.',
    ],
  },
]

export function getBlogPost(slug: string) {
  return BLOG_POSTS.find((p) => p.slug === slug)
}

export function formatBlogDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export const SOLUTIONS_ICP = [
  {
    priority: 'Ưu tiên 1',
    title: 'Nhà phát triển nhãn hàng / startup',
    desc: 'Muốn launch sản phẩm mới — phù hợp Đồng kiến tạo & ODM, giá trị hợp tác cao nhất.',
    solution: 'dong-kien-tao-toan-hanh-trinh',
  },
  {
    priority: 'Ưu tiên 2',
    title: 'Brand cải tiến / mở rộng dòng',
    desc: 'Cần công nghệ độc quyền (Phytosome ướt, Polymerit) để khác biệt hóa.',
    solution: 'phat-trien-cong-thuc-odm',
  },
  {
    priority: 'Ưu tiên 3',
    title: 'Nhà sản xuất cần nguyên liệu',
    desc: 'Giao dịch nguyên liệu thuần, volume cao — phù hợp catalog chuyên biệt.',
    solution: 'cung-cap-nguyen-lieu',
  },
]

export const INGREDIENT_PAGE_INTRO = {
  title: 'Nguyên liệu chuyên biệt cho mọi khả năng',
  description:
    'Hơn 100 nguyên liệu hiệu suất cao cho Dược phẩm, Thực phẩm chức năng và Mỹ phẩm — đầy đủ tài liệu kỹ thuật, sẵn mẫu thử. Mỗi nguyên liệu có TDS, COA, SDS theo mô hình hybrid: TDS public hoặc gate nhẹ; COA/SDS qua email công việc để đảm bảo lead chất lượng. Giá không hiển thị công khai — vui lòng liên hệ báo giá hoặc yêu cầu mẫu thử trực tiếp từ trang chi tiết.',
  quickFilters: ['Chiết xuất thực vật', 'Dầu & Omega', 'Axit amin', 'Hoạt chất chức năng', 'Vật liệu Nano'],
}

export const CONTACT_FAQ = [
  {
    q: 'Bioscope có nhận đơn nhỏ / mẫu thử không?',
    a: 'Có, đa số nguyên liệu có MOQ linh hoạt (5–25 kg) và sẵn mẫu thử. Một số mặt hàng độc quyền có MOQ thấp hơn cho đánh giá ban đầu.',
  },
  {
    q: 'Quy trình đồng kiến tạo mất bao lâu?',
    a: 'Tùy độ phức tạp; thường 4–6 tháng từ ý tưởng đến ra mắt. Timeline cụ thể được ước lượng ngay sau buổi tư vấn đầu tiên.',
  },
  {
    q: 'Tài liệu kỹ thuật (TDS, COA) lấy như thế nào?',
    a: 'TDS có thể xem tại trang nguyên liệu. COA và SDS yêu cầu email công việc — hệ thống gửi file tự động sau khi điền form.',
  },
  {
    q: 'Bioscope hỗ trợ hồ sơ công bố TPCN/mỹ phẩm không?',
    a: 'Có — cung cấp tài liệu kỹ thuật, COA và phối hợp với đơn vị công bố theo quy định Việt Nam.',
  },
  {
    q: 'Có thể yêu cầu báo giá qua website không?',
    a: 'Có — dùng form Liên hệ hoặc "Yêu cầu mẫu thử" trên header. Đội ngũ phản hồi trong 24 giờ làm việc.',
  },
]

export const CERTIFICATION_DETAILS = [
  { name: 'GMP', desc: 'Thực hành sản xuất tốt — đảm bảo sản phẩm đạt chuẩn chất lượng đồng nhất.' },
  { name: 'ISO 22000', desc: 'Hệ thống quản lý an toàn thực phẩm theo chuẩn quốc tế.' },
  { name: 'HACCP', desc: 'Phân tích mối nguy & kiểm soát điểm tới hạn trong sản xuất.' },
  { name: 'Halal', desc: 'Đạt yêu cầu tiêu dùng theo luật Hồi giáo.' },
  { name: 'Kosher', desc: 'Đạt yêu cầu tiêu dùng theo luật Do Thái.' },
]

export const FAQ_PAGE = {
  title: 'Câu hỏi thường gặp',
  description:
    'Giải đáp nhanh về nguyên liệu, quy trình đồng kiến tạo, tài liệu kỹ thuật và cách làm việc cùng Bioscope.',
  groups: [
    {
      title: 'Nguyên liệu & mẫu thử',
      items: [
        {
          q: 'Bioscope có nhận đơn nhỏ / mẫu thử không?',
          a: 'Có, đa số nguyên liệu có MOQ linh hoạt (5–25 kg) và sẵn mẫu thử. Một số mặt hàng độc quyền có MOQ thấp hơn cho đánh giá ban đầu.',
        },
        {
          q: 'Tài liệu kỹ thuật (TDS, COA) lấy như thế nào?',
          a: 'TDS có thể xem tại trang nguyên liệu. COA và SDS yêu cầu email công việc — hệ thống gửi file tự động sau khi điền form.',
        },
        {
          q: 'Giá nguyên liệu có hiển thị trên website không?',
          a: 'Không — giá phụ thuộc volume, thời hạn hợp đồng và điều kiện giao hàng. Vui lòng liên hệ hoặc yêu cầu báo giá qua form Liên hệ.',
        },
      ],
    },
    {
      title: 'Giải pháp & đồng kiến tạo',
      items: [
        {
          q: 'Quy trình đồng kiến tạo mất bao lâu?',
          a: 'Tùy độ phức tạp; thường 4–6 tháng từ ý tưởng đến ra mắt. Timeline cụ thể được ước lượng ngay sau buổi tư vấn đầu tiên.',
        },
        {
          q: 'Bioscope khác gì nhà cung nguyên liệu thông thường?',
          a: 'Chúng tôi là đối tác chiến lược — đồng hành từ phân tích thị trường, chọn phân khúc, xây công thức, test nhu cầu đến thương mại hóa — không chỉ giao hàng rồi kết thúc.',
        },
        {
          q: 'Bioscope có hỗ trợ hồ sơ công bố TPCN/mỹ phẩm không?',
          a: 'Có — cung cấp tài liệu kỹ thuật, COA và phối hợp với đơn vị công bố theo quy định Việt Nam.',
        },
      ],
    },
    {
      title: 'Liên hệ & hỗ trợ',
      items: [
        {
          q: 'Có thể yêu cầu báo giá qua website không?',
          a: 'Có — dùng form Liên hệ hoặc "Yêu cầu mẫu thử" trên header. Đội ngũ phản hồi trong 24 giờ làm việc.',
        },
        {
          q: 'Thời gian phản hồi dự kiến là bao lâu?',
          a: 'Trong vòng 24 giờ làm việc. Đội ngũ chuyên gia sẽ liên hệ để hiểu rõ nhu cầu và đề xuất bước tiếp theo.',
        },
        {
          q: 'Tôi có thể liên hệ qua kênh nào?',
          a: 'Qua form Liên hệ trên website, email công việc hoặc Zalo OA (sắp tích hợp). Hotline và địa chỉ văn phòng đang được cập nhật.',
        },
      ],
    },
  ],
}

export type LegalSection = { title: string; paragraphs: string[] }

export const PRIVACY_POLICY = {
  title: 'Chính sách bảo mật',
  updated: 'Cập nhật: tháng 6/2026',
  intro:
    'Bioscope cam kết bảo vệ thông tin cá nhân của bạn khi truy cập website và sử dụng các dịch vụ của chúng tôi. Chính sách này mô tả cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu.',
  sections: [
    {
      title: '1. Thông tin chúng tôi thu thập',
      paragraphs: [
        'Thông tin bạn cung cấp qua form Liên hệ, yêu cầu mẫu thử, đăng ký nhận tin hoặc tải tài liệu gated: họ tên, email công việc, số điện thoại, tên công ty và mô tả nhu cầu.',
        'Dữ liệu kỹ thuật tự động: địa chỉ IP, loại trình duyệt, trang đã xem và thời gian truy cập — thu qua cookie và công cụ phân tích (Google Analytics 4) để cải thiện trải nghiệm.',
      ],
    },
    {
      title: '2. Mục đích sử dụng',
      paragraphs: [
        'Phản hồi yêu cầu tư vấn, báo giá, gửi mẫu thử và tài liệu kỹ thuật (TDS, COA, whitepaper).',
        'Gửi bản tin chuyên môn khi bạn đăng ký — bạn có thể hủy đăng ký bất cứ lúc nào.',
        'Phân tích hành vi truy cập để tối ưu nội dung website và trải nghiệm người dùng.',
      ],
    },
    {
      title: '3. Chia sẻ thông tin',
      paragraphs: [
        'Bioscope không bán hoặc cho thuê dữ liệu cá nhân. Thông tin chỉ được chia sẻ với đối tác cung cấp dịch vụ cần thiết (email, CRM, hosting) và tuân thủ cam kết bảo mật tương đương.',
        'Chúng tôi có thể tiết lộ thông tin khi pháp luật yêu cầu hoặc để bảo vệ quyền lợi hợp pháp của Bioscope và người dùng.',
      ],
    },
    {
      title: '4. Bảo mật & quyền của bạn',
      paragraphs: [
        'Dữ liệu được lưu trữ trên hệ thống có biện pháp bảo mật phù hợp. Chúng tôi duy trì quyền truy cập hạn chế và đào tạo nhân sự xử lý dữ liệu.',
        'Bạn có quyền yêu cầu truy cập, chỉnh sửa hoặc xóa thông tin cá nhân bằng cách liên hệ qua form Liên hệ trên website.',
      ],
    },
    {
      title: '5. Liên hệ',
      paragraphs: [
        'Mọi thắc mắc về chính sách bảo mật, vui lòng liên hệ Bioscope qua trang Liên hệ trên website.',
      ],
    },
  ] satisfies LegalSection[],
}

export const TERMS_OF_USE = {
  title: 'Điều khoản sử dụng',
  updated: 'Cập nhật: tháng 6/2026',
  intro:
    'Khi truy cập và sử dụng website Bioscope, bạn đồng ý tuân thủ các điều khoản dưới đây. Vui lòng đọc kỹ trước khi sử dụng.',
  sections: [
    {
      title: '1. Phạm vi áp dụng',
      paragraphs: [
        'Website cung cấp thông tin về nguyên liệu, giải pháp, nghiên cứu & phát triển và dịch vụ đồng kiến tạo của Bioscope dành cho khách hàng doanh nghiệp (B2B).',
        'Nội dung mang tính tham khảo chuyên môn — không thay thế tư vấn y tế, pháp lý hoặc công bố sản phẩm chính thức.',
      ],
    },
    {
      title: '2. Sử dụng nội dung',
      paragraphs: [
        'Văn bản, hình ảnh, logo và tài liệu tải về thuộc quyền sở hữu Bioscope hoặc đối tác được cấp phép. Không sao chép, phân phối lại hoặc sử dụng thương mại khi chưa có sự đồng ý bằng văn bản.',
        'Tài liệu kỹ thuật (TDS, COA, whitepaper) chỉ dùng cho mục đích đánh giá nguyên liệu và phát triển sản phẩm — không chia sẻ công khai nếu có ghi chú bảo mật.',
      ],
    },
    {
      title: '3. Trách nhiệm người dùng',
      paragraphs: [
        'Bạn cam kết cung cấp thông tin liên hệ chính xác khi gửi form. Không sử dụng website cho mục đích gian lận, spam hoặc vi phạm pháp luật.',
        'Liều dùng, công thức và ứng dụng nguyên liệu trên website chỉ mang tính tham khảo — trách nhiệm công bố và an toàn sản phẩm thuộc về nhà phát triển nhãn hàng.',
      ],
    },
    {
      title: '4. Giới hạn trách nhiệm',
      paragraphs: [
        'Bioscope nỗ lực đảm bảo thông tin chính xác và cập nhật, nhưng không đảm bảo website luôn không gián đoạn hoặc không có lỗi kỹ thuật.',
        'Bioscope không chịu trách nhiệm về thiệt hại gián tiếp phát sinh từ việc sử dụng thông tin trên website ngoài phạm vi hợp đồng cung ứng đã ký kết.',
      ],
    },
    {
      title: '5. Thay đổi điều khoản',
      paragraphs: [
        'Bioscope có thể cập nhật điều khoản sử dụng theo thời gian. Phiên bản mới có hiệu lực khi đăng tải trên website. Việc tiếp tục sử dụng website đồng nghĩa bạn chấp nhận điều khoản đã cập nhật.',
      ],
    },
  ] satisfies LegalSection[],
}
