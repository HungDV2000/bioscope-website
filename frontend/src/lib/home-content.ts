import type { Locale } from "@/lib/utils";

type L = Record<Locale, string>;
type LLines = Record<Locale, [string, string]>;

/** Nội dung trang chủ — khớp mockup example/index.html, có bản dịch VI */
export const homeContent = {
  hero: {
    eyebrow: {
      en: "FROM NATURE. BACKED BY SCIENCE.",
      vi: "TỪ THIÊN NHIÊN. DỰA TRÊN KHOA HỌC.",
    } satisfies L,
    title: {
      en: ["Healthcare Innovation", "Through Nature & Science"],
      vi: ["Đổi mới chăm sóc sức khỏe", "Bằng thiên nhiên & khoa học"],
    } satisfies LLines,
    description: {
      en: "Premium nutraceutical ingredients supported by science, compliance and global supply assurance.",
      vi: "Nguyên liệu thực phẩm chức năng cao cấp, hậu thuẫn bởi khoa học, tuân thủ chuẩn mực và đảm bảo nguồn cung toàn cầu.",
    } satisfies L,
    ctaSample: { en: "Request Sample", vi: "Yêu cầu mẫu" } satisfies L,
    ctaCatalogue: { en: "Download Catalogue", vi: "Tải catalogue" } satisfies L,
    ctaExpert: { en: "Speak to Expert", vi: "Gặp chuyên gia" } satisfies L,
  },

  compliance: {
    title: {
      en: ["Compliance First,", "Quality Always"],
      vi: ["Tuân thủ trước tiên,", "Chất lượng luôn đảm bảo"],
    } satisfies LLines,
    description: {
      en: "We are committed to the highest international standards and transparent documentation.",
      vi: "Cam kết tuân thủ các tiêu chuẩn quốc tế cao nhất và hồ sơ minh bạch.",
    } satisfies L,
    viewAll: { en: "View All Certificates", vi: "Xem tất cả chứng nhận" } satisfies L,
    certified: { en: "Certified", vi: "Chứng nhận" } satisfies L,
    photoAlt: {
      en: "Certification frames on office wall",
      vi: "Khung chứng nhận GMP, USDA, HACCP treo trên tường văn phòng",
    } satisfies L,
  },

  ingredients: {
    title: { en: "Explore Our Ingredient Library", vi: "Khám phá thư viện nguyên liệu" } satisfies L,
    viewAll: { en: "View All Ingredients", vi: "Xem tất cả nguyên liệu" } satisfies L,
    searchPlaceholder: { en: "Search ingredient...", vi: "Tìm nguyên liệu..." } satisfies L,
    filterBenefits: { en: "Health Benefits", vi: "Công dụng" } satisfies L,
    filterCerts: { en: "Certifications", vi: "Chứng nhận" } satisfies L,
    filterForms: { en: "Dosage Form", vi: "Dạng bào chế" } satisfies L,
    origin: { en: "Origin", vi: "Xuất xứ" } satisfies L,
    specification: { en: "Specification", vi: "Quy cách" } satisfies L,
    requestSample: { en: "Request Sample", vi: "Yêu cầu mẫu" } satisfies L,
    requestQuotation: { en: "Request Quotation", vi: "Yêu cầu báo giá" } satisfies L,
    filters: {
      benefits: {
        en: ["Brain Health", "Beauty & Anti-aging", "Longevity", "Joint Support", "Cardiovascular", "Immune Support"],
        vi: ["Não bộ", "Làm đẹp & chống lão hoá", "Trường thọ", "Hỗ trợ khớp", "Tim mạch", "Miễn dịch"],
      },
      certs: {
        en: ["Organic", "Halal", "Kosher", "Non-GMO", "Allergen Free"],
        vi: ["Hữu cơ", "Halal", "Kosher", "Non-GMO", "Không gây dị ứng"],
      },
      forms: {
        en: ["Powder", "Oil", "Granule", "Liquid", "Direct Compression"],
        vi: ["Bột", "Dầu", "Cốm", "Lỏng", "Dập thẳng"],
      },
    },
  },

  science: {
    title: { en: "Science Backed. Results Driven.", vi: "Khoa học chứng minh. Hiệu quả thực tế." } satisfies L,
    clinicalStudies: { en: "Clinical Studies", vi: "Nghiên cứu lâm sàng" } satisfies L,
    viewAllEvidence: { en: "View All", vi: "Xem tất cả" } satisfies L,
    viewStudy: { en: "View Study", vi: "Xem nghiên cứu" } satisfies L,
  },

  stats: {
    title: {
      en: ["Reliable Supply.", "Global Standards."],
      vi: ["Nguồn cung tin cậy.", "Chuẩn mực toàn cầu."],
    } satisfies LLines,
    factories: { en: "Certified Factories", vi: "Nhà máy đạt chuẩn" } satisfies L,
    countries: { en: "Countries Sourced", vi: "Quốc gia cung ứng" } satisfies L,
    warehouse: { en: "Warehouse Area", vi: "Diện tích kho bãi" } satisfies L,
    ingredients: { en: "Ingredients", vi: "Nguyên liệu" } satisfies L,
    watchFacility: { en: "Watch Our Facility", vi: "Xem nhà máy" } satisfies L,
  },

  solutions: {
    title: { en: "Solutions & Applications", vi: "Giải pháp & Ứng dụng" } satisfies L,
    viewAll: { en: "View All Solutions", vi: "Xem tất cả giải pháp" } satisfies L,
    cards: {
      en: ["Brain Health", "Beauty & Anti-aging", "Joint Support", "Cardiovascular Health", "Immune Support", "Digestive Health"],
      vi: ["Sức khỏe não bộ", "Làm đẹp & chống lão hoá", "Hỗ trợ khớp", "Sức khỏe tim mạch", "Hỗ trợ miễn dịch", "Sức khỏe tiêu hoá"],
    },
  },

  header: {
    nav: [
      { en: "Ingredients", vi: "Nguyên liệu" },
      { en: "Solutions", vi: "Giải pháp" },
      { en: "Scientific Evidence", vi: "Bằng chứng khoa học" },
      { en: "Compliance Center", vi: "Trung tâm tuân thủ" },
      { en: "About Us", vi: "Giới thiệu" },
      { en: "Resources", vi: "Tài nguyên" },
      { en: "Contact", vi: "Liên hệ" },
    ],
    requestSample: { en: "Request Sample", vi: "Yêu cầu mẫu" } satisfies L,
  },

  footer: {
    description: {
      en: "Bioscope is a global supplier of premium nutraceutical ingredients backed by science, quality and regulatory excellence.",
      vi: "Bioscope là nhà cung cấp nguyên liệu thực phẩm chức năng cao cấp toàn cầu, hậu thuẫn bởi khoa học, chất lượng và tuân thủ quy định.",
    } satisfies L,
    company: { en: "Company", vi: "Công ty" } satisfies L,
    ingredients: { en: "Ingredients", vi: "Nguyên liệu" } satisfies L,
    support: { en: "Support", vi: "Hỗ trợ" } satisfies L,
    contactUs: { en: "Contact Us", vi: "Liên hệ" } satisfies L,
    stayUpdated: { en: "Stay Updated", vi: "Cập nhật mới" } satisfies L,
    emailPlaceholder: { en: "Enter your email", vi: "Nhập email của bạn" } satisfies L,
    newsletterNote: {
      en: "Subscribe to our newsletter for latest updates and insights.",
      vi: "Đăng ký nhận bản tin để cập nhật tin tức và thông tin mới nhất.",
    } satisfies L,
    rights: { en: "All Rights Reserved.", vi: "Bảo lưu mọi quyền." } satisfies L,
    privacy: { en: "Privacy Policy", vi: "Chính sách bảo mật" } satisfies L,
    terms: { en: "Terms & Conditions", vi: "Điều khoản & Điều kiện" } satisfies L,
    /** Liên hệ theo mockup example */
    phone: "+84 28 7300 9888",
    phoneHref: "tel:+842873009888",
    email: "info@bioscope.com",
    emailHref: "mailto:info@bioscope.com",
    address: {
      en: "123 Innovation Way, Singapore 123456",
      vi: "123 Innovation Way, Singapore 123456",
    } satisfies L,
    companyLinks: [
      { en: "About Us", vi: "Giới thiệu" },
      { en: "Our Facilities", vi: "Cơ sở sản xuất" },
      { en: "Quality Assurance", vi: "Đảm bảo chất lượng" },
      { en: "News & Events", vi: "Tin tức & Sự kiện" },
      { en: "Careers", vi: "Tuyển dụng" },
    ],
    ingredientLinks: [
      { en: "Ingredient Library", vi: "Thư viện nguyên liệu" },
      { en: "By Benefit", vi: "Theo công dụng" },
      { en: "By Form", vi: "Theo dạng bào chế" },
      { en: "Branded Ingredients", vi: "Nguyên liệu thương hiệu" },
      { en: "New Ingredients", vi: "Nguyên liệu mới" },
    ],
    supportLinks: [
      { en: "Request Sample", vi: "Yêu cầu mẫu" },
      { en: "Technical Support", vi: "Hỗ trợ kỹ thuật" },
      { en: "Regulatory Support", vi: "Hỗ trợ quy định" },
      { en: "FAQ", vi: "Câu hỏi thường gặp" },
      { en: "Downloads", vi: "Tài liệu tải về" },
    ],
  },
} as const;

export function pickL<T extends L>(obj: T, locale: Locale): string {
  return obj[locale];
}
