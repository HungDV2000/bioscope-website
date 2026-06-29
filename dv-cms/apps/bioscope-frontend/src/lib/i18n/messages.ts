import type { Locale } from './config'
import { getPageExtras, type PageExtras } from './messages-pages'

export type Messages = {
  nav: {
    home: string
    ingredients: string
    solutions: string
    coCreate: string
    rd: string
    resources: string
    about: string
    contact: string
  }
  header: {
    requestSamples: string
    menu: string
  }
  footer: {
    tagline: string
    cols: {
      ingredients: { title: string; links: string[] }
      solutions: { title: string; links: string[] }
      company: { title: string; links: string[] }
      support: { title: string; links: string[] }
    }
    copyright: string
    privacy: string
    terms: string
  }
  home: {
    hero: {
      eyebrow: string
      titleBefore: string
      titleHighlight: string
      titleMid: string
      titleAccent: string
      description: string
      ctaPrimary: string
      ctaSecondary: string
      trust: string[]
    }
    brands: {
      title: string
      categories: string[]
    }
    process: {
      title: string
      description: string
      steps: { title: string; desc: string }[]
    }
    cta: {
      title: string
      description: string
      primary: string
      secondary: string
    }
    categories: {
      title: string
      description: string
      viewAll: string
      featured: { name: string; desc: string; cta: string }
      items: { name: string; desc: string }[]
    }
    certifications: {
      title: string
      description: string
      items: { name: string; sub: string }[]
      countries: string
    }
    caseStudies: {
      title: string
      viewAll: string
    }
    experts: {
      eyebrow: string
      title: string
      paragraphs: string[]
      cta: string
      imageAlt: string
      stats: { label: string }[]
    }
    aiChat: {
      badge: string
      titleBefore: string
      titleHighlight: string
      description: string
      features: string[]
      cta: string
      ctaHref: string
      chatName: string
      chatStatus: string
      typing: string
      suggestions: [string, string]
      demoUser: string
      demoAi1: string
      demoAi2: string
      replyAntiAging: string
      replyOmega3: string
    }
  }
  about: {
    mission: { title: string; desc: string }[]
    journey: {
      eyebrow: string
      title: string
      subtitle: string
      description: string
      stats: { label: string }[]
      highlight: string
      highlightBold: string
    }
    partners: { eyebrow: string; title: string; description: string }
    differentiation: {
      eyebrow: string
      bullets: string[]
      quote: string
      quoteHighlight: string
      quoteAfter: string
      company: string
      companyRole: string
    }
    coreValues: { eyebrow: string; title: string }
    productProcess: { eyebrow: string; stepLabel: string }
  }
  common: {
    explore: string
    learnMore: string
    viewAll: string
    readMore: string
    contactUs: string
    requestSamples: string
    backToHome: string
  }
  contact: {
    wizard: {
      needs: { label: string; desc: string }[]
      step1Title: string
      step2Title: string
      step3Title: string
      name: string
      company: string
      email: string
      phone: string
      message: string
      next: string
      back: string
      submit: string
      successTitle: string
      successBody: string
    }
  }
} & PageExtras

