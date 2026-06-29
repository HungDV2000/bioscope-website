import type { Metadata } from 'next'
import type { Locale } from './config'

export type PageHeroData = {
  eyebrow: string
  title: string
  description: string
  crumbs: { label: string; href?: string }[]
}

export type PageI18n = {
  metadata: Metadata
  hero: PageHeroData
}

const pages: Record<string, Record<Locale, PageI18n>> = {
  home: {
    vi: {
      metadata: { title: 'Bioscope — Nguyên liệu chuyên biệt & Đồng kiến tạo' },
      hero: { eyebrow: '', title: '', description: '', crumbs: [] },
    },
    en: {
      metadata: { title: 'Bioscope — Specialty ingredients & Co-creation' },
      hero: { eyebrow: '', title: '', description: '', crumbs: [] },
    },
  },
  about: {
    vi: {
      metadata: {
        title: 'Về chúng tôi — Nhà phân phối công nghệ, không chỉ nguyên liệu',
        description:
          'Bioscope hợp tác với các đối tác sản xuất có tiềm lực R&D để đưa ra thị trường những sản phẩm công nghệ cao, đột phá về hiệu quả và chi phí.',
      },
      hero: {
        eyebrow: 'Về chúng tôi',
        title: 'Nhà phân phối công nghệ — không chỉ là nhà cung ứng nguyên liệu',
        description:
          'Bioscope tồn tại để nâng cao cân bằng hiệu quả/chi phí cho người tiêu dùng — và đưa các nhà phát triển nhãn hàng Việt Nam vươn xa.',
        crumbs: [{ label: 'Về chúng tôi' }],
      },
    },
    en: {
      metadata: {
        title: 'About us — Technology distributor, not just ingredients',
        description:
          'Bioscope partners with R&D-driven manufacturers to bring high-tech, breakthrough products to market — balancing efficacy and cost.',
      },
      hero: {
        eyebrow: 'About us',
        title: 'Technology distributor — not just an ingredient supplier',
        description:
          'Bioscope exists to improve the efficacy-to-cost balance for consumers — and help Vietnamese brand builders go further.',
        crumbs: [{ label: 'About us' }],
      },
    },
  },
  ingredients: {
    vi: {
      metadata: {
        title: 'Nguyên liệu — Danh mục hoạt chất chuyên biệt',
        description: 'Hơn 100 nguyên liệu hiệu suất cao cho Dược phẩm, TPCN, Mỹ phẩm. TDS, COA, mẫu thử sẵn sàng.',
      },
      hero: {
        eyebrow: 'Nguyên liệu',
        title: 'Danh mục hoạt chất chuyên biệt',
        description: 'Hơn 100 nguyên liệu hiệu suất cao — Dược phẩm, TPCN, Mỹ phẩm. Đầy đủ TDS, COA, sẵn mẫu thử.',
        crumbs: [{ label: 'Nguyên liệu' }],
      },
    },
    en: {
      metadata: {
        title: 'Ingredients — Specialty actives catalog',
        description: '100+ high-performance ingredients for pharma, nutraceuticals, and cosmetics. TDS, COA, and samples available.',
      },
      hero: {
        eyebrow: 'Ingredients',
        title: 'Specialty actives catalog',
        description: '100+ high-performance ingredients — pharmaceuticals, nutraceuticals, cosmetics. Full TDS, COA, samples ready.',
        crumbs: [{ label: 'Ingredients' }],
      },
    },
  },
  solutions: {
    vi: {
      metadata: {
        title: 'Giải pháp — Ba cách Bioscope giúp thương hiệu chiến thắng',
        description:
          'Từ cung cấp nguyên liệu đến đồng kiến tạo trọn hành trình — chọn mức độ đồng hành phù hợp với năng lực và mục tiêu của bạn.',
      },
      hero: {
        eyebrow: 'Giải pháp',
        title: 'Ba cách Bioscope giúp thương hiệu của bạn chiến thắng',
        description:
          'Tùy vào năng lực và mục tiêu, bạn có thể chọn mức độ đồng hành phù hợp — từ cung cấp nguyên liệu đến đồng kiến tạo trọn hành trình.',
        crumbs: [{ label: 'Giải pháp' }],
      },
    },
    en: {
      metadata: {
        title: 'Solutions — Three ways Bioscope helps brands win',
        description:
          'From ingredient supply to full-journey co-creation — choose the partnership level that fits your capabilities and goals.',
      },
      hero: {
        eyebrow: 'Solutions',
        title: 'Three ways Bioscope helps your brand win',
        description:
          'Depending on your capabilities and goals, choose the right level of partnership — from ingredient supply to full-journey co-creation.',
        crumbs: [{ label: 'Solutions' }],
      },
    },
  },
  coCreate: {
    vi: {
      metadata: {
        title: 'Đồng kiến tạo — Hành trình 5 bước cùng Bioscope',
        description:
          'Nhà phân phối thông thường giao hàng rồi kết thúc. Bioscope bắt đầu từ ý tưởng và đồng hành đến khi thương hiệu của bạn tăng trưởng bền vững.',
      },
      hero: {
        eyebrow: 'Đồng kiến tạo',
        title: 'Tại sao đồng kiến tạo khác hẳn việc mua nguyên liệu thông thường?',
        description:
          'Nhà phân phối thông thường giao hàng rồi kết thúc. Bioscope bắt đầu từ ý tưởng và đồng hành đến tận lúc thương hiệu của bạn tăng trưởng bền vững.',
        crumbs: [{ label: 'Đồng kiến tạo' }],
      },
    },
    en: {
      metadata: {
        title: 'Co-creation — 5-step journey with Bioscope',
        description:
          'Traditional distributors deliver and leave. Bioscope starts from your idea and partners until your brand grows sustainably.',
      },
      hero: {
        eyebrow: 'Co-creation',
        title: 'Why co-creation is nothing like buying ingredients off the shelf',
        description:
          'Traditional distributors deliver and leave. Bioscope starts from your idea and stays with you until your brand grows sustainably.',
        crumbs: [{ label: 'Co-creation' }],
      },
    },
  },
  rd: {
    vi: {
      metadata: {
        title: 'Nghiên cứu & Phát triển — R&D là trái tim của Bioscope',
        description:
          '23+ dự án nghiên cứu, 14 đơn sáng chế, hàng trăm nguyên liệu công nghệ cao — tối ưu hiệu quả/chi phí để nhãn hàng dễ thành công.',
      },
      hero: {
        eyebrow: 'Nghiên cứu & Phát triển',
        title: 'R&D là trái tim của Bioscope',
        description:
          '23+ dự án nghiên cứu · 14 đơn sáng chế · hàng trăm nguyên liệu công nghệ cao đã đưa ra thị trường — với cùng một mục tiêu: tối ưu hiệu quả/chi phí để nhãn hàng dễ thành công.',
        crumbs: [{ label: 'Nghiên cứu & Phát triển' }],
      },
    },
    en: {
      metadata: {
        title: 'R&D — The heart of Bioscope',
        description:
          '23+ research projects, 14 patents, hundreds of high-tech ingredients — optimizing efficacy and cost so brands succeed.',
      },
      hero: {
        eyebrow: 'R&D',
        title: 'R&D is the heart of Bioscope',
        description:
          '23+ research projects · 14 patents · hundreds of high-tech ingredients brought to market — all with one goal: optimize efficacy and cost so brands succeed.',
        crumbs: [{ label: 'R&D' }],
      },
    },
  },
  resources: {
    vi: {
      metadata: {
        title: 'Tài nguyên — Whitepaper, Blog & Tài liệu kỹ thuật',
        description: 'Tài liệu chuyên môn, webinar và hướng dẫn cho formulator và nhà phát triển sản phẩm.',
      },
      hero: {
        eyebrow: 'Tài nguyên',
        title: 'Kiến thức chuyên môn cho đội ngũ của bạn',
        description: 'Whitepaper, blog chuyên môn, webinar và tài liệu kỹ thuật — cập nhật xu hướng và công nghệ mới.',
        crumbs: [{ label: 'Tài nguyên' }],
      },
    },
    en: {
      metadata: {
        title: 'Resources — Whitepapers, blog & technical docs',
        description: 'Expert materials, webinars, and guides for formulators and product developers.',
      },
      hero: {
        eyebrow: 'Resources',
        title: 'Expert knowledge for your team',
        description: 'Whitepapers, expert blog, webinars, and technical documents — stay current on trends and technologies.',
        crumbs: [{ label: 'Resources' }],
      },
    },
  },
  caseStudies: {
    vi: {
      metadata: {
        title: 'Case study — Giải pháp thật, kết quả thật',
        description: 'vivomega®, Gastroheal, PEA — câu chuyện đồng kiến tạo và công nghệ đột phá cùng Bioscope.',
      },
      hero: {
        eyebrow: 'Case study',
        title: 'Đổi mới tạo nên tác động',
        description: 'Giải pháp thật. Kết quả thật. Tăng trưởng thật — từ omega-3 cao cấp đến công nghệ da liễu.',
        crumbs: [{ label: 'Case study' }],
      },
    },
    en: {
      metadata: {
        title: 'Case studies — Real solutions, real results',
        description: 'vivomega®, Gastroheal, PEA — co-creation and breakthrough technology stories with Bioscope.',
      },
      hero: {
        eyebrow: 'Case studies',
        title: 'Innovation that drives impact',
        description: 'Real solutions. Real results. Real growth — from premium omega-3 to dermatology technology.',
        crumbs: [{ label: 'Case studies' }],
      },
    },
  },
  contact: {
    vi: {
      metadata: {
        title: 'Liên hệ — Bắt đầu dự án của bạn',
        description: 'Chia sẻ nhu cầu của bạn — đội ngũ chuyên gia Bioscope sẽ liên hệ trong vòng 24 giờ làm việc.',
      },
      hero: {
        eyebrow: 'Liên hệ',
        title: 'Bắt đầu dự án của bạn',
        description:
          'Thời gian phản hồi dự kiến: trong vòng 24 giờ làm việc. Đội ngũ chuyên gia của Bioscope sẽ liên hệ để hiểu rõ nhu cầu và đề xuất bước tiếp theo.',
        crumbs: [{ label: 'Liên hệ' }],
      },
    },
    en: {
      metadata: {
        title: 'Contact — Start your project',
        description: 'Share your needs — the Bioscope team will reach out within 24 business hours.',
      },
      hero: {
        eyebrow: 'Contact',
        title: 'Start your project',
        description:
          'Expected response time: within 24 business hours. Our experts will contact you to understand your needs and propose next steps.',
        crumbs: [{ label: 'Contact' }],
      },
    },
  },
  faq: {
    vi: {
      metadata: {
        title: 'Câu hỏi thường gặp',
        description: 'Giải đáp về nguyên liệu, MOQ, chứng nhận, ODM và quy trình làm việc với Bioscope.',
      },
      hero: {
        eyebrow: 'Hỗ trợ',
        title: 'Câu hỏi thường gặp',
        description: 'Tìm câu trả lời nhanh về nguyên liệu, dịch vụ và quy trình hợp tác.',
        crumbs: [{ label: 'Câu hỏi thường gặp' }],
      },
    },
    en: {
      metadata: {
        title: 'Frequently asked questions',
        description: 'Answers about ingredients, MOQ, certifications, ODM, and working with Bioscope.',
      },
      hero: {
        eyebrow: 'Support',
        title: 'Frequently asked questions',
        description: 'Quick answers about ingredients, services, and our partnership process.',
        crumbs: [{ label: 'FAQ' }],
      },
    },
  },
  privacy: {
    vi: {
      metadata: { title: 'Chính sách bảo mật', description: 'Chính sách bảo mật thông tin của Bioscope.' },
      hero: {
        eyebrow: 'Pháp lý',
        title: 'Chính sách bảo mật',
        description: 'Cách Bioscope thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn.',
        crumbs: [{ label: 'Chính sách bảo mật' }],
      },
    },
    en: {
      metadata: { title: 'Privacy policy', description: 'Bioscope privacy and data protection policy.' },
      hero: {
        eyebrow: 'Legal',
        title: 'Privacy policy',
        description: 'How Bioscope collects, uses, and protects your personal information.',
        crumbs: [{ label: 'Privacy policy' }],
      },
    },
  },
  terms: {
    vi: {
      metadata: { title: 'Điều khoản sử dụng', description: 'Điều khoản sử dụng website và dịch vụ Bioscope.' },
      hero: {
        eyebrow: 'Pháp lý',
        title: 'Điều khoản sử dụng',
        description: 'Điều khoản và điều kiện khi sử dụng website và dịch vụ của Bioscope.',
        crumbs: [{ label: 'Điều khoản sử dụng' }],
      },
    },
    en: {
      metadata: { title: 'Terms of use', description: 'Terms and conditions for Bioscope website and services.' },
      hero: {
        eyebrow: 'Legal',
        title: 'Terms of use',
        description: 'Terms and conditions for using Bioscope website and services.',
        crumbs: [{ label: 'Terms of use' }],
      },
    },
  },
  blog: {
    vi: {
      metadata: {
        title: 'Blog chuyên môn',
        description: 'Bài viết chuyên sâu về nguyên liệu, công nghệ và xu hướng ngành Dược phẩm, TPCN, Mỹ phẩm.',
      },
      hero: {
        eyebrow: 'Tài nguyên',
        title: 'Blog chuyên môn',
        description: 'Phân tích kỹ thuật, case study và insight thị trường từ đội ngũ Bioscope.',
        crumbs: [{ label: 'Tài nguyên', href: '/tai-nguyen' }, { label: 'Blog chuyên môn' }],
      },
    },
    en: {
      metadata: {
        title: 'Expert blog',
        description: 'In-depth articles on ingredients, technology, and trends in pharma, nutraceuticals, and cosmetics.',
      },
      hero: {
        eyebrow: 'Resources',
        title: 'Expert blog',
        description: 'Technical analysis, case studies, and market insights from the Bioscope team.',
        crumbs: [{ label: 'Resources', href: '/tai-nguyen' }, { label: 'Expert blog' }],
      },
    },
  },
  bioscopeAi: {
    vi: {
      metadata: {
        title: 'Bioscope AI — Trợ lý thông minh',
        description: 'Trợ lý AI hỗ trợ tra cứu nguyên liệu, gợi ý công thức và tài liệu kỹ thuật — sắp ra mắt.',
      },
      hero: {
        eyebrow: 'Trợ lý AI',
        title: 'Bioscope AI',
        description:
          'Hỏi bất cứ điều gì về nguyên liệu — gợi ý hoạt chất, đề xuất công thức và gửi TDS/COA ngay lập tức.',
        crumbs: [{ label: 'Bioscope AI' }],
      },
    },
    en: {
      metadata: {
        title: 'Bioscope AI — Smart assistant',
        description: 'AI assistant for ingredient lookup, formula suggestions, and technical docs — coming soon.',
      },
      hero: {
        eyebrow: 'AI assistant',
        title: 'Bioscope AI',
        description:
          'Ask anything about ingredients — get active suggestions, formula ideas, and TDS/COA delivery instantly.',
        crumbs: [{ label: 'Bioscope AI' }],
      },
    },
  },
}

export function getPageI18n(key: string, locale: Locale): PageI18n {
  return pages[key]?.[locale] ?? pages[key]?.vi ?? pages.about.vi
}
