import type { Locale } from './config'

export type PageExtras = {
  solutionsPage: { icpTitle: string; icpDesc: string }
  coCreatePage: {
    compareTitle: string
    compareDesc: string
    traditionalTitle: string
    bioscopeTitle: string
    stepLabel: string
    casesTitle: string
    casesDesc: string
    readCase: string
    journey: { title: string; desc: string }[]
  }
  rdPage: {
    stats: { label: string }[]
    techTitle: string
    researchTitle: string
    researchDesc: string
    partnersTitle: string
    partnersDesc: string
    papersTitle: string
    papersDesc: string
    gated: string
  }
  resourcesPage: {
    gated: string
    public: string
    comingSoon: string
    backToResources: string
    viewAllCaseStudies: string
    emptyTitle: string
    emptyDesc: string
    explore: string
    featured: string
    newsletterTitle: string
    newsletterDesc: string
    newsletterPlaceholder: string
    newsletterButton: string
  }
  blogPage: {
    search: string
    searchPlaceholder: string
    topics: string
    allTopics: string
    industries: string
    allIndustries: string
    clearFilters: string
    articleCount: string
    pageOf: string
    featured: string
    readArticle: string
    readMore: string
    noResults: string
    minRead: string
    backToBlog: string
    relatedTitle: string
    relatedDesc: string
    toc: string
    share: string
    copyLink: string
    copied: string
    author: string
    authorBio: string
    comments: string
    commentPrompt: string
    nameLabel: string
    emailLabel: string
    contentLabel: string
    namePlaceholder: string
    emailPlaceholder: string
    commentPlaceholder: string
    commentModeration: string
    submitComment: string
    commentThanks: string
    prevPage: string
    nextPage: string
    pagination: string
  }
  aiAssistantPage: {
    status: string
    statusDesc: string
    introQuote: string
    stats: { value: string; label: string }[]
    previewEyebrow: string
    previewTitle: string
    previewDesc: string
    useCasesTitle: string
    useCasesDesc: string
    useCases: { persona: string; scenario: string; example: string }[]
    capabilitiesTitle: string
    capabilitiesDesc: string
    capabilities: { title: string; desc: string; bullets: string[] }[]
    compareTitle: string
    compareDesc: string
    compareGeneric: string
    compareBioscope: string
    genericItems: string[]
    bioscopeItems: string[]
    strengthsTitle: string
    strengthsDesc: string
    strengths: { title: string; desc: string }[]
    notifyTitle: string
    notifyDesc: string
    notifyPlaceholder: string
    notifyButton: string
    contactCta: string
    backHome: string
  }
  ingredientsCatalog: {
    tags: Record<string, string>
    searchPlaceholder: string
    advancedSearch: string
    allIndustries: string
    pagination: string
    prevPage: string
    nextPage: string
    close: string
    filters: Record<string, string>
    moqAny: string
    results: string
    noResults: string
    clearFilters: string
    applyFilters: string
    viewDetails: string
    clearAdvanced: string
    ingredientsUnit: string
    pageOf: string
    originLabel: string
    advancedTitle: string
    advancedDesc: string
    tryClearFilters: string
    reset: string
    cancel: string
    applyFiltersFull: string
    moqMax: string
  }
}