const vi: Messages = {
  ...getPageExtras('vi'),
  nav: {
    home: 'Trang chủ',
    ingredients: 'Nguyên liệu',
    solutions: 'Giải pháp',
    coCreate: 'Đồng kiến tạo',
    rd: 'Nghiên cứu & Phát triển',
    resources: 'Tài nguyên',
    about: 'Về chúng tôi',
    contact: 'Liên hệ',
  },
  header: {
    requestSamples: 'Yêu cầu mẫu thử',
    menu: 'Menu',
  },
  footer: {
    tagline:
      'Đối tác được lựa chọn của Việt Nam cho nguyên liệu cao cấp và đổi mới đột phá ngành Dược phẩm, Thực phẩm chức năng và Mỹ phẩm.',
    cols: {
      ingredients: {
        title: 'Nguyên liệu',
        links: ['Thực phẩm chức năng', 'Mỹ phẩm', 'Dược phẩm', 'Chiết xuất thực vật'],
      },
      solutions: {
        title: 'Giải pháp',
        links: ['Cung cấp nguyên liệu', 'Phát triển công thức ODM', 'Đồng kiến tạo'],
      },
      company: {
        title: 'Công ty',
        links: ['Về chúng tôi', 'Nghiên cứu & Phát triển', 'Case study', 'Tài nguyên'],
      },
      support: {
        title: 'Hỗ trợ',
        links: ['Liên hệ', 'Yêu cầu mẫu thử', 'Câu hỏi thường gặp', 'Chính sách bảo mật', 'Cổng đối tác'],
      },
    },
    copyright: '© 2026 Bioscope. Bảo lưu mọi quyền.',
    privacy: 'Chính sách bảo mật',
    terms: 'Điều khoản sử dụng',
  },
  home: {
    hero: {
      eyebrow: 'Nguyên liệu chuyên biệt · Thành công đồng kiến tạo',
      titleBefore: 'Không chỉ là nguyên liệu. Chúng tôi',
      titleHighlight: 'đồng kiến tạo',
      titleMid: 'giải pháp',
      titleAccent: 'đột phá',
      description:
        'Nguyên liệu cao cấp, dựa trên khoa học. Chuyên môn kỹ thuật sâu. Khả năng không giới hạn — cùng nhau.',
      ctaPrimary: 'Khám phá nguyên liệu',
      ctaSecondary: 'Đồng kiến tạo cùng chúng tôi',
      trust: ['Nguyên liệu chuyên biệt', 'Đảm bảo chất lượng toàn cầu', 'Nguồn cung ổn định'],
    },
    brands: {
      title: 'Đã đồng hành cùng hơn 50 thương hiệu',
      categories: ['Thực phẩm chức năng', 'Mỹ phẩm', 'Dinh dưỡng', 'Dược phẩm', 'Tim mạch', 'Vitamin & Khoáng'],
    },
    process: {
      title: 'Chúng tôi đồng hành như thế nào?',
      description:
        'Chúng tôi không chỉ cung cấp. Chúng tôi đồng kiến tạo — từ ý tưởng đến thành công thị trường, Bioscope đồng hành cùng bạn ở mọi bước.',
      steps: [
        { title: 'Ý tưởng', desc: 'Thấu hiểu nhu cầu và nắm bắt xu hướng thị trường.' },
        { title: 'Phát triển', desc: 'Nghiên cứu công thức, lựa chọn nguyên liệu tối ưu.' },
        { title: 'Kiểm chứng', desc: 'Đánh giá hiệu quả, độ an toàn và tính ổn định.' },
        { title: 'Ra mắt', desc: 'Hỗ trợ sản xuất và đưa sản phẩm ra thị trường.' },
        { title: 'Tăng trưởng', desc: 'Tối ưu và đồng hành tăng trưởng dài hạn.' },
      ],
    },
    cta: {
      title: 'Sẵn sàng bắt đầu dự án của bạn?',
      description:
        'Chia sẻ ý tưởng hoặc thách thức của bạn — đội ngũ chuyên gia của Bioscope đã sẵn sàng đồng hành cùng bạn từ hôm nay.',
      primary: 'Nhận tư vấn miễn phí',
      secondary: 'Yêu cầu mẫu thử',
    },
    categories: {
      title: 'Danh mục nguyên liệu',
      description:
        'Hơn 100 nguyên liệu hiệu suất cao — Dược phẩm, TPCN, Mỹ phẩm. Đầy đủ TDS, COA, sẵn mẫu thử.',
      viewAll: 'Xem tất cả nguyên liệu',
      featured: {
        name: 'Chiết xuất thực vật',
        desc: 'Nguồn gốc tự nhiên, hiệu quả đã được khoa học chứng minh.',
        cta: 'Khám phá ngay',
      },
      items: [
        { name: 'Omega & dầu cá', desc: 'Hỗ trợ tim mạch, não bộ, lựa sức khỏe toàn diện.' },
        { name: 'Nấm dược liệu', desc: 'Tăng cường miễn dịch, bảo vệ và phục hồi cơ thể.' },
        { name: 'Hoạt chất công nghệ cao', desc: 'Hiệu quả vượt trội, ứng dụng đa dạng.' },
        { name: 'Axit amin & vitamin', desc: 'Nền tảng cho sức khỏe và hiệu suất tối ưu.' },
      ],
    },
    certifications: {
      title: 'Chất lượng bạn có thể tin tưởng',
      description: 'Đạt chuẩn toàn cầu cao nhất — GMP, ISO 22000, HACCP, Halal, Kosher.',
      items: [
        { name: 'GMP', sub: 'Nhà máy đạt chuẩn' },
        { name: 'ISO 22000', sub: 'Quản lý an toàn thực phẩm' },
        { name: 'HACCP', sub: 'Hệ thống quản lý ATTP' },
        { name: 'Halal', sub: 'Đạt chứng nhận' },
        { name: 'Kosher', sub: 'Đạt chứng nhận' },
      ],
      countries: 'Quốc gia phân phối',
    },
    caseStudies: {
      title: 'Đổi mới tạo nên tác động — Giải pháp thật. Kết quả thật. Tăng trưởng thật.',
      viewAll: 'Xem tất cả câu chuyện',
    },
    experts: {
      eyebrow: 'Đội ngũ chuyên gia',
      title: 'Khoa học là nền tảng, con người là giá trị cốt lõi',
      paragraphs: [
        'Đội ngũ chuyên gia R&D giàu kinh nghiệm, tâm huyết và luôn tiên phong trong nghiên cứu ứng dụng.',
        'Chúng tôi đồng hành từ chọn nguyên liệu, phát triển công thức và kiểm chứng hiệu quả — đến khi sản phẩm của bạn sẵn sàng ra thị trường.',
      ],
      cta: 'Tìm hiểu về chúng tôi',
      imageAlt: 'Đội ngũ chuyên gia Bioscope',
      stats: [
        { label: 'năm kinh nghiệm' },
        { label: 'dự án nghiên cứu' },
        { label: 'đơn sáng chế' },
        { label: 'dự án R&D' },
      ],
    },
    aiChat: {
      badge: 'Mới — Trợ lý AI',
      titleBefore: 'Gặp gỡ',
      titleHighlight: 'Bioscope AI',
      description:
        'Hỏi bất cứ điều gì về nguyên liệu — trợ lý AI gợi ý hoạt chất phù hợp, đề xuất công thức và gửi tài liệu kỹ thuật cho bạn ngay lập tức.',
      features: ['Tư vấn nguyên liệu', 'Gợi ý công thức', 'Tải TDS / COA', '24/7'],
      cta: 'Tìm hiểu thêm',
      ctaHref: '/bioscope-ai',
      chatName: 'Bioscope AI',
      chatStatus: 'Đang hoạt động',
      typing: 'Đang nhập',
      suggestions: ['Chống lão hóa da', 'Omega-3 dạng TG'],
      demoUser: 'Serum chống lão hóa da',
      demoAi1: 'Chào bạn, tôi là Bioscope AI. Bạn đang phát triển sản phẩm gì?',
      demoAi2:
        'Gợi ý 3 hoạt chất: NMN, Bacopa và Curcumin Phytosome. Bạn muốn xem TDS hay yêu cầu mẫu thử?',
      replyAntiAging:
        'Gợi ý 3 hoạt chất: NMN, Bacopa và Curcumin Phytosome. Bạn muốn xem TDS hay yêu cầu mẫu thử?',
      replyOmega3:
        'Omega-3 dạng TG có sinh khả dụng cao hơn EE — phù hợp phân khúc premium. Bạn muốn xem catalog vivomega® hay nhận TDS?',
    },
  },
  about: {
    mission: [
      { title: 'Sứ mệnh', desc: 'Nâng cao cân bằng hiệu quả/chi phí cho người tiêu dùng và đưa nhãn hàng Việt vươn xa.' },
      { title: 'Định vị', desc: 'Đối tác chiến lược đồng hành từ ý tưởng đến thương mại hóa — không chỉ bán nguyên liệu.' },
      { title: 'Mạng lưới', desc: 'Hợp tác với đối tác R&D và nhà sản xuất tại hơn 50 quốc gia.' },
    ],
    journey: {
      eyebrow: 'Hành trình',
      title: 'Từ 2011 đến hôm nay',
      subtitle: 'Từ khởi đầu nghiên cứu đến đồng kiến tạo thương hiệu toàn cầu.',
      description: 'Hơn một thập kỷ nghiên cứu, hợp tác quốc tế và đồng kiến tạo cùng các thương hiệu Việt.',
      stats: [
        { label: 'Năm kinh nghiệm' },
        { label: 'Dự án' },
        { label: 'Dự án R&D' },
        { label: 'Đơn sáng chế' },
      ],
      highlight: 'đã được đưa vào thị trường Việt Nam — từ omega-3, chiết xuất thực vật đến công nghệ da liễu tiên tiến.',
      highlightBold: '100+ nguyên liệu mới',
    },
    partners: {
      eyebrow: 'Đối tác toàn cầu',
      title: 'Mạng lưới hơn 50 quốc gia',
      description:
        'Hợp tác với các nhà sản xuất và đơn vị R&D hàng đầu thế giới — GC Rieber Oils, Indena, PolymerSolution, Naturex, Sabinsa, PLT Health Solutions và nhiều đối tác khác.',
    },
    differentiation: {
      eyebrow: 'Khác biệt Bioscope',
      bullets: [
        'Nghiên cứu thị trường trước khi làm hàng',
        'Công nghệ độc quyền Phytosome & Polymerit',
        'Đồng hành từ ý tưởng đến tăng trưởng dài hạn',
      ],
      quote: 'Chúng tôi không giao nguyên liệu rồi kết thúc — chúng tôi',
      quoteHighlight: 'đồng kiến tạo',
      quoteAfter: 'cùng bạn đến khi sản phẩm thành công trên thị trường.',
      company: 'Bioscope Healthcare',
      companyRole: 'Đối tác chiến lược ngành TPCN & mỹ phẩm',
    },
    coreValues: { eyebrow: 'Giá trị cốt lõi', title: 'Nền tảng cho mọi quyết định' },
    productProcess: { eyebrow: 'Quy trình', stepLabel: 'Bước' },
  },
  common: {
    explore: 'Khám phá',
    learnMore: 'Tìm hiểu thêm',
    viewAll: 'Xem tất cả',
    readMore: 'Đọc thêm',
    contactUs: 'Liên hệ',
    requestSamples: 'Yêu cầu mẫu thử',
    backToHome: 'Về trang chủ',
  },
  contact: {
    wizard: {
      needs: [
        { label: 'Nguyên liệu', desc: 'Tìm nguồn nguyên liệu chuyên biệt.' },
        { label: 'ODM / Phát triển công thức', desc: 'Xây dựng công thức & sản xuất.' },
        { label: 'Tư vấn đồng kiến tạo', desc: 'Đồng hành xây thương hiệu từ đầu.' },
      ],
      step1Title: 'Bạn cần Bioscope hỗ trợ điều gì?',
      step2Title: 'Thông tin liên hệ',
      step3Title: 'Chi tiết yêu cầu',
      name: 'Họ và tên',
      company: 'Công ty',
      email: 'Email',
      phone: 'Số điện thoại',
      message: 'Mô tả nhu cầu',
      next: 'Tiếp theo',
      back: 'Quay lại',
      submit: 'Gửi yêu cầu',
      successTitle: 'Đã gửi yêu cầu thành công!',
      successBody: 'Cảm ơn {name}. Đội ngũ chuyên gia của Bioscope sẽ phản hồi trong vòng 24 giờ làm việc qua email {email}.',
    },
  },
} satisfies Messages