const vi: PageExtras = {
  solutionsPage: {
    icpTitle: 'Ai phù hợp với giải pháp nào?',
    icpDesc:
      'Tùy năng lực nội bộ và mục tiêu kinh doanh, bạn có thể chọn mức độ đồng hành phù hợp — từ cung cấp nguyên liệu đến đồng kiến tạo trọn hành trình.',
  },
  coCreatePage: {
    compareTitle: 'So sánh mô hình hợp tác',
    compareDesc: 'Chúng tôi không chỉ cung cấp. Chúng tôi đồng kiến tạo — từ ý tưởng đến thành công thị trường.',
    traditionalTitle: 'Nhà phân phối thông thường',
    bioscopeTitle: 'Bioscope — Đồng kiến tạo',
    stepLabel: 'Bước',
    casesTitle: 'Câu chuyện đồng kiến tạo thực tế',
    casesDesc:
      'vivomega®, Gastroheal và PEA — minh chứng cho hành trình 5 bước từ ý tưởng đến tăng trưởng đo lường được.',
    readCase: 'Đọc case study',
    journey: [
      {
        title: 'Ý tưởng',
        desc: 'Thấu hiểu nhu cầu & nắm bắt xu hướng. Cùng bạn phân tích thị trường, đối tượng mục tiêu, phân khúc và cơ hội.',
      },
      {
        title: 'Nghiên cứu & đề xuất',
        desc: 'Lựa chọn nguyên liệu, công nghệ và đề xuất công thức tối ưu hiệu quả/chi phí.',
      },
      {
        title: 'Kiểm chứng & thử nghiệm',
        desc: 'Tạo mẫu, kiểm nghiệm hiệu quả và độ an toàn; test tín hiệu thị trường qua kênh online trước khi sản xuất lớn.',
      },
      {
        title: 'Phát triển & ra mắt',
        desc: 'Hoàn thiện sản phẩm, hỗ trợ pháp lý, sản xuất và đưa ra thị trường.',
      },
      {
        title: 'Tăng trưởng & đồng hành',
        desc: 'Tối ưu liên tục, mở rộng danh mục, đồng hành xây dựng thương hiệu bền vững.',
      },
    ],
  },
  rdPage: {
    stats: [
      { label: 'Dự án nghiên cứu' },
      { label: 'Đơn sáng chế' },
      { label: 'Nguyên liệu công nghệ cao' },
      { label: 'Đối tác R&D toàn cầu' },
    ],
    techTitle: 'Công nghệ độc quyền của Bioscope',
    researchTitle: 'Lĩnh vực nghiên cứu',
    researchDesc:
      '23+ dự án R&D tập trung vào sinh khả dụng, dẫn truyền qua da, nano hoạt chất và các phân khúc sức khỏe trọng điểm.',
    partnersTitle: 'Đối tác R&D quốc tế',
    partnersDesc:
      'Hợp tác trực tiếp với các nhà sản xuất và viện nghiên cứu hàng đầu tại hơn 50 quốc gia — đảm bảo nguồn công nghệ và nguyên liệu luôn cập nhật.',
    papersTitle: 'Tài liệu chuyên môn & công bố',
    papersDesc: 'Tài liệu chuyên sâu từ đội ngũ R&D — một số yêu cầu email để tải.',
    gated: 'Cần đăng ký',
  },
  resourcesPage: {
    gated: 'Cần đăng ký',
    public: 'Public',
    comingSoon: 'Sắp ra mắt',
    backToResources: 'Quay lại Tài nguyên',
    viewAllCaseStudies: 'Xem tất cả Case Study',
    emptyTitle: 'Nội dung đang được cập nhật',
    emptyDesc: 'Đăng ký nhận tin để không bỏ lỡ khi có tài liệu mới trong danh mục này.',
    explore: 'Khám phá',
    featured: 'Nội dung nổi bật',
    newsletterTitle: 'Nhận tài liệu mới qua email',
    newsletterDesc: 'Whitepaper, checklist và bài viết chuyên môn — gửi thẳng tới hộp thư của bạn.',
    newsletterPlaceholder: 'Email công việc của bạn',
    newsletterButton: 'Đăng ký',
  },
  blogPage: {
    search: 'Tìm kiếm',
    searchPlaceholder: 'Tiêu đề, từ khóa…',
    topics: 'Chủ đề',
    allTopics: 'Tất cả chủ đề',
    industries: 'Ngành',
    allIndustries: 'Tất cả ngành',
    clearFilters: 'Xóa bộ lọc',
    articleCount: 'bài viết',
    pageOf: 'Trang',
    featured: 'Nổi bật',
    readArticle: 'Đọc bài viết',
    readMore: 'Đọc thêm',
    noResults: 'Không tìm thấy bài viết phù hợp. Thử từ khóa hoặc bộ lọc khác.',
    minRead: 'phút đọc',
    backToBlog: 'Quay lại Blog chuyên môn',
    relatedTitle: 'Bài viết liên quan',
    relatedDesc: 'Cùng chủ đề hoặc ngành — gợi ý đọc tiếp.',
    toc: 'Mục lục',
    share: 'Chia sẻ',
    copyLink: 'Sao chép link',
    copied: 'Đã sao chép',
    author: 'Tác giả',
    authorBio:
      'Đội ngũ nghiên cứu & ứng dụng của Bioscope — chia sẻ kiến thức chuyên môn về nguyên liệu, công thức và phát triển nhãn hàng.',
    comments: 'Bình luận',
    commentPrompt: 'Chia sẻ câu hỏi hoặc kinh nghiệm của bạn về',
    nameLabel: 'Họ tên *',
    emailLabel: 'Email công việc',
    contentLabel: 'Nội dung *',
    namePlaceholder: 'Nguyễn Văn A',
    emailPlaceholder: 'ban@congty.com',
    commentPlaceholder: 'Viết bình luận của bạn…',
    commentModeration: 'Bình luận sẽ được kiểm duyệt trước khi hiển thị công khai.',
    submitComment: 'Gửi bình luận',
    commentThanks: 'Cảm ơn bạn! Bình luận đã được ghi nhận và hiển thị tạm thời trên trang này.',
    prevPage: 'Trang trước',
    nextPage: 'Trang sau',
    pagination: 'Phân trang blog',
  },
  aiAssistantPage: {
    status: 'Sắp ra mắt',
    statusDesc:
      'Trợ lý AI chuyên biệt cho ngành nguyên liệu chức năng — được huấn luyện trên catalog, tài liệu R&D và kinh nghiệm tư vấn thực tế của Bioscope.',
    introQuote:
      '“Từ câu hỏi đầu tiên đến danh sách hoạt chất ứng viên — trong vài phút, không vài ngày.”',
    stats: [
      { value: '500+', label: 'Nguyên liệu trong catalog' },
      { value: '24/7', label: 'Tra cứu mọi lúc' },
      { value: '3', label: 'Ngành: DP · TPCN · Mỹ phẩm' },
    ],
    previewEyebrow: 'Xem trước',
    previewTitle: 'Hỏi như đang chat với chuyên gia Bioscope',
    previewDesc:
      'Mô tả sản phẩm bạn đang phát triển — AI gợi ý hoạt chất, giải thích lý do lựa chọn và hỏi bạn muốn xem TDS hay đặt mẫu thử.',
    useCasesTitle: 'Ai sẽ dùng Bioscope AI?',
    useCasesDesc: 'Thiết kế cho mọi vai trò trong chuỗi phát triển sản phẩm — từ ý tưởng ban đầu đến quyết định mua nguyên liệu.',
    useCases: [
      {
        persona: 'Formulator / R&D',
        scenario: 'Cần shortlist hoạt chất cho concept mới',
        example: '“Serum chống lão hóa, phân khúc premium, ưu tiên peptide và botanical có bằng chứng lâm sàng.”',
      },
      {
        persona: 'Product Manager',
        scenario: 'So sánh phương án trước khi họp với supplier',
        example: '“Omega-3 dạng TG vs EE cho softgel — khác biệt sinh khả dụng và định vị giá?”',
      },
      {
        persona: 'QA / Regulatory',
        scenario: 'Tra cứu chứng nhận và tài liệu nhanh',
        example: '“Gửi TDS và COA của Curcumin Phytosome — có Halal và non-GMO không?”',
      },
    ],
    capabilitiesTitle: 'Tính năng chính',
    capabilitiesDesc: 'Mọi bước trong quy trình nghiên cứu nguyên liệu — gom vào một giao diện hội thoại.',
    capabilities: [
      {
        title: 'Tư vấn nguyên liệu thông minh',
        desc: 'Hiểu mục tiêu sản phẩm và đề xuất hoạt chất có căn cứ từ dữ liệu Bioscope.',
        bullets: ['Lọc theo ngành hàng, công dụng, ngân sách', 'Giải thích cơ chế và ưu điểm từng hoạt chất', 'Gợi ý thay thế khi MOQ hoặc nguồn cung hạn chế'],
      },
      {
        title: 'Gợi ý công thức & phối hợp',
        desc: 'Đề xuất kết hợp hoạt chất với liều tham khảo và lưu ý tương thích.',
        bullets: ['Phối hợp đa hoạt chất theo mục tiêu', 'Liều dùng tham khảo và cảnh báo tương tác', 'Liên kết công cụ gợi ý công thức Bioscope'],
      },
      {
        title: 'Tài liệu kỹ thuật tức thì',
        desc: 'Yêu cầu TDS, COA, SDS ngay trong chat — không cần email qua lại.',
        bullets: ['TDS / COA / SDS theo từng mã nguyên liệu', 'Thông tin chứng nhận (Halal, organic, non-GMO…)', 'Luồng gated cho tài liệu nhạy cảm'],
      },
      {
        title: 'Hỗ trợ 24/7',
        desc: 'Tra cứu nhanh trước khi liên hệ sales — lý tưởng cho giai đoạn brainstorm.',
        bullets: ['Phản hồi tức thì, không chờ giờ hành chính', 'Lưu ngữ cảnh cuộc hội thoại', 'Chuyển tiếp mượt sang đội tư vấn khi cần'],
      },
    ],
    compareTitle: 'Khác gì so với chatbot thông thường?',
    compareDesc: 'ChatGPT biết nhiều thứ — nhưng Bioscope AI biết đúng thứ bạn cần khi phát triển sản phẩm.',
    compareGeneric: 'Chatbot AI chung',
    compareBioscope: 'Bioscope AI',
    genericItems: [
      'Trả lời chung chung, thiếu dữ liệu catalog cụ thể',
      'Không liên kết TDS/COA thật từ Bioscope',
      'Dễ “ảo giác” tên hoạt chất hoặc liều dùng',
      'Không hiểu MOQ, chứng nhận, nguồn cung Bioscope',
    ],
    bioscopeItems: [
      'Gợi ý từ catalog và tài liệu kỹ thuật Bioscope',
      'Yêu cầu & nhận TDS/COA qua luồng chuẩn',
      'Ngôn ngữ chuyên môn DP · TPCN · Mỹ phẩm',
      'Kết nối sales, mẫu thử và cổng đối tác B2B',
    ],
    strengthsTitle: 'Điểm mạnh cốt lõi',
    strengthsDesc: 'Xây dựng trên nền tảng dữ liệu và kinh nghiệm tư vấn thực chiến — không phải wrapper ChatGPT.',
    strengths: [
      {
        title: 'Dữ liệu catalog thật',
        desc: 'Huấn luyện trên hàng trăm nguyên liệu, case study và whitepaper — câu trả lời có nguồn, không đoán mò.',
      },
      {
        title: 'Ngôn ngữ formulator',
        desc: 'Hiểu INCI, liều dùng, dạng bào chế, claim — nói đúng ngôn ngữ R&D và regulatory.',
      },
      {
        title: 'Một luồng, nhiều công cụ',
        desc: 'Từ chat → gợi ý công thức → tài liệu → liên hệ mẫu thử — không phải nhảy qua 4 tab.',
      },
      {
        title: 'Rút ngắn vòng R&D',
        desc: 'Giảm thời gian từ brief sản phẩm đến shortlist hoạt chất — formulator tập trung vào thử nghiệm.',
      },
    ],
    notifyTitle: 'Nhận thông báo khi ra mắt',
    notifyDesc: 'Để lại email công việc — chúng tôi ưu tiên mời các nhãn hàng và formulator đăng ký sớm.',
    notifyPlaceholder: 'Email công việc của bạn',
    notifyButton: 'Đăng ký nhận tin',
    contactCta: 'Liên hệ tư vấn ngay',
    backHome: '← Về trang chủ',
  },
  ingredientsCatalog: {
    tags: { NEW: 'Mới', TRENDING: 'Nổi bật', EXCLUSIVE: 'Độc quyền' },
    searchPlaceholder: 'Tìm theo tên, nhóm hoặc công dụng…',
    advancedSearch: 'Tìm kiếm nâng cao',
    allIndustries: 'Tất cả ngành',
    pagination: 'Phân trang',
    prevPage: 'Trang trước',
    nextPage: 'Trang sau',
    close: 'Đóng',
    filters: {
      industry: 'Ngành hàng',
      category: 'Nhóm nguyên liệu',
      origin: 'Xuất xứ',
      form: 'Dạng bào chế',
      application: 'Ứng dụng',
      cert: 'Chứng nhận',
      tag: 'Nhãn nổi bật',
      moq: 'MOQ',
    },
    moqAny: 'Không giới hạn',
    results: 'kết quả',
    noResults: 'Không tìm thấy nguyên liệu phù hợp.',
    clearFilters: 'Xóa bộ lọc',
    applyFilters: 'Áp dụng',
    viewDetails: 'Xem chi tiết',
    clearAdvanced: 'Xóa bộ lọc nâng cao',
    ingredientsUnit: 'nguyên liệu',
    pageOf: 'Trang',
    originLabel: 'Xuất xứ',
    advancedTitle: 'Tìm kiếm nâng cao',
    advancedDesc: 'Chọn nhiều tiêu chí để thu hẹp danh mục',
    tryClearFilters: 'Không tìm thấy nguyên liệu phù hợp. Thử xóa bớt bộ lọc.',
    reset: 'Đặt lại',
    cancel: 'Hủy',
    applyFiltersFull: 'Áp dụng bộ lọc',
    moqMax: 'MOQ tối đa',
  },
}

const en: PageExtras = {
  solutionsPage: {
    icpTitle: 'Which solution fits you?',
    icpDesc:
      'Depending on internal capabilities and business goals, choose the right level of partnership — from ingredient supply to full-journey co-creation.',
  },
  coCreatePage: {
    compareTitle: 'Partnership model comparison',
    compareDesc: 'We do not just supply. We co-create — from idea to market success.',
    traditionalTitle: 'Traditional distributor',
    bioscopeTitle: 'Bioscope — Co-creation',
    stepLabel: 'Step',
    casesTitle: 'Real co-creation stories',
    casesDesc:
      'vivomega®, Gastroheal, and PEA — proof of a 5-step journey from idea to measurable growth.',
    readCase: 'Read case study',
    journey: [
      {
        title: 'Ideation',
        desc: 'Understand needs and capture trends. Together we analyze market, target audience, segments, and opportunities.',
      },
      {
        title: 'Research & proposal',
        desc: 'Select ingredients, technologies, and propose formulas optimized for efficacy and cost.',
      },
      {
        title: 'Validation & testing',
        desc: 'Create samples, test efficacy and safety; validate market signals online before large-scale production.',
      },
      {
        title: 'Development & launch',
        desc: 'Finalize product, support regulatory compliance, manufacturing, and go-to-market.',
      },
      {
        title: 'Growth & partnership',
        desc: 'Continuous optimization, portfolio expansion, and sustainable brand building together.',
      },
    ],
  },
  rdPage: {
    stats: [
      { label: 'Research projects' },
      { label: 'Patents' },
      { label: 'High-tech ingredients' },
      { label: 'Global R&D partners' },
    ],
    techTitle: 'Bioscope proprietary technologies',
    researchTitle: 'Research areas',
    researchDesc:
      '23+ R&D projects focused on bioavailability, transdermal delivery, nano actives, and key health segments.',
    partnersTitle: 'International R&D partners',
    partnersDesc:
      'Direct partnerships with leading manufacturers and research institutes in 50+ countries — ensuring access to the latest technologies and ingredients.',
    papersTitle: 'Expert materials & publications',
    papersDesc: 'In-depth materials from our R&D team — some require email registration to download.',
    gated: 'Registration required',
  },
  resourcesPage: {
    gated: 'Registration required',
    public: 'Public',
    comingSoon: 'Coming soon',
    backToResources: 'Back to Resources',
    viewAllCaseStudies: 'View all case studies',
    emptyTitle: 'Content coming soon',
    emptyDesc: 'Subscribe to our newsletter to be notified when new materials are added to this category.',
    explore: 'Explore',
    featured: 'Featured content',
    newsletterTitle: 'Get new resources by email',
    newsletterDesc: 'Whitepapers, checklists, and expert articles — delivered to your inbox.',
    newsletterPlaceholder: 'Your work email',
    newsletterButton: 'Subscribe',
  },
  blogPage: {
    search: 'Search',
    searchPlaceholder: 'Title, keywords…',
    topics: 'Topics',
    allTopics: 'All topics',
    industries: 'Industry',
    allIndustries: 'All industries',
    clearFilters: 'Clear filters',
    articleCount: 'articles',
    pageOf: 'Page',
    featured: 'Featured',
    readArticle: 'Read article',
    readMore: 'Read more',
    noResults: 'No matching articles. Try different keywords or filters.',
    minRead: 'min read',
    backToBlog: 'Back to Expert blog',
    relatedTitle: 'Related articles',
    relatedDesc: 'Same topic or industry — suggested reading.',
    toc: 'Table of contents',
    share: 'Share',
    copyLink: 'Copy link',
    copied: 'Copied',
    author: 'Author',
    authorBio:
      'The Bioscope research & application team — sharing expert knowledge on ingredients, formulation, and brand development.',
    comments: 'Comments',
    commentPrompt: 'Share your questions or experience about',
    nameLabel: 'Full name *',
    emailLabel: 'Work email',
    contentLabel: 'Comment *',
    namePlaceholder: 'Jane Doe',
    emailPlaceholder: 'you@company.com',
    commentPlaceholder: 'Write your comment…',
    commentModeration: 'Comments are moderated before being published.',
    submitComment: 'Submit comment',
    commentThanks: 'Thank you! Your comment has been recorded and shown temporarily on this page.',
    prevPage: 'Previous page',
    nextPage: 'Next page',
    pagination: 'Blog pagination',
  },
  aiAssistantPage: {
    status: 'Coming soon',
    statusDesc:
      'A specialized AI assistant for functional ingredients — trained on Bioscope catalog, R&D documents, and real advisory experience.',
    introQuote:
      '“From your first question to a shortlist of candidate actives — in minutes, not days.”',
    stats: [
      { value: '500+', label: 'Ingredients in catalog' },
      { value: '24/7', label: 'Always available' },
      { value: '3', label: 'Industries: Pharma · Nutraceutical · Cosmetics' },
    ],
    previewEyebrow: 'Preview',
    previewTitle: 'Chat like you are talking to a Bioscope expert',
    previewDesc:
      'Describe the product you are developing — AI suggests actives, explains why, and asks if you want TDS or samples.',
    useCasesTitle: 'Who is Bioscope AI for?',
    useCasesDesc: 'Built for every role in product development — from early ideation to ingredient sourcing decisions.',
    useCases: [
      {
        persona: 'Formulator / R&D',
        scenario: 'Need a shortlist of actives for a new concept',
        example: '“Premium anti-aging serum — prioritize peptides and botanicals with clinical evidence.”',
      },
      {
        persona: 'Product Manager',
        scenario: 'Compare options before supplier meetings',
        example: '“TG vs EE omega-3 for softgels — bioavailability and price positioning differences?”',
      },
      {
        persona: 'QA / Regulatory',
        scenario: 'Quick lookup for certifications and documents',
        example: '“Send TDS and COA for Curcumin Phytosome — Halal and non-GMO certified?”',
      },
    ],
    capabilitiesTitle: 'Core features',
    capabilitiesDesc: 'Every step in ingredient research — unified in one conversational interface.',
    capabilities: [
      {
        title: 'Smart ingredient guidance',
        desc: 'Understands product goals and suggests actives backed by Bioscope data.',
        bullets: ['Filter by industry, benefit, budget', 'Explain mechanism and advantages per active', 'Suggest alternatives when MOQ or supply is limited'],
      },
      {
        title: 'Formula & combination ideas',
        desc: 'Proposes active pairings with reference dosing and compatibility notes.',
        bullets: ['Multi-active stacks by product goal', 'Reference dosing and interaction warnings', 'Links to Bioscope formulation tools'],
      },
      {
        title: 'Instant technical documents',
        desc: 'Request TDS, COA, SDS in chat — no back-and-forth emails.',
        bullets: ['TDS / COA / SDS per ingredient code', 'Certification info (Halal, organic, non-GMO…)', 'Gated flow for sensitive documents'],
      },
      {
        title: '24/7 support',
        desc: 'Quick lookup before contacting sales — ideal for brainstorming.',
        bullets: ['Instant responses, any time zone', 'Conversation context retained', 'Smooth handoff to advisory team when needed'],
      },
    ],
    compareTitle: 'How is it different from a generic chatbot?',
    compareDesc: 'ChatGPT knows a lot — Bioscope AI knows what you need when developing products.',
    compareGeneric: 'Generic AI chatbot',
    compareBioscope: 'Bioscope AI',
    genericItems: [
      'Generic answers without specific catalog data',
      'No link to real Bioscope TDS/COA documents',
      'Risk of hallucinated actives or dosing',
      'No understanding of MOQ, certs, or Bioscope supply',
    ],
    bioscopeItems: [
      'Suggestions from Bioscope catalog and technical docs',
      'Request & receive TDS/COA through standard flow',
      'Pharma · nutraceutical · cosmetics terminology',
      'Connects to sales, samples, and B2B partner portal',
    ],
    strengthsTitle: 'Core strengths',
    strengthsDesc: 'Built on real data and advisory experience — not a ChatGPT wrapper.',
    strengths: [
      {
        title: 'Real catalog data',
        desc: 'Trained on hundreds of ingredients, case studies, and whitepapers — sourced answers, not guesses.',
      },
      {
        title: 'Formulator language',
        desc: 'Understands INCI, dosing, dosage forms, claims — speaks R&D and regulatory fluently.',
      },
      {
        title: 'One flow, many tools',
        desc: 'Chat → formula ideas → documents → sample requests — no jumping across four tabs.',
      },
      {
        title: 'Shorter R&D cycles',
        desc: 'Less time from product brief to active shortlist — formulators focus on testing.',
      },
    ],
    notifyTitle: 'Get notified at launch',
    notifyDesc: 'Leave your work email — we will prioritize early access for registered brands and formulators.',
    notifyPlaceholder: 'Your work email',
    notifyButton: 'Notify me',
    contactCta: 'Contact us now',
    backHome: '← Back to home',
  },
  ingredientsCatalog: {
    tags: { NEW: 'New', TRENDING: 'Trending', EXCLUSIVE: 'Exclusive' },
    searchPlaceholder: 'Search by name, category, or benefit…',
    advancedSearch: 'Advanced search',
    allIndustries: 'All industries',
    pagination: 'Pagination',
    prevPage: 'Previous page',
    nextPage: 'Next page',
    close: 'Close',
    filters: {
      industry: 'Industry',
      category: 'Ingredient category',
      origin: 'Origin',
      form: 'Dosage form',
      application: 'Application',
      cert: 'Certification',
      tag: 'Featured tags',
      moq: 'MOQ',
    },
    moqAny: 'No limit',
    results: 'results',
    noResults: 'No matching ingredients found.',
    clearFilters: 'Clear filters',
    applyFilters: 'Apply',
    viewDetails: 'View details',
    clearAdvanced: 'Clear advanced filters',
    ingredientsUnit: 'ingredients',
    pageOf: 'Page',
    originLabel: 'Origin',
    advancedTitle: 'Advanced search',
    advancedDesc: 'Select multiple criteria to narrow the catalog',
    tryClearFilters: 'No matching ingredients. Try clearing some filters.',
    reset: 'Reset',
    cancel: 'Cancel',
    applyFiltersFull: 'Apply filters',
    moqMax: 'Max MOQ',
  },
}

export function getPageExtras(locale: Locale): PageExtras {
  return locale === 'en' ? en : vi
}