const en: Messages = {
  ...getPageExtras('en'),
  nav: {
    home: 'Home',
    ingredients: 'Ingredients',
    solutions: 'Solutions',
    coCreate: 'Co-creation',
    rd: 'R&D',
    resources: 'Resources',
    about: 'About us',
    contact: 'Contact',
  },
  header: {
    requestSamples: 'Request samples',
    menu: 'Menu',
  },
  footer: {
    tagline:
      "Vietnam's partner of choice for premium ingredients and breakthrough innovation in pharmaceuticals, nutraceuticals, and cosmetics.",
    cols: {
      ingredients: {
        title: 'Ingredients',
        links: ['Nutraceuticals', 'Cosmetics', 'Pharmaceuticals', 'Botanical extracts'],
      },
      solutions: {
        title: 'Solutions',
        links: ['Ingredient supply', 'ODM formulation', 'Co-creation'],
      },
      company: {
        title: 'Company',
        links: ['About us', 'R&D', 'Case studies', 'Resources'],
      },
      support: {
        title: 'Support',
        links: ['Contact', 'Request samples', 'FAQ', 'Privacy policy', 'Partner portal'],
      },
    },
    copyright: '© 2026 Bioscope. All rights reserved.',
    privacy: 'Privacy policy',
    terms: 'Terms of use',
  },
  home: {
    hero: {
      eyebrow: 'Specialty ingredients · Co-created success',
      titleBefore: 'More than ingredients. We',
      titleHighlight: 'co-create',
      titleMid: 'breakthrough',
      titleAccent: 'solutions',
      description:
        'Premium, science-backed ingredients. Deep technical expertise. Limitless potential — together.',
      ctaPrimary: 'Explore ingredients',
      ctaSecondary: 'Co-create with us',
      trust: ['Specialty ingredients', 'Global quality assurance', 'Stable supply chain'],
    },
    brands: {
      title: 'Trusted by 50+ brands',
      categories: ['Nutraceuticals', 'Cosmetics', 'Nutrition', 'Pharmaceuticals', 'Cardiovascular', 'Vitamins & minerals'],
    },
    process: {
      title: 'How do we partner with you?',
      description:
        'We do not just supply. We co-create — from idea to market success, Bioscope walks with you at every step.',
      steps: [
        { title: 'Ideation', desc: 'Understand needs and capture market trends.' },
        { title: 'Development', desc: 'Research formulations and select optimal ingredients.' },
        { title: 'Validation', desc: 'Assess efficacy, safety, and stability.' },
        { title: 'Launch', desc: 'Support production and go-to-market.' },
        { title: 'Growth', desc: 'Optimize and sustain long-term growth.' },
      ],
    },
    cta: {
      title: 'Ready to start your project?',
      description:
        'Share your idea or challenge — Bioscope experts are ready to partner with you from today.',
      primary: 'Get free consultation',
      secondary: 'Request samples',
    },
    categories: {
      title: 'Ingredient categories',
      description:
        '100+ high-performance ingredients — pharmaceuticals, nutraceuticals, cosmetics. Full TDS, COA, samples available.',
      viewAll: 'View all ingredients',
      featured: {
        name: 'Botanical extracts',
        desc: 'Natural origin with scientifically proven efficacy.',
        cta: 'Explore now',
      },
      items: [
        { name: 'Omega & fish oils', desc: 'Cardiovascular, brain, and whole-body wellness support.' },
        { name: 'Medicinal mushrooms', desc: 'Immune support, protection, and recovery.' },
        { name: 'High-tech actives', desc: 'Superior efficacy, diverse applications.' },
        { name: 'Amino acids & vitamins', desc: 'Foundation for health and peak performance.' },
      ],
    },
    certifications: {
      title: 'Quality you can trust',
      description: 'Highest global standards — GMP, ISO 22000, HACCP, Halal, Kosher.',
      items: [
        { name: 'GMP', sub: 'Certified facilities' },
        { name: 'ISO 22000', sub: 'Food safety management' },
        { name: 'HACCP', sub: 'Food safety system' },
        { name: 'Halal', sub: 'Certified' },
        { name: 'Kosher', sub: 'Certified' },
      ],
      countries: 'Countries served',
    },
    caseStudies: {
      title: 'Innovation that drives impact — Real solutions. Real results. Real growth.',
      viewAll: 'View all stories',
    },
    experts: {
      eyebrow: 'Expert team',
      title: 'Science is the foundation, people are the core value',
      paragraphs: [
        'An experienced, passionate R&D team pioneering applied research.',
        'We partner from ingredient selection and formulation development through efficacy validation — until your product is market-ready.',
      ],
      cta: 'Learn about us',
      imageAlt: 'Bioscope expert team',
      stats: [
        { label: 'years of experience' },
        { label: 'research projects' },
        { label: 'patents' },
        { label: 'R&D projects' },
      ],
    },
    aiChat: {
      badge: 'New — AI assistant',
      titleBefore: 'Meet',
      titleHighlight: 'Bioscope AI',
      description:
        'Ask anything about ingredients — our AI suggests suitable actives, proposes formulas, and sends technical documents instantly.',
      features: ['Ingredient advice', 'Formula suggestions', 'Download TDS / COA', '24/7'],
      cta: 'Learn more',
      ctaHref: '/bioscope-ai',
      chatName: 'Bioscope AI',
      chatStatus: 'Online',
      typing: 'Typing',
      suggestions: ['Anti-aging serum', 'Omega-3 TG form'],
      demoUser: 'Anti-aging facial serum',
      demoAi1: "Hi, I'm Bioscope AI. What product are you developing?",
      demoAi2:
        'I suggest 3 actives: NMN, Bacopa, and Curcumin Phytosome. Would you like to view TDS or request samples?',
      replyAntiAging:
        'I suggest 3 actives: NMN, Bacopa, and Curcumin Phytosome. Would you like to view TDS or request samples?',
      replyOmega3:
        'TG-form omega-3 offers higher bioavailability than EE — ideal for premium positioning. View the vivomega® catalog or get TDS?',
    },
  },
  about: {
    mission: [
      { title: 'Mission', desc: 'Improve the efficacy-to-cost balance for consumers and help Vietnamese brands go further.' },
      { title: 'Positioning', desc: 'Strategic partner from idea to commercialization — not just selling ingredients.' },
      { title: 'Network', desc: 'Partnerships with R&D and manufacturers in 50+ countries.' },
    ],
    journey: {
      eyebrow: 'Journey',
      title: 'From 2011 to today',
      subtitle: 'From research beginnings to global brand co-creation.',
      description: 'Over a decade of research, international partnerships, and co-creation with Vietnamese brands.',
      stats: [
        { label: 'Years of experience' },
        { label: 'Projects' },
        { label: 'R&D projects' },
        { label: 'Patents' },
      ],
      highlight: 'introduced to the Vietnamese market — from omega-3 and botanical extracts to advanced dermatology technologies.',
      highlightBold: '100+ new ingredients',
    },
    partners: {
      eyebrow: 'Global partners',
      title: 'Network across 50+ countries',
      description:
        'Partnerships with leading manufacturers and R&D organizations worldwide — GC Rieber Oils, Indena, PolymerSolution, Naturex, Sabinsa, PLT Health Solutions, and more.',
    },
    differentiation: {
      eyebrow: 'The Bioscope difference',
      bullets: [
        'Market research before manufacturing',
        'Exclusive Phytosome & Polymerit technologies',
        'Partnership from idea to long-term growth',
      ],
      quote: 'We do not deliver ingredients and walk away — we',
      quoteHighlight: 'co-create',
      quoteAfter: 'with you until your product succeeds in the market.',
      company: 'Bioscope Healthcare',
      companyRole: 'Strategic partner in nutraceuticals & cosmetics',
    },
    coreValues: { eyebrow: 'Core values', title: 'Foundation for every decision' },
    productProcess: { eyebrow: 'Process', stepLabel: 'Step' },
  },
  common: {
    explore: 'Explore',
    learnMore: 'Learn more',
    viewAll: 'View all',
    readMore: 'Read more',
    contactUs: 'Contact',
    requestSamples: 'Request samples',
    backToHome: 'Back to home',
  },
  contact: {
    wizard: {
      needs: [
        { label: 'Ingredients', desc: 'Source specialty ingredients.' },
        { label: 'ODM / Formulation', desc: 'Build formulas & manufacturing.' },
        { label: 'Co-creation consulting', desc: 'Partner on brand building from day one.' },
      ],
      step1Title: 'What do you need from Bioscope?',
      step2Title: 'Contact information',
      step3Title: 'Request details',
      name: 'Full name',
      company: 'Company',
      email: 'Email',
      phone: 'Phone',
      message: 'Describe your needs',
      next: 'Next',
      back: 'Back',
      submit: 'Submit request',
      successTitle: 'Request sent successfully!',
      successBody: 'Thank you {name}. The Bioscope team will respond within 24 business hours at {email}.',
    },
  },
} satisfies Messages

const catalog: Record<Locale, Messages> = { vi, en }

export function getMessages(locale: Locale): Messages {
  return catalog[locale] ?? catalog.vi
}
